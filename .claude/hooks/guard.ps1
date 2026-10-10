# PreToolUse guard: usage caps, 5-hour pause, context checkpoints, and command/path rules.
# Runs before every tool call (main agent and subagents). Prints a JSON decision or nothing.

. (Join-Path $PSScriptRoot 'common.ps1')

$in     = Read-HookInput
$cfg    = Get-Config
$tool   = [string](Get-Prop $in 'tool_name')
$ti     = Get-Prop $in 'tool_input'
$cwd    = [string](Get-Prop $in 'cwd')
if (-not $cwd) { $cwd = Get-ProjectDir }
$notes  = New-Object System.Collections.Generic.List[string]

function Stop-Run([string]$reason) {
    Write-GuardLog "STOP: $reason"
    Write-HookJson ([ordered]@{
        continue         = $false
        stopReason       = $reason
        terminalSequence = (Get-NotifySequence $reason)
        hookSpecificOutput = [ordered]@{
            hookEventName            = 'PreToolUse'
            permissionDecision       = 'deny'
            permissionDecisionReason = $reason
        }
    })
    exit 0
}

function Deny-Tool([string]$reason) {
    Write-GuardLog "DENY [$tool]: $reason"
    Write-HookJson ([ordered]@{
        hookSpecificOutput = [ordered]@{
            hookEventName            = 'PreToolUse'
            permissionDecision       = 'deny'
            permissionDecisionReason = "Guardrail: $reason"
        }
    })
    exit 0
}

# ---------------------------------------------------------------- kill switches
if (Test-Path -LiteralPath (Get-StatePath 'STOP')) {
    Stop-Run 'Manual STOP file is present (.claude/state/STOP). Remove it with run.ps1 -ClearStops to continue.'
}
if (Test-Path -LiteralPath (Get-StatePath 'WEEKLY_CAP')) {
    $u0 = Get-Usage
    if ($u0 -and $u0.hasLimits -and $u0.week -lt [double]$cfg.weeklyStopPct) {
        # Weekly window reset since the cap was hit.
        Remove-Item -LiteralPath (Get-StatePath 'WEEKLY_CAP') -Force -ErrorAction SilentlyContinue
        Write-GuardLog 'Weekly cap marker cleared: weekly usage is back under the cap.'
    } else {
        Stop-Run "Weekly usage cap ($($cfg.weeklyStopPct)%) was reached. Work is halted until the weekly window resets."
    }
}

# ---------------------------------------------------------------- usage
$usage = Get-Usage
if ($null -eq $usage -or -not $usage.hasLimits) {
    # The status line may still be writing its first snapshot; give it a moment.
    for ($i = 0; $i -lt 6 -and ($null -eq $usage -or -not $usage.hasLimits); $i++) {
        Start-Sleep -Milliseconds 500
        $usage = Get-Usage
    }
}

if ($null -eq $usage -or -not $usage.hasLimits) {
    if ([bool]$cfg.requireUsageData) {
        Stop-Run 'No rate-limit data from the status line (.claude/state/usage.json). The weekly cap cannot be enforced, so work is halted. Check that the status line is configured (run setup.ps1) and that you are signed in with your Pro account.'
    }
} else {
    $flagsPath = Get-StatePath 'flags.json'
    $flags = Read-JsonFile $flagsPath
    if ($null -eq $flags) { $flags = New-Object PSObject }
    $flagsChanged = $false
    function Set-Flag($name, $value) {
        if ($flags.PSObject.Properties[$name]) { $flags.$name = $value }
        else { $flags | Add-Member -NotePropertyName $name -NotePropertyValue $value }
        $script:flagsChanged = $true
    }

    # Weekly hard stop
    if ($usage.week -ge [double]$cfg.weeklyStopPct) {
        Write-JsonFile (Get-StatePath 'WEEKLY_CAP') ([ordered]@{ at = (Get-NowEpoch); week = $usage.week; resets = $usage.weekReset })
        Stop-Run ("Weekly usage is at {0:N0}%, at or above the {1}% cap. Work is halted until the weekly window resets ({2})." -f $usage.week, $cfg.weeklyStopPct, (Format-Epoch $usage.weekReset))
    }

    # Weekly warning (once per weekly window)
    if ($usage.week -ge [double]$cfg.weeklyWarnPct -and [long](Get-Prop $flags 'weeklyWarnedFor') -ne $usage.weekReset) {
        $notes.Add(("Weekly usage is at {0:N0}%; the run stops automatically at {1}%. Update _agent/PROGRESS.md and commit a checkpoint now so the stop loses nothing." -f $usage.week, $cfg.weeklyStopPct))
        Set-Flag 'weeklyWarnedFor' $usage.weekReset
    }

    # 5-hour window: pause until reset
    if ($usage.five -ge [double]$cfg.fiveHourPausePct -and $usage.fiveReset -gt 0) {
        $now = Get-NowEpoch
        $wakeAt = $usage.fiveReset + [long]$cfg.pauseBufferSeconds
        $wait = [Math]::Min($wakeAt - $now, [long]$cfg.pauseMaxSeconds)
        if ($wait -gt 0) {
            $pausePath = Get-StatePath 'paused.json'
            Write-JsonFile $pausePath ([ordered]@{ since = $now; until = ($now + $wait); five = $usage.five })
            Write-GuardLog ("PAUSE: 5-hour window at {0:N0}%; sleeping {1}s until {2}" -f $usage.five, $wait, (Format-Epoch ($now + $wait)))
            $deadline = $now + $wait
            while ((Get-NowEpoch) -lt $deadline) {
                if (Test-Path -LiteralPath (Get-StatePath 'STOP')) {
                    Remove-Item -LiteralPath $pausePath -Force -ErrorAction SilentlyContinue
                    Stop-Run 'Manual STOP file appeared during the 5-hour pause.'
                }
                $remaining = $deadline - (Get-NowEpoch)
                Start-Sleep -Seconds ([Math]::Max(1, [Math]::Min(30, $remaining)))
            }
            Remove-Item -LiteralPath $pausePath -Force -ErrorAction SilentlyContinue
            Write-GuardLog 'RESUME after 5-hour pause'
            $notes.Add(("Work was paused automatically for the 5-hour usage window and resumed at {0}. The prompt cache has likely expired." -f (Get-Date -Format 'h:mm tt')))
        }
    }
    elseif ($usage.five -ge [double]$cfg.fiveHourWarnPct -and [long](Get-Prop $flags 'fiveWarnedFor') -ne $usage.fiveReset) {
        $notes.Add(("The 5-hour usage window is at {0:N0}%; work pauses automatically at {1}% until it resets ({2}). Update _agent/PROGRESS.md now." -f $usage.five, $cfg.fiveHourPausePct, (Format-Epoch $usage.fiveReset)))
        Set-Flag 'fiveWarnedFor' $usage.fiveReset
    }

    # Context checkpoint (once per compaction cycle; SessionStart resets the flag)
    if ($null -ne $usage.ctx -and $usage.ctx -ge [double]$cfg.contextCheckpointPct -and -not [bool](Get-Prop $flags 'ctxWarned')) {
        $notes.Add(("The context window is at {0:N0}%. Write the current state, open questions, and next step to _agent/PROGRESS.md and commit a checkpoint before continuing; compaction will follow." -f $usage.ctx))
        Set-Flag 'ctxWarned' $true
    }

    if ($flagsChanged) { Write-JsonFile $flagsPath $flags }
}

# ---------------------------------------------------------------- command analysis

$script:NetHeads = @('curl','wget','invoke-webrequest','iwr','invoke-restmethod','irm','start-bitstransfer','bitsadmin','certutil','ssh','scp','sftp','ftp','tftp','nc','ncat','netcat','telnet','socat','rsync','net','netsh')
$script:InstallHeads = @('pip','pip3','pipx','npm','npx','pnpm','yarn','bun','winget','choco','scoop','apt','apt-get','brew','conda','mamba','gem','cargo','go','dotnet','install-module','install-package','install-script','save-module','msiexec','uv')
$script:DeleteHeads = @('rm','rmdir','del','erase','rd','remove-item','ri','unlink','shred','format','clear-content','clc')
$script:ExecHeads = @('eval','exec','iex','invoke-expression','invoke-command','icm','start-process','saps','start','start-job','sajb','invoke-item','ii','cmd','wscript','cscript','mshta','rundll32','regsvr32','reg','schtasks','sc','at','runas','set-executionpolicy','new-service','export','setx','alias','set-alias','new-alias','function','filter','chmod','chown','sudo','su','doas','ruby','perl','php','deno','java','javaw','lua','tclsh','osascript','rscript','add-type','new-object')
$script:ApprovableHeads = @('python','py','node','bash','sh','powershell','pwsh','.','source')
$script:WrapperHeads = @('env','time','timeout','nice','nohup','stdbuf','command','builtin','noglob','xargs')
$script:WriterHeads = @('mv','cp','tee','touch','mkdir','ln','install','dd','set-content','sc','add-content','ac','out-file','new-item','ni','move-item','mi','move','copy-item','cpi','copy','rename-item','rni','ren','mklink')
$script:PatternHeads = @('grep','egrep','fgrep','rg','awk','gawk','mawk','sed','select-string','sls','findstr','jq')
$script:ScriptExt = '\.(py|pyw|js|mjs|cjs|ps1|psm1|sh|bash|bat|cmd|rb|pl|php|vbs|wsf)$'

function Split-Segments([string]$cmd, [bool]$bashEscapes) {
    $segs = New-Object System.Collections.Generic.List[string]
    $sb = New-Object System.Text.StringBuilder
    $q = $null
    $n = $cmd.Length
    for ($i = 0; $i -lt $n; $i++) {
        $c = $cmd[$i]
        $next = if ($i + 1 -lt $n) { $cmd[$i + 1] } else { [char]0 }
        if ($q -eq "'") {
            [void]$sb.Append($c)
            if ($c -eq "'") { $q = $null }
            continue
        }
        if ($bashEscapes -and $c -eq '\' -and $i + 1 -lt $n) {
            [void]$sb.Append($c); [void]$sb.Append($next); $i++; continue
        }
        if ($q -eq '"') {
            if ($c -eq '"') { [void]$sb.Append($c); $q = $null; continue }
            if ($c -eq '`' -or ($c -eq '$' -and $next -eq '(')) {
                $segs.Add($sb.ToString()); [void]$sb.Clear()
                if ($c -eq '$') { $i++ }
                continue
            }
            [void]$sb.Append($c); continue
        }
        if ($c -eq "'" -or $c -eq '"') { $q = $c; [void]$sb.Append($c); continue }
        if ($c -eq '$' -and $next -eq '(') { $segs.Add($sb.ToString()); [void]$sb.Clear(); $i++; continue }
        if (';&|(){}`'.Contains([string]$c) -or $c -eq "`n" -or $c -eq "`r") {
            $segs.Add($sb.ToString()); [void]$sb.Clear(); continue
        }
        [void]$sb.Append($c)
    }
    $segs.Add($sb.ToString())
    return ,($segs | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
}

function Split-Tokens([string]$seg) {
    $list = New-Object System.Collections.Generic.List[string]
    foreach ($m in [regex]::Matches($seg, '"[^"]*"|''[^'']*''|\S+')) {
        $t = $m.Value
        if ($t.Length -ge 2 -and (($t.StartsWith('"') -and $t.EndsWith('"')) -or ($t.StartsWith("'") -and $t.EndsWith("'")))) {
            $t = $t.Substring(1, $t.Length - 2)
        }
        $list.Add($t)
    }
    return ,$list
}

function Get-HeadName([string]$tok) {
    $h = $tok.ToLowerInvariant()
    $h = [IO.Path]::GetFileName(($h -replace '\\', '/'))
    if ($h -match '\.exe$') { $h = $h.Substring(0, $h.Length - 4) }
    if ($h -match '^python[0-9.]*w?$') { return 'python' }
    if ($h -match '^pip[0-9.]*$') { return 'pip' }
    return $h
}

function Test-ApprovedScript([string]$token) {
    if (-not $token) { return 'no script path given (only approved scripts may be run)' }
    $full = Resolve-FullPath $token $cwd
    $approvedDir = [IO.Path]::Combine((Get-ProjectDir), 'approved-scripts')
    if (-not $full -or -not (Test-UnderDir $full $approvedDir) -or $full.Equals($approvedDir, $script:PathComparison)) {
        return "'$token' is not in approved-scripts/. Write the script to _agent/proposed-scripts/ and request approval in _agent/NEEDS_HUMAN.md."
    }
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) { return "approved script '$token' does not exist" }
    $manifest = Read-JsonFile ([IO.Path]::Combine((Get-ProjectDir), '.claude', 'approved-scripts.json'))
    $key = Get-RelativeKey $full
    $expected = $null
    if ($manifest) {
        foreach ($p in $manifest.PSObject.Properties) { if ($p.Name.ToLowerInvariant() -eq $key) { $expected = [string]$p.Value } }
    }
    if (-not $expected) { return "'$key' is not listed in the approval manifest" }
    $actual = (Get-FileHash -LiteralPath $full -Algorithm SHA256).Hash
    if (-not $actual.Equals($expected, [StringComparison]::OrdinalIgnoreCase)) {
        return "'$key' has changed since it was approved (hash mismatch); it must be re-approved"
    }
    return $null
}

function Test-InterpreterCall([string]$head, $toks, [int]$start) {
    # $toks[$start] is the first argument after the interpreter.
    $script = $null
    switch ($head) {
        { $_ -in @('python','py') } {
            for ($j = $start; $j -lt $toks.Count; $j++) {
                $t = $toks[$j]
                if ($t -in @('-c','-m','-')) { return "python $t (inline code or module execution) is not allowed" }
                if ($t -match '^-c.|^-m.') { return 'python inline code or module execution is not allowed' }
                if ($t.StartsWith('-')) { continue }
                $script = $t; break
            }
        }
        'node' {
            for ($j = $start; $j -lt $toks.Count; $j++) {
                $t = $toks[$j].ToLowerInvariant()
                if ($t -match '^(-e|--eval|-p|--print|-r|--require|--import|--loader|--experimental-loader|-i|--interactive)(=|$)') { return "node $t is not allowed" }
                if ($t.StartsWith('-')) { continue }
                $script = $toks[$j]; break
            }
        }
        { $_ -in @('bash','sh') } {
            for ($j = $start; $j -lt $toks.Count; $j++) {
                $t = $toks[$j]
                if ($t -match '^-[a-zA-Z]*[csi]') { return "$head $t (inline or interactive shell) is not allowed" }
                if ($t.StartsWith('-')) { continue }
                $script = $t; break
            }
        }
        { $_ -in @('powershell','pwsh') } {
            for ($j = $start; $j -lt $toks.Count; $j++) {
                $t = $toks[$j].ToLowerInvariant()
                if ($t -match '^[-/](c|command|e|ec|enc|encodedcommand|commandwithargs|cwa)$') { return "$head $t is not allowed" }
                if ($t -match '^[-/](f|file)$') {
                    if ($j + 1 -lt $toks.Count) { $script = $toks[$j + 1] }
                    break
                }
            }
            if (-not $script) { return "$head must be called with -File approved-scripts/<script>.ps1" }
        }
        { $_ -in @('.','source') } {
            if ($start -lt $toks.Count) { $script = $toks[$start] }
        }
    }
    return (Test-ApprovedScript $script)
}

function Test-PathToken([string]$tok, [bool]$isWrite) {
    if ([string]::IsNullOrWhiteSpace($tok)) { return $null }
    # Strip redirection prefix like 2> >> < &>
    $t = $tok -replace '^[0-9&]*[<>]+&?', ''
    if ($t -eq '') { return $null }
    if ($t -match '^[a-zA-Z][a-zA-Z0-9+.-]*://') { return $null }   # URL
    if ($t -match '^(/dev/(null|stdout|stderr)|nul|\$null)$') { return $null }
    if ($t -match '^[-/][a-zA-Z]' -and $t -notmatch '[\\/].*[\\/]' -and $t -notmatch '^/[a-zA-Z](/|$)' -and -not $script:IsWin) {
        # Looks like a flag on non-Windows; fall through only if it is clearly a path.
    }
    if ($t -match '^~|\$HOME|\$\{HOME\}|\$env:|%[A-Za-z_]+%|\$USERPROFILE|\$APPDATA|\$TEMP|\$TMP') {
        return "path '$tok' refers to a location outside the working folder"
    }
    $looksPath = $false
    if ($t -match '^(/|\\\\|[a-zA-Z]:[\\/])') { $looksPath = $true }
    if ($t -match '(^|[\\/])\.\.([\\/]|$)') { $looksPath = $true }
    if (-not $looksPath -and -not $isWrite) { return $null }
    if (-not $looksPath -and $t.StartsWith('-')) { return $null }
    # Windows switches like /c are not paths
    if ($script:IsWin -and $t -match '^/[a-zA-Z?]{1,3}$' -and $t -notmatch '^/[a-zA-Z]$') { return $null }
    $full = Resolve-FullPath $t $cwd
    if (-not $full) { return "could not resolve path '$tok'" }
    if (-not (Test-InProject $full)) { return "path '$tok' is outside the working folder" }
    if ($isWrite -and (Test-Protected $full)) { return "writing to '$tok' is not allowed (protected guardrail/approval area)" }
    return $null
}

function Test-Command([string]$cmd, [string]$toolName) {
    if ([string]::IsNullOrWhiteSpace($cmd)) { return $null }
    $isBash = ($toolName -eq 'Bash')
    $lower = $cmd.ToLowerInvariant()

    # Environment / variable assignments that steer interpreters
    if ($cmd -match '\$env:[A-Za-z_]+\s*=' -or $cmd -match '(^|[;&|\s])(set|setx)\s+[A-Za-z_]+=') {
        return 'setting environment variables is not allowed'
    }

    $segments = Split-Segments $cmd $isBash
    foreach ($seg in $segments) {
        $toks = Split-Tokens $seg
        if ($toks.Count -eq 0) { continue }
        $i = 0
        $hadAssign = $false
        # Leading VAR=value assignments and wrappers
        while ($i -lt $toks.Count) {
            $t = $toks[$i]
            if ($t -match '^[A-Za-z_][A-Za-z0-9_]*=') { $hadAssign = $true; $i++; continue }
            $hn = Get-HeadName $t
            if ($hn -in $script:WrapperHeads) {
                $i++
                # skip wrapper options and timeout's duration argument
                while ($i -lt $toks.Count -and ($toks[$i].StartsWith('-') -or ($hn -eq 'timeout' -and $toks[$i] -match '^[0-9.]+[smhd]?$') -or ($hn -eq 'env' -and $toks[$i] -match '='))) {
                    if ($hn -eq 'env' -and $toks[$i] -match '=') { $hadAssign = $true }
                    $i++
                }
                continue
            }
            break
        }
        if ($i -ge $toks.Count) { continue }
        $headTok = $toks[$i]
        # PowerShell: segment starting with a variable or literal is not a command invocation
        if ($headTok -match '^\$' -and $headTok -notmatch '^\$\(') {
            if ($headTok -match '^\$[A-Za-z_:]+\s*$' -and $i + 1 -lt $toks.Count -and $toks[$i + 1] -eq '=') { return 'variable assignment in commands is not allowed' }
            continue
        }
        $head = Get-HeadName $headTok
        $argStart = $i + 1

        if ($head -in $script:NetHeads) { return "'$head' is a network tool; use WebFetch/WebSearch (read-only) instead" }
        if ($head -in $script:InstallHeads) { return "'$head' (installs/downloads) is not allowed" }
        if ($head -in $script:DeleteHeads) { return "'$head' (delete) is not allowed; move unwanted files to _trash/ instead" }
        if ($head -in $script:ExecHeads) { return "'$head' is not allowed" }

        if ($head -eq 'git') {
            for ($j = $argStart; $j -lt $toks.Count; $j++) {
                $g = $toks[$j].ToLowerInvariant()
                if ($g -match '^(-c|-C|--exec-path|--git-dir|--work-tree|--namespace)') { return "git option '$($toks[$j])' is not allowed" }
                if ($g.StartsWith('-')) { continue }
                if ($g -in @('push','pull','fetch','clone','remote','config','submodule','clean','filter-branch','filter-repo','gc','prune','daemon','send-email','request-pull','archive','bundle','credential','lfs','worktree','hook','update-ref','reflog')) { return "git $g is not allowed" }
                if ($g -eq 'reset' -and $lower -match '--hard') { return 'git reset --hard is not allowed' }
                if ($g -eq 'checkout' -and $lower -match '\s--\s+\.') { return 'git checkout -- . is not allowed' }
                break
            }
        }

        if ($head -in @('find')) {
            if ($seg -match '\s-(exec|execdir|ok|okdir|delete|fprint|fprintf|fls)\b') { return 'find -exec/-delete/-fprint is not allowed' }
        }
        if ($head -in @('awk','gawk','mawk')) {
            if ($cmd -match 'system\s*\(|getline|\|\s*"|print[^;}]*\|') { return 'awk system()/getline/pipes are not allowed' }
        }
        if ($head -eq 'sed') {
            if ($cmd -match 's(.)(?:(?!\1).)*\1(?:(?!\1).)*\1[gpiImM0-9w]*e' -or $cmd -match "(^|[;'\s{])e(\s|$|')") { return 'sed e (execute) is not allowed' }
        }

        if ($hadAssign -and ($head -in $script:ApprovableHeads)) { return 'environment assignments before an interpreter are not allowed' }

        $headIsPath = ($headTok -match '[\\/]' -or $headTok -match $script:ScriptExt)
        if ($head -in $script:ApprovableHeads) {
            $r = Test-InterpreterCall $head $toks $argStart
            if ($r) { return $r }
        } elseif ($headIsPath) {
            $full = Resolve-FullPath $headTok $cwd
            if ($full -and (Test-InProject $full)) {
                $r = Test-ApprovedScript $headTok
                if ($r) { return $r }
            } else {
                return "running '$headTok' is not allowed (outside the working folder)"
            }
        }

        # Path checks on arguments
        $isWriterHead = ($head -in $script:WriterHeads) -or ($head -eq 'sed' -and $seg -match '\s-i')
        $skipPattern = ($head -in $script:PatternHeads)
        $patternSkipped = $false
        $redirectNext = $false
        for ($j = $argStart; $j -lt $toks.Count; $j++) {
            $t = $toks[$j]
            if ($t -match '^[0-9&]*[<>]+&?$') { $redirectNext = ($t -match '>'); continue }
            $isRedirect = $redirectNext -or ($t -match '^[0-9&]*>')
            $redirectNext = $false
            if ($skipPattern -and -not $patternSkipped -and -not $t.StartsWith('-') -and -not $isRedirect) {
                $patternSkipped = $true; continue
            }
            $r = Test-PathToken $t ($isWriterHead -or $isRedirect)
            if ($r) { return $r }
        }
    }
    return $null
}

# ---------------------------------------------------------------- per-tool rules
$reason = $null
switch -Regex ($tool) {
    '^(Bash|PowerShell|Monitor)$' {
        $reason = Test-Command ([string](Get-Prop $ti 'command')) $tool
    }
    '^(Edit|Write|MultiEdit|NotebookEdit)$' {
        $p = Get-Prop $ti 'file_path'
        if (-not $p) { $p = Get-Prop $ti 'notebook_path' }
        if ($p) {
            $full = Resolve-FullPath ([string]$p) $cwd
            if (-not $full -or -not (Test-InProject $full)) { $reason = "writing '$p' is outside the working folder; use _agent/tmp/ for scratch files" }
            elseif (Test-Protected $full) { $reason = "writing '$p' is not allowed (protected guardrail/approval area)" }
        }
    }
    '^(Read|Grep|Glob|LSP)$' {
        foreach ($k in @('file_path','path','notebook_path')) {
            $p = Get-Prop $ti $k
            if ($p) {
                $full = Resolve-FullPath ([string]$p) $cwd
                if (-not $full -or -not (Test-InProject $full)) { $reason = "reading '$p' is outside the working folder"; break }
            }
        }
        $pat = Get-Prop $ti 'pattern'
        if (-not $reason -and $tool -eq 'Glob' -and $pat -and ([string]$pat -match '^(/|\\\\|[a-zA-Z]:[\\/]|~)')) {
            $full = Resolve-FullPath ([string]$pat) $cwd
            if (-not $full -or -not (Test-InProject $full)) { $reason = "glob '$pat' is outside the working folder" }
        }
    }
    '^Agent$' {
        $st = [string](Get-Prop $ti 'subagent_type')
        $allowed = @($cfg.allowedSubagents)
        if (-not $st -or -not ($allowed -contains $st)) { $reason = "subagent type '$st' is not allowed; use: $($allowed -join ', ')" }
    }
}
if ($reason) { Deny-Tool $reason }

if ($notes.Count -gt 0) {
    Write-HookJson ([ordered]@{
        hookSpecificOutput = [ordered]@{
            hookEventName     = 'PreToolUse'
            additionalContext = ($notes -join ' ')
        }
    })
}
exit 0

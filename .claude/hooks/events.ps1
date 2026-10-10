# Handles SessionStart, Stop, StopFailure and Notification events.

. (Join-Path $PSScriptRoot 'common.ps1')

$in    = Read-HookInput
$cfg   = Get-Config
$event = [string](Get-Prop $in 'hook_event_name')
$agent = Get-AgentDir
$autorun = Test-Path -LiteralPath (Get-StatePath 'AUTORUN')

switch ($event) {

    'SessionStart' {
        $source = [string](Get-Prop $in 'source')
        # New context cycle: allow the context checkpoint notice to fire again.
        $flagsPath = Get-StatePath 'flags.json'
        $flags = Read-JsonFile $flagsPath
        if ($flags -and $flags.PSObject.Properties['ctxWarned']) { $flags.ctxWarned = $false; Write-JsonFile $flagsPath $flags }

        $u = Get-Usage
        $usageLine = 'Usage data is not available yet.'
        if ($u -and $u.hasLimits) {
            $usageLine = "Weekly usage is at {0:N0}% (hard stop at {1}%); the 5-hour window is at {2:N0}% (automatic pause at {3}%)." -f $u.week, $cfg.weeklyStopPct, $u.five, $cfg.fiveHourPausePct
        }
        $mode = if ($autorun) { 'Autorun is ON: the session continues through the plan without waiting for the user.' } else { 'Autorun is OFF: the user is present.' }
        $text = "Long-run protocol is active (see CLAUDE.md). The plan is in _agent/PLAN.md and the progress log is in _agent/PROGRESS.md. $usageLine $mode"
        if ($source -eq 'compact') {
            $text = "Context was just compacted. Re-read _agent/PLAN.md and the latest entry in _agent/PROGRESS.md before the next step. " + $text
        }
        Write-HookJson ([ordered]@{ hookSpecificOutput = [ordered]@{ hookEventName = 'SessionStart'; additionalContext = $text } })
    }

    'Stop' {
        if (-not $autorun) { exit 0 }
        foreach ($marker in @((Get-StatePath 'STOP'), (Get-StatePath 'WEEKLY_CAP'), (Join-Path $agent 'DONE'), (Join-Path $agent 'BLOCKED'))) {
            if (Test-Path -LiteralPath $marker) {
                $msg = "Session stopped: $([IO.Path]::GetFileName($marker)) marker present."
                Write-GuardLog $msg
                Write-HookJson ([ordered]@{ terminalSequence = (Get-NotifySequence $msg) })
                exit 0
            }
        }
        # Stall guard: if the progress log hasn't changed since the last forced continue, count a stall.
        $hash = ''
        foreach ($f in @('PROGRESS.md', 'PLAN.md')) {
            $p = Join-Path $agent $f
            if (Test-Path -LiteralPath $p) { $hash += (Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash }
        }
        $sgPath = Get-StatePath 'stop-guard.json'
        $sg = Read-JsonFile $sgPath
        $stalls = 0
        if ($sg -and [string]$sg.hash -eq $hash) { $stalls = [int]$sg.stalls + 1 }
        Write-JsonFile $sgPath ([ordered]@{ hash = $hash; stalls = $stalls; at = (Get-NowEpoch) })
        if ($stalls -ge [int]$cfg.maxStopStalls) {
            $msg = "Autorun stopped: no progress-log changes across $stalls continue attempts."
            Write-GuardLog $msg
            Write-HookJson ([ordered]@{ terminalSequence = (Get-NotifySequence $msg) })
            exit 0
        }
        Write-HookJson ([ordered]@{
            decision = 'block'
            reason   = 'Autorun is on and _agent/DONE does not exist. Continue with the next unchecked item in _agent/PLAN.md and log progress in _agent/PROGRESS.md. If every item is complete, create _agent/DONE. If nothing can proceed without the user, write the request in _agent/NEEDS_HUMAN.md and create _agent/BLOCKED.'
        })
    }

    'StopFailure' {
        $raw = ($in | ConvertTo-Json -Depth 5 -Compress)
        Write-GuardLog "STOP FAILURE: $raw"
        $msg = 'Turn ended on an API error (see .claude/state/guard.log). If it was a rate limit, resume after the reset with run.ps1 -Mode unattended -Resume.'
        Write-HookJson ([ordered]@{ terminalSequence = (Get-NotifySequence $msg) })
    }

    'Notification' {
        $m = [string](Get-Prop $in 'message')
        Write-GuardLog "NOTIFY: $m"
        Write-HookJson ([ordered]@{ terminalSequence = (Get-NotifySequence $m) })
    }
}
exit 0

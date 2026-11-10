# Shared helpers for the guardrail hooks and status line.
# Compatible with Windows PowerShell 5.1 and PowerShell 7+.

Set-StrictMode -Off
$ErrorActionPreference = 'Stop'

$script:Utf8NoBom = New-Object System.Text.UTF8Encoding $false
try {
    [Console]::InputEncoding  = $script:Utf8NoBom
    [Console]::OutputEncoding = $script:Utf8NoBom
} catch { }

$script:IsWin = ($env:OS -eq 'Windows_NT')
$script:PathComparison = if ($script:IsWin) { [StringComparison]::OrdinalIgnoreCase } else { [StringComparison]::Ordinal }
$script:Sep = [IO.Path]::DirectorySeparatorChar

function Get-ProjectDir {
    if ($env:CLAUDE_PROJECT_DIR) { return [IO.Path]::GetFullPath($env:CLAUDE_PROJECT_DIR).TrimEnd('\', '/') }
    # Fallback: this file lives in <project>/.claude/hooks
    return [IO.Path]::GetFullPath([IO.Path]::Combine($PSScriptRoot, '..', '..')).TrimEnd('\', '/')
}

function Get-StateDir {
    $d = [IO.Path]::Combine((Get-ProjectDir), '.claude', 'state')
    if (-not (Test-Path -LiteralPath $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
    return $d
}

function Get-StatePath([string]$name) { return [IO.Path]::Combine((Get-StateDir), $name) }

function Get-AgentDir { return [IO.Path]::Combine((Get-ProjectDir), '_agent') }

function Read-HookInput {
    $raw = [Console]::In.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($raw)) { return New-Object PSObject }
    return $raw | ConvertFrom-Json
}

function Write-HookJson($obj) {
    $json = $obj | ConvertTo-Json -Depth 8 -Compress
    [Console]::Out.Write($json)
}

function Read-JsonFile([string]$path) {
    try {
        if (Test-Path -LiteralPath $path) {
            $t = [IO.File]::ReadAllText($path)
            if (-not [string]::IsNullOrWhiteSpace($t)) { return $t | ConvertFrom-Json }
        }
    } catch { }
    return $null
}

function Write-JsonFile([string]$path, $obj) {
    $json = $obj | ConvertTo-Json -Depth 8
    $tmp = "$path.$PID.tmp"
    [IO.File]::WriteAllText($tmp, $json, $script:Utf8NoBom)
    Move-Item -LiteralPath $tmp -Destination $path -Force
}

function Get-Prop($obj, [string]$path) {
    $cur = $obj
    foreach ($part in $path.Split('.')) {
        if ($null -eq $cur) { return $null }
        $p = $cur.PSObject.Properties[$part]
        if ($null -eq $p) { return $null }
        $cur = $p.Value
    }
    return $cur
}

function Get-NowEpoch { return [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() }

function Format-Epoch([long]$epoch) {
    if ($epoch -le 0) { return '?' }
    return [DateTimeOffset]::FromUnixTimeSeconds($epoch).ToLocalTime().ToString('ddd h:mm tt')
}

function Write-GuardLog([string]$msg) {
    try {
        $p = Get-StatePath 'guard.log'
        if ((Test-Path -LiteralPath $p) -and ((Get-Item -LiteralPath $p).Length -gt 1MB)) {
            Move-Item -LiteralPath $p -Destination "$p.1" -Force
        }
        $line = "{0}  {1}{2}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg, [Environment]::NewLine
        [IO.File]::AppendAllText($p, $line, $script:Utf8NoBom)
    } catch { }
}

$script:DefaultConfig = [ordered]@{
    weeklyStopPct         = 60
    weeklyWarnPct         = 55
    fiveHourWarnPct       = 80
    fiveHourPausePct      = 88
    contextCheckpointPct  = 70
    pauseBufferSeconds    = 120
    pauseMaxSeconds       = 18000
    requireUsageData      = $true
    maxStopStalls         = 3
    allowedSubagents      = @('researcher', 'scholar')
}

function Get-Config {
    $cfg = @{}
    foreach ($k in $script:DefaultConfig.Keys) { $cfg[$k] = $script:DefaultConfig[$k] }
    $file = Read-JsonFile ([IO.Path]::Combine((Get-ProjectDir), '.claude', 'guard-config.json'))
    if ($file) {
        foreach ($p in $file.PSObject.Properties) { $cfg[$p.Name] = $p.Value }
    }
    return $cfg
}

# Usage snapshot written by statusline.ps1. Windows whose reset time has passed count as 0.
function Get-Usage {
    $u = Read-JsonFile (Get-StatePath 'usage.json')
    if ($null -eq $u) { return $null }
    $now = Get-NowEpoch
    $res = [ordered]@{
        updated     = [long](Get-Prop $u 'updated')
        hasLimits   = $false
        five        = 0.0
        fiveReset   = 0
        week        = 0.0
        weekReset   = 0
        ctx         = $null
        cost        = Get-Prop $u 'cost'
    }
    $c = Get-Prop $u 'ctx'
    if ($null -ne $c) { $res.ctx = [double]$c }
    $f = Get-Prop $u 'five'
    $fr = Get-Prop $u 'fiveReset'
    $w = Get-Prop $u 'week'
    $wr = Get-Prop $u 'weekReset'
    if ($null -ne $f -or $null -ne $w) { $res.hasLimits = $true }
    if ($null -ne $f -and $null -ne $fr -and [long]$fr -gt $now) { $res.five = [double]$f; $res.fiveReset = [long]$fr }
    if ($null -ne $w -and $null -ne $wr -and [long]$wr -gt $now) { $res.week = [double]$w; $res.weekReset = [long]$wr }
    return $res
}

function Get-NotifySequence([string]$body) {
    $esc = [char]27; $bel = [char]7
    $clean = ($body -replace '[\x00-\x1f;]', ' ')
    if ($clean.Length -gt 180) { $clean = $clean.Substring(0, 180) }
    return "$esc]9;Claude guardrails: $clean$bel$bel"
}

# ---------- path helpers ----------

function ConvertTo-NativePath([string]$p) {
    if ($script:IsWin) {
        # Git Bash style /c/Users/... -> C:\Users\...
        if ($p -match '^/([a-zA-Z])(/|$)(.*)$') { $p = "$($Matches[1]):\$($Matches[3])" }
        $p = $p -replace '/', '\'
    }
    return $p
}

function Resolve-FullPath([string]$p, [string]$baseDir) {
    if ([string]::IsNullOrWhiteSpace($p)) { return $null }
    $p = ConvertTo-NativePath $p
    # Drop any glob portion so GetFullPath doesn't choke on wildcard characters.
    $wild = $p.IndexOfAny([char[]]@('*', '?', '['))
    if ($wild -ge 0) {
        $p = $p.Substring(0, $wild)
        if ($p -eq '') { $p = '.' }
    }
    try {
        if ([IO.Path]::IsPathRooted($p)) { return [IO.Path]::GetFullPath($p).TrimEnd('\', '/') }
        if (-not $baseDir) { $baseDir = Get-ProjectDir }
        return [IO.Path]::GetFullPath([IO.Path]::Combine((ConvertTo-NativePath $baseDir), $p)).TrimEnd('\', '/')
    } catch {
        return $null
    }
}

function Test-UnderDir([string]$full, [string]$dir) {
    if (-not $full -or -not $dir) { return $false }
    $dir = $dir.TrimEnd('\', '/')
    if ($full.Equals($dir, $script:PathComparison)) { return $true }
    return $full.StartsWith($dir + $script:Sep, $script:PathComparison)
}

function Test-InProject([string]$full) { return (Test-UnderDir $full (Get-ProjectDir)) }

function Get-ProtectedDirs {
    $proj = Get-ProjectDir
    return @(
        [IO.Path]::Combine($proj, '.claude'),
        [IO.Path]::Combine($proj, '.git'),
        [IO.Path]::Combine($proj, 'approved-scripts'),
        [IO.Path]::Combine($proj, 'CLAUDE.md')
    )
}

# Folders inside a protected area that the agent may write. Skills are instructions, not controls.
function Get-WritableExceptions {
    $proj = Get-ProjectDir
    return @(
        [IO.Path]::Combine($proj, '.claude', 'skills')
    )
}

function Test-Protected([string]$full) {
    foreach ($d in (Get-WritableExceptions)) {
        # Only what is inside the folder is writable; the folder itself cannot be moved or replaced.
        if ((Test-UnderDir $full $d) -and -not $full.Equals($d, $script:PathComparison)) { return $false }
    }
    foreach ($d in (Get-ProtectedDirs)) { if (Test-UnderDir $full $d) { return $true } }
    return $false
}

function Get-RelativeKey([string]$full) {
    $proj = Get-ProjectDir
    $rel = $full.Substring($proj.Length).TrimStart('\', '/')
    return ($rel -replace '\\', '/').ToLowerInvariant()
}

# PreToolUse usage guard. Three checks, nothing else:
#   1. .claude/state/STOP exists        -> end the session (manual kill switch)
#   2. weekly usage >= weeklyStopPct    -> end the session
#   3. 5-hour usage >= fiveHourPausePct -> sleep inside the hook until the window resets, then carry on
# Thresholds: .claude/usage-config.json. Usage numbers: .claude/state/usage.json, written by statusline.ps1.
# Fails open: no usage data or any error means the tool call goes ahead.

$ErrorActionPreference = 'SilentlyContinue'
$utf8 = New-Object System.Text.UTF8Encoding $false
[Console]::InputEncoding = $utf8; [Console]::OutputEncoding = $utf8
$null = [Console]::In.ReadToEnd()

$proj = $env:CLAUDE_PROJECT_DIR
if (-not $proj) { $proj = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..')) }
$state     = Join-Path $proj '.claude\state'
$stopFile  = Join-Path $state 'STOP'
$pauseFile = Join-Path $state 'paused.json'

function Read-Json($path) {
    try { if (Test-Path -LiteralPath $path) { return Get-Content -LiteralPath $path -Raw | ConvertFrom-Json } } catch { }
    return $null
}
function Get-Now { [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() }
function Format-Time($epoch) { [DateTimeOffset]::FromUnixTimeSeconds([long]$epoch).ToLocalTime().ToString('ddd h:mm tt') }
function Stop-Session($reason) {
    $out = [ordered]@{
        continue   = $false
        stopReason = $reason
        hookSpecificOutput = [ordered]@{
            hookEventName = 'PreToolUse'; permissionDecision = 'deny'; permissionDecisionReason = $reason
        }
    }
    [Console]::Out.Write(($out | ConvertTo-Json -Depth 5 -Compress))
    exit 0
}

$weeklyStop = 75; $fivePause = 95; $buffer = 120
$cfg = Read-Json (Join-Path $proj '.claude\usage-config.json')
if ($cfg) {
    if ($null -ne $cfg.weeklyStopPct)      { $weeklyStop = [double]$cfg.weeklyStopPct }
    if ($null -ne $cfg.fiveHourPausePct)   { $fivePause  = [double]$cfg.fiveHourPausePct }
    if ($null -ne $cfg.pauseBufferSeconds) { $buffer     = [long]$cfg.pauseBufferSeconds }
}

if (Test-Path -LiteralPath $stopFile) { Stop-Session 'Usage guard: .claude/state/STOP exists. Delete the file to continue.' }

$u = Read-Json (Join-Path $state 'usage.json')
if (-not $u) { exit 0 }
$now = Get-Now
# A window whose reset time has passed counts as 0.
$week = 0.0; $five = 0.0
if ($null -ne $u.week -and $u.weekReset -and [long]$u.weekReset -gt $now) { $week = [double]$u.week }
if ($null -ne $u.five -and $u.fiveReset -and [long]$u.fiveReset -gt $now) { $five = [double]$u.five }

if ($week -ge $weeklyStop) {
    Stop-Session ("Usage guard: weekly usage is at {0:N0}% (limit {1}%). Resets {2}. Raise weeklyStopPct in .claude/usage-config.json to continue." -f $week, $weeklyStop, (Format-Time $u.weekReset))
}

if ($five -ge $fivePause) {
    $deadline = [Math]::Min([long]$u.fiveReset + $buffer, $now + 18000)
    ([ordered]@{ since = $now; until = $deadline; five = $five } | ConvertTo-Json) | Set-Content -LiteralPath $pauseFile -Encoding utf8
    while ((Get-Now) -lt $deadline) {
        if (Test-Path -LiteralPath $stopFile) {
            Remove-Item -LiteralPath $pauseFile -Force
            Stop-Session 'Usage guard: STOP file appeared during the 5-hour pause.'
        }
        # Raising fiveHourPausePct above the current usage ends the pause early.
        $c2 = Read-Json (Join-Path $proj '.claude\usage-config.json')
        if ($c2 -and $null -ne $c2.fiveHourPausePct -and [double]$c2.fiveHourPausePct -gt $five) { break }
        Start-Sleep -Seconds ([Math]::Max(1, [Math]::Min(30, $deadline - (Get-Now))))
    }
    Remove-Item -LiteralPath $pauseFile -Force
    $note = "Usage guard: work was paused at {0:N0}% of the 5-hour window and resumed at {1}." -f $five, (Get-Date -Format 'h:mm tt')
    $out = [ordered]@{ hookSpecificOutput = [ordered]@{ hookEventName = 'PreToolUse'; additionalContext = $note } }
    [Console]::Out.Write(($out | ConvertTo-Json -Depth 5 -Compress))
}
exit 0

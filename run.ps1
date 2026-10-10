<#
.SYNOPSIS
  Launch Claude Code in this folder in attended or unattended mode, or control a running session.

.EXAMPLE
  .\run.ps1                                  # attended: you approve URLs/scripts, chat freely
  .\run.ps1 -Mode unattended -Resume         # continue the last conversation hands-off
  .\run.ps1 -Stop                            # kill switch: the guard halts the session at its next step
  .\run.ps1 -ClearStops                      # remove STOP / WEEKLY_CAP markers
#>
param(
    [ValidateSet('attended', 'unattended')][string]$Mode = 'attended',
    [switch]$Resume,
    [switch]$Stop,
    [switch]$ClearStops,
    [switch]$ClearBlocked,
    [string]$Prompt = 'Resume the long-run protocol: read _agent/PLAN.md and the latest entry in _agent/PROGRESS.md, then continue with the next unchecked item.'
)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$state = Join-Path $root '.claude\state'
if (-not (Test-Path $state)) { New-Item -ItemType Directory $state | Out-Null }

if ($Stop) {
    Set-Content (Join-Path $state 'STOP') (Get-Date -Format o)
    'STOP set. The session halts at its next tool call (also ends a 5-hour pause). Clear with: .\run.ps1 -ClearStops'
    return
}
if ($ClearStops) {
    Remove-Item (Join-Path $state 'STOP'), (Join-Path $state 'WEEKLY_CAP'), (Join-Path $state 'stop-guard.json') -ErrorAction SilentlyContinue
    'Cleared STOP and WEEKLY_CAP. (The weekly cap re-triggers immediately if usage is still at or above it.)'
    return
}
if ($ClearBlocked) {
    Remove-Item (Join-Path $root '_agent\BLOCKED'), (Join-Path $root '_agent\DONE') -ErrorAction SilentlyContinue
    'Cleared _agent\BLOCKED and _agent\DONE.'
    return
}

Set-Location $root
$autorun = Join-Path $state 'AUTORUN'
if ($Mode -eq 'unattended') {
    Set-Content $autorun (Get-Date -Format o)
    Remove-Item (Join-Path $state 'stop-guard.json') -ErrorAction SilentlyContinue
    $claudeArgs = @('--permission-mode', 'dontAsk')
    if ($Resume) { $claudeArgs += '--continue' }
    $claudeArgs += $Prompt
} else {
    Remove-Item $autorun -ErrorAction SilentlyContinue
    $claudeArgs = @('--permission-mode', 'default')
    if ($Resume) { $claudeArgs += '--continue' }
}
& claude @claudeArgs

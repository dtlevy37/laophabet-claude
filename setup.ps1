<#
.SYNOPSIS
  One-time setup for the guardrail kit. Run from the working folder:
    powershell -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1
  Runs a local self-test of the guard (no Claude usage).
#>
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
Set-Location $root
Write-Host "Setting up guardrails in $root" -ForegroundColor Cyan

# 1. Unblock downloaded scripts (Mark of the Web)
Get-ChildItem $root -Recurse -Filter *.ps1 | ForEach-Object { try { Unblock-File $_.FullName } catch {} }

# 2. Folders
foreach ($d in '.claude\state', '_agent\tmp', '_agent\proposed-scripts', '_agent\research','approved-scripts', '_trash') {
    New-Item -ItemType Directory -Path (Join-Path $root $d) -Force | Out-Null
}

# 3. Absolute path for the status line
$settingsPath = Join-Path $root '.claude\settings.json'
$s = Get-Content $settingsPath -Raw
if ($s -match '__PROJECT_DIR__') {
    $s = $s.Replace('__PROJECT_DIR__', ($root -replace '\\', '/'))
    [IO.File]::WriteAllText($settingsPath, $s, (New-Object Text.UTF8Encoding $false))
    Write-Host 'Status line path set.'
}

# 4. Tool checks
$ver = $null
try { $ver = (& claude --version) 2>$null } catch {}
if ($ver -match '(\d+)\.(\d+)\.(\d+)') {
    $v = [version]"$($Matches[1]).$($Matches[2]).$($Matches[3])"
    Write-Host "Claude Code $v"
    if ($v -lt [version]'2.1.295') { Write-Warning 'Claude Code is older than 2.1.295: the guard hook will fail OPEN on errors (onFailure: block unsupported). Run: claude update' }
} else { Write-Warning 'Could not run "claude --version". Is Claude Code installed and on PATH?' }

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Write-Warning 'git not found. Install Git for Windows (also provides Git Bash, which Claude Code prefers for shell commands).' }
elseif (-not (Test-Path (Join-Path $root '.git'))) { git init -q; Write-Host 'git repo initialised.' }

$gi = Join-Path $root '.gitignore'
$lines = @('.claude/state/', '.claude/settings.local.json', '_agent/tmp/', '_trash/')
$existing = if (Test-Path $gi) { Get-Content $gi } else { @() }
$add = $lines | Where-Object { $existing -notcontains $_ }
if ($add) { Add-Content $gi $add }

# 5. Self-test the guard with mock inputs
Write-Host "`nSelf-test (local only):" -ForegroundColor Cyan
$state = Join-Path $root '.claude\state'
$usagePath = Join-Path $state 'usage.json'
$backup = if (Test-Path $usagePath) { Get-Content $usagePath -Raw } else { $null }
$now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$env:CLAUDE_PROJECT_DIR = $root
$guard = Join-Path $root '.claude\hooks\guard.ps1'

function Invoke-Guard($toolName, $toolInput) {
    $payload = @{ hook_event_name = 'PreToolUse'; tool_name = $toolName; tool_input = $toolInput; cwd = $root } | ConvertTo-Json -Compress -Depth 5
    $out = $payload | powershell -NoProfile -ExecutionPolicy Bypass -File $guard
    return ($out -join '')
}
function Check($label, $toolName, $toolInput, $expect) {
    $out = Invoke-Guard $toolName $toolInput
    $got = if ($out -match '"continue":\s*false') { 'stop' } elseif ($out -match '"deny"') { 'deny' } else { 'allow' }
    $ok = ($got -eq $expect)
    $color = if ($ok) { 'Green' } else { 'Red' }
    Write-Host ("  [{0}] {1,-45} expected {2}, got {3}" -f $(if ($ok) { 'PASS' } else { 'FAIL' }), $label, $expect, $got) -ForegroundColor $color
    return $ok
}

$results = @()
@{ updated = $now; ctx = 10; five = 10; fiveReset = $now + 3600; week = 10; weekReset = $now + 86400 } | ConvertTo-Json | Set-Content $usagePath
$results += Check 'grep inside folder'            'Bash' @{ command = 'grep -rn "TODO" _agent' } 'allow'
$results += Check 'rm blocked'                    'Bash' @{ command = 'rm -rf _agent/tmp' } 'deny'
$results += Check 'curl blocked'                  'Bash' @{ command = 'curl https://example.com' } 'deny'
$results += Check 'python -c blocked'             'Bash' @{ command = 'python -c "print(1)"' } 'deny'
$results += Check 'unapproved script blocked'     'Bash' @{ command = 'python _agent/proposed-scripts/x.py' } 'deny'
$results += Check 'read outside folder blocked'   'Read' @{ file_path = 'C:\Windows\win.ini' } 'deny'
$results += Check 'cat outside folder blocked'    'Bash' @{ command = 'cat /c/Windows/win.ini' } 'deny'
$results += Check 'write to .claude blocked'      'Write' @{ file_path = (Join-Path $root '.claude\settings.json') } 'deny'
$results += Check 'write to _agent allowed'       'Write' @{ file_path = (Join-Path $root '_agent\PROGRESS.md') } 'allow'
$results += Check 'git push blocked'              'Bash' @{ command = 'git push origin main' } 'deny'
$results += Check 'non-researcher subagent'       'Agent' @{ subagent_type = 'general-purpose'; prompt = 'x' } 'deny'
@{ updated = $now; ctx = 10; five = 10; fiveReset = $now + 3600; week = 61; weekReset = $now + 86400 } | ConvertTo-Json | Set-Content $usagePath
$results += Check 'weekly cap stops run'          'Read' @{ file_path = (Join-Path $root 'CLAUDE.md') } 'stop'

# Restore state
Remove-Item (Join-Path $state 'WEEKLY_CAP'), (Join-Path $state 'flags.json') -ErrorAction SilentlyContinue
if ($backup) { Set-Content $usagePath $backup } else { Remove-Item $usagePath -ErrorAction SilentlyContinue }

$fails = @($results | Where-Object { -not $_ }).Count
if ($fails -eq 0) { Write-Host "`nAll checks passed." -ForegroundColor Green }
else { Write-Host "`n$fails check(s) failed. See .claude\state\guard.log and send me the output." -ForegroundColor Red }

Write-Host @"

Next:
  1. Fill in the Domain context section of CLAUDE.md and the plan in _agent\PLAN.md (or let the agent draft it).
  2. Start attended:    .\run.ps1
     Approve the domains and scripts it needs ("Yes, and don't ask again" saves domain rules).
  3. Go unattended:     .\run.ps1 -Mode unattended -Resume
  4. Kill switch:       .\run.ps1 -Stop
"@

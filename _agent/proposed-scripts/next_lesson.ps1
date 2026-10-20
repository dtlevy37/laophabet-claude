<#
Build the next lesson(s) unattended with `claude -p`, one fresh session per lesson.

Usage (from the project root, in your own terminal):
  powershell -NoProfile -ExecutionPolicy Bypass -File approved-scripts/next_lesson.ps1
  powershell -NoProfile -ExecutionPolicy Bypass -File approved-scripts/next_lesson.ps1 -Count 3 -Model sonnet

Per lesson:
  1. Stops if _agent/BLOCKED exists.
  2. python approved-scripts/lesson_tool.py brief  -> _agent/lessons/next-brief.md
  3. Pipes approved-scripts/next_lesson_prompt.md into `claude -p` (fresh context, project settings and hooks apply).
     The session drafts, checks and merges exactly one lesson (lesson_tool.py check / merge).
  4. Verifies that data/lessons.csv gained exactly one row; otherwise stops with exit code 1.
  5. Runs the data pipeline, then commits: "lesson: <id> <title>".
Logs: _agent/lessons/logs/<id>-<timestamp>.log
Runs only approved scripts, git and the claude CLI.
#>
param(
    [int]$Count = 1,
    [string]$Model = "opus",
    [int]$MaxTurns = 80
)
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)
$utf8 = New-Object System.Text.UTF8Encoding $false
$OutputEncoding = $utf8
[Console]::OutputEncoding = $utf8

function Get-LessonCount {
    if (-not (Test-Path "data/lessons.csv")) { return 0 }
    return @(Import-Csv -Path "data/lessons.csv" -Encoding UTF8).Count
}

$logDir = "_agent/lessons/logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

for ($i = 1; $i -le $Count; $i++) {
    if (Test-Path "_agent/BLOCKED") { Write-Host "Stopped: _agent/BLOCKED exists."; exit 1 }
    $before = Get-LessonCount
    $lid = "L{0:D4}" -f ($before + 1)
    Write-Host "== $lid ($i of $Count) =="

    & python approved-scripts/lesson_tool.py brief
    if ($LASTEXITCODE -ne 0) { Write-Host "Stopped: brief failed."; exit 1 }

    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $log = Join-Path $logDir "$lid-$stamp.log"
    Get-Content -Raw -Encoding UTF8 "approved-scripts/next_lesson_prompt.md" |
        & claude -p --model $Model --max-turns $MaxTurns 2>&1 |
        Tee-Object -FilePath $log
    $after = Get-LessonCount
    if ($after -ne $before + 1) {
        Write-Host "Stopped: expected $($before + 1) lessons, found $after. See $log and _agent/NEEDS_HUMAN.md."
        exit 1
    }

    & bash approved-scripts/pipeline.sh
    if ($LASTEXITCODE -ne 0) { Write-Host "Stopped: pipeline failed after $lid. Lesson merged but not committed."; exit 1 }

    $title = (Import-Csv -Path "data/lessons.csv" -Encoding UTF8 | Select-Object -Last 1).title_en
    & git add -A
    & git commit -q -m "lesson: $lid $title"
    if ($LASTEXITCODE -ne 0) { Write-Host "Stopped: commit failed."; exit 1 }
    Write-Host "Committed $lid $title"
}

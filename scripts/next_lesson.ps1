<#
Build the next lesson(s) unattended with `claude -p`, one fresh session per lesson.

Usage (from the project root, in your own terminal):
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/next_lesson.ps1
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/next_lesson.ps1 -Count 3 -Model sonnet

Per lesson:
  1. Stops if tmp/STOP_LESSONS exists.
  2. python scripts/lesson_tool.py brief  -> curriculum/lessons/next-brief.md
  3. Pipes scripts/next_lesson_prompt.md into `claude -p` (fresh context, project settings and hooks apply).
     The session drafts, checks and merges exactly one lesson (lesson_tool.py check / merge).
  4. Verifies that data/lessons.csv gained exactly one row and that merge wrote the lesson migration
     app/backend/supabase/migrations/<stamp>_lesson_<id>.sql; otherwise stops with exit code 1.
  5. Runs the data pipeline, then commits: "lesson: <id> <title>". The migration is committed for owner
     review and never applied here.
Logs: curriculum/lessons/logs/<id>-<timestamp>.log
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

$logDir = "curriculum/lessons/logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

for ($i = 1; $i -le $Count; $i++) {
    if (Test-Path "tmp/STOP_LESSONS") { Write-Host "Stopped: tmp/STOP_LESSONS exists."; exit 1 }
    $before = Get-LessonCount
    $lid = "L{0:D4}" -f ($before + 1)
    Write-Host "== $lid ($i of $Count) =="

    & python scripts/lesson_tool.py brief
    if ($LASTEXITCODE -ne 0) { Write-Host "Stopped: brief failed."; exit 1 }

    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $log = Join-Path $logDir "$lid-$stamp.log"
    Get-Content -Raw -Encoding UTF8 "scripts/next_lesson_prompt.md" |
        & claude -p --model $Model --max-turns $MaxTurns 2>&1 |
        Tee-Object -FilePath $log
    $after = Get-LessonCount
    if ($after -ne $before + 1) {
        Write-Host "Stopped: expected $($before + 1) lessons, found $after. See $log and docs/QUESTIONS.md."
        exit 1
    }

    $mig = Get-ChildItem -Path "app/backend/supabase/migrations" -Filter "*_lesson_$($lid.ToLower()).sql" |
        Select-Object -Last 1
    if (-not $mig) { Write-Host "Stopped: $lid merged but no lesson migration was written."; exit 1 }

    & bash scripts/pipeline.sh
    if ($LASTEXITCODE -ne 0) { Write-Host "Stopped: pipeline failed after $lid. Lesson merged but not committed."; exit 1 }

    $title = (Import-Csv -Path "data/lessons.csv" -Encoding UTF8 | Select-Object -Last 1).title_en
    & git add -A
    & git commit -q -m "lesson: $lid $title"
    if ($LASTEXITCODE -ne 0) { Write-Host "Stopped: commit failed."; exit 1 }
    Write-Host "Committed $lid $title (migration for review: $($mig.Name))"
}

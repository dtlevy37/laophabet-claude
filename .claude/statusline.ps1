# Status line: shows context / 5-hour / weekly usage and writes .claude/state/usage.json for the guard hook.

$ErrorActionPreference = 'SilentlyContinue'
$utf8 = New-Object System.Text.UTF8Encoding $false
[Console]::InputEncoding = $utf8; [Console]::OutputEncoding = $utf8

$d = [Console]::In.ReadToEnd() | ConvertFrom-Json
$proj = $d.workspace.project_dir
if (-not $proj) { $proj = $d.cwd }
$stateDir = Join-Path $proj '.claude\state'
if (-not (Test-Path $stateDir)) { New-Item -ItemType Directory -Path $stateDir -Force | Out-Null }
$usagePath = Join-Path $stateDir 'usage.json'

$ctx  = $d.context_window.used_percentage
$five = $d.rate_limits.five_hour.used_percentage
$fr   = $d.rate_limits.five_hour.resets_at
$week = $d.rate_limits.seven_day.used_percentage
$wr   = $d.rate_limits.seven_day.resets_at
$cost = $d.cost.total_cost_usd

# Keep last known limit values if this update has none (field absent early in a session).
$prev = $null
if (Test-Path $usagePath) { $prev = Get-Content $usagePath -Raw | ConvertFrom-Json }
if ($null -eq $five -and $prev) { $five = $prev.five; $fr = $prev.fiveReset }
if ($null -eq $week -and $prev) { $week = $prev.week; $wr = $prev.weekReset }

$now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$snap = [ordered]@{ updated = $now; ctx = $ctx; five = $five; fiveReset = $fr; week = $week; weekReset = $wr; cost = $cost; session = $d.session_id }
$tmp = "$usagePath.sl.tmp"
[IO.File]::WriteAllText($tmp, ($snap | ConvertTo-Json -Compress), $utf8)
Move-Item -LiteralPath $tmp -Destination $usagePath -Force

# Thresholds for colors
$cfgPath = Join-Path $proj '.claude\guard-config.json'
$cap = 60; $pause = 88
if (Test-Path $cfgPath) { $c = Get-Content $cfgPath -Raw | ConvertFrom-Json; if ($c.weeklyStopPct) { $cap = $c.weeklyStopPct }; if ($c.fiveHourPausePct) { $pause = $c.fiveHourPausePct } }

$e = [char]27
function Col($v, $warn, $bad) {
    if ($null -eq $v) { return "--" }
    $n = [int][Math]::Floor([double]$v)
    $color = if ($n -ge $bad) { '31' } elseif ($n -ge $warn) { '33' } else { '32' }
    return "$e[${color}m$n%$e[0m"
}
function T($epoch) { if (-not $epoch) { return '' }; return [DateTimeOffset]::FromUnixTimeSeconds([long]$epoch).ToLocalTime().ToString('h:mmtt').ToLower() }

$parts = @()
$parts += "[$($d.model.display_name)]"
$parts += "ctx $(Col $ctx 60 80)"
$parts += "5h $(Col $five 70 $pause)" + $(if ($fr) { " ($(T $fr))" } else { '' })
$parts += "wk $(Col $week ($cap - 10) $cap)/$cap"
if ($cost) { $parts += ('${0:N2}' -f [double]$cost) }

if (Test-Path (Join-Path $stateDir 'STOP'))       { $parts += "$e[41m STOP $e[0m" }
if (Test-Path (Join-Path $stateDir 'WEEKLY_CAP')) { $parts += "$e[41m WEEKLY CAP $e[0m" }
$pp = Join-Path $stateDir 'paused.json'
if (Test-Path $pp) { $pz = Get-Content $pp -Raw | ConvertFrom-Json; $parts += "$e[43m PAUSED until $(T $pz.until) $e[0m" }
if (Test-Path (Join-Path $stateDir 'AUTORUN'))    { $parts += "$e[36mAUTORUN$e[0m" }

Write-Output ($parts -join ' | ')

<#
.SYNOPSIS
  Approve, revoke, or list scripts the agent may run. Run this yourself; the agent cannot.

.EXAMPLE
  .\.claude\tools\approve-script.ps1 _agent\proposed-scripts\parse.py    # review first, then approve
  .\.claude\tools\approve-script.ps1 -Revoke parse.py
  .\.claude\tools\approve-script.ps1 -List
#>
param(
    [Parameter(Position = 0)][string]$Path,
    [switch]$Revoke,
    [switch]$List,
    [switch]$Force   # overwrite without asking (use when running from Claude Code's ! prompt)
)
$ErrorActionPreference = 'Stop'
$proj = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$approvedDir = Join-Path $proj 'approved-scripts'
$manifestPath = Join-Path $proj '.claude\approved-scripts.json'
if (-not (Test-Path $approvedDir)) { New-Item -ItemType Directory $approvedDir | Out-Null }

$m = @{}
if (Test-Path $manifestPath) {
    $j = Get-Content $manifestPath -Raw | ConvertFrom-Json
    if ($j) { foreach ($p in $j.PSObject.Properties) { $m[$p.Name] = $p.Value } }
}
function Save { ($m | ConvertTo-Json) | Set-Content -Path $manifestPath -Encoding UTF8 }

if ($List) {
    if ($m.Count -eq 0) { 'No approved scripts.'; return }
    foreach ($k in $m.Keys) {
        $f = Join-Path $proj $k
        $state = if (-not (Test-Path $f)) { 'MISSING' } elseif ((Get-FileHash $f -Algorithm SHA256).Hash -eq $m[$k]) { 'ok' } else { 'CHANGED (re-approve)' }
        '{0,-50} {1}' -f $k, $state
    }
    return
}

if (-not $Path) { throw 'Give a script path, or use -List.' }

if ($Revoke) {
    $key = 'approved-scripts/' + [IO.Path]::GetFileName($Path).ToLowerInvariant()
    if ($m.ContainsKey($key)) { $m.Remove($key); Save; "Revoked $key (file left in place)." } else { "$key was not approved." }
    return
}

$src = (Resolve-Path $Path).Path
$name = [IO.Path]::GetFileName($src)
$dest = Join-Path $approvedDir $name
if (-not $src.Equals($dest, [StringComparison]::OrdinalIgnoreCase)) {
    if ((Test-Path $dest) -and -not $Force) {
        $ans = Read-Host "approved-scripts\$name exists. Overwrite? (y/N)"
        if ($ans -ne 'y') { 'Cancelled.'; return }
    }
    Copy-Item $src $dest -Force
}
$hash = (Get-FileHash $dest -Algorithm SHA256).Hash
$key = ('approved-scripts/' + $name).ToLowerInvariant()
$m[$key] = $hash
Save
"Approved $key"
"SHA256 $hash"
"The agent can now run it, e.g.: python approved-scripts/$name"

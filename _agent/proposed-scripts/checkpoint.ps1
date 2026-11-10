<#
Checkpoint: commit, and optionally push, the project's three git repos.

  powershell -NoProfile -ExecutionPolicy Bypass -File approved-scripts/checkpoint.ps1 -Message "checkpoint: <item>" [-Push]

Repos (each skipped if its own folder has no .git; the script never lets git walk up to a parent repo):
  1. laophabet-claude    the project root (harness, data, scripts, notes; ignores the two app folders)
  2. laophabet-backend   app/backend  (Supabase migrations, seeds, tests)
  3. laophabet-frontend  app/frontend (deployed by Netlify)
Safety:
  - each repo must be on branch main
  - the origin URL must be exactly https://github.com/dtlevy37/<that repo's name>(.git)
  - pushes only `origin main`, never forces, never touches other remotes or branches
  - aborts that repo (and unstages) if the staged changes add a Supabase secret key (sb_secret_...),
    a private key block, or a service_role JWT
  - commits only when something is staged; with -Push it still pushes earlier unpushed commits
  - one repo failing does not stop the others; the script exits 1 at the end and lists what failed
Never reads or writes anything outside the three repos.
#>
param(
    [Parameter(Mandatory = $true)][string]$Message,
    [switch]$Push,
    [string]$Trailer = 'Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>'
)
$ErrorActionPreference = 'Stop'

$root  = Split-Path -Parent $PSScriptRoot
$repos = @(
    @{ Path = $root;                            Name = 'laophabet-claude' },
    @{ Path = (Join-Path $root 'app/backend');  Name = 'laophabet-backend' },
    @{ Path = (Join-Path $root 'app/frontend'); Name = 'laophabet-frontend' }
)
$secretPattern = '^\+.*(sb_secret_|BEGIN [A-Z ]*PRIVATE KEY|service_role.{0,40}eyJ)'
$failed = @()

foreach ($r in $repos) {
    $repo = $r.Path
    if (-not (Test-Path -LiteralPath (Join-Path $repo '.git'))) {
        Write-Output "skip (no git repo): $repo"
        continue
    }
    Push-Location -LiteralPath $repo
    try {
        $branch = (git rev-parse --abbrev-ref HEAD | Out-String).Trim()
        if ($branch -ne 'main') { throw "on branch '$branch'; expected 'main'" }

        git add -A
        $staged = git diff --cached --name-only
        if ($staged) {
            $hit = git diff --cached -U0 | Select-String -Pattern $secretPattern
            if ($hit) {
                git reset -q
                $line = $hit[0].Line
                throw ("staged changes look like they contain a secret key; nothing committed. First hit: " + $line.Substring(0, [Math]::Min(60, $line.Length)))
            }
            git commit -q -m $Message -m $Trailer
            if ($LASTEXITCODE -ne 0) { throw 'commit failed' }
            Write-Output ("committed in {0}: {1}" -f $r.Name, (git log --oneline -1 | Out-String).Trim())
        } else {
            Write-Output ("nothing to commit in {0}" -f $r.Name)
        }

        if ($Push) {
            $url = (git remote get-url origin | Out-String).Trim()
            if ($LASTEXITCODE -ne 0 -or -not $url) { throw "no 'origin' remote" }
            $expected = '^https://github\.com/dtlevy37/' + [regex]::Escape($r.Name) + '(\.git)?$'
            if ($url -notmatch $expected) { throw "origin is '$url'; expected github.com/dtlevy37/$($r.Name)" }
            git push origin main
            if ($LASTEXITCODE -ne 0) { throw 'push failed' }
            Write-Output ("pushed {0}" -f $r.Name)
        }
    }
    catch {
        $failed += $r.Name
        Write-Output ("FAILED {0}: {1}" -f $r.Name, $_.Exception.Message)
    }
    finally {
        Pop-Location
    }
}

if ($failed.Count -gt 0) {
    Write-Output ("checkpoint incomplete; failed: " + ($failed -join ', '))
    exit 1
}

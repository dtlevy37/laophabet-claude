<#
Checkpoint: commit, and optionally push, the project's two git repos.

  powershell -NoProfile -ExecutionPolicy Bypass -File approved-scripts/checkpoint.ps1 -Message "checkpoint: <item>" [-Push]

Repos (each skipped if it has no .git folder):
  1. the project root (everything except app/frontend; that folder is ignored here)
  2. app/frontend (its own repo, deployed by Netlify)
Safety:
  - each repo must be on branch main
  - pushes only `origin main`, never forces, never touches other remotes or branches
  - aborts (and unstages) if the staged changes add a Supabase secret key (sb_secret_...),
    a private key block, or a service_role JWT
  - commits only when something is staged; with -Push it still pushes earlier unpushed commits
Never reads or writes anything outside the two repos.
#>
param(
    [Parameter(Mandatory = $true)][string]$Message,
    [switch]$Push,
    [string]$Trailer = 'Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>'
)
$ErrorActionPreference = 'Stop'

$root  = Split-Path -Parent $PSScriptRoot
$repos = @($root, (Join-Path $root 'app/frontend'))
$secretPattern = '^\+.*(sb_secret_|BEGIN [A-Z ]*PRIVATE KEY|service_role.{0,40}eyJ)'

foreach ($repo in $repos) {
    if (-not (Test-Path -LiteralPath (Join-Path $repo '.git'))) {
        Write-Output "skip (no git repo): $repo"
        continue
    }
    Push-Location -LiteralPath $repo
    try {
        $branch = (git rev-parse --abbrev-ref HEAD | Out-String).Trim()
        if ($branch -ne 'main') { throw "$repo is on branch '$branch'; expected 'main'" }

        git add -A
        $staged = git diff --cached --name-only
        if ($staged) {
            $hit = git diff --cached -U0 | Select-String -Pattern $secretPattern
            if ($hit) {
                git reset -q
                throw "$repo : staged changes look like they contain a secret key; nothing committed. First hit: $($hit[0].Line.Substring(0, [Math]::Min(60, $hit[0].Line.Length)))"
            }
            git commit -q -m $Message -m $Trailer
            if ($LASTEXITCODE -ne 0) { throw "commit failed in $repo" }
            Write-Output ("committed in {0}: {1}" -f $repo, (git log --oneline -1 | Out-String).Trim())
        } else {
            Write-Output "nothing to commit in $repo"
        }

        if ($Push) {
            git remote get-url origin | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "$repo has no 'origin' remote" }
            git push origin main
            if ($LASTEXITCODE -ne 0) { throw "push failed in $repo" }
            Write-Output "pushed $repo"
        }
    }
    finally {
        Pop-Location
    }
}

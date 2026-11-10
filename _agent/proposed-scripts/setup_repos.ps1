<#
One-time setup of the project's three git repos. Safe to re-run: every step checks first and skips what is done.

  powershell -NoProfile -ExecutionPolicy Bypass -File approved-scripts/setup_repos.ps1 [-Push]

Without -Push it only prepares locally (init, untrack, rename, commit, add remote). With -Push it also runs
`git push -u origin main` in each repo. Never forces; a rejected push is reported, not overridden.

Repos (github.com/dtlevy37, private, created empty by the user):
  laophabet-backend   app/backend   (new: git init -b main, first commit)
  laophabet-frontend  app/frontend  (already set up by the user; only verified and pushed)
  laophabet-claude    project root  (stops tracking app/frontend, app/backend and __pycache__, renamed master -> main)

Safety:
  - an existing origin must already be exactly the expected URL, otherwise that repo is skipped with an error
  - a commit is aborted (and unstaged) if the staged changes add a Supabase secret key, a private key block or a
    service_role JWT
  - GIT_TERMINAL_PROMPT=0 so a missing GitHub login fails fast instead of hanging; sign in once by hand
    (a manual `git push` in any repo) to store the login
  - the backend's .gitignore must exist (it keeps supabase/.temp, which holds local secrets, out of git)
Never reads or writes outside the three repos.
#>
param([switch]$Push)
$ErrorActionPreference = 'Stop'
$env:GIT_TERMINAL_PROMPT = '0'

$root  = Split-Path -Parent $PSScriptRoot
$owner = 'dtlevy37'
# Built from fragments so this file never matches its own scan.
$secretPattern = '^\+.*(' + 'sb_' + 'secret_|BEGIN [A-Z ]*PRIVATE' + ' KEY|service_' + 'role.{0,40}eyJ)'
$failed = @()

function Test-RepoGit([string]$path) { Test-Path -LiteralPath (Join-Path $path '.git') }

function Add-Origin([string]$name) {
    $expected = "https://github.com/$owner/$name.git"
    $remotes = @(git remote)
    if ($remotes -notcontains 'origin') {
        git remote add origin $expected
        if ($LASTEXITCODE -ne 0) { throw 'git remote add failed' }
        Write-Output "  added origin $expected"
    } else {
        $url = (git remote get-url origin | Out-String).Trim()
        if ($url -ne $expected -and $url -ne ($expected -replace '\.git$', '')) {
            throw "origin is '$url'; expected '$expected'"
        }
        Write-Output '  origin ok'
    }
}

function Save-Commit([string]$msg) {
    git add -A
    $staged = git diff --cached --name-only
    if (-not $staged) { Write-Output '  nothing to commit'; return }
    $hit = git diff --cached -U0 | Select-String -Pattern $secretPattern
    if ($hit) {
        git reset -q
        throw 'staged changes look like they contain a secret key; nothing committed'
    }
    git commit -q -m $msg -m 'Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>'
    if ($LASTEXITCODE -ne 0) { throw 'commit failed' }
    Write-Output ('  committed: ' + (git log --oneline -1 | Out-String).Trim())
}

function Publish-Main {
    if (-not $Push) { Write-Output '  (not pushing: no -Push)'; return }
    git push -u origin main
    if ($LASTEXITCODE -ne 0) { throw 'push failed (repo not empty or not signed in?); not forced' }
    Write-Output '  pushed'
}

# 1. backend: new repo
$backend = Join-Path $root 'app/backend'
Write-Output 'laophabet-backend'
try {
    if (-not (Test-Path -LiteralPath (Join-Path $backend '.gitignore'))) { throw 'app/backend/.gitignore is missing' }
    Push-Location -LiteralPath $backend
    try {
        if (-not (Test-RepoGit $backend)) {
            git init -q -b main
            if ($LASTEXITCODE -ne 0) { throw 'git init failed' }
            Write-Output '  initialised'
        }
        $b = (git symbolic-ref --short HEAD | Out-String).Trim()
        if ($b -ne 'main') { throw "on branch '$b'; expected main" }
        Save-Commit 'Initial commit: backend (earlier history is in laophabet-claude)'
        Add-Origin 'laophabet-backend'
        Publish-Main
    } finally { Pop-Location }
} catch { $failed += 'laophabet-backend'; Write-Output "  FAILED: $($_.Exception.Message)" }

# 2. frontend: verify and push
$frontend = Join-Path $root 'app/frontend'
Write-Output 'laophabet-frontend'
try {
    if (-not (Test-RepoGit $frontend)) { throw 'app/frontend has no git repo' }
    Push-Location -LiteralPath $frontend
    try {
        $b = (git symbolic-ref --short HEAD | Out-String).Trim()
        if ($b -ne 'main') { throw "on branch '$b'; expected main" }
        Save-Commit 'Update frontend'
        Add-Origin 'laophabet-frontend'
        Publish-Main
    } finally { Pop-Location }
} catch { $failed += 'laophabet-frontend'; Write-Output "  FAILED: $($_.Exception.Message)" }

# 3. root: untrack the app folders and .pyc files, rename the branch, commit, push
Write-Output 'laophabet-claude'
try {
    if (-not (Test-RepoGit $root)) { throw 'project root has no git repo' }
    Push-Location -LiteralPath $root
    try {
        foreach ($p in @('app/frontend', 'app/backend', 'approved-scripts/__pycache__')) {
            if (git ls-files $p) {
                git rm -r --cached -q $p
                if ($LASTEXITCODE -ne 0) { throw "git rm --cached $p failed" }
                Write-Output "  untracked $p"
            }
        }
        $b = (git symbolic-ref --short HEAD | Out-String).Trim()
        if ($b -eq 'master') {
            git branch -m master main
            if ($LASTEXITCODE -ne 0) { throw 'branch rename failed' }
            Write-Output '  renamed master -> main'
        } elseif ($b -ne 'main') { throw "on branch '$b'; expected master or main" }
        Save-Commit 'Split app/frontend and app/backend into their own repos'
        Add-Origin 'laophabet-claude'
        Publish-Main
    } finally { Pop-Location }
} catch { $failed += 'laophabet-claude'; Write-Output "  FAILED: $($_.Exception.Message)" }

if ($failed.Count -gt 0) {
    Write-Output ('setup incomplete; failed: ' + ($failed -join ', '))
    exit 1
}
Write-Output 'setup done'

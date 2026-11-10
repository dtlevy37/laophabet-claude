<#
One-off: remove every Supabase CLI `.temp/` folder from the ENTIRE history of the project-root repo
(laophabet-claude), then push. GitHub push protection rejected the first push because two early commits
contain supabase/.temp/start-secrets/*/env/docker.env (local-stack keys, committed before .temp was ignored).

  powershell -NoProfile -ExecutionPolicy Bypass -File approved-scripts/purge_temp_secrets.ps1 [-Push]

Steps:
  1. refuse unless the root repo is on main, origin is github.com/dtlevy37/laophabet-claude, and nothing has been pushed
     (a rewrite after a push would need a force push, which this project never does)
  2. commit any pending changes (so filter-branch has a clean tree)
  3. back up the whole .git folder to _trash/git-backup-<time> (ignored by git; delete it once you are happy)
  4. git filter-branch: remove every path with a `.temp/` folder from every commit, drop commits left empty
  5. delete filter-branch's backup refs, expire reflogs, gc (so the old objects are gone locally too)
  6. verify no .temp path is left in history; with -Push run `git push -u origin main` (no force)
Commit hashes change. Only this repo is touched; the backend and frontend repos are not.
#>
param([switch]$Push)
$ErrorActionPreference = 'Stop'
$env:GIT_TERMINAL_PROMPT = '0'
$env:FILTER_BRANCH_SQUELCH_WARNING = '1'

$root = Split-Path -Parent $PSScriptRoot
$expectedUrl = 'https://github.com/dtlevy37/laophabet-claude.git'
Push-Location -LiteralPath $root
try {
    if (-not (Test-Path -LiteralPath (Join-Path $root '.git'))) { throw 'project root has no git repo' }
    $b = (git symbolic-ref --short HEAD | Out-String).Trim()
    if ($b -ne 'main') { throw "on branch '$b'; expected main" }
    $url = (git remote get-url origin | Out-String).Trim()
    if ($url -ne $expectedUrl -and $url -ne ($expectedUrl -replace '\.git$', '')) { throw "origin is '$url'; expected $expectedUrl" }
    $remoteRefs = @(git for-each-ref refs/remotes)
    if ($remoteRefs.Count -gt 0) { throw 'remote-tracking branches exist: something was pushed; not rewriting history' }

    # 2. clean tree
    git add -A
    $staged = git diff --cached --name-only
    if ($staged) {
        git commit -q -m 'checkpoint: before purging .temp from history' -m 'Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>'
        if ($LASTEXITCODE -ne 0) { throw 'commit failed' }
        Write-Output 'committed pending changes'
    }

    # 3. backup
    $stamp  = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backup = Join-Path $root "_trash/git-backup-$stamp"
    New-Item -ItemType Directory -Force -Path (Join-Path $root '_trash') | Out-Null
    Copy-Item -LiteralPath (Join-Path $root '.git') -Destination $backup -Recurse
    Write-Output "backup: $backup"

    # 4. rewrite
    $filter = "git ls-files -z | grep -zE '(^|/)\.temp/' | xargs -0 -r git rm -r --cached -q --ignore-unmatch"
    git filter-branch --force --prune-empty --index-filter $filter -- --all
    if ($LASTEXITCODE -ne 0) { throw 'filter-branch failed; the backup is intact' }

    # 5. drop old objects
    $orig = @(git for-each-ref --format='%(refname)' refs/original)
    foreach ($r in $orig) { git update-ref -d $r }
    git reflog expire --expire=now --all
    git gc -q --prune=now

    # 6. verify
    $left = git log --all --name-only --pretty=format: | Select-String -Pattern '(^|/)\.temp/' -List
    if ($left) { throw "a .temp path is still in history: $($left.Line)" }
    Write-Output ('history clean; ' + (git rev-list --count HEAD | Out-String).Trim() + ' commits; head ' + (git log --oneline -1 | Out-String).Trim())

    if ($Push) {
        git push -u origin main
        if ($LASTEXITCODE -ne 0) { throw 'push failed; not forced' }
        Write-Output 'pushed laophabet-claude'
    } else { Write-Output '(not pushing: no -Push)' }
}
finally { Pop-Location }

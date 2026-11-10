# Git setup: three repos, agent can push (staged 2026-11-10; decided by the user)

| Repo (private, github.com/dtlevy37) | Purpose | Local folder |
|---|---|---|
| `laophabet-frontend` | what Netlify deploys; Netlify never sees the backend | `app/frontend` |
| `laophabet-backend` | Supabase migrations, seeds, tests: DB history and restoration | `app/backend` |
| `laophabet` | the harness and everything else: scripts, agents, guard, data CSVs, plans, notes. Lets you resume the workflow after losing the drive | project root (ignores the two app folders) |

The two app repos are nested inside the project folder. The root repo ignores them (`.gitignore` already says so).

**How the agent pushes:** not by loosening the guard (`git push`, `remote`, `-C` stay blocked for ad-hoc commands).
One approved script, `approved-scripts/checkpoint.ps1`, commits all three repos and pushes only `origin main`, never
with force. It checks each origin URL is exactly `github.com/dtlevy37/<that repo>`, and aborts a repo if a secret key
is staged. **Untested** (the agent cannot run PowerShell git).

**Restore story:** `laophabet-backend` has the migrations that rebuild the database; `laophabet` has the content
CSVs those migrations are generated from. Clone all three into the same layout:
`laophabet/` then `laophabet/app/frontend` and `laophabet/app/backend`.

## Steps (PowerShell, from the project root)

### 1. GitHub: create empty private repos
`laophabet-backend` and `laophabet` (no README, .gitignore or licence). `laophabet-frontend` already exists.

### 2. Frontend: check it is pushed
```powershell
cd app/frontend
git status        # expect: on branch main, up to date with 'origin/main', config.js not listed
cd ../..
```
If not up to date: `git push -u origin main` inside `app/frontend`.

### 3. Backend repo (new history starts here)
```powershell
cd app/backend
git init -b main
git add -A
git status        # check: no supabase/.temp, no .branches, no __pycache__ in the list
git commit -m "Initial commit: backend (earlier history is in the laophabet repo)"
git remote add origin https://github.com/dtlevy37/laophabet-backend.git
git push -u origin main
cd ../..
```

### 4. Root repo: stop tracking the two app folders and the .pyc files, rename the branch, push
(`.gitignore` is already updated.)
```powershell
git rm -r --cached app/frontend app/backend -q
git rm -r --cached approved-scripts/__pycache__ -q
git branch -m master main
git add -A
git commit -m "Split app/frontend and app/backend into their own repos"
git remote add origin https://github.com/dtlevy37/laophabet.git
git push -u origin main
```
(`git rm --cached` only changes what git tracks; files stay on disk.) The first push asks you to sign in to GitHub;
Git Credential Manager remembers it, which is what lets the script push later. If a path in `git rm` says "did not
match any files", it was already untracked: fine, carry on.

### 5. Re-approve the script (its content changed from the two-repo version, so the old hash no longer matches)
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/tools/approve-script.ps1 _agent/proposed-scripts/checkpoint.ps1 -Force
```
Test it yourself (nothing to commit is fine):
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File approved-scripts/checkpoint.ps1 -Message "checkpoint: test" -Push
```
Expected, per repo: "nothing to commit in laophabet-..." (or "committed ...") then "pushed laophabet-...". A repo
that fails prints `FAILED <name>: <reason>`, and the others still run.

### 6. CLAUDE.md (after steps 1–5, or the agent will call a script that is not approved yet)
`Copy-Item _agent/proposed-config/CLAUDE.md CLAUDE.md -Force`. The staged copy is the installed file plus: the
`checkpoint.ps1` instruction (three repos, no direct `git push`/`remote`/`-C`, never force), Map rows for the two
app repos, and `checkpoint.ps1` in the scripts list.

### 7. Start a fresh session
The next session reads the new CLAUDE.md. Delete this file after installing.

## About "write access to the whole project folder"
Not needed for this: everything above is staged, and the agent already writes to `app/` and `_agent/`. If you do widen
it, I recommend keeping `approved-scripts/`, `.claude/` and `CLAUDE.md` protected: `checkpoint.ps1` holds your GitHub
credentials' reach, and its hash check only means something while the agent cannot edit it or the guard.

## Before connecting Netlify (slice S11, not now)
- `netlify.toml` has `publish = "."`, so Netlify serves everything in the frontend repo root, including
  `LAO_UI_REVIEW.md` and `scripts/export_lao_review.py`. Move them out (see PLAN) or delete them in the build command.
- Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (publishable key only) as Netlify environment variables.

## Caveats
- A slice touching frontend and backend is two commits, and a content change is a root commit (CSVs) plus a backend
  commit (migration). The script does all three in one call with one message.
- `lesson_tool.py` and `db_sql.py` read `data/` (root) and write migrations into `app/backend` (nested repo): they
  keep working unchanged, since all three folders stay in place.
- The frontend and backend repos have no history before their first commit; the older history of those folders stays in
  `laophabet` (`git log -- app/backend`, from the commits before the split).

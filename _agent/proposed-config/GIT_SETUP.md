# Git setup: two repos, agent can push (staged 2026-11-10; nothing here is installed yet)

Decision (user, 2026-11-10): the frontend gets its own repo because Netlify deploys it and must not see the backend.
Everything else (backend migrations, `data/`, scripts, drafters, `_agent/`) is one repo and keeps its full history.

| Repo (private, under github.com/dtlevy37) | Contents | Local folder |
|---|---|---|
| `laophabet` | everything except `app/frontend` | project root |
| `laophabet-frontend` | the frontend only | `app/frontend` (nested; the root repo ignores it) |

How the agent pushes: not by loosening the guard (`git push`, `remote`, `-C` stay blocked). One approved script,
`approved-scripts/checkpoint.ps1`, commits both repos and pushes only `origin main`, never with force, and aborts
if a secret key is staged. The agent calls it at each checkpoint. **Untested** (the agent cannot run PowerShell git).

## Steps (you run these in a PowerShell terminal at the project root)

### 1. Create two empty private repos on GitHub
`laophabet` and `laophabet-frontend`: no README, no .gitignore, no licence. (Add `-` or other names if you prefer;
edit the URLs below to match.)

### 2. Frontend repo (new history starts here)
```powershell
cd app/frontend
git init -b main
git add -A
git commit -m "Initial commit: frontend (earlier history is in the laophabet repo)"
git remote add origin https://github.com/dtlevy37/laophabet-frontend.git
git push -u origin main
cd ../..
```
`config.js` is already ignored by `app/frontend/.gitignore`. Check `git status` shows it is not staged.

### 3. Main repo: stop tracking the frontend, rename the branch, push
```powershell
Add-Content .gitignore "app/frontend/"
git rm -r --cached app/frontend -q
git branch -m master main
git add -A
git commit -m "Move app/frontend to its own repo (laophabet-frontend)"
git remote add origin https://github.com/dtlevy37/laophabet.git
git push -u origin main
```
(`git rm --cached` only changes what git tracks; the files stay on disk.) GitHub will ask you to sign in the first
time; Git Credential Manager then remembers it, which is what lets the script push later.

### 4. Approve the checkpoint script
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/tools/approve-script.ps1 _agent/proposed-scripts/checkpoint.ps1 -Force
```
Test it once yourself (nothing to commit is fine):
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File approved-scripts/checkpoint.ps1 -Message "checkpoint: test" -Push
```
Expected: for each repo, "nothing to commit in ..." (or "committed ...") then "pushed ...".

### 5. CLAUDE.md (only after steps 1–4, or the agent will call a script that is not approved yet)
Easiest: `Copy-Item _agent/proposed-config/CLAUDE.md CLAUDE.md -Force`. The staged copy already has the three edits
below (identical to the installed file otherwise). By hand instead: in "Working state", replace

> - Commit a local checkpoint after each finished slice or plan item: `git add -A`, then
>   `git commit -m "checkpoint: <item>"`. Never push or add remotes.

with

> - Checkpoint after each finished slice or plan item:
>   `powershell -NoProfile -ExecutionPolicy Bypass -File approved-scripts/checkpoint.ps1 -Message "checkpoint: <item>" -Push`.
>   It commits and pushes both repos (project root, and `app/frontend`, which is its own repo ignored by the root).
>   Never run `git push`, `git remote` or `git -C` directly, never force, and never add other remotes or branches.

In the "Map" table, change the `app/frontend/` row to say "its own git repo (`laophabet-frontend`), ignored by the root
repo". Also change the line "Never run git commands that rewrite working-tree files" only if you want it softened;
it can stay as is.

### 6. Tell me, then start a fresh session
The next agent session reads the new CLAUDE.md. Delete or ignore this file after installing.

## Before connecting Netlify (slice S11, not now)
- `netlify.toml` has `publish = "."`, so Netlify serves everything in the repo root. That includes
  `LAO_UI_REVIEW.md` (the unreviewed Lao UI text) and `scripts/export_lao_review.py`. Either append
  `&& rm -rf scripts LAO_UI_REVIEW.md` to the build command, or move both out of the frontend repo. Note
  `export_lao_review.py` finds `js/strings.json` from its own location, so moving it needs a path edit.
- Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (publishable key only) as Netlify environment variables.
- The frontend repo is private; Netlify can still deploy it through its GitHub app.

## Caveats
- A slice that changes both frontend and backend is two commits in two repos. The script does both in one call.
- `lesson_tool.py` and `db_sql.py` write migrations to `app/backend/` (main repo) and read `data/` (main repo): no
  cross-repo coupling for content work.
- The frontend repo has no history before step 2; the older history stays in `laophabet`
  (`git log -- app/frontend`).

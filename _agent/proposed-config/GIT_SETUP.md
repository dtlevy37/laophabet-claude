# Git setup: three repos, agent can push (staged 2026-11-10; decided by the user)

| Repo (private, github.com/dtlevy37) | Purpose | Local folder |
|---|---|---|
| `laophabet-frontend` | what Netlify deploys; Netlify never sees the backend | `app/frontend` |
| `laophabet-backend` | Supabase migrations, seeds, tests: DB history and restoration | `app/backend` |
| `laophabet-claude` | the harness and everything else: scripts, agents, guard, data CSVs, plans, notes. Lets you resume the workflow after losing the drive | project root (ignores the two app folders) |

The two app repos are nested in the project folder. The root `.gitignore` already ignores them.

**How the agent pushes:** not by loosening the guard (`git push`, `remote`, `-C` stay blocked for ad-hoc commands).
Two approved scripts do all git work that needs those:
- `setup_repos.ps1`: one-time, idempotent. Creates the backend repo, untracks the app folders in the root repo, renames
  `master` to `main`, adds the three origins, optionally pushes (`-Push`).
- `checkpoint.ps1`: every checkpoint. Commits all three repos and pushes `origin main`.
Both: never force, check each origin URL is exactly `github.com/dtlevy37/<that repo>`, abort a commit if a secret key
is staged. **Both untested** (the agent cannot run them until approved, and nothing here has been run yet).

**Restore story:** `laophabet-backend` has the migrations that rebuild the database; `laophabet-claude` has the
content CSVs they are generated from. Clone all three into the same layout: `laophabet-claude/`, then
`laophabet-claude/app/frontend` and `laophabet-claude/app/backend`.

## State on 2026-11-10 (checked from the repos' files)
- `laophabet-frontend`: set up by the user, on `main`, pushed, tracking `origin/main`.
- `laophabet-backend`: no git repo yet in `app/backend` (the script creates it). GitHub repo created (empty).
- `laophabet-claude`: still on `master`, no remote, 53 app files tracked (the script untracks them). GitHub repo created (empty).

## Steps (PowerShell, from the project root)

### 1. Approve both scripts
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/tools/approve-script.ps1 _agent/proposed-scripts/setup_repos.ps1 -Force
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/tools/approve-script.ps1 _agent/proposed-scripts/checkpoint.ps1 -Force
```
(`checkpoint.ps1` must be re-approved: its content changed since the two-repo version.) Read both first if you like;
each has its behaviour and safety rules at the top.

### 2. Run the setup (the agent can do this once approved, or you can)
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File approved-scripts/setup_repos.ps1 -Push
```
Expected output, in order:
- `laophabet-backend`: initialised, committed, added origin, pushed
- `laophabet-frontend`: nothing to commit (or committed), origin ok, pushed
- `laophabet-claude`: untracked app/frontend, untracked app/backend, untracked approved-scripts/__pycache__,
  renamed master -> main, committed, added origin, pushed
- `setup done`

Failures print `FAILED: <reason>` for that repo and the others still run; re-running is safe. Likely ones:
"push failed": GitHub repo not empty (README or licence added) or not signed in (the script cannot prompt; do one
manual `git push` in `app/frontend` to see that your login is stored, which it is if that push worked). Nothing is forced.

### 3. Test the checkpoint script
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File approved-scripts/checkpoint.ps1 -Message "checkpoint: test" -Push
```
Expected, per repo: "nothing to commit in laophabet-..." then "pushed laophabet-...".

### 4. Install CLAUDE.md, then start a fresh session
```powershell
Copy-Item _agent/proposed-config/CLAUDE.md CLAUDE.md -Force
```
The staged copy is the installed file plus: the `checkpoint.ps1` instruction (three repos, no direct
`git push`/`remote`/`-C`, never force), Map rows for the two app repos, and `checkpoint.ps1` in the scripts list.
Then delete this file.

## About "write access to the whole project folder"
Not needed for this: everything is staged, and the agent already writes to `app/` and `_agent/`. If you do widen it,
I recommend keeping `approved-scripts/`, `.claude/` and `CLAUDE.md` protected: the scripts' hash check only means
something while the agent cannot edit them or the guard.

## Before connecting Netlify (slice S11, not now)
- `netlify.toml` has `publish = "."`, so Netlify serves everything in the frontend repo root, including
  `LAO_UI_REVIEW.md` and `scripts/export_lao_review.py`. Move them out (see PLAN) or delete them in the build command.
- Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (publishable key only) as Netlify environment variables.

## Caveats
- A slice touching frontend and backend is two commits, and a content change is a root commit (CSVs) plus a backend
  commit (migration). `checkpoint.ps1` does all three in one call with one message.
- `lesson_tool.py` and `db_sql.py` read `data/` (root) and write migrations into `app/backend` (nested repo): they
  keep working unchanged, since all three folders stay in place.
- The frontend and backend repos have no history before their first commit; the older history of those folders stays in
  `laophabet-claude` (`git log -- app/backend`, from before the split).

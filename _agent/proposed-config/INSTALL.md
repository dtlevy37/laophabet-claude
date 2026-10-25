# Installing the app-phase config (2026-10-24)

The agent cannot write `CLAUDE.md`, `.claude/` or `approved-scripts/`, so these files are staged here. Run from the
project root in PowerShell (or type each line after `! ` at the Claude prompt).

```powershell
# 1. CLAUDE.md (the old one is already preserved as CLAUDE_Research.md)
Copy-Item _agent/proposed-config/CLAUDE.md CLAUDE.md -Force

# 2. Agents: 3 updated (researcher, scholar, drafter) + 2 new (code-reviewer, curriculum-reviewer)
Copy-Item _agent/proposed-config/agents/*.md .claude/agents/ -Force

# 3. Skills (new folder)
New-Item -ItemType Directory -Force .claude/skills | Out-Null
Copy-Item _agent/proposed-config/skills/* .claude/skills/ -Recurse -Force

# 4. Guard: allow the two new agents
Copy-Item _agent/proposed-config/guard-config.json .claude/guard-config.json -Force

# 5. Optional: approve the frontend checker
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/tools/approve-script.ps1 _agent/proposed-scripts/check_frontend.js -Force
```

6. In `.claude/settings.json`, under `permissions.allow`, next to `"Agent(researcher)"` and `"Agent(scholar)"`, add:
   ```json
   "Agent(drafter)",
   "Agent(code-reviewer)",
   "Agent(curriculum-reviewer)",
   ```
   (Without these, each spawn asks for permission; in unattended mode it would be denied.)

7. Start a fresh session (`/clear` or restart) so the new CLAUDE.md, agents and skills load. `/agents` should list
   five agents; skills appear in the skill list.

## What changed and why
- **CLAUDE.md** is organised around the two tracks (app, curriculum) and the slice/gate workflow. Procedures moved
  into skills, which load only when needed, so the always-loaded file stays short. The research-era guide is kept
  unchanged in `CLAUDE_Research.md` (not auto-loaded).
- **Agents**
  - `code-reviewer` and `curriculum-reviewer` are new. Both are read-only: they never edit files.
  - The drafter is retargeted at lesson needs and follows the efficiency notes from PROGRESS: short runs, a small
    brief, no big reads, and two files per run.
  - `researcher` and `scholar` now also cover technical sources.
  - There are no implementer agents: the main session writes the code because it holds the slice's context, and a
    subagent could not run the code either.
- **Skills:** app-slice, sql-migration, frontend-feature, activity-module, build-lesson and draft-content.

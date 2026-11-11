# Laophabet

A web app that teaches English speakers to read and speak Lao. This repo (`laophabet-claude`) holds the content
data, the tooling and the agent setup; the app itself lives in two nested repos, `app/frontend`
(`laophabet-frontend`) and `app/backend` (`laophabet-backend`).

- `CLAUDE.md`: how the agent works here. `docs/NOTES.md`: current state and next step. `docs/PLAN.md`: open slices.
- `app/README.md`: backend and frontend reference and local setup.
- `_shelf/`: parked research and word-list work (see its README).

## Usage guard
`.claude/hooks/usage-guard.ps1` runs before every tool call and does three things:
- stops the session when weekly usage reaches `weeklyStopPct`;
- pauses (sleeps) when the 5-hour window reaches `fiveHourPausePct`, and resumes after the reset;
- stops the session if the file `.claude/state/STOP` exists (create it to halt a run; delete it to continue).

Thresholds are in `.claude/usage-config.json`. Lower `fiveHourPausePct` to keep part of a window for other work;
raising it above the current usage ends a pause early. The status line shows both numbers and writes them for the guard.

## Unattended lessons
`powershell -NoProfile -ExecutionPolicy Bypass -File scripts/next_lesson.ps1 -Count N` builds the next N lessons,
one fresh `claude -p` session each, following `docs/CURRICULUM_PATH.md`. Create `tmp/STOP_LESSONS` to stop it
between lessons.

## Commit
`powershell -NoProfile -ExecutionPolicy Bypass -File scripts/checkpoint.ps1 -Message "<what>" -Push` commits and
pushes all three repos.

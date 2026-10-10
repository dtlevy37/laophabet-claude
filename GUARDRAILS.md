# Claude Code guardrail kit (Windows, Pro plan)

Copy this folder's contents into your working folder, then run:

    powershell -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1

## What enforces what

| Guardrail | Mechanism |
|---|---|
| Weekly cap: hard stop at 60% | `guard.ps1` (PreToolUse) reads usage written by the status line; writes `.claude/state/WEEKLY_CAP` and ends the session |
| 5-hour window: pause at 88%, resume after reset | `guard.ps1` sleeps inside the hook until reset + 2 min (hook timeout 18600 s) |
| Warnings: weekly 55%, 5-hour 80%, context 70% | `guard.ps1` injects a checkpoint notice once per window / compaction cycle |
| No reads/writes outside the folder | `blockReadsOutsideWorkingDirectories` + path checks in `guard.ps1` |
| Agent can't edit guardrails, `.git`, approved scripts, `CLAUDE.md` | Edit deny rules + `guard.ps1` |
| Only approved scripts run | `guard.ps1` checks the script is in `approved-scripts/` and its SHA256 matches `.claude/approved-scripts.json` |
| No installs, downloads, network tools, deletes, inline interpreter code | `guard.ps1` command rules + deny rules |
| Web read-only, approved domains only | WebFetch/WebSearch only; in unattended (`dontAsk`) mode unapproved domains are denied, not prompted |
| Subagents: `researcher` (Haiku, lookups) and `scholar` (Sonnet, in-depth study with notes in `_agent/research/`); max 2 at once, no nesting | `.claude/agents/`, env vars and deny rules in `settings.json` |
| Keep working while unattended | Stop hook continues the run until `_agent/DONE` or `_agent/BLOCKED`, a cap, or 3 continues with no progress-log change |
| Fail closed | `onFailure: block` on the guard (needs Claude Code 2.1.295+); no usage data = stop |

## Day-to-day

- `.\run.ps1` — attended. The agent asks in chat instead of writing to NEEDS_HUMAN.md. Approve domains at the prompt with "Yes, and don't ask again". Approve a script without leaving the session by typing at the Claude prompt:
  `! powershell -NoProfile -ExecutionPolicy Bypass -File .claude/tools/approve-script.ps1 _agent/proposed-scripts/<file> -Force`
  (`!` runs your own shell command directly, so the guard doesn't block it.)
- `.\run.ps1 -Mode unattended -Resume` — hands-off, `dontAsk` mode, continues the last conversation.
- `.\run.ps1 -Stop` — kill switch (also ends a 5-hour pause). `-ClearStops` to undo.
- `.\run.ps1 -ClearBlocked` — after you've handled `_agent/NEEDS_HUMAN.md`.
- Thresholds: `.claude/guard-config.json`. Log: `.claude/state/guard.log`.

## Known limits

- Native Windows has no OS-level sandbox, so command rules are pattern checks, not a hard boundary. The approved-script gate and `dontAsk` allowlist are the main defenses. WSL2 adds an OS sandbox if you want one later.
- Usage numbers lag by one response. If the 5-hour limit is hit mid-response before the guard sees it, the turn ends on a rate-limit error; resume with `.\run.ps1 -Mode unattended -Resume` after reset.
- Each tool call starts PowerShell for the guard (~0.3 s).
- Untested on a real Windows install; run `setup.ps1` and check the self-test before trusting it.

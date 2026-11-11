# Allowing an Opus "builder" subagent (staged 2026-11-10)

The guard refused a general Opus subagent ("subagent type '' is not allowed"): only researcher, scholar, drafter,
code-reviewer and curriculum-reviewer may run, and none of them can write scripts and run the approved tools.
To let the main agent hand implementation tasks to Opus, install three things (the agent cannot edit `.claude/`):

1. Copy `_agent/proposed-config/.claude/agents/builder.md` to `.claude/agents/builder.md`.
2. In `.claude/guard-config.json`, add `"builder"` to `allowedSubagents`:
   `"allowedSubagents": ["researcher", "scholar", "drafter", "code-reviewer", "curriculum-reviewer", "builder"]`
3. In `.claude/settings.json`, add `"Agent(builder)",` next to the line `"Agent(curriculum-reviewer)",`.
4. Start a fresh session (agent definitions load at session start).

Also for CLAUDE.md, "Agents and skills": the sentence "Implementation stays in the main session" would become
"Implementation stays in the main session unless the user asks for the `builder` agent", plus a table row:
`builder` | One fully specified implementation task (scripts, SQL, a lesson rebuild) from a written brief. Stages
changes; never edits approved-scripts/ or .claude/.

The first task waiting for it is `_agent/tmp/S7C_S7F_BRIEF.md` (S7c + S7f script group), then the lesson 4 rebuild.

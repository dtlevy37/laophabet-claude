# Stop prompts for read-only shell helpers (staged 2026-11-10)

Why: `.claude/settings.json` allows `awk`, `sed`, `sort`, `cut`, `jq` etc. in Bash, but not `grep`, `cat`,
`head`, `tail`, `wc`, `ls` or `find`. When an agent (the builder, here) ran `grep` through Bash instead of the
Grep tool, Claude Code asked you. The guard hook only ever denies; it never asks, so the prompt came from the
missing allow rule.

## Install
In `.claude/settings.json`, add these lines to `permissions.allow` (after `"Bash(jq *)",`):

```json
      "Bash(grep *)",
      "Bash(egrep *)",
      "Bash(rg *)",
      "Bash(cat *)",
      "Bash(head *)",
      "Bash(tail *)",
      "Bash(wc *)",
      "Bash(ls *)",
      "Bash(ls)",
      "Bash(find *)",
      "Bash(diff *)",
```

And add these to `permissions.deny` (CLAUDE.md allows `find` only without `-exec`; deny wins over allow):

```json
      "Bash(find * -exec *)",
      "Bash(find * -execdir *)",
      "Bash(find * -delete*)",
```

Optional: the same for PowerShell is already covered (`Get-Content`, `Select-String`, `Get-ChildItem`).

All of these read files only. Reads outside the project stay blocked by `blockReadsOutsideWorkingDirectories`
and the guard hook. Restart Claude Code (or start a new session) after editing.

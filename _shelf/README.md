# Shelf

Parked on 2026-11-11 when the project narrowed to building the app and its lessons. Nothing here is used by the
app, the lesson tooling or the agents. Paths inside these files are the old ones (`_agent/…`, `approved-scripts/…`).

| Path | What |
|---|---|
| `docs/CLAUDE_Research.md`, `docs/CLAUDE-wordlist-phase.md` | The agent guides for the research and word-list phases |
| `docs/PLAN-phases-0-10.md` | The old top-level plan (phases 0–10) with what was done |
| `docs/PROGRESS-2026-11-11.md`, `docs/progress-archive.md` | The full progress notes up to the refactor |
| `docs/NEEDS_HUMAN.md` | Review items from the word-list batches (c1–c6, classifiers, tone-source disagreements) |
| `docs/LETTER_MAP_PLAN.md`, `letter_map/` | Letter-set to word map: plan, runs and results (`lesson_rules/chain.csv` is the advisory unit order) |
| `docs/OPUS_PLANNING_PROMPT.md`, `docs/PENDING_MIGRATIONS.md` | One-off planning prompt; the old migration tick-list |
| `research/` | Source notes: tone rules (SEAsite, Wiktionary, FSI), script and Unicode, Tatoeba, classifiers, `sources.md` |
| `drafts/` | Content drafts. `c7-*` (weather, family, body: 74 words, 148 sentences) is **unmerged**; `lm-*` are letter-map proposals; `merged/` is history |
| `scripts/` | `letter_map.py`, `lesson_map.py`, `common_list.py`, `enum_spellings.py` (letter map); `rekey_ids.py`, `apply_columns.py` (one-off data changes); `setup_repos.ps1`, `purge_temp_secrets.ps1` (one-off git setup) |
| `claude/agents/` | `scholar` (source study), `researcher` (lookups), `builder` (staged script work under the old guard) |

## To resume growing the word pool (old "Phase 7", paused at 1425 of a 3000 cap)
1. Move `drafts/c7-*` to `curriculum/drafts/`.
2. `python scripts/check_drafts.py`, then `python scripts/tone_derive.py` on the drafts, then
   `python scripts/merge_words.py … --allow-homograph ຕາ`, then `bash scripts/pipeline.sh`.
3. Hand-fix the c7-067 ຕາເວັນຂຶ້ນ gloss to "sunrise".
4. Still to do in the pool: add ຜູ້ to the components of ຜູ້ຊາຍ, ຜູ້ຍິງ, ຜູ້ຈັດການ, ໄກ່ຜູ້, ໂຕຜູ້.
5. Drafter cost was about 2k tokens per word for big batches. Move `claude/agents/*.md` back to `.claude/agents/`
   if the research agents are wanted again.

The old guardrail kit (hash-checked scripts, command filter, unattended autorun) was deleted, not shelved. It is in
git history before the commit "harness refactor" (`GUARDRAILS.md`, `.claude/hooks/guard.ps1`, `run.ps1`, `setup.ps1`).

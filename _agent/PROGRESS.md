# Progress

Notepad for the next session: open work, decisions still in force, next steps. Finished work is in `CHANGELOG.md`
and git. History up to 2026-10-10 is in `_agent/progress-archive.md`; the long 2026-10-10 to 2026-11-09 notes that
used to be here are in git (`git show 1494e18:_agent/PROGRESS.md`). Rules: CLAUDE.md. Lesson decisions:
`_agent/LESSON_PLAN.md` (1–19). App design: `_agent/APP_DESIGN.md`. Slices: `_agent/APP_PLAN.md`.

## State (2026-11-10)
- **Content pool:** 1425 words, 2816 sentences, 30 templates. Pipeline clean (0 errors; the usual 8 warnings).
- **Lessons merged: 4.** L0001 ກິນ · L0002 ເຂົ້າ, ກິນເຂົ້າ · L0003 ລາວ, ລາວກິນເຂົ້າ · L0004 ຂາ, ຂາວ, ລາວຂາວ, then ◌ຳ, ນ້ຳ,
  recap R02 (the stroke າ in three vowels), ກິນນ້ຳ, ລາວກິນນ້ຳ.
- **Backend:** the user's local Supabase works (`supabase db reset` from `app/backend`, then sign up again: a reset
  wipes accounts). Nothing is hosted yet, so every migration in `_agent/PENDING_MIGRATIONS.md` is still unticked.
- **App:** lesson list and teach cards work in the user's browser (S4). No quiz yet (S6). Progress tables (S5) are
  written but `app/backend/tests/s5_progress_test.sql` has not been confirmed by the user.

## Next step (user, 2026-11-10): lesson building is PAUSED at 4
1. **Opus planning session** on the learning experience: follow `_agent/OPUS_PLANNING_PROMPT.md`. It re-slices
   APP_PLAN so lessons 1–4 become playable (teach, quiz, summary, completed tick) before any new content.
2. **Git/harness:** no remote exists; branch is `master` (user convention `main`). The user will create repo(s) under
   github.com/dtlevy37 and wants the agent to push. Open: one repo (agent recommends: tools and data and migrations
   change together, the guard confines the agent to one folder) or three (frontend, backend, tools). Then stage a
   CLAUDE.md edit and a guard patch allowing only `git push origin main` in `_agent/proposed-config/`.

## Order of work (user; resumes after the two items above)
1. Hand-build lessons, one at a time, proposing each first. Next is **lesson 5: ບ, ◌ໍ, ◌່ → ບໍ່ "not; no"**
   (ລາວບໍ່ກິນເຂົ້າ). Then, one or two new pieces plus 2–3 very common words each: ມ + ◌ີ → ມີ "have"; ແ◌ → ແມ່ນ
   "yes; to be" (W000004; the user wants it early); ດ → ດີ "good"; ໄ◌ + ປ → ໄປ "go"; ອ + final ຍ → ຂ້ອຍ "I".
   Bring back ເຂົາ "they" (W000160) and ເກົ້າ "nine" (W000141) only once ເຂົ້າ is solid (decision 15).
2. Then S6 (activity shell and first quiz). The unattended runner (`next_lesson.ps1`) comes after that.

## How a lesson gets built (what worked for lessons 3–4)
- `lesson_tool.py brief` → propose to the user → the `drafter` agent (sonnet; it has no Bash) writes
  `_agent/drafts/<tag>-sentences.csv` and `_agent/lessons/drafts/next/*.csv` from a brief that names every row →
  main agent: `check_drafts.py`, `merge_words.py` (a sentences-only merge needs a header-only words file as the
  positional argument), replace placeholder sentence IDs, `pipeline.sh`, `lesson_tool.py check` →
  `curriculum-reviewer` → fix → `lesson_tool.py merge` → `db_sql.py seed` → `pipeline.sh` → CHANGELOG → commit.
- The guard allows only the five project agents (researcher, scholar, drafter, code-reviewer, curriculum-reviewer).
- Check/merge flags used so far: L0002 and L0003 `--max-units 3`; L0003 `--min-recycle 2`; L0004 `--max-weight 7.5`
  (recap rule card).
- The user reviews a lesson **in the browser after merge**, so merge once the reviewer has no blockers. While nothing
  is hosted, a merged lesson can be withdrawn and rebuilt: remove its rows from data/lessons.csv, lesson_items.csv
  and any units/rules it introduced, move its migration to `_trash/`, drop its PENDING_MIGRATIONS line, and empty
  (do not leave behind) its `_agent/lessons/merged/<id>` folder, or merge fails at the final move. Once a hosted DB
  exists this is no longer allowed: use `db_sql.py change`.
- Edit-tool caution: a `replace_all` that removed text at line ends in a CSV also removed the line breaks. Rewrite
  small CSVs whole instead.

## Browser check
- The user reviewed lessons 1–4 in the browser (local Docker Supabase) on 2026-11-10. Their findings are not yet
  recorded here: add any fixes they want as open items. One item is still unverified: the "Read more on Wikipedia"
  links under "More" (URLs written from memory).

## Open questions with the user
- Final-ວ card probably shows "o/w" as its sound: tidy?
- "nam" for ນ້ຳ although the cue says "um in hum"; "kao" (ເຂົ້າ) vs "kaao" (ຂາວ) look alike in English letters.
- pron_tip texts under "More" are stored prose with English-style spellings and the word "aspirated": reword?
- Stale notes on W000035 and W001415 (they still mention W000019 for the "enter" sense; the links are fixed).
- Native-speaker questions are collected at the top of `_agent/NEEDS_HUMAN.md` ("For the native speaker").
  A native speaker is expected from about December 2026; audio is built as if recordings exist (decision 12).

## Proposed, not yet agreed or built
- Interleave teach and check cards (show a card, check it, next card) when S6 is built.
- "Build the word" activity in v1, ahead of the tone drill (assembling ກ + ◌ິ + ນ is the core skill).
- Move settings from the browser to the learner's profile when the home screen exists (S8).

## Parked (older work, still true)
- **Phase 7 (grow the pool to 3000 words) is paused.** The c7 batch (weather, family, body: 74 words, 148 sentences)
  sits unmerged in `_agent/drafts/c7-*`. To resume: check_drafts → tone_derive on the drafts → merge_words with
  `--allow-homograph ຕາ` → pipeline; hand-fix c7-067 ຕາເວັນຂຶ້ນ gloss to "sunrise".
- To do in the pool: add ຜູ້ to the components of ຜູ້ຊາຍ, ຜູ້ຍິງ, ຜູ້ຈັດການ, ໄກ່ຜູ້, ໂຕຜູ້.
- Drafter cost for big batches was about 2k tokens per word; a small, fully specified brief (as for lessons 3–4)
  costs about 27k tokens per run.
- Homograph flags needed on check_drafts/merge_words when a batch repeats a spelling on purpose
  (`--allow-homograph <lao>`).

## Standing decisions (older, still in force)
- Sources: Wiktionary (words), SEAsite and Wikipedia (tone rules); Glosbe if needed. Declined: sealang, Enfield.
  Tatoeba and Big Brother Mouse are skipped; drafters compose sentences (`unverified`).
- One row per spelling and meaning; sentences pick a meaning with `word_overrides`.
- Do not over-deliberate word choice; group script changes into one approval.
- Git: never stash, checkout or restore; no `git -C`; no chained `cd`. Guard: `sed -e`, awk pipes and heredocs that
  mention .sql paths are blocked.
- The memory folder is outside the guard's folder, so durable preferences are recorded here and in LESSON_PLAN /
  APP_DESIGN instead.

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
- **App:** lesson list and teach cards work in the user's browser (S4). Progress tables (S5) and the played-lesson
  backend (S6a) passed their SQL gates. The session runner (S6b, cards only) passed its browser gate
  (user, 2026-11-10). Multiple-choice checks (S6c) are built but untested in a browser.

## Next step (2026-11-10): lesson building is PAUSED at 4 until "Before the unattended run" is done; app slices
1. **Learning-experience plan is agreed** (2026-11-10). Decisions: APP_DESIGN "Curriculum lesson, app lesson,
   session", "Lesson session", "Audio and speaking hooks", "Decisions log". Slice order: APP_PLAN "Re-sliced
   2026-11-10". In force:
   - One curriculum lesson = one app lesson; content names no screens; the planner (`js/session.js`) builds them.
   - Interleaved: card, check, next card; closing mixed block; missed questions replayed.
   - Completed = reached the end; no pass mark; summary accuracy is first try only.
   - Build the word is v1 (needs `word_units`, S7c); tone drill waits for a tone-rule lesson.
   - Agent defaults the user has not objected to: the check after a card counts as recognition (level 2); audio
     keyed by item id (`item_audio`, S10) with an empty button slot from S7b; resume same-device only; no offline.
   **S6a, S6b, S6c are done** (S6c gate passed 2026-11-10; the done-lesson link is now "Review lesson material",
   read-only cards, never questions: user).
   **S7a: desktop browser test passed (user, 2026-11-10), including drag tiles and `covers` on the lesson list;
   phone test not done yet** (user: soon). Phone: `config.js` SUPABASE_URL must use the PC's LAN address
   (192.168.1.189 on 2026-11-10), the frontend server must bind 0.0.0.0, firewall may need the ports. When the
   phone test passes: tick S7a, then the mobile layout proposal, then S7b.
   **Mobile layout (user, 2026-11-10, important, next after the phone test):** the lesson screen has no fixed area;
   a step with more text grows the page, so on a phone the Continue/Check button and the tiles move about and the page
   scrolls. Wanted: a stable lesson frame on mobile (progress bar on top, the activity in a fixed-height middle that
   scrolls inside itself if needed, the action button pinned at the bottom). Propose the layout first; not built.
   Notes:
   - Provisional S6c decisions are in APP_DESIGN "Decisions log" (2026-11-10, agent, S6c); the user has not
     objected.
   - Use Read/Grep/Glob, not `ls`/`head`/`grep`/`cd` in Bash: those prompt the user for approval. Subagents cannot
     `git diff` the sub-repos (chained `cd` and `git -C` are blocked); offered the user a read-only
     `repo_diff.ps1` approved script (not yet staged).
   - Code map: `js/session.js` (`planLesson(bundle, rng)`; `advance` queues `again(spec)` for a missed question),
     `js/activities/multiple_choice.js` (forms, `build` returns null when it cannot fill 3 options),
     `js/activities/build_sentence.js` (tiles, `again` reshuffles), `activities/teach_card.js` (`cardItems`,
     `unitSound`, `openInfo`, `infoButton`, `chips`).
   **Content impact on lessons 1–4: none.** Nothing merged is re-ordered or rewritten. Additive only: generated
   `word_units` rows for their words (S7c, by script + a `db_sql.py change` backfill).
   **To stage later, not now:** S7c script group (build_order.py, db_sql.py, lesson_tool.py) in
   `_agent/proposed-scripts/`.
   **Guard (2026-11-10):** the agent may now write inside `.claude/skills/` (user installed the patched
   `common.ps1` and `settings.json`; both checks passed: a skills write works, `guard-config.json` is still refused).
   The rest of `.claude/` stays protected. The updated `activity-module` skill is installed. Still for the user:
   add "(except `.claude/skills/`)" to the CLAUDE.md line about `.claude/`. Backups of the old files are in `_trash/`.
2. **Git/harness (2026-11-10): three repos are live and pushed** (`laophabet-frontend` = app/frontend, `laophabet-backend`
   = app/backend, `laophabet-claude` = project root), all private under github.com/dtlevy37. `checkpoint.ps1 -Push` was
   tested across all three. Root history was purged of `.temp/` (local Supabase keys) with `purge_temp_secrets.ps1`.
   **Left for the user:** (a) copy `_agent/proposed-config/CLAUDE.md` over `CLAUDE.md` (PowerShell `Copy-Item`, or bash
   `cp`), then start a fresh session, so checkpoints use `checkpoint.ps1`; (b) delete `_trash/git-backup-20261110-160713`
   once happy (it holds the old history with the keys); (c) delete `_agent/proposed-config/GIT_SETUP.md` after (a).
   Until (a), CLAUDE.md still says "never push": use `checkpoint.ps1 -Message "checkpoint: <item>" -Push` anyway.

## Curriculum path (agreed by the user 2026-11-10; replaces the old lesson 5+ order)
- **The order for lessons 4–11 is `_agent/CURRICULUM_PATH.md`**; the rules are LESSON_PLAN decisions 20–25
  (natural sentences first, core and bonus words, conversations as canned content, ຂໍ … ແນ່).
- The user plans to **run the unattended runner up to lesson 10 or 11** and will play-test the lessons (lesson 6
  may be split in two; lesson 4 felt too big and should feel right once ຂາ is bonus and ຂາວ is gone).
- Still wanted later, not placed yet: ແມ່ນ "yes; to be" (W000004), ໄປ "go", and ເຂົາ "they" / ເກົ້າ "nine" once ເຂົ້າ
  is solid (decision 15).

### Before the unattended run (nothing here is built or staged yet)
1. **S7f script group** (APP_PLAN): the `bonus` role in `lesson_tool.py` and `db_sql.py`, the DB check on
   `lesson_items.role` (today `new|recycle|example`), and an updated `next_lesson_prompt.md` that reads
   CURRICULUM_PATH.md and uses its budget flags (the prompt runs `check` with no flags today, so lessons 6, 8
   and 11 would fail the default budget). Stage in `_agent/proposed-scripts/` for one approval.
2. **Rebuild lesson 4** (withdraw and re-merge; steps under "How a lesson gets built").
3. **Decide with the user: run before or after S7c?** A lesson merged before S7c lacks word units, categories
   and sentence slots; S7c's backfill would then cover lessons 1–11, not 1–4 (categories and slots are
   hand-tagged). Agent's recommendation: stage S7c and S7f as one script approval, then run. Not decided.
4. Drafting needs: a words.csv row for ແນ່ as a softener (the pool has ແດ່ W000308; the only ແນ່ listing is
   "sure; certain" in the common list); ສາວ, ກໍ, ຈຳ have no rows (not needed by the path).
5. Conversations (S7g) are not a blocker: lessons 8 and 10 carry their lines as ordinary sentences in order.
6. Add to NEEDS_HUMAN "For the native speaker" when lesson 6 is built: ແນ່ vs ແດ່ (which is everyday Vientiane
   speech, spelling), whether bare ຂໍນ້ຳ sounds abrupt, ຫິວເຂົ້າ as the normal "hungry".

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

## Lesson 4 and fill-in-the-blank notes (user, 2026-11-11, after the S6c browser test)
- **Fill in the blank, one logical choice: agreed by the user 2026-11-10.** Design: APP_DESIGN "Fill in the blank:
  one logical choice" + Decisions log. Slice order now: S7a (build the sentence only), S7b, S7c (also categories,
  slots, checks, `get_lesson` fields), S7e (fill in the blank), S7d. The brief `_agent/FILL_BLANK_BRIEF.md` is
  superseded (moved to `_trash/`).
- **Lesson 4 sentence ລາວຂາວ** (S000002876): decided 2026-11-10: removed; ຂາ becomes a bonus word and ຂາວ moves
  to lesson 11 (LESSON_PLAN decision 22). Done by the lesson 4 rebuild above.
- **ລາວ vs ຂາວ vowel:** data has ລາວ short (`law`, respelling "lao") but ຂາວ long (`kaao`) though both are ◌າ+ວ. Researcher
  check 2026-11-11: Wiktionary gives ລາວ long ([laːw˧˥]) as a noun/proper noun but short ([law˧˥]) as the pronoun;
  Wikipedia gives the language name long ([láːw]); ຂາວ long. Unsettled whether the pronoun is really short. Our
  W000538 ("he/she") follows the pronoun entry. Settling it needs the 1994 Vientiane phonology study (scholar) or a
  native speaker (add to NEEDS_HUMAN "For the native speaker"). The English word stays "Lao"; only the transliteration may change (user).
- **ນ້ຳ cue:** keep respelling "nam"; reword the pron_tip ("'num' as in 'number'") (user asked "nam or num?").

## Open questions with the user
- "nam" for ນ້ຳ although the cue says "um in hum"; "kao" (ເຂົ້າ) vs "kaao" (ຂາວ) look alike in English letters.
- pron_tip texts under "More" are stored prose with English-style spellings and the word "aspirated": reword?
- Stale notes on W000035 and W001415 (they still mention W000019 for the "enter" sense; the links are fixed).
- Native-speaker questions are collected at the top of `_agent/NEEDS_HUMAN.md` ("For the native speaker").
  A native speaker is expected from about December 2026; audio is built as if recordings exist (decision 12).

## Proposed, not yet agreed or built
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

## Working preferences (user, 2026-11-10)
- **Every Lao example shown to the user in chat carries a romanization and the English** (user, 2026-11-10: they
  know a few hundred Lao words and cannot read every word shown). Use their own spellings where they have given
  one (leo, khoy, mee, muk, jak, sabaidee).
- **Keep usage down** (S6c took about 20% of a 5-hour window, which the user found far too high): do not re-read
  everything each session. Work from the code map here and grep; read in full only modules being changed
  substantially. The `app-slice` skill and CLAUDE.md ("Reading depth", when to run `code-reviewer`) say so (the user
  installed the CLAUDE.md edit 2026-11-10). The main session's
  model is the user's choice (`/model`); the agent cannot switch it.
- **Keep SQL gate checks short:** the user found the 11-check S5 test overkill. For a slice gate, hand over a
  handful of queries that confirm the Done-when line, not an exhaustive suite.
- **Run checkpoints through the Bash tool** (`powershell -NoProfile -ExecutionPolicy Bypass -File
  approved-scripts/checkpoint.ps1 ...`): through the PowerShell tool it asked for approval every time although
  both forms are on the allowlist. Untested; if Bash also prompts, look at the guard hook.
- Avoid `cd` into `app/backend` or `app/frontend`, and `mv`, for routine work: they are not on the allowlist and
  prompt each time. Kept tests live in `app/backend/tests/`; `supabase/snippets/` is git-ignored.

## Standing decisions (older, still in force)
- Sources: Wiktionary (words), SEAsite and Wikipedia (tone rules); Glosbe if needed. Declined: sealang, Enfield.
  Tatoeba and Big Brother Mouse are skipped; drafters compose sentences (`unverified`).
- One row per spelling and meaning; sentences pick a meaning with `word_overrides`.
- Do not over-deliberate word choice; group script changes into one approval.
- Git: never stash, checkout or restore; no `git -C`; no chained `cd`. Guard: `sed -e`, awk pipes and heredocs that
  mention .sql paths are blocked.
- The memory folder is outside the guard's folder, so durable preferences are recorded here and in LESSON_PLAN /
  APP_DESIGN instead.

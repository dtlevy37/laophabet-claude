# Notes

Notepad for the next session: state, open work, decisions in force, next step. Remove what is finished (history is
in `CHANGELOG.md` and git). Slices: `docs/PLAN.md`.

## State (2026-11-12)
- **Harness refactored 2026-11-11:** guardrails reduced to a usage guard, folders renamed (`scripts/`, `docs/`,
  `curriculum/`), word-list and research work parked in `_shelf/`. **Not yet proven in the new setup:** the agent
  running the local Supabase itself (`supabase status` / `migration up` from `app/backend`, SQL through
  `docker exec -i <supabase_db container> psql -U postgres`; there is no `psql` on PATH) and the lesson runner
  (`scripts/next_lesson.ps1`). First use of each should be treated as a test.
- **Content pool:** 1425 words, 2816 sentences, 30 templates. Pipeline clean (0 errors, the usual 8 warnings).
- **Lessons merged: 4.** L0001 ກິນ (gin, eat) · L0002 ເຂົ້າ (kao, rice) · L0003 ລາວ (lao, he/she) · L0004 ◌ຳ, ນ້ຳ
  (nam, water), bonus ຂາ (kaa, leg) and ຂາວ (kaao, white). L0004 was rebuilt in place 2026-11-12
  (`20261112195124_lesson_l0004.sql`, then `20261112204059_lesson_l0004.sql` adding ຂາວ as bonus at the owner's
  request); ຂາວ becomes core in lesson 11; ລາວຂາວ is out of every lesson.
- **L0005 "Already"** merged 2026-11-12 (`20261112205459_lesson_l0005.sql`, not applied): new V15 ແ◌; core ແລ້ວ
  (laew, already; W000020, tagged `function`, so it is never the blank); bonus ແກ້ວ (gaew, glass; W000218). Recycles
  ກິນ, ລາວ, ເຂົ້າ, ນ້ຳ and S000002872. Sentences: S000000024 ກິນແລ້ວ (existing), S000002877 and S000002878 (composed, unverified).
  No budget warnings, no flags. W000020's gloss is still "already, done; then" (lessons have no gloss override): the card
  shows all three senses. Native-speaker points in QUESTIONS.
- **L0006 "Not, questions, asking for something"** merged 2026-11-12 (`20261112210242_lesson_l0006.sql`, not applied;
  `--max-units 3`): new V21 ◌ໍ, C14 ບ, T1 ◌່; core ຂໍ (khor, may I have; W000009), ບໍ່ (bor, not/question; W000003),
  ແນ່ (nae, softener; W001426, newly drafted, unverified); bonus ບ້ານ (baan, home; W000049). Recycles ລາວ, ກິນ, ເຂົ້າ,
  ແລ້ວ, ນ້ຳ and S000000024. Sentences: S000002879 ລາວບໍ່ກິນເຂົ້າ, S000002880 ຂໍນ້ຳແນ່, S000002881 ຂໍເຂົ້າແນ່ (composed),
  S000000023 ກິນເຂົ້າແລ້ວບໍ່? (existing). Budget warning: weight 7.5 (guideline 5.5); the path allows splitting the
  ຂໍ … ແນ່ half into its own lesson 7 if it plays long. Several blanks are skipped (1 safe distractor) because ນ້ຳ and
  ແກ້ວ are excluded as personal names and ຂາ as food; the S000000024 slot change rides in the L0006 migration.
  Native-speaker points in QUESTIONS.
- **Backend:** local Supabase only (Docker). Nothing is hosted, so any migration may still be replaced. A
  `supabase db reset` wipes accounts; the owner then signs up again.
- **App:** lessons 1–4 play end to end with teach cards, multiple choice, replay of missed questions and a summary
  (S6a–S6c passed). Build the sentence (S7a) passed on desktop, including drag tiles and `covers` on the lesson list.
- S7b (resume, leave dialog, dry run `#/try/L000n`, `audio.js`), S7e (fill in the blank) and S7d (build the word)
  passed the owner's browser test 2026-11-12. S7f (bonus label, lesson 4 rebuild) passed 2026-11-12.

## Next steps
0. Re-dump `tmp/bundles/` and rerun `node scripts/session_test.mjs` after any lesson merge.
0. **Owner test of letter writing (S7w)**: owner 2026-11-12, after the fixes: "still feels weird", will review in
   depth later; wait for their notes. Earlier: desktop drawing and judging good apart from two bugs, now fixed ("null" after
   Check; the letter showing on part-from-memory steps). Retest those, then the phone. `#/write` on desktop and phone (steps in CHANGELOG 2026-11-11 "letter
   writing"). Untested in any browser. If judging feels too strict or too loose, the knobs are `TUNING` in
   `js/writing/score.js` (`LETTER_MAX`, `LETTER_MARGIN`, `TRACE_TOL`, `PART_MAX`); rerun `node scripts/strokes_test.js`.
1. Phone testing: `config.js` SUPABASE_URL uses the PC's LAN address (192.168.1.189); the app is at
   `http://192.168.1.189:5500/`. The lesson frame (`.lesson-frame`, 100dvh, pinned button) passed the phone test on 2026-11-11.
3. Then lessons 5–11 (PLAN "Working order"). Owner, 2026-11-12: wait on lessons 5–11 until asked; keep ສະບາຍ
   (sabai) and ສະບາຍດີ (sabaidee) together in lesson 8 as the path has them.

## Decisions in force
- Letter writing (DESIGN "Letter writing"): separate area, static stroke file, nothing recorded in the DB yet; the
  whole-letter judge passes a drawing only when the wanted letter is the best match among all letters.
- One curriculum lesson = one app lesson. Content names no screens; the planner (`js/session.js`) builds them.
- Interleaved: card, check, next card; a closing mixed block; missed questions replayed until right once.
- Completed = reached the end; no pass mark; summary accuracy counts first tries only.
- The check after a card counts as recognition (level 2). Audio is keyed by item id (`item_audio`, S10) with an empty
  button slot from S7b. Resume is same-device only. No offline.
- A done lesson links to "Review lesson material": read-only cards, never questions.
- Fill in the blank offers exactly one logical choice (DESIGN "Fill in the blank: one logical choice").
- Lesson budget is a guideline (decision 26). Lesson 4 is rebuilt; lessons 5–11 wait until the owner asks.
- Still wanted in a later lesson, not placed: ແມ່ນ (maen, yes / to be) W000004, ໄປ (bpai, go), and ເຂົາ (kao, they) /
  ເກົ້າ (gao, nine) once ເຂົ້າ is solid (decision 15).
- One row per spelling and meaning; sentences pick a meaning with `word_overrides`.
- Content sources: Wiktionary (words), SEAsite and Wikipedia (tone rules). Drafters compose sentences (`unverified`).

## Code map (frontend)
- `js/session.js`: `planLesson(bundle, rng)`; `advance` queues `again(spec)` for a missed question.
- `js/activities/multiple_choice.js`: forms; `build` returns null when it cannot fill 3 options.
- `js/activities/build_sentence.js`: tiles; `again` reshuffles.
- `js/activities/fill_blank.js` (option rule; gap choice by lowest level), `js/activities/build_word.js` (pieces
  from word_json `units`). `js/session.js`: `buildPlan(bundle, levels, seed, missed)` rebuilds a plan for resume;
  `dryLevels` for `#/try/`. Test: `node scripts/session_test.mjs` (bundles in `tmp/bundles/`).
- `js/activities/teach_card.js`: `cardItems`, `unitSound`, `openInfo`, `infoButton`, `chips`.
- `js/write.js` (grid, step flow), `js/writing/pad.js` (SVG pad, pointer input, animation), `js/writing/score.js`
  (pure judges: `createTracer`, `scorePart`, `scoreLetter`). Data: `data/strokes.json`, rebuilt with
  `node scripts/strokes_build.js --png` (sheet in `tmp/strokes/`; corrections in `scripts/strokes_overrides.json`).
- `js/learn.js`: lesson list and the read-only viewer. `js/bundle.js`: `get_lesson` cache.

## Lesson building (what worked for lessons 3–4)
- `lesson_tool.py brief` → propose to the owner → `drafter` agent writes the content drafts and
  `curriculum/lessons/drafts/next/*.csv` from a brief that names every row → `check_drafts.py`, `merge_words.py`
  (a sentences-only merge needs a header-only words file as the positional argument), replace placeholder sentence
  ids, `pipeline.sh`, `lesson_tool.py check` → `curriculum-reviewer` → fix → `lesson_tool.py merge` → `db_sql.py seed`
  → `pipeline.sh` → CHANGELOG → commit.
- Flags used so far: L0002 and L0003 `--max-units 3`; L0003 `--min-recycle 2`; L0004 `--max-weight 7.5`.
- `db_sql.py` options go before the mode (`--name x change <ids>`).
- **Changing a merged lesson in place** (what lesson 4 used, 2026-11-12): edit its rows in `data/lesson_items.csv`
  / `lessons.csv` and `curriculum/lessons/merged/<id>/`, `lesson_tool.py check --merged`, `pipeline.sh`, then
  `python scripts/db_sql.py --name <id>_rebuild lesson <id>` (upserts, retires dropped positions; no reset).
- **Withdrawing a merged lesson** (allowed only while nothing is hosted; needs a db reset): remove its rows from `data/lessons.csv`,
  `lesson_items.csv` and any units/rules it introduced, delete its migration, and remove its
  `curriculum/lessons/merged/<id>` folder (merge fails at the final move if it exists). Once hosted: `db_sql.py change`.
- Editing CSVs: a `replace_all` that removed text at line ends also removed the line breaks. Rewrite small CSVs whole.
- Conversations (S7g) do not block lessons 8 and 10: they carry their lines as ordinary sentences in order.

## Open with the owner
- **ລາວ (he/she) long or short?** Owner 2026-11-12: wants the long "laao" if that is the truth (Wiktionary's
  short ເລົາ reading is not trusted); the owner's wife will confirm. If long: `python tmp/laao_change.py --write`
  (dry run without the flag; word W000031 + 166 sentences, all aligned), then the steps in its docstring, and drop
  the short/long wording from the lesson 3 card and QUESTIONS. If short: keep the data, note it as an exception.
- **Idea: ຂາວ / ລາວ as the first tone pair** (owner 2026-11-12): same vowel and final, different consonant class,
  so low-rising kʰaːw vs high-rising laːw. A "picture perfect" early example of tone differences. Lesson 4 has both
  (ຂາວ as bonus); decision 11 keeps tone explanations out of early lessons, so this fits the first tone lesson or
  a recap card. Owner to say where.
- **Build the word, strict spoken order** (owner 2026-11-12): for ເຂົ້າ the vowel ເ is written before ຂ, and the
  tone mark ◌້ feels like it could go anywhere, so spoken order surprised the owner. Agent's view: keep spoken order
  (it is how Lao is read: find the consonant, then the vowel around it), but say so when it bites: a slip that picks
  a pre-vowel first gets "ເ is written first but read after the consonant", and the tone mark's slip explains it
  goes on the consonant last. Not built; owner to decide.
- **Idea: "lock in" a new word** (owner 2026-11-12): before a new word's card, ask each of its pieces ("what sound
  does ຂ make?"); each right answer locks the piece into the equation, and the full word and meaning appear at the
  end. A presentation of build the word for new words; it shows the learner they already know the parts. Not
  sliced yet.
- **Idea: respelling hint on meaning → Lao questions** (owner 2026-11-12): a "show sound" hint, or always showing
  the respelling of the options for new words, so the question tests reading while teaching meaning. Would need
  hinted answers logged apart (they should count for letters, not for word knowledge). Not sliced yet.
- ລາວ vs ຂາວ vowel length: data has ລາວ short (`law`) but ຂາວ long (`kaao`), both ◌າ+ວ. Wiktionary gives the pronoun
  short and the noun long. Needs a native speaker (in QUESTIONS).
- ນ້ຳ (nam, water): keep the respelling "nam"; reword the pron_tip ("'num' as in 'number'").
- pron_tip texts under "More" use English-style spellings and the word "aspirated": reword?
- The "Read more on Wikipedia" links under "More" were written from memory and are unverified.
- Stale notes on W000035 and W001415 still mention W000019 for the "enter" sense (the links are fixed).
- Proposed, not agreed: move settings from the browser to the learner's profile when the home screen exists (S8).
- A native speaker is expected from about December 2026; audio is built as if recordings exist.

## Owner preferences
- Every Lao example in chat carries a romanization and the English. Use the owner's own spellings where they have
  given one (leo, khoy, mee, muk, jak, sabaidee).
- Keep usage down: do not re-read everything each session; work from this file and grep.
- Keep gate checks short: a handful of queries that confirm the Done-when line, not an exhaustive suite.
- Do not over-deliberate word choice.

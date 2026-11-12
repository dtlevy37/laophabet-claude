# Changelog

Every change to the project is recorded here, newest first. Update it in the same commit as the change.

## 2026-11-12 (lessons 7–11; fill in the blank on new sentences)
- Lessons 7 "Good, this" (ດ ◌ີ; ດີ ນີ້; bonus ດາວ ດິນ), 8 "Hello" (ສ ◌ະ ◌ຍ, rule R01; ສະບາຍ ສະບາຍດີ; bonus ຂາຍ),
  9 "Hungry, you" (ຫ ຈ; ຫິວ ເຈົ້າ; bonus ຫ້າ ຈານ), 10 "I, and the conversation" (◌ອ◌; ຂ້ອຍ ນອນ; bonus ນ້ອຍ; the target
  conversation as ordinary sentences), 11 "Colours, selling, small" (no new letters; ສີ ຂາວ ດຳ ຂາຍ ແກ້ວ ນ້ອຍ) built by
  subagents, each curriculum-reviewed, merged and applied locally. New `lesson_tool.py --no-new-letters` flag.
- Name exclusions in subject slots (ດາວ, ນ້ອຍ, ດຳ, ຂາວ besides ນ້ຳ, ແກ້ວ) and other earlier-slot fixes shipped as
  `db_sql.py change` migrations (`..._dao_name_exclusion`, `..._l0009_earlier_slots`, `..._noy_name_exclusion`,
  `..._dam_khao_name_exclusion`).
- App: a new sentence also gets a fill in the blank in its own lesson (closing block; the lesson's new words count
  as level 2); untaught options are never a tone-mark or long/short-vowel twin of a word on screen. Owner browser
  test pending: `#/try/L0005` … `#/try/L0011`.

## 2026-11-12 (lessons 5–6, S7h untaught wrong options)
- Lesson 5 "Already" (ແ◌; ແລ້ວ; bonus ແກ້ວ) and lesson 6 "Not, questions, asking for something" (◌ໍ ບ ◌່; ຂໍ ບໍ່ ແນ່;
  bonus ບ້ານ) built by subagents, curriculum-reviewed, merged; migrations `..._lesson_l0005.sql`, `..._lesson_l0006.sql`
  applied locally. New word ແນ່ W001426 (unverified). Native-speaker questions added.
- S7h (built, owner browser test pending): fill in the blank tops up wrong options at random from real untaught
  words (any tagged word outside the pool) when fewer than 3 known options are safe; `get_lesson` returns
  `distractors.untaught` (`20261112211502_s7h_untaught_options.sql`). Function words can be blanked but are never
  options; particle slots for ແລ້ວ/ບໍ່/ແນ່; ນ້ຳ/ແກ້ວ (names) excluded from subject slots; 15 filler words tagged
  (`20261112211540_s7h_untaught_tags_particle_slots.sql`). Owner rule: every word shown is real Lao, never invented.
  Browser: `#/try/L0006`, play to ກິນແລ້ວ; the blank shows 4 tiles, some untaught (ສິ້ນ, ເຂົ່າ…).

## 2026-11-12 (lesson 4 rebuild, bonus words; owner tests)

S7f passed the owner's browser test (lesson 4 with bonus words ຂາ and ຂາວ). Letter writing: the owner says it still
feels weird and will review it in depth later.

### Changed
- **Lesson 4 rebuilt in place** (`20261112195124_lesson_l0004.sql`, written by `db_sql.py lesson L0004`; applied with
  `supabase migration up`, no reset): ◌ຳ, ນ້ຳ water, the R02 recap, ກິນນ້ຳ, ລາວກິນນ້ຳ, recycled ລາວກິນເຂົ້າ, and ຂາ leg
  as the bonus word at the end. ຂາວ white (to lesson 11) and ລາວຂາວ left the lesson; old positions 11–12 retired.
  Then, at the owner's request, ຂາວ white added back as a second bonus word (`20261112204059_lesson_l0004.sql`);
  it becomes core in lesson 11. CURRICULUM_PATH and LESSON_RULES decision 22 updated.
- `app/backend/tests/s7c_s7f_test.sql` passed (checks 1–8).
- PLAN: S7b, S7d, S7e ticked after the owner's browser test (the backend-down case was not tested).

### Added
- **Bonus words in the app (S7f):** "Bonus word" badge on the card (`badge_bonus`, dashed border); the planner gives
  a bonus word its card and one Lao → meaning check, nothing in the closing block; the lesson list shows a "Bonus
  words" line for a done lesson (`covers_bonus`, from `list_lessons.bonus`). DESIGN lesson-session table updated.

### Fixed
- Letter writing: "null" printed under the result after Check (and in the recorder's idle view):
  `replaceChildren` writes a null argument as text. The printed letter now hides on every from-memory step.

## 2026-11-12 (session comfort, fill in the blank, build the word)

### Added
- **Resume (S7b):** a lesson reloaded, or reopened on the same day in the same browser, returns to the same
  question. A localStorage record (`laophabet.resume.<user>.<lesson>`) keeps the seed, the levels the plan was built
  with, the step, the missed steps and any unsent answers; the plan is rebuilt from the seed. A reload during saving
  goes straight to the save. A session the DB no longer knows (local reset) or that was completed elsewhere ends
  with "start again" (`session_gone`). (`js/session.js`)
- **"Leave the lesson?" dialog** on "All lessons" during a lesson. (`js/session.js`)
- **Dry run `#/try/L000n`** ("Try the questions" on the read-only viewer): plays a lesson's questions as a learner
  who has done the lessons before it, with no start_lesson, record_answers or complete_lesson. (`js/session.js`
  `dryLevels`, `js/learn.js`)
- **`js/audio.js` `audioButton(detail)`** on unit, word and sentence cards and in answer feedback; it renders nothing
  until items carry `audio_url` (S10).
- **Fill in the blank (S7e):** `js/activities/fill_blank.js`, asked on recycled sentences (build the sentence when
  no slot qualifies), with the one-logical-choice option rule from DESIGN. The sentence's answer is sent with
  `first_try` false so one question counts once (DESIGN updated).
- **Build the word (S7d):** `js/activities/build_word.js`: tap a word's pieces in spoken order, each tap judged at
  once; the assembled word appears at the end. Asked on recycled words at level 2 or more, and in the closing block
  for the first new word carrying a new tone mark (the tone mark's first check, logged as a recognition answer).
  Word cards gain a "Made of" line with this lesson's new pieces underlined. (`teach_card.js`)
- **`scripts/session_test.mjs`:** plans lessons from dumped `get_lesson` bundles and checks resume rebuilds, fill
  in the blank options (ນ້ຳ never after ກິນ) and that every lesson word can be built.

### Changed
- Local DB: applied the pending migrations `20261111020000_activity_data_bonus.sql` and `20261111144707_s7c_backfill.sql`
  (`supabase migration up`, no reset).

All three slices are **untested in a browser**; `check_frontend.js` and `session_test.mjs` pass, and the
code-reviewer findings were fixed.

## 2026-11-11 (letter writing)

### Added
- **Letter writing practice (S7w), a separate area at `#/write`** (link under the lesson list). For each of the 27
  consonants: watch the letter drawn, trace each part, trace the whole letter, draw each part from memory, draw the
  whole letter from memory. Frontend only; nothing is recorded in the DB (a per-device tick marks finished letters).
  **Untested in a browser.** (`app/frontend/js/write.js`, `js/writing/pad.js`, `js/writing/score.js`, `js/dom.js`
  `s()`, `js/learn.js`, `strings.json` `write_*`, `styles.css`)
- `scripts/strokes_build.js`: builds `app/frontend/data/strokes.json` once from the font outlines (rasterise, thin
  to a skeleton, read the skeleton as pen strokes; no dependencies). Fonts in `scripts/assets/` (Noto Sans Lao
  Looped and Noto Sans Lao, SIL OFL). Hand corrections in `scripts/strokes_overrides.json` (ກ from the plain font,
  ອ direction). Geometry is `derived`; stroke order and direction are the agent's (`unverified`, in QUESTIONS).
- `scripts/strokes_test.js`: simulated handwriting against the scorer. Result at commit: careful drawings accepted
  97.5%, a different letter accepted 0.24%, junk 0/81, tracer and part checks all as expected.
- DESIGN "Letter writing" (writing letters by hand is now in scope as shape practice; typing Lao is still out).

### Browser steps (owner)
1. `#/`: "Practice writing letters" under the lesson list → `#/write`: 27 letters.
2. `#/write/C02` (ຂ, kor): go through all steps. Trace carelessly once (should fail), lift the pen mid-trace
   (should let you continue).
3. `#/write/C07` (ຊ, sor), last step: draw ຂ (kor) instead → "looks like ຂ". Draw it tiny → too small.
4. Fail a from-memory step twice → "Show me" appears. Finish a letter → tick on the grid.
5. Phone: the page must not scroll while drawing. Error case: rename `data/strokes.json`, reload `#/write` → error
   with retry.

## 2026-11-11 (phone test)

### Changed
- S7a build the sentence passed the owner's phone test (Firefox Android); ticked in PLAN.
- Lesson steps now use a fixed frame that fills the visible screen (`100dvh`): progress on top, the activity
  scrolls inside itself, the button is pinned at the bottom, and smaller type is used on short screens. The page no
  longer scrolls, so the mobile address bar stops covering content. Phone test passed (owner).
  (`app/frontend/styles.css`, `app/frontend/js/session.js`)

## 2026-11-11

### Changed
- **Harness refactor.** Folders: `approved-scripts/` → `scripts/`; `_agent/` split into `docs/` (NOTES, PLAN,
  DESIGN, SCHEMA, LESSON_RULES, CURRICULUM_PATH, QUESTIONS), `curriculum/` (lesson drafts and merged folders,
  `vocab.csv`, `common_words.csv`) and `tmp/`. Paths updated in every script, skill, agent and doc; older entries
  below use the old names. Word-list, letter-map and research material parked in `_shelf/` (see its README).
- Guardrails reduced to `.claude/hooks/usage-guard.ps1` (weekly stop, 5-hour pause, STOP file; thresholds in
  `.claude/usage-config.json`). The agent may now edit and run anything inside the project, including the local
  Supabase. Removed: the command filter, script hash approvals, autorun, `run.ps1`, `setup.ps1`, `GUARDRAILS.md`,
  the staging folders (`proposed-scripts/`, `proposed-config/`) and `_trash/`.
- `CLAUDE.md` rewritten (165 → 70 lines). `PLAN.md` holds only open slices. `PROGRESS.md` became `docs/NOTES.md`.
  `app-slice` skill folded into `CLAUDE.md`; `scholar`, `researcher` and `builder` agents shelved.
- `db_sql.py` no longer writes a pending-migrations list (the migrations folder is the list while nothing is hosted).
  `next_lesson.ps1` stops on `tmp/STOP_LESSONS` instead of `_agent/BLOCKED`.

### Added
- `app/backend/tests/s7c_s7f_test.sql` (the S7c/S7f SQL gate, from the builder's hand-over; untested).
- Root `README.md` (usage guard, lesson runner, commit command).

## 2026-11-11 (earlier)

### Added
- S7c + S7f script group (staged by the `builder` agent, approved by the user): `build_order.py` writes
  `data/word_units.csv` (6,868 rows); `db_sql.py` knows `word_units`, `word_categories`, `sentence_slots` and the
  `bonus` role; `lesson_tool.py` has the `bonus` role, the fill-in-the-blank option rule in `check` (and
  `check --merged`), and treats the budget as a warning; `validate_data.py` checks the tag files;
  `next_lesson_prompt.md` follows `_agent/CURRICULUM_PATH.md`. Updated `drafter` agent and `draft-content` skill.
- Migration `20261111020000_activity_data_bonus.sql` (new tables, `bonus` role, `get_lesson`/`list_lessons`
  additions; reviewed, no blockers) and content migration `20261111144707_s7c_backfill.sql` (tags for lessons 1–4).
  Seeds 10–12 regenerated. Both migrations untested until `supabase db reset`.
- `data/categories.csv` (16 categories incl. verb classes `consume`, `motion`), `data/word_categories.csv` (the 8
  words of lessons 1–4) and `data/sentence_slots.csv` (8 slots), all agent-tagged and `unverified`.

### Changed
- `app/README.md` and `_agent/SCHEMA.md` document the new tables, RPC fields and the `bonus` role.

## 2026-11-10

### Added
- Curriculum path for lessons 4–11 (`_agent/CURRICULUM_PATH.md`), agreed with the user: planned backwards from
  natural sentences to a first conversation in lesson 10 (hello, are you hungry, I've eaten already). LESSON_PLAN
  decisions 20–25: core and bonus words, conversations as canned content, ຂໍ … ແນ່, lesson 4 changes. New slices
  S7f (bonus words, runner readiness) and S7g (conversations) in APP_PLAN. Plan only: no data or lesson changed yet.
- S7a build the sentence (`js/activities/build_sentence.js`): the English is shown and the learner taps the Lao word
  tiles into order (the sentence's words plus up to 2 pool words). A wrong order shows the right sentence with its word
  chips. The planner gives a new sentence its card, then build the sentence; a recycled sentence gets build the sentence.
- Build the sentence: tiles can also be dragged into the line at any place, moved within it, or dragged out (touch
  and mouse; tapping still works).
- The lesson list shows what each done lesson covers (letters, words with meanings, sentences, rules):
  `list_lessons` returns `covers` (migration `20261111010000_list_lessons_covers.sql`).

### Changed
- S6c passed its browser gate. The done-lesson link "Read the cards" is now "Review lesson material" (still the
  read-only viewer, no questions).
- Seed files regenerated from `data/` (`db_sql.py seed`); they still had ເຂົ້າ as "rice" (harmless: seeds never
  overwrite, but they now match).
- Fill-in-the-blank design agreed with the user (APP_DESIGN "Fill in the blank: one logical choice"): word categories plus
  per-sentence slot `accepts`, so exactly one option is valid. APP_PLAN re-cut: S7a is build the sentence only, S7c
  also carries the category and slot data, and a new S7e (fill in the blank) comes before S7d.

### Fixed
- S6c browser feedback (user): a question showed the text "null" under the options before the answer
  (`replaceChildren` was given `null`); final ວ is now labelled "ao" like ເ◌ົາ, not "-ao" (card and questions);
  W000019 ເຂົ້າ gloss is "rice, food" (migration `20261111003745_gloss_rice_food.sql`). Letter case in sound
  labels: kept lowercase (user: "maybe lowercase is fine").

### Added
- S6c first checks (frontend only; untested until the browser gate): `js/activities/multiple_choice.js` (unit:
  letter → sound and sound → letter; word: Lao → meaning and meaning → Lao; options never share a Lao form or a
  label; after the answer the right option is marked and the item is shown with its sound, meaning and info icon).
  `planLesson` now interleaves: card, check, next card; one question per recycled word (by level); a closing mixed
  block (at most 8); a missed question comes back at the end, at most twice, sent with `first_try: false`. The
  summary shows words read and "right first time", and its line goes by accuracy. Final ວ is labelled "-ao"
  (display rule in `teach_card.js`). Units now have an info dialog (`openInfo`, `infoButton`).
- S6b session runner (browser gate passed, closed by the user): `#/lesson/L0001` plays a lesson as a session. New
  `app/frontend/js/session.js` (planner and runner: `start_lesson`, teach cards under a progress bar, answers
  batched to `record_answers` and resent after a failure, `complete_lesson`, summary screen with new items, streak
  and one encouraging line), `js/activities/index.js` and `js/activities/teach_card.js` (card code moved out of
  `learn.js`, same look), `js/bundle.js`. The lesson list shows done (tick and date, "Read the cards"), open and
  locked from `list_lessons`. The read-only viewer moved to `#/read/L0001`. `t(key, vars)` fills `{n}`-style
  placeholders. Staged: an updated `activity-module` skill in `_agent/proposed-config/skills/`.
- S6a backend for a played lesson (gate passed on the user's local Supabase, 5 of 5 checks): migration `20261110120000_played_lesson.sql` adds `review_log.first_try`; `record_answers` accepts `first_try`; the session summary's answers, correct and accuracy count first tries only; `list_lessons()` returns per-learner `state` (done / open / locked), `completed_at` and `last_accuracy`; `get_lesson()` returns the caller's `levels` and pool units with their sound. Test: `app/backend/tests/s6a_played_lesson_test.sql`.

### Changed
- Guard: the agent may write inside `.claude/skills/` (`Get-WritableExceptions` in `.claude/hooks/common.ps1`; the
  deny rule `Edit(/.claude/**)` in `.claude/settings.json` narrowed to hooks, state, tools, agents and the top-level
  files). Installed by the user; the updated `activity-module` skill is in place.
- S5 (progress tables and RPCs) confirmed: `app/backend/tests/s5_progress_test.sql` passed 11 of 11 on the user's local Supabase. Decisions recorded: final ວ is labelled "-ao" (applied in S6c); lessons 5+ resume after S7c.
- Learning-experience plan (planning only, no code). APP_DESIGN: new sections "Curriculum lesson, app lesson, session", "Lesson session" (interleaved teach and check, closing block, mistake replay, feedback, completion, lesson list states, resume) and "Audio and speaking hooks"; activity table re-ordered (build the word is v1, tone drill waits for a tone-rule lesson, "Spot it" dropped); decisions log. APP_PLAN: slices re-cut as S6a–S6c (playable lessons 1–4), S7a–S7d, S8, S8b, S9, S9b, S10, S11; S2–S4 ticked. SCHEMA: planned `word_units.csv`. No change to merged lessons.

## 2026-11-09

### Added
- Lesson 2 (L0002, "A second word and a first phrase"): ຂ, ເ◌ົາ, the tone mark ◌້ (taught as "changes the melody", no class rule), the word ເຂົ້າ "rice" and the first phrase ກິນເຂົ້າ (S000002870, unverified). Migration `20261110025408_lesson_l0002.sql` (pending). Built with `--max-units 3` because the word is fixed.
- W001425 ເຂົ້າ "to enter; to go in", split out of W000019 (one row per spelling and meaning).
- The first dotted-circle card of lesson 1 says on its front that ◌ is a placeholder, not a letter (`unit_dotted_circle_first`). Untested in a browser.
- LESSON_PLAN decisions 11 (natural learning first; rules are a backup) and 12 (build as if native audio exists; no TTS).
- `.vscode/settings.json`: Live Server root is `/app/frontend`.

### Fixed
- The app no longer hangs on "Loading" when the browser holds a session for an account that no longer exists (as after a local `supabase db reset`): `app.js` drops the session and shows the sign-in screen. Untested in a browser.

### Added
- Learner settings dialog (Settings in the top bar; `app/frontend/js/settings.js`, remembered per browser) with one setting so far: show spaces between Lao words. It replaces the per-card "Show as normally written" switch. Untested in a browser.

### Added
- Transliteration is a learner setting: Standard (k, kh, p, ph, t, th, ch; the default) or English-style (g, k, bp, p, dt, t, j). The data keeps the English-style respelling and `app/frontend/js/translit.js` converts it for display. LESSON_PLAN decision 13: teach texts must read correctly in both styles. Untested in a browser.
- Lesson 1 opens with two intro cards: Lao sounds do not map neatly onto English letters, and the learner picks a transliteration style (changeable in Settings). Untested in a browser.
- "Read more on Wikipedia" links under "More" on letter, vowel, tone mark and word cards (aspiration, vowel length, tones, IPA for Lao, the Lao script). The link targets were written from memory and not opened.
- Lesson 3 (L0003, "A new word and a first sentence"): ລ, ◌າ, final ວ; ລາວ "he, she" (W000031) and "Laos; Lao" (W000058) on one card; the first full sentence S000002872 ລາວກິນເຂົ້າ "He eats. / She eats." (composed, unverified); recycles ກິນ, ເຂົ້າ and ກິນເຂົ້າ. Drafted by the drafter agent; checked with `--max-units 3 --min-recycle 2`. Migration `20261110034745_lesson_l0003.sql` (pending).
  - It replaces a first lesson 3 (ເຂົາ, ເກົ້າ; migration `20261110033330`), withdrawn the same day before it reached any hosted database: ເຂົາ is too close to ເຂົ້າ this early (LESSON_PLAN decision 15). The old files are in `_trash/lesson-l0003-first/`. S000002871 ເຂົາກິນເຂົ້າ "They eat." stays in the pool.
- Lesson 4 (L0004, "More words, more sentences"): one new vowel ◌ຳ; new words ນ້ຳ "water", ຂາ "leg", ຂາວ "white"; new composed, unverified sentences S000002876 ລາວຂາວ "He is fair-skinned. / She is fair-skinned.", S000002873 ກິນນ້ຳ "To drink water." and S000002874 ລາວກິນນ້ຳ "He drinks water. / She drinks water."; recycles ກິນ, ເຂົ້າ, ລາວ and ລາວກິນເຂົ້າ. Passes the lesson check with default limits. Migration pending (see PENDING_MIGRATIONS.md).
  - Rebuilt the same day in two halves (owner): first the words that need nothing new (ຂາ, ຂາວ, ລາວຂາວ), then the new vowel with ນ້ຳ and its sentences. ເຂົ້າຂາວ "white rice" (S000002875) was taken out of the lesson because the owner doubted it (plain rice is usually ເຂົ້າຈ້າວ); it stays in the pool, unverified. The first version's files are in `_trash/lesson-l0004-first/`.
  - Rebuilt once more to add the recap card R02 "One shape, three vowels" (the stroke າ in ◌າ, ເ◌ົາ and ◌ຳ) right after ນ້ຳ; merged with `--max-weight 7.5`. Current migration: `20261110040845_lesson_l0004.sql`. Rule and recap cards show their Lao parts enlarged. LESSON_PLAN decisions 18 (recap cards for apparent contradictions) and 19 (lesson layout and reading load).
- Homographs taught together share one card with each meaning on its own line (`learn.js`). Untested in a browser.
- LESSON_PLAN decisions 14–17: lesson 3 is ລາວ; look-alikes wait; translations show alternatives on separate lines, never "or"; from lesson 4, fewer new letters and more (very common) words.
- Lao font is a learner setting (Settings dialog): Standard (Leelawadee UI on Windows, else the device's Lao font; the default), Looped (Noto Sans Lao Looped), Modern (Noto Sans Lao) and Serif (Noto Serif Lao), each shown with a sample. Untested in a browser.

### Changed
- The recap card "One shape, three vowels" is now a table with one row per vowel: the Lao, its sound again (aa, ao, am) and the English cue (the a in 'father'). Rule text format `prose || Lao | sounds like | cue || ...` (LESSON_PLAN decision 18). Migration `20261110041529_l0004_recap_rows.sql` (pending). Untested in a browser.
- The transliteration choice moved from its own intro card onto lesson 1's first letter card (ກ), with a short explanation; choosing redraws the card. Lesson 1 keeps one intro card ("Lao has its own sounds"). Untested in a browser.
- `.gitignore` now covers the local Supabase CLI folders (`.temp`, `.branches`).
- PROGRESS.md cut down to open work, decisions in force and next steps; PLAN.md ticks brought up to date.
- Sentence translations: alternatives are separated by " / " in `sentences.english` and shown one per line; no "literally" clause. S000002870 is now "To eat (a meal)." (migration `20261110034746_l0002_phrase_english.sql`, pending).
- ເຂົາ (W000160) gloss is now "they; (more formal) he; she" (was Wiktionary's "he; she; they"), on the owner's experience; flagged for the native speaker.
- Lesson 1's ກ card now reads "Like the k in 'sky': a k with no puff of air." (was "A hard g, as in the word 'get'."), so it is right in both transliteration styles. Migration `20261110032940_l0001_k_cue.sql` (pending).
- Lao text font, trial: the device's own Lao font (`sans-serif`, which is what Wikipedia shows), after the loopless Noto Sans Lao and then Noto Sans Lao Looped were tried and not liked. English text uses the system font. To be pinned once the owner names a font.
- The word info dialog no longer shows "Taught in lesson L0001": internal IDs are not shown to learners.
- Teach cards put the Lao first: the glyph or word takes the whole top row, larger and semi-bold, and "Sounds like", "Means" and the tone picture sit below it in smaller type. Sentence cards show the Lao larger too. CSS only; untested in a browser.
- W000019 ເຂົ້າ is now "rice" (noun) only. S000000512, S000002222 and S000002853 pick W001425 through `word_overrides`; ເຂົ້າໃຈ, ເຂົ້ານອນ and ທາງເຂົ້າ list W001425 as their component.
- Seed files regenerated (`db_sql.py seed`) so a local `supabase db reset` includes the split.

## 2026-10-24

### Added
- S5 learner progress (SQL only, untested): migration `20261025040000_progress_tables.sql` with `learner_sessions`, `lesson_progress`, `learner_items` (level 0–4, never lowered), append-only `review_log`, and RPCs `start_lesson`, `record_answers` (batched; replays are no-ops) and `complete_lesson` (summary: accuracy, words read, new items, level-ups, streak). Paste-in check `app/backend/tests/s5_progress_test.sql`.

### Changed
- Same-sound letters (ງ ນ ມ) are taught at the start and the end of a word together, on one card. Lesson 1 adds initial ນ (C13) next to final ນ (C13f), and the lesson page folds the pair into one card. Migration `20261025034328_l0001_initial_na.sql` (pending; untested). The matching `lesson_tool.py` change (pair required, counts as one unit, brief scores pairs together, FIRST_UNITS + C13) is proposed in `_agent/proposed-scripts/` and awaits approval.
- Teach card front is now a small table: small labels over large content (Lao letter | Sounds like, with a hint line underneath; Lao word | Sounds like, Means, Tone). The lesson title no longer appears on card 1. L0001's title is now "First letters: ກ ◌ິ ◌ນ", and its teach texts are hint lines. Migration `20261025033501_l0001_teach_hints.sql` (pending; untested).
- Teach cards are minimal (user feedback: too much text for a new learner). The front shows the glyph or word, a one-line sound cue, the meaning and, for words, a tone picture. IPA, class, length, role, tone names, part of speech and the longer tip sit behind a "More" section, which is open in the info dialog. The letter name word (ໄກ່ "chicken"), example chips on unit cards and the lesson summary on card 1 are gone. Spec: APP_DESIGN "Teach cards", LESSON_PLAN decision 9.
- Lesson 1 content: the teach texts for ກ, ◌ິ and final ນ are cut to one line, the title is now "Your first word" with a summary that doesn't name ກິນ, and the ກິນ item note shows both senses (eat and drink). Migration `20261025032517_l0001_short_teach_text.sql` (pending; untested).

### Added
- `app/frontend/js/tone.js`: a tone contour picture (SVG pitch line on the 5-level Chao scale, one per syllable) with tone descriptions as accessible labels. Untested in a browser.

### Added
- App-phase agent config, staged for the owner to install (`_agent/proposed-config/INSTALL.md`):
  - New CLAUDE.md built around the app and curriculum tracks and the slice/gate workflow.
  - New read-only agents `code-reviewer` and `curriculum-reviewer`. `drafter` retargeted at lesson needs; `researcher` and `scholar` now also cover technical sources.
  - Six skills: app-slice, sql-migration, frontend-feature, activity-module, build-lesson, draft-content.
  - Guard config allowing the new agents.
- `CLAUDE_Research.md`: the previous CLAUDE.md, preserved unchanged for research and word-list work (not auto-loaded).
- Proposed script `_agent/proposed-scripts/check_frontend.js`: JS syntax, import/export and strings.json key checks for `app/frontend` (awaiting approval).
- APP_DESIGN: "Practice sessions" and "Stats and encouragement" (streak, letters known, words known, session summary). Confirmed by the user: letters known is one number; words read counts repeats.

### Changed
- APP_PLAN slices: S5 adds sessions and the session summary; S6 adds the summary screen; S8 adds home stats; new S8b practice sessions.

### Fixed
- App no longer hangs when Supabase is unreachable. Sign-up and login now show an error and re-enable the submit button instead of leaving the form stuck. A failed profile fetch shows an error with "Try again" and "Sign out" instead of an endless loading screen. A failed `getSession` at startup falls through to the login screen. (`app/frontend/js/auth.js`, `app/frontend/js/app.js`)

### Added
- `retry` UI string ("Try again" / "ລອງໃໝ່", Lao unverified). (`app/frontend/js/strings.json`)
- This changelog.

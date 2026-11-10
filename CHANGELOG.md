# Changelog

Every change to the project is recorded here, newest first. Update it in the same commit as the change.

## 2026-11-10

### Changed
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

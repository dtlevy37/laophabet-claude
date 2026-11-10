# Changelog

Every change to the project is recorded here, newest first. Update it in the same commit as the change.

## 2026-11-09

### Added
- Lesson 2 (L0002, "A second word and a first phrase"): ຂ, ເ◌ົາ, the tone mark ◌້ (taught as "changes the melody", no class rule), the word ເຂົ້າ "rice" and the first phrase ກິນເຂົ້າ (S000002870, unverified). Migration `20261110025408_lesson_l0002.sql` (pending). Built with `--max-units 3` because the word is fixed.
- W001425 ເຂົ້າ "to enter; to go in", split out of W000019 (one row per spelling and meaning).
- The first dotted-circle card of lesson 1 says on its front that ◌ is a placeholder, not a letter (`unit_dotted_circle_first`). Untested in a browser.
- LESSON_PLAN decisions 11 (natural learning first; rules are a backup) and 12 (build as if native audio exists; no TTS).
- `.vscode/settings.json`: Live Server root is `/app/frontend`.

### Fixed
- The app no longer hangs on "Loading" when the browser holds a session for an account that no longer exists (as after a local `supabase db reset`): `app.js` drops the session and shows the sign-in screen. Untested in a browser.

### Changed
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

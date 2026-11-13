# Changelog

Every change to the project is recorded here, newest first. Update it in the same commit as the change.

## 2026-11-13 A7 step 8: home tiles and Lessons page
- Navigation model B (owner, step 6), no tab bar. Home (`#/`) is the Continue card, then a grid of section tiles
  (2 columns on a phone, 3 from 560px): Lessons (`#/lessons`, status "{done} of {total} done" counted from the
  `list_lessons` rows) and Write (`#/write`) are links; Review, Letters and sounds, My words and Notes are greyed
  (dashed, muted, "Soon" written out), `role=link` + `aria-disabled`, no href, not focusable. (`home.js`,
  `styles.css`)
- New `js/lessons.js`: the `#/lessons` page holds the compact path moved from home (done ✓ + Review, open lessons,
  the next 2 locked, the rest folded), with ← Back like Settings (history.back when opened from home, else `#/`)
  and the h1 focused. The lesson to pick up is now listed and outlined (`aria-current`), since there is no Continue
  card on this page. `nextLesson()` is shared with home's Continue card. Route in `learn.js`. (`lessons.js`,
  `learn.js`)
- Strings: `home_lessons_status`, `home_sections`, `home_soon`, `home_tile_*`, `lessons_back` (English only);
  `home_all_done` now points to Lessons. Unused `.write-entry` and `.path-title` styles removed.
- Tests: `scripts/browser/a7_shots.js` checks the tiles, the Lessons tile status, 2/3 columns, greyed tiles not
  reached by Tab, Lessons → Back (from home and direct), "in progress" on Continue, the current row on `#/lessons`;
  shots `home_*` and `lessons_*` at 375/1280 light and dark and 375×700.

## 2026-11-13 A7 step 7: Lao palette, colour themes, badges
- Palette: Lao blue + red (the owner's step 6 choice) is the default, light and dark, from the step 6 mockup tokens;
  the old blue is gone. New tokens `--warm` (brand red) and `--on-warm`; the warm colour is only for the brand dot
  in the learner header, the streak on the summary and the Culture badge, never for an answer state (wrong stays
  `--danger`, a darker red, with ✗). Links use `--accent` instead of the browser's blue. (`styles.css`, `app.js`,
  `summary.js`)
- Settings → Colours: Lao blue and red / Indigo and saffron / Teal and gold, each with a swatch; stored as
  `palette` in `laophabet.settings`, set as `html[data-palette]` (CSS token swaps for light and dark), independent
  of System / Light / Dark. A small inline script in index.html's head sets `data-theme` and `data-palette` before
  the first paint (no flash). (`settings.js`, `index.html`, `strings.json`: `settings_palette*`, English only)
- Badges: "★ Bonus word" is a solid accent pill; "✦ Culture" a solid warm pill (the note keeps its accent edge: a red edge would look like the "wrong" feedback); both pop
  in once with a light sweep, off under `prefers-reduced-motion`. (`styles.css`, `teach_card.js`)
- Every text token is at least 4.5:1 on `--bg` and `--card` in all six sets (checked with a script).
- Tests: new `scripts/browser/a7_look.js` (shots of every palette, light and dark, at 375 and 1280; palette before
  the modules; reduced motion); `a7_shots.js` background colours updated.

## 2026-11-13 A7 steps 3-4: review fixes
- Home's Continue card (`session.js` `resumableLesson`, now given list_lessons rows): of the lessons with a usable
  resume record, a lesson not done before a done one played again, then the most recently saved (the record now
  keeps `at`). One validity test, `recordFits`, is shared with `resume()`.
- Summary: its primary button ("Next lesson", else "Back home") gets the focus, so Enter takes it; the DOM order
  stays the visual order. "Next lesson" is the lowest lesson order above this one that is not locked
  (`pickNextLesson`), and the `list_lessons` call is raced against 3 s so the summary never hangs on "Saving…".
- Home: no "Lessons" heading when the only open lesson is on the Continue card.
- Strings removed (unused): `lesson_done_on`, `lesson_read_cards`, `covers_letters/words/sentences/rules/bonus`.
- Tests: `session_test.mjs` covers `pickNextLesson` and `resumableLesson`; `a7_summary.js` presses Enter on the
  summary instead of clicking. Selector contract note on end-screen focus (activity-module skill).

## 2026-11-13 A7 step 5: audio hierarchy and build-the-word how-to
- `audio.js`: the play button is the only audio control next to the Lao (⚑ removed from `audioButton`); new
  `audioExtras(detail)` ("Voice: <name>" and "⚑ Report a problem with this recording") replaces `audioCredit`.
- `teach_card.js`: word cards put `audioExtras` at the end of "More" (open in the ⓘ sheet, folded on the lesson card);
  sentence cards get a "More" holding it. The report dialog is unchanged and opens from there.
- `build_word.js`: the "◌ is not a piece" note shows on the first 3 build-the-word questions that have a ◌ tile (was
  once; A6 finding 10). `styles.css`: `.audio-btn` in the accent colour; `.audio-extras`, `.audio-report` small and
  muted.
- `scripts/browser/a7_audio.js`: keyboard dry run that checks no ⚑ on any card face, Space plays, and a report is sent
  from an ⓘ sheet with a recording; screenshots `tmp/shots/a7/audio_*`. Passed on L0002 (375/1280, light/dark) and
  L0007.

## 2026-11-13 A7 step 4: summary "Next lesson"
- Summary (`summary.js`): "Next lesson" (primary, on the right) and "Back home" (secondary); with no next lesson
  (the last one, or the lookup failed) "Back home" is primary. The next lesson is found after `complete_lesson`
  with one `list_lessons` call (`session.js` `nextLesson`: the next in lesson order, not locked; best effort).
- "Words read" relabelled "Lao words read (with repeats)". Strings `summary_next`, `summary_home` (replace
  `summary_continue`).
- `scripts/browser/a7_summary.js`: plays a real lesson to its summary, screenshots 375/1280 light/dark, taps Next
  lesson; L0001 → `#/lesson/L0002` with a step on screen.

## 2026-11-13 A7 step 3: home Continue card and compact path
- New `js/home.js` (`showHome`, replaces learn.js's lesson list): a Continue card (the lesson running in memory or
  saved for resume today on this device, `session.js` `resumableLesson`, else the first open lesson; "Continue" or
  "Start", button on the right), then the path: done lessons one line each (✓, tap to play again, "Review" for the
  cards), open lessons other than the Continue card's, the next 2 locked, the rest folded under "{n} more lessons";
  "Practice writing letters" as a link row. Only `list_lessons` and the local resume record are used.
- Removed from home: the "Letters / Words / Sentences / Rules / Bonus" lines under done lessons (`covers`; the RPC
  still returns them) and the done date. CSS for the old list removed.
- Strings: `home_continue_label`, `home_next_label`, `home_all_done`, `home_continue`, `home_more_lessons`,
  `home_review`, `home_review_label`, `lesson_done_short`.
- Checked: with 5 lessons done, home is 700px tall at 375×700 (light and dark), and a lesson left part-way shows
  "Continue" after a reload (`a7_shots.js`).

## 2026-11-13 A7 steps 0–2: review fixes (code-reviewer)
- The header hides only on a real lesson route: `learn.js` `isLessonRoute()` (the router's own parse) replaces
  app.js's looser regex, so `#/lesson/foo` (which shows the lesson list) keeps the header.
- Slim header: the brand shrinks (ellipsis) and the links never clip; at very narrow widths they wrap.
- Settings: a failed Sign out shows the generic error (the button is the retry); the page focuses its h1
  (tabindex -1) when drawn.
- Signing out resets the hash to `#/` (replaceState) and Settings' Back memory (`resetRoutes`), so the next sign-in
  lands at home.
- Lesson head: the counter is `aria-hidden`; the progress bar's label says "step {n} of {total}"
  (`session_progress_n`, replaces `session_progress`).
- Keys: Enter on a focused radio or checkbox (the lesson 1 intro card's sound spelling) goes on; other keys stay
  with the control.
- `a7_shots.js` checks all of these (native-as-learner at 320 with `NATIVE_EMAIL` / `NATIVE_PASSWORD`, a local
  native account).

## 2026-11-13 A7 step 2: slim header and lesson chrome
- Learner header (`app.js` `showLearnerTopbar`): one line, the brand and Settings (plus a native's way back to
  review). Hidden on `#/lesson/…` and `#/try/…` (`syncTopbar`, on render and every hashchange). The native header
  (`showTopbar`: name and Sign out) is unchanged.
- Settings page: an Account section at the end, "Signed in as {email}" and Sign out (`settings.js`; the email comes
  from app.js through `showLearnerHome`'s ctx).
- Lesson head (`session.js` `stepView`): a 44px ✕ (opens the leave dialog), the progress bar and a counter
  `{n} / {total}` (this step / the steps planned so far, replays included). The dry-run badge moved under the head.
  The loading screen has a ✕ link home. Esc still opens the leave dialog.
- Strings: `lesson_close`, `session_counter`, `settings_account`, `settings_signed_in_as` (learner only).

## 2026-11-13 A7 step 1: settings page, sound spelling on the intro card, light/dark
- Settings is a page, `#/settings` (`settings.js` `showSettings`, routed in `learn.js`), scrolling like any other;
  ← Back goes back in history when opened from the app, else home. The top bar's Settings is a link. The dialog
  (`openSettings`) is gone.
- New "Light or dark" choice: System / Light / Dark (setting `theme`, per browser). Light or Dark sets
  `html[data-theme]`, which beats the device setting (`styles.css`: dark tokens under `prefers-color-scheme: dark`
  for `:root:not([data-theme='light'])`, and again for `[data-theme='dark']`). The palette is unchanged.
- The sound-spelling choice moved off the ກ card onto lesson 1's intro card, with ກ and "Sounds like" as the
  example; picking a style rewrites that "Sounds like" in place (no fake hashchange). `intro_style_1` reworded
  ("This letter, the first you will learn, ..."). DESIGN Presentation updated.
- A running lesson reopened from another screen gets its keys back (`showSession` re-adds the listeners; they
  were lost after a visit to another screen).
- Strings: `settings_back`, `settings_theme`, `settings_theme_system|light|dark` (learner only, no `lo`).
- `scripts/browser/a7_shots.js`: 375/1280, light/dark shots of home, settings, the intro card and a lesson step, with
  checks (Back, theme beats device, intro choice updates "Sounds like", no radios on the ກ card, Esc).

## 2026-11-13 A7 step 0: groundwork (no visible change)
- `js/summary.js`: the end screens (summary, dry-run end, failed, save failed) moved out of `session.js`; they take
  callbacks, so summary.js knows nothing of the running session. `buildPlan` / `dryLevels` stay in session.js.
- `settings.js`: `settingsPanel(onChange)` (the controls) split from `openSettings()` (the dialog).
- activity-module skill: the selector contract (`.stage`, `.actions` `button.primary`, `button.mc-option`,
  `.bs-bank > button`, `.bs-line > button.bs-tile`, `.audio-btn`, `.info-btn` / `.info-icon`, `.feedback`).
- `styles.css`: `--content-max` (720px) and `--radius` (12px) tokens, used by `.card`, `.back-home` and the 12px corners.
- `scripts/browser/a7_keys.js`: plays a dry run to its end with the keyboard only, and checks Esc opens the leave
  dialog.

## 2026-11-13 L1d/L1e review fixes (code-reviewer)
- Planner: a new unit's sound → letter and a shared card's other meanings are reserved (never dropped by the kept
  builds; the closing block may pass 8 by reserved and kept steps only). Lessons 6 and 7 have ◌ໍ ບ ດ ◌ີ back.
  Dead `newMarks` removed. `piecesFirst` exported and tested.
- Find the missing piece is logged as `recognition` (record_answers: a right recognition lifts to 2 at most), and
  its wrong options are pieces of the same kind as the missing one when the pool has 2+. No migration.
- Resume record stores `APP_VERSION` (now 2026.11.13-l1e.2); a record from another release is dropped.
- Missed-ເຂົ້າ note softened to "“Hungry” is usually ຫິວເຂົ້າ (hiw kao), with ເຂົ້າ."; QUESTIONS asks the native when
  bare ຫິວ is fine.
- `session_test.mjs`: every new unit keeps its sound → letter, shared-card meanings asked, missing piece logged as
  recognition and same-kind options, piecesFirst order.

## 2026-11-13 L1e Lesson order
- Planner (`js/session.js`): every new core word that can be built is built in its own lesson's closing block
  (always kept; replaces its meaning → Lao there), so no word is first built in a later lesson. Long words
  (3+ `syllables`) first get "find the missing piece", always before the full build (`piecesFirst`).
- `build_word.js` variant `spec.missing`: every piece in its slot but one; pick it from the piece and 2–3 wrong pool
  pieces (same rules as a full build); one tap decides. Still activity `build_word` (recall); detail
  `{mode: 'missing', tiles, pieces: [the missing piece], given, taps}` (no migration). String `bw_q_missing`.
- `APP_VERSION` 2026.11.13-l1e. DESIGN lesson-session rows updated. `session_test.mjs` asserts no first build
  outside the word's own lesson, a missing-piece question before the build of every long new word, and the
  variant's judging and options. Side effect: lessons 6 and 7 lose some sound → letter closing questions (cap 8).

## 2026-11-13 L1d (c) missed-ເຂົ້າ note
- Compare view (build the sentence): `PAIR_NOTES` table in `js/activities/compare.js`; when the answer has ຫິວ
  (W000072) followed by ເຂົ້າ (W000019) and yours has ຫິວ without ເຂົ້າ after it, a note under the rows:
  "“Hungry” needs ເຂົ້າ after it: ຫິວເຂົ້າ (hiw kao). On its own it sounds unfinished." String `cmp_pair_hiw_kao`
  (en only). `session_test.mjs` covers it. Frontend only, no migration.

## 2026-11-13 R03 as a lead-in (owner)
- R03 "Written first, said second" moved before V35 ເ◌ົາ in L0002 and reworded as a lead-in; vowel cards
  V04 V03 V05 V21 V01 V35 keep a short reminder only. Migrations `20261113195331_lesson_l0002`, `20261113195332_vowel_cards_short_reminder`
  (local). New slice A10 Notes section.

## 2026-11-13 L1c, L1d, L1b(a) built (subagents)
- L1c: build the word slot board, Check early, slips stay green (kept in detail), compare view (`compare.js`),
  pronoun-drop alternates via `sentence_json.alternates` (migration `20261113190300`, test `tests/l1c_sentence_alternates_test.sql`).
- L1d: rules R03 (L0002, after ເ◌ົາ) and R04 (L0009, after ຫິວນ້ຳ); ຫິວ culture note; English fixes S000002881/2889/2892;
  ເຂົ້າ added to S000000268, S000001655, S000000192; new QUESTIONS on bare ຫິວ replies and ສີນີ້ຂາວ.
- L1b(a): vowel cards say the vowel is one unit and the consonant is said first.
- Pushed to hosted with the owner's go-ahead (8 migrations `20261113190300`–`20261113190645`); owner check pending.

## 2026-11-13 (docs cleanup)
- NOTES, PLAN, QUESTIONS rewritten about 3x shorter: per-lesson detail and finished slices left to CHANGELOG/git,
  owner decisions gathered in QUESTIONS "For the owner", native questions grouped by topic and deduplicated
  (tag-confirmation questions dropped).
- Lesson runner prompt: per-lesson entry goes to CHANGELOG, not NOTES; no category-tag questions for the native.
- `docs/A3_STATS_DESIGN.md` moved to `_shelf/docs/` (summary stays in DESIGN); references updated.

## 2026-11-13 (owner answers)
- NOTES: one list of open owner browser tests. L5: owner answers recorded (§11).
- L2 listen and pick (`js/activities/listen_pick.js`): hear a recorded word, pick its Lao from 3–4 real words (no
  same-sound option); one per lesson in the closing block; logged with A3 detail. "Can't listen now" pauses
  listening and autoplay for 10 minutes (stand-in: meaning question, logged with `swapped`); Settings shows and ends
  the pause. A lesson saved in progress before this restarts once.
- Key numbers in tile banks stay with their slot after a tile is used (owner 2026-11-13).
- L1 clearer activities: first-time how-tos for build the word / sentence (`js/howto.js`, ◌ explained once);
  wrong sentences mark each placed tile ✓/✗; same-sound rule for sound options and build-the-word wrong tiles
  (session_test now checks it; it found ◌ວ / ເ◌ົາ and ◌ອ◌ / ◌ໍ tiles); unit cards say "Same sound as …".
  Bundles in tmp/bundles re-dumped.
- Accessibility fixes (audit `tmp/a6b/a11y.md`): dark-mode button text, locked-lesson contrast, control borders,
  hidden h1 per screen, focus-visible ring, progress track, lang="lo" on all Lao (`dom.laoText`), 44px targets,
  "Keyboard shortcuts in lessons" setting, feedback scrolled into view + persistent live region. axe 126 → 0.
- PLAN: learning slices L1–L5 and their order. L5 speaking design note (research on Lao speech recognition).
- Letter and vowel cards show "Hear it in a word": a recorded lesson word with the unit highlighted and ▶
  (`js/unit_word.js`). A4 hints on hosted (owner push). Review round 2: accessibility audit and learning-design review
  (tmp reports; points in NOTES).
- Hosted: A5 and A3 migrations pushed (owner go-ahead), checked. A4 sound hints applied to 33 rows (units V04 V15 V21
  V22 V36, rule R02, letters C01 C02 C09 C14, vowels, 18 word tips) in `20261113143534_a4_sound_hints.sql`, local
  only (hosted push left to the owner). `docs/A7_PLAN.md`: revamp readiness and step plan.
- A4: owner answers recorded; formant measurement of the native takes (`tmp/audio/formants.py`) with a proposed hint
  per vowel in the audit.
- A3 agreed (weak evidence: log only); summary added to DESIGN "Stats capture (A3)"; PLAN A3 ticked.
- Lesson primary button on the right (thumb reach). A3 answers 2–4 recorded (as built); A6 proposal point 4 changed:
  keep repetition, streamline the UX. A4: owner accent Midwest US.

## 2026-11-13 night (A2 review fixes; A3 and A5 built locally; A6 UX review)
- A2 review fixes: rule notes and build-the-word hints put Lao in `lang="lo"` spans (`i18n.tParts`,
  `grammar.noteParts`); tone marks in build the word are logged wrong only after a wrong tone-mark tap (plus, in
  strict order, a slip at their step); `isToneMark` used in `finish`; the describer rule needs a noun before the
  describer (pronoun ນີ້ / ລາວ cases no longer fire; checked against every bundle sentence); "usually" for ແລ້ວ.
- A3 stats capture (subagent), local only: `review_log` gains attempt, question_id, role, known_options, detail;
  `learner_sessions` gains tz, utc offset, app version, settings via new `set_session_client`; activities send their
  detail (options, chosen, tiles, per-piece taps, mode, audio/info taps). Built on the proposed answers to the
  design's open questions. Old-shape batches still accepted; new frontend tested against the old RPC.
- A5 usage and culture notes (subagent), local only: `word_notes` table, `word_json` adds usage_note/culture,
  `db_sql.py` handles `word_notes` (bool type, `word_notes:<id>`), validation; notes for ເຂົ້າ and ສະບາຍດີ.
- A6 UX review: three personas in Playwright; `docs/A6_UX_REVIEW.md` (findings, revamp proposal, owner questions).
  Quick fixes: dry-run badge no longer overlaps Sign out; Settings dialog closes on a route change.
- Keyboard support in lessons and dry runs (A6 finding 6): 1–9, Enter, Space, Backspace, Esc; focus moves into the
  lesson stage; key hints on desktop only. Lao options never wrap mid-word (finding 9; `dom.fitOptions`).
- QUESTIONS: A2 rule claims, A4 sound checks and the owner's accent. NOTES: closed the stale slot-exclusion items
  (later lesson merges carried them; local and hosted match the CSV).

## 2026-11-13 (A2 gentler activities; A3 design; A4 audit; handoff)
- A2 (frontend only, owner test pending): build the sentence's Check is enabled after one tile; build the word
  defaults to any order and then shows the reading order, with strict order as the setting "Spelling challenge"
  (`spellingOrder`); new `js/grammar.js` adds rule notes for wrong word order (describer after the thing, ບໍ່
  placement, question ບໍ່ at the end, ແນ່, ແລ້ວ); test `scripts/grammar_test.mjs`. Code review findings are listed in
  NOTES (not fixed).
- `docs/A3_STATS_DESIGN.md`: stats-logging design draft (not agreed). `docs/A4_SOUNDS_LIKE_AUDIT.md`: sounds-like
  audit (not applied).
- NOTES rewritten as a handoff for a fresh session.

## 2026-11-13 (A1 lesson audio; plan A1–A9)
- Owner's play-test notes turned into PLAN slices A1–A9 (order agreed).
- A1: the 67 takes by the owner's wife (verified native, credit "Na") are lesson audio. `scripts/audio_publish.py`
  trims silence and applies a linear gain toward −18 LUFS (no compression; takes were about −44 LUFS), MP3 96 kb/s,
  uploads them to the public bucket `audio` and writes the `item_audio` migration. Schema migration
  `20261113020000_a1_lesson_audio.sql`: `item_audio`, `get_item_audio`, `learner_reports`, `report_content`.
  Content migration `20261113032217_lesson_audio.sql`. Both pushed to hosted; the files are uploaded.
- Frontend: bundles carry `audio_url`; play + ⚑ report chips (shared player); autoplay once on new word/sentence
  cards (setting); "Voice: Na" credit on cards.
- Tests: `app/backend/tests/a1_audio_test.sql` (local, passed); `scripts/browser/a1_smoke.js` (Playwright, local,
  passed); `scripts/local_test_user.sh` recreates the local test learner.
- Local Supabase: `.temp/postgres-version` (17, written by `link`) moved aside so local starts on Postgres 15.
- A4 research report in `tmp/a4_sounds_like_audit.md` (not applied).

## 2026-11-12 (hosted 403 fix)
- After sign-up the hosted site returned 403: the new hosted project grants no select/insert/update on public
  tables to `authenticated` by default (local does). Migration `20261113010000_explicit_table_grants.sql` grants
  them explicitly (profiles select + column-level update without the consent columns; sentence_reviews,
  sentence_recordings, item_recordings and learner tables select; sentence_recordings insert). Applied locally
  and pushed to hosted; privileges checked on hosted. The sql-migration skill now requires explicit grants.

## 2026-11-12 (hosted Supabase)
- Linked `app/backend` to the hosted project `nerttltntbwhpvticuwe` and pushed all 41 migrations plus the seeds
  (`supabase db push --linked --include-seed`). Hosted counts match local (1426 words, 2839 sentences, 11 lessons).
- Frontend: `config.production.js` (hosted URL + publishable key, committed); the Netlify build copies it to
  `config.js` unless the env vars are set.
- CLAUDE.md, PLAN, NOTES and the sql-migration skill now say migrations are frozen once pushed.

## 2026-11-12 (S10r recording mode)
- Natives get a home screen (`#/`) with two tasks: record (`#/record`, new) and check sentences (`#/review`, as before).
- Recording mode (`js/record.js`): consent once with an optional credit (no name, first name or nickname); recording
  tips once per page load; one word or sentence at a time, lesson 1–11 content first (a sentence's words just before
  it), then pool words and sentences. "Is this natural?" comes before recording; if not, the native writes their own
  wording and records that. Words also ask "could this be a person's name?" (optional). Listen, redo, save or skip.
- `js/recorder.js`: raw takes (echo cancelling, noise suppression, auto gain off); `onChange`, `reset()`; the mic
  is released when the screen is left.
- Migration `20261113000000_s10r_recording_mode.sql`: `profiles.voice_consent_at`, `voice_credit`;
  `item_recordings` (append-only); RPCs `set_voice_consent`, `next_recording_item`, `save_recording` (needs consent,
  checks path, mime and that the file exists; replay-safe), `skip_recording_item` (idempotent); owner view
  `recording_feedback`. Test `app/backend/tests/s10r_recording_test.sql`; also run over HTTP against local Supabase
  (sign-up, consent, upload, save twice, next item). Code-reviewed; findings fixed.
- New Lao UI strings (unverified). The native app name is now ຊ່ວຍສອນພາສາລາວ "Help teach Lao".
- Browser untested; an iPhone can record only on the https (deployed) site.

## 2026-11-12 (word ເຕ້ຍ)
- Added ເຕ້ຍ W001427 "short (in height), low" at the owner's request (unverified, not on Wiktionary) with sentences S000002899 ລາວເຕ້ຍ, S000002900 ພໍ່ເຕ້ຍ. Not in a lesson; no DB change.

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

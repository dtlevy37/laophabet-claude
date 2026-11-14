# Notes

State, next step, what waits on the owner, decisions in force, code map. Keep it short: only open work. History
goes in `CHANGELOG.md` and git; slices in `docs/PLAN.md`; questions for people in `docs/QUESTIONS.md`.

## State (2026-11-13)
- **Content:** 1425 words, 2816 sentences. Pipeline clean (0 errors, the usual 11 warnings).
- **Lessons merged: 11.** L0001 ກິນ (gin, eat) · L0002 ເຂົ້າ (kao, rice) · L0003 ລາວ (lao, he/she) · L0004 ◌ຳ, ນ້ຳ
  (nam, water) · L0005 ແລ້ວ (laew, already) · L0006 ຂໍ ບໍ່ ແນ່ (khor/bor/nae: may I have, not, softener) · L0007
  ດີ ນີ້ (dee/nee: good, this) · L0008 ສະບາຍດີ (sabaidee, hello) · L0009 ຫິວ ເຈົ້າ (hiw/jao: hungry, you) · L0010
  ຂ້ອຍ ນອນ (khoy/non: I, sleep) + first conversation · L0011 colours, ຂາຍ (khaai, sell), ນ້ອຍ (noy, small).
  Path notes: 6 and 11 may split, 9 and 10 may swap (after the owner's play-test).
- **Hosted:** Supabase `nerttltntbwhpvticuwe` (Postgres 17); every migration is pushed, nothing pending. Netlify
  serves the frontend; `config.production.js` is copied to `config.js` by the build unless `SUPABASE_URL` /
  `SUPABASE_ANON_KEY` env vars are set. Local Docker DB is still Postgres 15 (`supabase/.temp/postgres-version`
  moved to `postgres-version.hosted` so local starts on 15); move it to 17 some time.
- **Audio:** the wife's 67 takes are live (A1). Recording mode `#/record` (S10r) is on the deployed site.
- **Not yet proven:** the unattended lesson runner `scripts/next_lesson.ps1` in the post-2026-11-11 setup.

## Next step
AL1 alpha readiness (PLAN): built and tested locally. Push `20261114000230_alpha_intake_feedback.sql` to hosted
**before** the frontend (the feedback page needs the RPC; the intake gate skips itself on a read error), then
the owner's sons sign up. Read their answers and notes in the dashboard (`learner_intake`, `app_feedback`).
Browser check: `scripts/browser/alpha_check.js`.

Then: A7 step 9 part B, inline sentence words with a popover (`docs/A7_PLAN.md` "Step 6 decided" item 3; the thumb zone
is built as 9a), then the desktop rail with the lesson preview, L3, A7 step 10, L4, L5. Owner browser checks
of L1c/L1d/L1b(a) and L1e are pending (list below).

## Waiting on the owner
**Browser tests** (deployed site; a private window shows the first-time hints). Delete a line when done.
1. Phone: `#/read/L0001` ກ card "Hear it in a word" ກິນ (gin, "eat").
2. Phone width: `#/try/L0010` fill-in-the-blank options never break a Lao word; Next on the right.
3. Dark mode: dark text on the blue button; locked lessons dashed; progress bar visible; focus ring when tabbing.
4. Play-test lessons 5–11 (`#/try/L0005` … `#/try/L0011`), including S7h (untaught real words as wrong options).
5. Letter writing `#/write` (S7w): owner said "still feels weird"; waiting for their notes. Phone untested.
6. L1c/L1d (deployed, `#/try/L0002`, `#/try/L0009`, `#/try/L0007`): slot board, slips stay green, Check early,
   Your answer / Right answer, "Also right!" on ສະບາຍດີບໍ່?, rule cards R03/R04, ຫິວ culture note, vowel card line.
   Decide: fold R03 into the ເ◌ົາ card?
   Missed-ເຂົ້າ note: on `#/try/L0009` build ລາວຫິວເຂົ້າ as ລາວ ຫິວ, Check: "“Hungry” is usually ຫິວເຂົ້າ (hiw kao), with ເຂົ້າ".
7. L1e (`#/try/L0008`): in the closing block every new word is built; ສະບາຍດີ (sabaidee, hello) first gets
   "Find the missing piece of the word" (one tap decides), later the full build. Closing blocks are now longer
   (lesson 6: 10 closing questions): every new unit keeps its sound → letter.
8. S10r: bigger record button and the "common name or nickname" prompt (built, untested).
9. A7 step 1: Settings (top bar) opens `#/settings` as a page; "Light or dark" System / Light / Dark switches at
   once and is kept after a reload; ← Back returns. `#/read/L0001/1` (or a new lesson 1): the intro card has the
   sound-spelling choice with ກ and "Sounds like" (k ↔ g as you pick); the ກ card has no radios.
10. A7 step 2 (phone and desktop): the header is one line, "Laophabet" and Settings; email and Sign out are at the
   end of Settings (Account). In a lesson (`#/lesson/…`, `#/try/…`) there is no header: ✕ top left (Leave dialog),
   progress bar, "1 / 34" counter; Esc still asks to leave. Natives' recording header is unchanged (untested).
11. A7 step 3 home (phone): a Continue card (next lesson, or "Lesson n · in progress" with Continue after leaving
   a lesson part-way today). The path itself moved to `#/lessons` in step 8 (item 15); the old "Letters / Words"
   lines under done lessons are gone.
12. A7 step 4: finish `#/lesson/L0001`: the summary says "Lao words read (with repeats)" and has Back home and
   Next lesson (blue, right); Next lesson opens lesson 2, and so does Enter (it has the focus). Home's Continue
   card picks the lesson left most recently, a lesson not done before a done one played again.
13. A7 step 5 (`#/try/L0002`, phone and desktop, light and dark): no ⚑ on any card; ▶ is blue. On the ເຂົ້າ (khao,
   "rice") card open More: "Voice: Na" and "⚑ Report a problem with this recording" at the end. After an answer tap
   ⓘ: the sheet shows the same at its end; Report opens "What is wrong with this recording?", Send says "Thank you".
   Space plays. The first 3 build-the-word questions with a ◌ tile say "◌ is not a piece…" (a private window).
14. A7 step 7 (phone and desktop, light and dark): the app is Lao blue with a red brand dot by "Laophabet"; no
   bright browser-blue links. Settings → Colours: Lao blue and red / Indigo and saffron / Teal and gold switch at
   once, are kept after a reload with no flash of the wrong colours, and work with System / Light / Dark. Answers stay
   green ✓ / red ✗ in every colour theme. `#/read/L0007/14` (ດາວ, daao, "star"): a solid "★ Bonus word" badge that
   pops in; `#/read/L0002/5` (ເຂົ້າ, khao, "rice"): a solid "✦ Culture" badge. With
   "reduce motion" on in the device, the badges just appear.
15. A7 step 8 (phone and desktop, light and dark): home `#/` is the Continue card, then 6 tiles (2 columns on a
   phone, 3 on desktop): Lessons ("n of 11 done") and Write are live; Review, Letters and sounds, My words and Notes
   are greyed with "Soon", do nothing on tap and are skipped by Tab. Lessons opens `#/lessons`: the path (done ✓ +
   Review, the lesson to play now outlined, the next 2 locked, the rest folded); ← Back returns home. Leave a lesson
   part-way: home says "Lesson n · in progress" / Continue, and that lesson is outlined on `#/lessons`. Decide: tile
   order and wording.
16. A7 step 9a thumb zone (phone 375×667 and 375×812, and desktop): on a question (`#/try/L0009`) the four answer
   boxes sit in the middle of the space under the prompt and are taller; after an answer the feedback appears under
   them and they stay put unless it does not fit; Continue stays bottom right. Phone: no "Keys: …" line and no small
   numbers on the options; desktop with a mouse: both still shown.

Owner decisions and answers are listed in `docs/QUESTIONS.md` "For the owner".

## Decisions in force
- One curriculum lesson = one app lesson; the planner (`js/session.js`) builds the screens. Card, check, next card;
  a closing mixed block (every new word built there, L1e; long words get find the missing piece first); missed questions replayed until right once. Completed = reached the end, no pass mark;
  summary accuracy counts first tries. A check after a card is recognition (level 2). Repetition is intended.
- A done lesson links to "Review lesson material": read-only cards. Resume is same-device only. No offline.
- Fill in the blank offers exactly one logical choice (DESIGN). A new sentence is also blanked in its own lesson.
  Untaught wrong options (S7h) are real words only, never a tone-mark or vowel-length twin of a word on screen.
  Any newly tagged word becomes an untaught option everywhere: tag only words safe as wrong options.
- Words that are also personal names are kept out of subject/person slots: ນ້ຳ Nam, ແກ້ວ Kaew, ດາວ Dao, ນ້ອຍ Noy,
  ດຳ Dam, ຂາວ Khao.
- Lesson budget is a guideline (LESSON_RULES decision 26). One row per spelling and meaning; sentences pick a
  meaning with `word_overrides`. W000020 ແລ້ວ shows all three senses on its card (no per-lesson gloss override).
- Still wanted, not placed: ແມ່ນ (maen, yes/to be) W000004, ໄປ (bpai, go), ເຂົາ (kao, they) / ເກົ້າ (gao, nine)
  once ເຂົ້າ is solid (decision 15).
- Recording: words and sentences only, one take, words deliberate, sentences natural but a little slow; never build a
  sentence from word clips. "Is this natural?" before recording; a native's own wording (`spoken_lao`) needs owner
  review. Explicit consent, optional credit. Conversations: every speaker records both sides; one voice until a
  second native records.
- Letter writing: separate area, static stroke file, nothing in the DB yet; the whole-letter judge passes only when
  the wanted letter is the best match. Tuning knobs: `TUNING` in `js/writing/score.js`; test
  `node scripts/strokes_test.js`.
- Owner wants subagents used where it makes sense, and more subagent review before big UI changes.

## Code map (frontend)
- `js/session.js`: `planLesson`, `buildPlan(bundle, levels, seed, missed)` (resume), `dryLevels` (`#/try/`),
  `advance`/`again(spec)`, keyboard. End screens (summary, dry-run end, failures) in `js/summary.js`. Selector
  contract (classes keys and A3 tap counts rely on): activity-module skill. Keyboard dry run:
  `scripts/browser/a7_keys.js`; thumb zone (options centred, step fits, key hints): `scripts/browser/a7_thumb.js`. Test: `node scripts/session_test.mjs` (bundles in `tmp/bundles/`;
  re-dump them after any lesson merge).
- `js/activities/`: `multiple_choice.js` (null when it cannot fill 3 options), `build_sentence.js`, `fill_blank.js`,
  `build_word.js` (pieces from `units`; `spec.missing` = find the missing piece, recognition, detail `mode: 'missing'`), `listen_pick.js`, `teach_card.js` (`cardItems`, `unitSound`, `openInfo`).
- `js/grammar.js` word-order rule notes (test `scripts/grammar_test.mjs`). `js/audio.js` player, report dialog.
  `js/unit_word.js` "Hear it in a word". `js/howto.js` first-time how-tos. `js/bundle.js` `get_lesson` cache.
- `js/home.js` home (#/): Continue card and the section tiles (live: Lessons, Write; the rest greyed "Soon").
  `js/lessons.js` `#/lessons`: the compact path, `nextLesson()` (`session.js` `resumableLesson`; shared with home).
  Browser check of both: `scripts/browser/a7_shots.js`.
- `js/learn.js` reader, `#/settings` route (Back = history.back when opened from the app).
  Theme: `settings.js` `theme` sets `html[data-theme]`; `styles.css` has the dark tokens twice (device dark unless
  `light`, and `[data-theme='dark']`): change both. Browser check: `scripts/browser/a7_shots.js`. `js/write.js`, `js/writing/pad.js`, `js/writing/score.js`; strokes from
  `node scripts/strokes_build.js --png` (overrides `scripts/strokes_overrides.json`).
- `js/activities/compare.js` Your answer / Right answer alignment (build word and sentence). Alternates (L1c d):
  `sentence_json.alternates` = another live sentence with the same English minus pronouns only (`drops_only`).
  Word-pair notes (`PAIR_NOTES`: ຫິວ needs ເຂົ້າ after it) show under the compare rows.
  build_word detail keys: `taps`, `early`, `pieces[].found`; A3 stats must not count `found: false` as clean.
- Known gap: pool words in `get_lesson` lack `units` and usage notes.

## Recipes and gotchas
- Lessons: `build-lesson` skill. `db_sql.py` options go before the mode (`--name x change <ids>`). A sentences-only
  `merge_words.py` needs a header-only words file. Change a merged lesson in place: edit `data/lesson_items.csv` /
  `lessons.csv` and `curriculum/lessons/merged/<id>/`, `lesson_tool.py check --merged`, `pipeline.sh`,
  `db_sql.py --name <id>_rebuild lesson <id>`. Lessons can no longer be withdrawn (hosted).
- Editing CSVs: a `replace_all` that removed text at line ends also removed the line breaks. Rewrite small CSVs whole.
- New native takes: `python scripts/audio_publish.py fetch`, `process`, `upload --linked`, `migration`, then
  `supabase db push --linked`. Check the level of the first ~5 takes before a long session.
- Local SQL: `docker exec -i <supabase_db container> psql -U postgres` (no `psql` on PATH).
- Tools (git-ignored): ffmpeg `tmp/tools/ffmpeg-*/bin`, Playwright `tmp/tools/pw`, formants
  `tmp/tools/phon/Scripts/python tmp/audio/formants.py`. Local test learner: `bash scripts/local_test_user.sh`
  (a1smoke@test.local / smoke-test-pass-1); browser drivers in `scripts/browser/`.

## Owner preferences
- Use the owner's own spellings where given (leo, khoy, mee, muk, jak, sabaidee).
- Keep gate checks short: a handful of queries that confirm the Done-when line. Do not over-deliberate word choice.

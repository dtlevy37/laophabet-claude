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
Owner browser check of L1c/L1d/L1b(a) (all pushed 2026-11-13). Then L1e, A7 steps 0–5, L3, A7 steps 6–10, L4, L5.

## Waiting on the owner
**Browser tests** (deployed site; a private window shows the first-time hints). Delete a line when done.
1. Phone: `#/read/L0001` ກ card "Hear it in a word" ກິນ (gin, "eat").
2. Phone width: `#/try/L0010` fill-in-the-blank options never break a Lao word; Next on the right.
3. Dark mode (OS setting until A7 step 1): dark text on the blue button; locked lessons dashed; progress bar
   visible; focus ring when tabbing.
4. Play-test lessons 5–11 (`#/try/L0005` … `#/try/L0011`), including S7h (untaught real words as wrong options).
5. Letter writing `#/write` (S7w): owner said "still feels weird"; waiting for their notes. Phone untested.
6. L1c/L1d (deployed, `#/try/L0002`, `#/try/L0009`, `#/try/L0007`): slot board, slips stay green, Check early,
   Your answer / Right answer, "Also right!" on ສະບາຍດີບໍ່?, rule cards R03/R04, ຫິວ culture note, vowel card line.
   Decide: fold R03 into the ເ◌ົາ card?
   Missed-ເຂົ້າ note: on `#/try/L0009` build ລາວຫິວເຂົ້າ as ລາວ ຫິວ, Check: "“Hungry” needs ເຂົ້າ after it: ຫິວເຂົ້າ".
7. S10r: bigger record button and the "common name or nickname" prompt (built, untested).

Owner decisions and answers are listed in `docs/QUESTIONS.md` "For the owner".

## Decisions in force
- One curriculum lesson = one app lesson; the planner (`js/session.js`) builds the screens. Card, check, next card;
  a closing mixed block; missed questions replayed until right once. Completed = reached the end, no pass mark;
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
  `advance`/`again(spec)`, summary and keyboard. Test: `node scripts/session_test.mjs` (bundles in `tmp/bundles/`;
  re-dump them after any lesson merge).
- `js/activities/`: `multiple_choice.js` (null when it cannot fill 3 options), `build_sentence.js`, `fill_blank.js`,
  `build_word.js` (pieces from `units`), `listen_pick.js`, `teach_card.js` (`cardItems`, `unitSound`, `openInfo`).
- `js/grammar.js` word-order rule notes (test `scripts/grammar_test.mjs`). `js/audio.js` player, report dialog.
  `js/unit_word.js` "Hear it in a word". `js/howto.js` first-time how-tos. `js/bundle.js` `get_lesson` cache.
- `js/learn.js` lesson list and reader. `js/write.js`, `js/writing/pad.js`, `js/writing/score.js`; strokes from
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

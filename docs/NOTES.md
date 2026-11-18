# Notes

State, next step, what waits on the owner, decisions in force, code map. Open work only: a finished item leaves this
file in the same commit that finishes it (record in `CHANGELOG.md`; slices in `docs/PLAN.md`; questions for people in
`docs/QUESTIONS.md`).

## State (2026-11-15)
- **Content:** 1427 words, 2848 sentences, 12 lessons merged (next: 13, ອ). Pipeline clean (0 errors, the usual 11
  warnings). Path notes: lessons 6 and 11 may split, 9 and 10 may swap (after the owner's play-test).
- **Hosted:** Supabase `nerttltntbwhpvticuwe` (Postgres 17); what is applied is `supabase migration list --linked`.
  Netlify serves the frontend;
  `config.production.js` is copied to `config.js` by the build unless `SUPABASE_URL` / `SUPABASE_ANON_KEY` env vars
  are set. Local Docker DB is still Postgres 15 (`supabase/.temp/postgres-version` moved to
  `postgres-version.hosted`); move it to 17 some time.
- **Audio:** the wife's takes are live (count: `item_audio` rows). Recording mode `#/record` is on the deployed site.
- **Not yet proven:** the unattended lesson runner `scripts/next_lesson.ps1` in the post-2026-11-11 setup.

## Next step
1. Owner tests the list below on Netlify; the owner's sons sign up for the alpha (read `learner_intake`,
   `app_feedback` in the dashboard; browser check `scripts/browser/alpha_check.js`).
2. The wife (Na, verified native) answers Q0017–Q0034 online; apply them and clear QUESTIONS. Any new native
   question follows "How to ask the native speaker" (QUESTIONS.md top); online ones go through
   `data/open_questions.csv` + `scripts/questions_tool.py`. Natives' browser steps: sign in as a native; `#/` shows the native home (N3); `#/questions`, `#/suggest`, `#/confirm`
   (second native); a learner opening them gets home. Driver `scripts/browser/n1n2_check.js` (local accounts n1a/n1b/n1l@test.local,
   password smoke-test-pass-1).
3. Then lesson 13 (ອ) and the PLAN order (A7 rest, A10, L3). Owner path notes (lesson 20+) come later.
- Open: `register` is set only where a native tagged it (N3 style row); question text is English (+ Lao only if `label_lao`); the Lao UI
  strings are unreviewed; N2 voice upload is untested.
- **Font size on mobile** (owner 2026-11-14): fonts may be a few points too large once sentences get longer. Idea:
  shrink slightly (`.bs-tile .lao` 2rem, `.mc-option .lao` 2.2rem, `.bs-answer` 2rem, `.glyph`, `.lao` 2rem base).
  Decide with several tester agents (screenshots at phone widths with the longest sentences). Do not change until then.

## Waiting on the owner
Browser tests on the deployed site (a private window shows the first-time hints). **Delete a line when done.**
- Owner feedback round 2026-11-14: build-a-sentence says "Build the sentence in Lao"; the Leave dialog has "Start over"
  and "Leave and discard progress"; build-a-word "= word" does not overlap the green line on short phones;
  `#/letters` greys unreached tiles; the speaker is an SVG in a tinted button.
- Native onboarding (`#/` as a new native, or a profile with no `onboarded_at`): "Your age" shows six ranges, no date
  field; its Lao (`age_*`, `profile_age`) is unverified until the wife has seen it (`docs/LAO_UI_REVIEW.md`).
- A11: a final consonant shows as the bare letter (no ◌). Open lesson 1 (ກິນ): the ກ + ◌ິ + ນ pieces line and the
  build-the-word tiles show plain ນ; `#/letters` final ນ card heading too; a vowel tile still shows ◌ິ.
- Phone (S10+): Next / Submit visible above the bottom toolbar, in lessons and forms.
- `#/read/L0001` ກ card "Hear it in a word" ກິນ (gin, "eat").
- `#/try/L0010` fill-in-the-blank options never break a Lao word; Next on the right.
- Dark mode: dark text on the blue button; locked lessons dashed; progress bar visible; focus ring when tabbing.
- Play-test lessons 5–12 (`#/try/L0005` … `#/try/L0012`), including S7h (untaught real words as wrong options).
- L1c/L1d (`#/try/L0002`, `L0009`, `L0007`): slot board, slips stay green, Check early, Your answer / Right answer,
  "Also right!" on ສະບາຍດີບໍ່?, rule cards R03/R04, ຫິວ culture note, vowel card line. Decide: fold R03 into the ເ◌ົາ
  card? Missed-ເຂົ້າ note: on `#/try/L0009` build ລາວຫິວເຂົ້າ as ລາວ ຫິວ, Check: "“Hungry” is usually ຫິວເຂົ້າ".
- L1e (`#/try/L0008`): every new word is built in the closing block; ສະບາຍດີ first gets "Find the missing piece".
- Settings (`#/settings`): Light or dark and Colours (Lao blue and red / Indigo and saffron / Teal and gold) switch at
  once, persist after reload with no flash, answers stay green/red in every theme. The intro card of a new lesson 1 has
  the sound-spelling choice. Natives' recording header is unchanged.
- Lesson chrome: no header in a lesson; ✕ top left (Leave dialog), progress bar, "1 / 34"; Esc asks to leave.
- Summary (`#/lesson/L0001`): "Lao words read (with repeats)", Back home, Next lesson (blue, right; Enter too).
- Audio (`#/try/L0002`): on the ເຂົ້າ card More has "Voice: Na" and "⚑ Report a problem" (opens the U2 dialog with
  "audio" chosen); ⓘ sheet has the same; Space plays. First 3 build-the-word questions with a ◌ tile say "◌ is not
  a piece…" (private window).
- Badges: `#/read/L0007/14` (ດາວ) solid "★ Bonus word"; `#/read/L0002/5` (ເຂົ້າ) "✦ Culture"; with reduce motion on,
  they just appear.
- Home `#/`: Continue card and 6 tiles (Lessons, Write, Review, Letters and sounds, My words live; Notes greyed
  "Soon", not focusable). `#/lessons`: the path, the lesson to play now outlined, the next 2 locked, the rest folded.
  Leaving a lesson part-way: home says "Lesson n · in progress". Decide: tile order and wording.
- Thumb zone (phone 375×667 and 375×812, desktop): answer boxes centred under the prompt, taller; feedback under them;
  Continue bottom right. Phone: no "Keys: …" line and no small numbers; desktop with a mouse: both shown.
- A8 `#/letters`: Consonants / Vowels / Tone marks; ນ is one tile for both roles; its page lists start and end sounds,
  examples (tap → My words), "Practice writing". New learner: empty state.
- A9 `#/words`: search (Lao, respelling, English), All / Needs work / Newest; a word's page: card, ▶, notes, "Right x
  of n first tries", example sentences. Decide: "Needs work" = under 70% first tries.
- S8b Review (`#/practice`): no teach cards, mixed questions, ✕ → "End the review?" ends on the summary; Review again /
  Back home; lessons never marked done by a review.
- H1–H6, A12a, show password, review time, About, native pause (migrations through `20261114170000`): hint ladder,
  effort budget, spelling opt-in, checkpoint `#/checkpoint/S01`, sign-in password toggle, `#/about`.
- Choose-then-Check setting (`confirm`) and the lesson 12 screens.
- Natives: `#/confirm` plays a suggestion's audio; `#/record` serves items nobody has recorded first.
- N3 one recording flow (as a native, phone): `#/` welcome line once, Record "Start here", Message the team, learner
  view link at the bottom; `#/record`: English under the Lao; Record -> style row (tap again unselects) -> Save and
  next; Save + more details; "I'd say it differently" (box starts with the text); "not sure what it means"; Skip.
  `#/review` opens Record. Driver `scripts/browser/n3_record.js`.
- U1 ⚙ (top bar and lesson header): Settings opens as a sheet; in `#/try/L0005` mid-question switch the romanization,
  Close: same question, same counter, new style; Esc closes the sheet, not the lesson. "Account, feedback and all
  settings" link opens `#/settings` (the top-bar Settings link is gone). Decide: ⚙ or ☰ (later UI review).
- U2 ⚑ (top bar and lesson header): pick what is wrong, note optional, Send → "Thank you"; on `#/try/L0010` after a
  fill-in-the-blank, the `app_feedback.context` column holds lesson, step, item, options and your answer. Phone width.
- A7 inline words (`#/try/L0007`, a sentence card): Lao words underlined; tap → bubble under the sentence (meaning,
  sound, ⓘ); another word moves it; tap elsewhere or Esc closes it. Build-the-sentence: no tappable words until Check.
  Home strip: day streak, letters known, words known. A lesson summary lists "Missed on the first try".
- S7g conversations (`#/try/L0010`, after ຂ້ອຍກິນເຂົ້າແລ້ວ): one card "Conversation: Are you hungry?" with 7 turns, A left
  and B right, Lao and ▶ only, Reveal shows a turn's sound and English (Settings: "Show sound and English in
  conversations right away" shows them all); then "Complete the conversation" blanks on its lines with the turns
  before shown above. Same in `#/try/L0008` (Hello). `#/read/L0010` shows the card. Play `#/lesson/L0010` for real
  once: the summary must save (no "could not save"). Driver `scripts/browser/s7g_dialogue.js`.
- H7 (`#/try/L0002`): "What does this word mean?" (ເຂົ້າ khao, rice) plays once with a ▶ under the word; with "Play
  Lao aloud automatically" off it stays silent until ▶.


## Decisions in force
- One curriculum lesson = one app lesson; the planner (`js/session.js`) builds the screens. Card, check, next card;
  a closing mixed block (every new word built there; long words get find the missing piece first); missed questions
  replayed until right once. Completed = reached the end, no pass mark; summary accuracy counts first tries. A check
  after a card is recognition (level 2). Repetition is intended.
- Lesson feel (owner 2026-11-14): hints are chosen by the learner and count for less (never a miss); no hard gate on
  checkpoints; spelling is opt-in; listening is never optional; level 3 = recalled (everyone), top = spelled from
  recall (opt-in only, a badge, not in "known"). One transliteration (the stored "respelling", shown in the learner's
  style), so one hint tier for it.
- `confirm` setting (device): pick-one questions select then Check (`activities/choice.js`). Any activity where each tap
  is the answer (match the tiles) ignores it and has no Check, ever (owner 2026-11-14).
- Activity mix (owner 2026-11-17): lessons keep their current share of build-the-word / build-the-sentence.
- A sentence a verified native recorded as natural is `verified` (SCHEMA, sentences.csv).
- A done lesson links to "Review lesson material": read-only cards. Resume is same-device only. No offline.
- Fill in the blank offers exactly one logical choice (DESIGN). A new sentence is also blanked in its own lesson.
  Untaught wrong options (S7h) are real words only, never a tone-mark or vowel-length twin of a word on screen.
  Any newly tagged word becomes an untaught option everywhere: tag only words safe as wrong options.
- Words that are also personal names are kept out of subject/person slots: ນ້ຳ Nam, ແກ້ວ Kaew, ດາວ Dao, ນ້ອຍ Noy,
  ດຳ Dam, ຂາວ Khao.
- Lesson budget is a guideline (LESSON_RULES decision 26). One row per spelling and meaning; sentences pick a
  meaning with `word_overrides`. W000020 ແລ້ວ shows all three senses on its card.
- Still wanted, not placed: ໄປ (bpai, go), ເຂົາ (kao, they) / ເກົ້າ (gao, nine) once ເຂົ້າ is solid (decision 15).
- Recording: words and sentences only, one take, words deliberate, sentences natural but a little slow; never build a
  sentence from word clips. Recording the text = natural; "I'd say it differently" records the native's own wording
  (`spoken_lao`, needs owner review). Flow and questions: DESIGN "Native recording flow". Explicit consent, optional credit. Conversations: every speaker records both sides; one voice until a
  second native records.
- Letter writing: separate area, static stroke file, nothing in the DB yet; the whole-letter judge passes only when
  the wanted letter is the best match. Tuning knobs: `TUNING` in `js/writing/score.js`; test
  `node scripts/strokes_test.js`.
- Owner wants subagents used where it makes sense, and more subagent review before big UI changes.

## Code map (frontend)
- `js/session.js`: `planLesson`, `buildPlan(bundle, levels, seed, missed)` (resume), `dryLevels` (`#/try/`),
  `advance`/`again(spec)`, keyboard. End screens (summary, dry-run end, failures) in `js/summary.js`. Selector
  contract (classes keys and A3 tap counts rely on): activity-module skill. Keyboard dry run:
  `scripts/browser/a7_keys.js`; thumb zone: `scripts/browser/a7_thumb.js`. Test: `node scripts/session_test.mjs`
  (bundles in `tmp/bundles/`; re-dump them after any lesson merge).
- `js/activities/`: `multiple_choice.js` (null when it cannot fill 3 options), `build_sentence.js`, `fill_blank.js`,
  `build_word.js` (pieces from `units`; `spec.missing` = find the missing piece, recognition, detail `mode: 'missing'`),
  `listen_pick.js`, `teach_card.js` (`cardItems`, `unitSound`, `openInfo`), `compare.js` (Your answer / Right answer
  alignment; alternates: `sentence_json.alternates` = another live sentence with the same English minus pronouns only;
  `PAIR_NOTES` word-pair notes), `choice.js`. build_word detail keys: `taps`, `early`, `pieces[].found`; A3 stats must
  not count `found: false` as clean.
- `js/chrome.js` ⚑ ⚙ buttons and the settings sheet (`openSettingsSheet(onClose)`, redraws on close); `js/report.js`
  the report dialog (`send_feedback` with `p_context`); the lesson's context is built in `session.js` from the stage
  (reads `.mc-option`, `.bs-line .bs-tile`, `.feedback-head`: renaming them drops the answer from reports).
  Sentence words: `teach_card.js` `inlineSentence()` (`.word-btn`, `.word-bubble`; countTaps counts `.word-btn`).
  Drivers: `scripts/browser/u1u2_check.js`, `a7_inline.js`, `h7_check.js` (frontend on :5500).
- Conversations (S7g): `session.js` `dialogueBlanks` + the dialogue branch of `planLesson`; `teach_card.js`
  `dialogueBody` / `dialogueLine`; `fill_blank.js` `spec.dialogue`. Data `data/dialogues.csv`, `dialogue_lines.csv`.
- `js/grammar.js` word-order rule notes (test `scripts/grammar_test.mjs`). `js/audio.js` player, report dialog.
  `js/unit_word.js` "Hear it in a word". `js/howto.js` first-time how-tos. `js/bundle.js` `get_lesson` cache.
- `js/home.js` home (#/): Continue card and the section tiles. `js/lessons.js` `#/lessons`: the compact path,
  `nextLesson()` (`session.js` `resumableLesson`; shared with home). Browser check: `scripts/browser/a7_shots.js`.
- `js/letters.js` (`learner_units`), `js/words.js` (`learner_words`, `learner_word`), home strip one `learner_stats`
  call (wraps `learner_counts`); summary missed list from `session_summary.missed`; `js/practice.js` + `planPractice` / practice runner branch in `session.js` (`start_practice`,
  `complete_practice`). SQL tests `app/backend/tests/a8_*.sql`, `a9_*.sql`, `s8b_*.sql` (rolled back; run with docker
  exec psql). Browser: `scripts/browser/s8b_practice.js`.
- `js/learn.js` reader, `#/settings` route (Back = history.back when opened from the app). Theme: `settings.js` `theme`
  sets `html[data-theme]`; `styles.css` has the dark tokens twice (device dark unless `light`, and
  `[data-theme='dark']`): change both. `js/write.js`, `js/writing/pad.js`, `js/writing/score.js`; strokes from
  `node scripts/strokes_build.js --png` (overrides `scripts/strokes_overrides.json`).
- Pool words in `get_lesson` are slim (no `units`, no usage note). That is fine: every word a lesson's sentences use
  is also a word item of that lesson (new, recycle or bonus) with full detail, and sentence chips read that.

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

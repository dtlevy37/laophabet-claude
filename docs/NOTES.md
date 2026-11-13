# Notes

Notepad for the next session: state, open work, decisions in force, next step. Remove what is finished (history is
in `CHANGELOG.md` and git). Slices: `docs/PLAN.md`.

## State (2026-11-12)
- **Harness refactored 2026-11-11:** guardrails reduced to a usage guard, folders renamed (`scripts/`, `docs/`,
  `curriculum/`), word-list and research work parked in `_shelf/`. **Not yet proven in the new setup:** the agent
  running the local Supabase itself (`supabase status` / `migration up` from `app/backend`, SQL through
  `docker exec -i <supabase_db container> psql -U postgres`; there is no `psql` on PATH) and the lesson runner
  (`scripts/next_lesson.ps1`). First use of each should be treated as a test.
- **Content pool:** 1425 words, 2816 sentences, 30 templates. Pipeline clean (0 errors, the usual 11 warnings).
- **Lessons merged: 11** (5–11 built 2026-11-12 by subagents, each curriculum-reviewed; entries below). Earlier: L0001 ກິນ (gin, eat) · L0002 ເຂົ້າ (kao, rice) · L0003 ລາວ (lao, he/she) · L0004 ◌ຳ, ນ້ຳ
  (nam, water), bonus ຂາ (kaa, leg) and ຂາວ (kaao, white). L0004 was rebuilt in place 2026-11-12
  (`20261112195124_lesson_l0004.sql`, then `20261112204059_lesson_l0004.sql` adding ຂາວ as bonus at the owner's
  request); ຂາວ becomes core in lesson 11; ລາວຂາວ is out of every lesson.
- **L0005 "Already"** merged 2026-11-12 (`20261112205459_lesson_l0005.sql`, applied locally): new V15 ແ◌; core ແລ້ວ
  (laew, already; W000020, tagged `function`: never an option, blankable since S7h); bonus ແກ້ວ (gaew, glass; W000218). Recycles
  ກິນ, ລາວ, ເຂົ້າ, ນ້ຳ and S000002872. Sentences: S000000024 ກິນແລ້ວ (existing), S000002877 and S000002878 (composed, unverified).
  No budget warnings, no flags. W000020's gloss is still "already, done; then" (lessons have no gloss override): the card
  shows all three senses. Native-speaker points in QUESTIONS.
- **L0006 "Not, questions, asking for something"** merged 2026-11-12 (`20261112210242_lesson_l0006.sql`, applied locally;
  `--max-units 3`): new V21 ◌ໍ, C14 ບ, T1 ◌່; core ຂໍ (khor, may I have; W000009), ບໍ່ (bor, not/question; W000003),
  ແນ່ (nae, softener; W001426, newly drafted, unverified); bonus ບ້ານ (baan, home; W000049). Recycles ລາວ, ກິນ, ເຂົ້າ,
  ແລ້ວ, ນ້ຳ and S000000024. Sentences: S000002879 ລາວບໍ່ກິນເຂົ້າ, S000002880 ຂໍນ້ຳແນ່, S000002881 ຂໍເຂົ້າແນ່ (composed),
  S000000023 ກິນເຂົ້າແລ້ວບໍ່? (existing). Budget warning: weight 7.5 (guideline 5.5); the path allows splitting the
  ຂໍ … ແນ່ half into its own lesson 7 if it plays long. Blanks that were short of safe distractors are topped up with untaught real words since S7h.
  Native-speaker points in QUESTIONS.
- **L0007 "Good, this"** merged 2026-11-12 (`20261112212459_lesson_l0007.sql`, not applied; no flags): new C09 ດ (initial)
  and V05 ◌ີ; core ດີ (dee, good; W000002), ນີ້ (nee, this; W000016); bonus ດາວ (dao, star; W000546), ດິນ (din, soil;
  W000550). Recycles ແລ້ວ, ບໍ່, ນ້ຳ, ຂໍ, ແນ່. Sentences: S000002882 ດີແລ້ວ, S000002883 ນ້ຳນີ້ດີ, S000002884 ຂໍນ້ຳນີ້ແນ່
  (composed, unverified), S000000004 ບໍ່ດີ (existing). No budget warnings. ດາວ excluded as a name (Dao) in person slots;
  four blanks have no safe option and are skipped. Native-speaker points in QUESTIONS.
- **L0008 "Hello"** merged 2026-11-12 (`20261112213147_lesson_l0008.sql`, not applied; `--max-units 3 --max-weight 7.5`,
  weight 7.5 over the 5.5 guideline): new C06 ສ, V01 ◌ະ, C08f ◌ຍ and rule R01 (first cut-off card, drafted here); core
  ສະບາຍ (sabai; W000512), ສະບາຍດີ (sabaidee; W000001); bonus ຂາຍ (khaai, sell; W000084). Recycles ດີ, ບໍ່, ລາວ (W000031).
  First mini-conversation as ordinary sentences (S7g): S000000001 ສະບາຍດີ (lines 1–2), S000000003 ສະບາຍດີບໍ່? (English
  now "How are you?"), S000002885 ສະບາຍດີ. "I'm well" (composed, unverified). The lesson row's notes still list W000058
  as a recycle (replaced by W000031 in review; items are right); harmless.
- **L0009 "Hungry, you"** merged 2026-11-12 (`20261112214113_lesson_l0009.sql`, not applied; no flags, no budget
  warnings): new C25 ຫ (initial h only; the silent ຫ before ນ ມ ລ is later) and C05 ຈ; core ຫິວ (hiu, hungry; W000072),
  ເຈົ້າ (jao, you; W000005, tagged person|function so it is never a wrong option); bonus ຫ້າ (haa, five; W000082), ຈານ
  (jaan, plate; W000629). Recycles ລາວ, ເຂົ້າ, ບໍ່, ນ້ຳ, ສະບາຍດີ. Sentences: S000002886 ລາວຫິວເຂົ້າ, S000002887
  ເຈົ້າຫິວເຂົ້າບໍ່? + S000002888 ບໍ່ຫິວ., S000001170 ເຈົ້າຫິວນ້ຳບໍ່? (existing, resegmented ຫິວ + ນ້ຳ; W000621 ຫິວນ້ຳ
  not taught, its tag removed) + S000002889 ຫິວນ້ຳ. "Yes, I'm thirsty" (composed), S000000007 ເຈົ້າສະບາຍດີບໍ່? (existing).
  Lessons 9 and 10 may swap (path note). (Slot edits carried by later merges; DB matches the CSV.)
- **L0010 "I, and the conversation"** merged 2026-11-12 (`20261112214853_lesson_l0010.sql`, not applied; no flags, no
  budget warnings): new V22 ◌ອ◌; core ຂ້ອຍ (khoy, I; W000006), ນອນ (non, sleep; W000033); bonus ນ້ອຍ (noy, small;
  W000090). Recycles ຫິວ, ເຂົ້າ, ກິນ, ແລ້ວ, ສະບາຍດີ, ລາວ, ເຈົ້າ, ບໍ່. Sentences: S000000113 ຂ້ອຍຫິວເຂົ້າ, S000000008
  ຂ້ອຍສະບາຍດີ (existing), S000002891 ລາວນອນແລ້ວ "He's asleep already" (composed), then the target conversation
  contiguous (S7g): S000000001 (lines 1–2), S000002887 (line 3, repeated as 4b, listed once), S000002892 ຫິວ. (4a,
  composed), S000002888 (5a), S000002890 ຂ້ອຍກິນເຂົ້າແລ້ວ (5b, composed). Lessons 9 and 10 may swap (path note).
- **L0011 "Colours, selling, small"** merged 2026-11-12 (`20261112215850_lesson_l0011.sql`, not applied; flags
  `--max-words 5 --no-new-letters`; budget warnings: 6 new words, weight 6): no new units; core ສີ (sii, colour;
  W000536), ຂາວ (khao, white; W000538), ດຳ (dam, black; W000539), ຂາຍ (khaai, sell; W000084), ແກ້ວ (kaew, glass;
  W000218, made core for the path sentence), ນ້ອຍ (noy, small; W000090). Recycles ນີ້, ດີ, ລາວ, ເຂົ້າ, ຂໍ, ແນ່. Sentences,
  all composed (unverified): S000002893 ສີນີ້ຂາວ, S000002894 ສີນີ້ດຳ, S000002895 ສີນີ້ດີ, S000002896 ລາວຂາຍເຂົ້າ,
  S000002897 ຂໍແກ້ວນ້ອຍແນ່, S000002898 ແກ້ວນີ້ນ້ອຍ. Kept as one lesson (decision 26) with a colour block and a sell/small
  block; the owner may split it there after play-testing. New `lesson_tool.py --no-new-letters` flag (check/merge):
  a lesson with no new units or rules; its new words need not use something new. ສີ tagged object|action (ສີເຂົ້າ mill
  rice), ດຳ quality|action (ດຳນ້ຳ dive), so neither is a wrong option in a verb gap; ສີ pron_tip no longer compares
  ສີ່ four.
- **Backend hosted 2026-11-12:** Supabase project `nerttltntbwhpvticuwe` (Laophabet-v2, Postgres 17), linked from
  `app/backend`. All migrations through `20261113000000` plus the seeds were pushed by the agent (`supabase db push
  --linked --include-seed`); counts match local. Applied migrations are now frozen: write new ones. The local
  Docker DB is still Postgres 15 (`config.toml` major_version 15); move it to 17 some time. A local `supabase db
  reset` wipes local accounts only. Not done yet (owner): Netlify site, Auth > URL Configuration (Site URL and
  redirects = the Netlify URL), email sending (the built-in mailer is rate-limited, a few emails per hour).
- Frontend config: `config.production.js` (committed; hosted URL + publishable key) is copied to `config.js` by the
  Netlify build unless `SUPABASE_URL` / `SUPABASE_ANON_KEY` env vars are set. The secret key is not used anywhere.
- **App:** lessons 1–4 play end to end with teach cards, multiple choice, replay of missed questions and a summary
  (S6a–S6c passed). Build the sentence (S7a) passed on desktop, including drag tiles and `covers` on the lesson list.
- S7b (resume, leave dialog, dry run `#/try/L000n`, `audio.js`), S7e (fill in the blank) and S7d (build the word)
  passed the owner's browser test 2026-11-12. S7f (bonus label, lesson 4 rebuild) passed 2026-11-12.

## Next steps
0. **Handoff, night of 2026-11-13 (owner asleep; agent + subagents). Nothing new is on the hosted DB.** Unpushed
   local migrations, in order: `20261113040000_a5_word_notes.sql`, `20261113040409_a5_word_notes_content.sql`,
   `20261113060000_a3_stats_capture.sql` (all applied locally). The frontend works with or without them (tested for
   A3; A5 fields are optional). Push with `supabase db push --linked` (from `app/backend`) only after the owner
   agrees A3's answers and the A5 notes.
   - A1 DONE. A2: review fixes done; owner browser test still pending (steps: `#/try/L0007`, put ຂໍ ນີ້ ນ້ຳ ແນ່
     (khor nee nam nae) → the "Lao word order" note, its Lao now in the Lao font; build the word any order → "Read in
     this order"; Settings → "Spelling challenge"). Tests: `node scripts/grammar_test.mjs`.
   - Owner 2026-11-13: A3 answers 2–4 agreed as built; Q1 explained, awaiting a reply. Primary lesson button moved
     to the right (done). Repetition in lessons is intended: do not cut it, streamline the UX instead.
   - A3 BUILT LOCALLY on the proposed answers to the 4 questions in `docs/A3_STATS_DESIGN.md` §7 (log only for weak
     evidence; no "left" row; writing not logged; letter credit only for weakest/FSRS). Ask the owner; then push.
     Analysis: filter `review_log.role = 'primary'` or group by `question_id`. Browser driver:
     `scripts/browser/a3_play_lesson.js`.
   - A4: owner accent is Midwest US (Iowa): pick anchors for that accent first. Native: 6 sound checks in QUESTIONS. Still needs the owner's
     read-through of `docs/A4_SOUNDS_LIKE_AUDIT.md`, then `db_sql.py change`.
   - A5 BUILT LOCALLY: ເຂົ້າ (kao) and ສະບາຍດີ (sabaidee) cards show "How it is used" + Culture badge. Notes
     unverified (QUESTIONS). Open: pool words in `get_lesson` lack the note; the "translations are not literal" card.
   - A6 RUN: findings + revamp proposal in `docs/A6_UX_REVIEW.md` (4 owner questions). Quick fixes done and Playwright-checked:
     dry-run badge overlap, Settings dialog closes on route change. Agree it, then A7 builds it.
   - Keyboard in lessons (1–9 option/tile, Enter primary, Space audio, Backspace undo tile, Esc leave; focus kept in
     the stage; desktop-only key hints) and no-wrap Lao options (`dom.fitOptions`, one column when needed): built,
     Playwright keys-only run of `#/try/L0007` passed; owner check: same route on desktop, `#/try/L0010` at 375px.
   - Next for the agent: after the owner answers, push A3/A5, then A7 (home, navigation, keyboard, thumb-zone
     layout, summary) per the agreed proposal; A8, A9.
   - Subagents: the owner wants subagents used where it makes sense (2026-11-13). Three personas ran A6 at sonnet.
   New native takes later: `python scripts/audio_publish.py fetch`, `process`, `upload --linked`, `migration`,
   then `supabase db push --linked` (bucket exists now). Check the level of the first ~5 takes before a long
   session (owner idea).
   Tools (git-ignored): ffmpeg in `tmp/tools/ffmpeg-*/bin`, Playwright in `tmp/tools/pw` (npm i playwright@1.56.1).
   Local test learner: `bash scripts/local_test_user.sh` (a1smoke@test.local / smoke-test-pass-1); browser smoke
   test `scripts/browser/a1_smoke.js` (header has the setup). Local DB: the CLI wrote `supabase/.temp/postgres-version` = 17 when
   linking; it was moved to `postgres-version.hosted` so local starts on 15 again (data is 15).
   Owner idea (2026-11-13): have a native record ~5 takes first and check the level before a long session.
0. **S10r wife's first-session feedback** (owner, 2026-11-12; not yet built, nothing else reported):
   (a) DONE, untested: record button bigger (`.rec-big`, full width, 64px; start and stop; shared with review.js).
   (b) Open, owner wants short steps: as many questions per screen as fit comfortably, no scrollbar where possible.
   Her session was recordings plus 2 questions per word (natural? / name?), 1 per sentence. Owner wants all questions
   asked in one go per item, not split in two paths (my "double work" reading was wrong; ask what exactly was split).
   (c) DONE, untested: name prompt now "common name or nickname" (`rec_name_q`; Lao wording unverified, ask her).
   (d) Context matters for some phrases, see QUESTIONS (ນີ້ຂາວ vs ນີ້ມັນສີຂາວ): check lesson sentences that use this pattern.
0. **S10r recording mode built, browser untested** (2026-11-12, migration `20261113000000_s10r_recording_mode.sql`,
   applied locally). The owner deploys hosted Supabase + Netlify (an iPhone allows the microphone only on https,
   so the LAN address cannot record) and pushes all migrations. Then on the deployed site: sign up as native,
   `#/record`. After the wife's first session: listen to takes in the dashboard (`recording_feedback` view;
   files in bucket `recordings`), check volume and noise of the raw takes, and collect her feedback on the
   instructions and the Lao UI text (all unverified). Verify her in `reviewer_trust` (README "Native verification").
0. **S7h built, not owner-tested** (2026-11-12): untaught real words (`get_lesson` `distractors.untaught`, every
   other tagged word) top up fill in the blank; particles blankable; ນ້ຳ/ແກ້ວ excluded in subject slots.
   Migrations `20261112211502_s7h_untaught_options.sql` (get_lesson) and `20261112211540_s7h_untaught_tags_particle_slots.sql`
   applied locally. The planner still blanks only recycled sentences, so ແລ້ວ in S000002877 is first asked when
   that sentence is recycled (lesson 5 itself recycles only S000002872). Any newly tagged word becomes an untaught
   option in every lesson: tag only words that are safe as wrong options.
0. Re-dump `tmp/bundles/` and rerun `node scripts/session_test.mjs` after any lesson merge.
0. **Owner test of letter writing (S7w)**: owner 2026-11-12, after the fixes: "still feels weird", will review in
   depth later; wait for their notes. Earlier: desktop drawing and judging good apart from two bugs, now fixed ("null" after
   Check; the letter showing on part-from-memory steps). Retest those, then the phone. `#/write` on desktop and phone (steps in CHANGELOG 2026-11-11 "letter
   writing"). Untested in any browser. If judging feels too strict or too loose, the knobs are `TUNING` in
   `js/writing/score.js` (`LETTER_MAX`, `LETTER_MARGIN`, `TRACE_TOL`, `PART_MAX`); rerun `node scripts/strokes_test.js`.
1. Phone testing: `config.js` SUPABASE_URL uses the PC's LAN address (192.168.1.189); the app is at
   `http://192.168.1.189:5500/`. The lesson frame (`.lesson-frame`, 100dvh, pinned button) passed the phone test on 2026-11-11.
3. **Owner play-test of lessons 5–11** (`#/try/L0005` … `#/try/L0011`): lesson 6 and lesson 11 may split; conversation
   lines in 8 and 10 play as ordinary sentences until S7g. Many native-speaker questions added to QUESTIONS.

## Decisions in force
- Recording (owner 2026-11-12): words and sentences only, no letter sounds or names. One take per item, no
  second speed. Words said clearly and deliberately; sentences naturally but clearly, a little slower than with
  family. Never build a sentence's audio from word clips. "Is this natural?" comes before recording; if not, the
  native records their own wording (`spoken_lao`), which then needs owner review before it becomes content. No
  device or room questions. Consent is explicit, with an optional credit (first name or nickname).
- Conversations with two voices (not built; for S7g/S10 audio): every speaker records both sides of a
  conversation, so any two speakers can be paired; lines that depend on the speaker's gender or age get a tag.
  Until a second native records, conversations play in one voice.
- Fill in the blank (owner 2026-11-12): a new sentence is also blanked in its own lesson (closing block; the
  lesson's new words count as level 2 there). Untaught wrong options (S7h) are real words only, never a tone-mark or
  long/short-vowel twin of a word on screen (ເຂົ່າ knee vs ເຂົ້າ rice waits until both are taught). Personal-name
  words (ນ້ຳ Nam, ແກ້ວ Kaew, ດາວ Dao) are excluded from subject slots.
- Idea, not sliced (owner 2026-11-12): a fill in the blank whose only readable option is the answer (the rest
  untaught) shows reading, but is weaker evidence of knowing the meaning; consider logging it with less weight
  (e.g. not raising the word's recall level) when S9 (FSRS) uses the answers.
- Letter writing (DESIGN "Letter writing"): separate area, static stroke file, nothing recorded in the DB yet; the
  whole-letter judge passes a drawing only when the wanted letter is the best match among all letters.
- One curriculum lesson = one app lesson. Content names no screens; the planner (`js/session.js`) builds them.
- Interleaved: card, check, next card; a closing mixed block; missed questions replayed until right once.
- Completed = reached the end; no pass mark; summary accuracy counts first tries only.
- The check after a card counts as recognition (level 2). Audio is keyed by item id (`item_audio`, S10) with an empty
  button slot from S7b. Resume is same-device only. No offline.
- A done lesson links to "Review lesson material": read-only cards, never questions.
- Fill in the blank offers exactly one logical choice (DESIGN "Fill in the blank: one logical choice").
- Lesson budget is a guideline (decision 26). Lessons 5–11 are built.
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
- `js/grammar.js`: pure rule-note detection for wrong word order (A2), test `scripts/grammar_test.mjs`.
  `js/audio.js`: shared player, `audioButton`, `autoplay`, report dialog (A1). `js/bundle.js` adds `audio_url`.
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
- **Withdrawing a merged lesson** (no longer allowed: hosted since 2026-11-12; was: needs a db reset): remove its rows from `data/lessons.csv`,
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

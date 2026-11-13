# Plan

Open work for the app and the lessons, in working order. One slice at a time; each slice has a "Done when" line.
Tick a slice when the owner's check passes. Design: `docs/DESIGN.md`. Current state and next step: `docs/NOTES.md`.

Ground rules that cut across slices:
- **The DB is the source of truth for course content.** Every content change is a migration file written by the
  scripts; `data/*.csv` is the working copy (hosted DB + migrations not yet pushed). Hosted since 2026-11-12.
- **Stable IDs everywhere** (W/S/L/R/unit IDs). Removing an item retires it; IDs are never reused.
- **Writes from the app go through RPCs** (security definer, role-checked); tables are read-only or own-row-only
  under RLS. Learner and reviewer data live only in app tables.
- **Native status is self-declared; feedback is unverified until the owner verifies the person**
  (`reviewer_trust.native_verified_at`, set by hand in SQL). `profiles.role` is self-declared; privileged roles
  live in a table users cannot write.

## Done
S1 scripts · S2 local backend · S3 lesson 1 · S4 read-only learner view · S5 progress tables and RPCs · S6a played-lesson
backend · S6b session runner · S6c multiple choice with feedback and replay · S7c activity data (word units,
categories, slots; its SQL test passed 2026-11-12 with the lesson 4 rebuild) · S7a build the sentence · S7b session
comfort · S7d build the word · S7e fill in the blank.
Lessons 1–4 are merged. Detail is in `CHANGELOG.md` and git.

## Next: owner's play-test notes (2026-11-12), proposed order
A full revamp of the site is allowed. Order agreed 2026-11-12: A1 → A9 as listed. Owner choices: all of the wife's
takes go live (no listening gate) but learners can report bad or wrong audio; build the word defaults to any order
with strict order opt-in; the UX review runs on local Docker with throwaway accounts.
- [x] **A1 Wife's audio in lessons** (high priority). All her takes are approved in bulk; a "report this audio"
      button (bad quality / wrong word / other) logs to a learner reports table the owner reads. A script trims silence and evens loudness (raw takes) and copies them to a learner-readable
      `audio` bucket; `item_audio` table; `get_lesson` puts `audio_url` on words and sentences; `audio.js` already
      renders the button. Plays once by itself on a new word's card. **Done when:** on the deployed site every
      recorded word and sentence in lessons 1–11 plays her voice on its card and in the feedback after a question.
      (2026-11-13: built and tested locally, not pushed. Migrations `20261113020000_a1_lesson_audio.sql` (schema) and
      `20261113032217_lesson_audio.sql` (67 takes, generated); `scripts/audio_publish.py`; frontend bundle.js,
      audio.js (play + ⚑ report, shared player, autoplay setting), teach_card.js. `tests/a1_audio_test.sql` passed;
      Playwright on local: lesson 1 reader shows ▶ and "Voice: Na" on ກິນ, the MP3 loads and the report dialog opens.
      Takes were very quiet (about −44 LUFS): about +25–32 dB of linear gain, no compression; W000512 and W000082
      had sound at the very start. Owner listened 2026-11-13: sound OK. Pushed to hosted 2026-11-13 (migrations,
      then `upload --linked`; 67 rows, 67 files). Owner test on the deployed site passed 2026-11-13.)
- [ ] **A2 Gentler activities.** (a) Build the sentence/word: Check is always enabled; a wrong count is just a
      mistake. (b) Build the word: default "find all the pieces" in any order, then the word assembles and shows the
      reading order once; strict spelling order becomes an opt-in challenge (setting, or bonus round). (c) Mistakes
      that break a Lao rule get a rule note: first rules are "describer after the thing" (ນ້ຳນີ້ nam nee "this water",
      not ນີ້ນ້ຳ), "ບໍ່ before the verb", "question ບໍ່ at the end". Detected from word categories and sentence
      slots, text in strings.json. **Done when:** ຂໍນີ້ນ້ຳແນ່ (khor nee nam nae) in lesson 7 shows the describer note.
      (2026-11-13: built by a subagent, frontend only: build_sentence.js, build_word.js, new grammar.js (5 rules incl.
      ແນ່ and ແລ້ວ), settings `spellingOrder`; `scripts/grammar_test.mjs` passes. Playwright saw Check enable after
      one tile and the reading-order line; the rule note on screen is untested. Owner browser test pending.
      2026-11-13 night: review fixes done (Lao spans in rule notes via `tParts`, tone-mark logging, rule 1 nouns
      only, "usually" for ແລ້ວ, rule claims in QUESTIONS).)
- [x] **A3 Stats capture audit** (before more people play: data not logged now is lost). `review_log` has item,
      activity, direction, first-try correct, latency, level. Add what SRS and "weakest items" need: the answer
      chosen and the options shown (confusion pairs, e.g. ດ vs ບ), replay vs first ask, audio played, hint used,
      and per-piece results for build the word (letter-level credit). **Done when:** a design note in DESIGN is
      agreed and the migration logs it. (2026-11-13: draft in `docs/A3_STATS_DESIGN.md`, 4 owner questions.
      Night of 2026-11-13: BUILT LOCALLY on the proposed answers, not pushed: `20261113060000_a3_stats_capture.sql`,
      `tests/a3_stats_capture_test.sql`, new `set_session_client` RPC; new frontend is safe against the old hosted
      RPC (tested). Owner agreed 2026-11-13 (weak evidence: log only); summary in DESIGN. Hosted push pending.)
- [ ] **A4 "Sounds like" review.** Audit every unit card text and word pron_tip against IPA, for US, UK and
      Australian ears; prefer two anchors plus a warning ("not the a in 'cat' for most Americans"); mark doubtful
      ones in QUESTIONS for the owner's wife. (2026-11-13: audit done, `docs/A4_SOUNDS_LIKE_AUDIT.md`.) Known bad: ແ◌ (ɛː) "a in 'cat'" → nearer "eh" held long, mouth open
      wider than ເ◌ (eː, "ay" in "lay" without the glide). Changes via `db_sql.py change`. **Done when:** every
      taught unit has a reviewed hint and the owner has read the list.
- [ ] **A5 Usage and culture notes.** A word gets an optional `usage_note` (how it is really used vs its literal
      meaning) and a `culture` flag (badge on the card). A one-off card in an early lesson: translations are not
      literal. First notes: ສະບາຍດີ (sabaidee: "be well", the universal greeting, said with the hands together and
      a slight bow, the ນົບ nop); ເຂົ້າ (kao: rice, and by extension a meal; ກິນເຂົ້າ "eat rice" = "have a meal";
      ອາຫານ aahaan is "food"). Unverified until the owner's wife checks. **Done when:** both cards show the note
      with the badge. (Night of 2026-11-13: BUILT LOCALLY, not pushed: `word_notes` table + `word_json`
      (`20261113040000_a5_word_notes.sql`), content `20261113040409_a5_word_notes_content.sql` from
      `data/word_notes.csv` via `db_sql.py change word_notes:<id>`; card shows "How it is used" + Culture badge
      (Playwright on L0002/L0008). Notes unverified. Follow-up: pool words in `get_lesson` lack the note, so the ⓘ
      dialog from a sentence chip in a later lesson shows none. The one-off "translations are not literal" card is
      not built (needs a merged-lesson change).)
- [ ] **A6 UX review round.** Subagents play the app in a headless browser (Playwright: `tmp/tools/pw`, `scripts/browser/`) at
      375, 768 and 1280 px as three personas (absolute beginner, returning learner on a phone, impatient desktop
      user), with screenshots; plus the owner's notes. Output: one findings list and a revamp proposal in DESIGN
      (screens, navigation, look). Needs a running backend and a test account (owner's choice: local Docker or a
      throwaway account on hosted). **Done when:** the owner has agreed the revamp proposal. (Night of 2026-11-13:
      review RUN, proposal written: `docs/A6_UX_REVIEW.md`, 4 owner questions; awaiting agreement.)
- [ ] **A7 Revamp: home and sections.** Home with sections instead of the long lesson list: Continue (next lesson,
      one tap), Review, Letters and sounds, My words, Write. Stats on home (streak, accuracy, letters and words known;
      absorbs S8). Lesson list collapsed around the next lesson. Content preview as a dialog on desktop and a sheet
      on phone. Dark mode. Sentence words: tappable inline vs tiles under the sentence (decide in A6). Review where the
      audio ▶ / ⚑ buttons sit (owner 2026-11-13).
- [ ] **A8 Letters and sounds.** Every taught symbol (consonants, vowels, tone marks, finals) with its card info,
      examples from known words and audio; links into writing practice; vowels join writing practice.
- [ ] **A9 My words.** Every word seen or known, with its card info and personal stats (times seen, first-try
      accuracy, last seen, level); needs a per-item stats RPC. Leads into S8b practice of the weakest items.

## Next: learning-design slices (owner 2026-11-13, order chosen by the agent)
From the second review round (`tmp/a6b/learning.md`, `tmp/a6b/a11y.md`, `docs/A7_PLAN.md`). Working order:
L1 → L2 → A7 steps 0–5 → L3 → A7 mockup gate (step 6) and steps 7–10 → L4 (= S7g) → L5 (design starts now).
- [x] **L1 Clearer activities.** (a) First build the word and first build the sentence get a one-line how-to (and a
      ◌ label: "the circle marks where the consonant goes"), shown the first few times. (b) Wrong build the sentence
      marks the misplaced tile(s) in the learner's order, not only the right answer. (c) Same-sound rule: a sound
      question never offers an option that sounds the same as the answer (same respelling: ◌ໍ / ◌ອ◌ "aw", ◌ວ /
      ເ◌ົາ "ao"); cards of same-sound symbols say so. **Done when:** a beginner sees the how-to on the first build of
      lesson 2; a wrong sentence in `#/try/L0007` shows which tile was out of place; no sound question in L1–L11 has
      two options with the same sound (checked by `session_test.mjs`). (owner passed 2026-11-13; built 2026-11-13:
      how-tos 3 times per browser (js/howto.js) plus the ◌ note once; ✓/✗ per placed tile on a wrong sentence;
      same-sound rule in multiple_choice and build_word wrong tiles, "Same sound as ◌ໍ." line on unit cards;
      session_test checks it on re-dumped bundles; Playwright shots in tmp/l1.)
- [x] **L2 Listen and pick.** A new activity: play a recorded word (or sentence), pick its Lao from 3–4 options
      (real words only; never a same-sound twin). Needs audio for the item and its options; recognition level.
      **Done when:** lessons with recorded words ask at least one listen-and-pick, and the answer is logged with
      A3 detail. (owner passed 2026-11-13; built 2026-11-13: js/activities/listen_pick.js, words only (the pool has no
      sentences to offer); one per lesson always kept in the closing block, other recorded new words compete for
      closing places, fallback a recorded recycled word; options are pool words, never the same respelling as the
      answer, preferring the same onset/vowel/first letter; detail {form: listen, options, chosen, answer, auto,
      heard}. Owner addition: "Can't listen now" pauses listening for 10 minutes per browser (settings.js
      listenPausedUntil): no autoplay, listen and pick shown as Lao -> meaning (detail.swapped = 'cant_listen'),
      Settings shows the pause with "Listen again now". session_test checks it on dumped audio
      (tmp/bundles/audio.json); Playwright in tmp/l2. The plan now depends on audio: a resume record saved before
      this change, or across a failed audio request or a newly added recording, restarts its lesson.)
- [ ] **L1b Owner follow-ups (2026-11-13, from the L1/L2 browser test).** (a) A vowel's intro card says plainly
      that the vowel is one unit (all its parts together, wherever they sit) and that the consonant in the ◌ is
      said first, then the vowel; today this is only implied. (b) Activity mix: favour listen and pick (and other
      quick recognition questions) in lessons; build the word / build the sentence are slower and harder, so use
      them less in lessons and more in tests, quizzes and checkpoints (S8b practice). Repetition stays (same number
      of checks, cheaper kinds). Owner said "might": confirm the split before changing the planner.
      **Done when:** every vowel intro card carries the line (teach texts via `db_sql.py change`); the planner mix
      is agreed and `session_test.mjs` checks it.
- [ ] **L1c Answers and feedback (owner play-test 2026-11-13).** (a) Build the word lets you press Check before all
      pieces are placed, as build the sentence does. (b) Right in the end = green: slips along the way (a wrong tile
      tapped and taken back) no longer show red when the final answer is right; they stay in `review_log` (A3).
      (c) A wrong answer shows "Your answer" over "Right answer", lined up word by word: the right answer's
      missing/misplaced words highlighted, the wrong part of yours highlighted, and a [missing] gap where you left a
      word out. (d) Accept an equally right answer: a build/fill answer that is another sentence with the same
      meaning (ສະບາຍດີບໍ່? for "How are you?" when the target is ເຈົ້າສະບາຍດີບໍ່?) counts as right with a note
      ("also right; ເຈົ້າ adds 'you'"); ເຈົ້າ is then tested where the pronoun cannot be left out (contrast ຂ້ອຍ /
      ເຈົ້າ / ລາວ, or fill in the blank). (e) Slot board in build the word when strict order is off: one slot per
      piece in reading position; a tapped piece drops into its own slot (ນ to the last, ກ to the first, ◌ິ above
      it), so the word assembles as it will be read. **Done when:** each of (a)–(e) works on `#/try/L0007` and
      `#/try/L0009`, `session_test.mjs` covers (b) and (d), and A3 detail still records every tap.
- [ ] **L1d Teaching notes (owner play-test 2026-11-13).** (a) Its own rule card, as direct as the "Lao has sounds
      English does not" intro: "Some vowels are written before the consonant (or around it), but you always say
      the consonant first", at the first such vowel (ເ◌ົາ in lesson 2, ເຂົ້າ khao "rice"); not a badge. (b) Rule
      card "Pronouns are often left out": everyday Lao drops ຂ້ອຍ / ເຈົ້າ / ລາວ when context makes it clear, and that
      is normal, not sloppy; at the first pronoun-less sentence (ບໍ່ຫິວ baw hiw "not hungry", lesson 9). (c) ຫິວ
      (hiw) note and the missed-ເຂົ້າ feedback ("hungry needs ເຂົ້າ: Lao says what you are hungry for") only after
      the native speaker answers QUESTIONS (lessons already accept bare ຫິວ). (d) English fixes: S000002881
      "Could I have some rice, please?" (ແນ່ = the please); S000002889 and S000002892 drop "Yes,"; S000002879 per
      QUESTIONS (2). **Done when:** the rule cards are in lessons 2 and 9 (new rule rows + `db_sql.py change`), the
      English rows are changed, pushed with the owner's go-ahead.
- [ ] **L1e Lesson order and review (owner play-test 2026-11-13).** New content is presented in a deliberate order:
      a word is first built (or first gets its hardest check) in the lesson that teaches it, never first in a later
      lesson (ສະບາຍດີ sabaidee and ຫິວ hiw were first built in lesson 9). Review items are semi-random and later
      chosen by spacing and the learner's stats (S9 FSRS). Long words (3+ syllables, e.g. ສະບາຍດີ) get "find the
      missing piece" (one piece blanked, pick it from real options) before a full build. Joins L1b (b), the
      activity mix. **Done when:** `session_test.mjs` asserts no word's first build is outside its own lesson, and
      long words get a missing-piece question.
- [ ] **Bug: ◌ິ drawn off to the right of its circle** on the owner's screen (other above-vowels fine). Not
      reproduced in headless Chrome with Noto Sans Lao Looped / Noto Sans Lao / Noto Serif Lao / Leelawadee UI
      (`tmp/vowel_glyph.png`). Need: device, browser, Settings → Lao font, and where it showed.
- [ ] **L3 Teaching tone.** Not necessarily at the first tone mark, but a proper lesson: what tone is, the pitch
      line legend, tone marks and consonant class in plain words, and compare/contrast pairs that differ only by
      tone, each with audio (candidates: ຂາວ khaao "white" vs ລາວ laao, owner idea; ໃກ້ "near" vs ໄກ "far", to
      verify; ເຂົ້າ "rice" vs ເຂົ່າ "knee" once both are taught). A hear-and-pick-the-pitch check. Pairs need the
      native speaker to record both words. **Done when:** the tone lesson is merged with at least two recorded
      pairs and a pitch check.
- [ ] **L4 Conversations** = S7g below, with two voices when a second speaker records; context-driven learning.
- [ ] **L5 Speaking practice.** Design note first (written by a Fable agent, owner 2026-11-13): options from
      record-and-compare with a pitch overlay (all in the browser) to automatic judging (speech recognition with Lao
      support, pronunciation scoring), privacy, cost, accuracy on the native takes. **Done when:** the owner agrees
      the design note; build slices follow.

## Working order (before 2026-11-12 notes)
1. Mobile lesson frame: done (phone test passed 2026-11-11)
2. S7f: done 2026-11-12
3. S7b, S7e, S7d: done 2026-11-12
4. Lessons 5–11 along `docs/CURRICULUM_PATH.md`: built 2026-11-12; owner play-test pending (lessons 6 and 11 may split)
6. S7g conversations (first ones in lessons 8 and 10)
7. S8 home and stats, S8b practice, S9 FSRS, S9b tone drill, S10 native feedback and audio, S11 deploy
8. Plan the stretch after lesson 11 (ມີ, ອາຫານ, ຢາກ, ມັກ, ຄົນ, ໃຫຍ່) around a second conversation (ordering food)

## Slices

- [x] **S7a Build the sentence** (re-cut 2026-11-10, agreed; fill in the blank moved to S7e): word tiles in
      order, from `sentence_json.words`; no new data. Planner: a new sentence gets its reading card, then build the
      sentence; a recycled sentence also gets build the sentence until S7e. **Done when:** lessons 2–4 ask at least
      one build the sentence each and a wrong order shows the right sentence. **Gate:** owner browser test.
      (2026-11-10: built, untested: `activities/build_sentence.js`, planner in `session.js`. Tiles = the sentence's
      words + up to 2 pool words; checked by Lao string, so the two ລາວ are interchangeable; recall, item_type sentence.
      Desktop browser test passed (user, also for drag and covers); phone test passed 2026-11-11 (Firefox Android). Added at the user's request: drag tiles into, within
      and out of the line (tap still works); the lesson list shows what each done lesson covers
      (`20261111010000_list_lessons_covers.sql`).)
- [x] **S7b Session comfort:** refresh or coming back the same day resumes the session at the same step (session id,
      seed and step in localStorage; specs are rebuilt from the seed); "Leave lesson?" confirm; dry-run mode on
      `#/read/…` that plays the questions without recording; `js/audio.js` `audioButton(detail)` placed on teach
      cards, sentence cards and wrong-answer feedback (renders nothing while `audio_url` is absent).
      **Done when:** refreshing mid-lesson returns to the same question; a dry run of lesson 4 leaves no rows in
      `review_log`. **Gate:** owner browser test.
      (2026-11-12: built, awaiting the owner's browser test. Resume record `laophabet.resume.<user>.<lesson>` keeps
      the levels the plan was built with, so the rebuilt plan matches even after levels changed; the dry run is
      `#/try/L000n`, linked from the reader as "Try the questions", and plays as a learner with earlier items at
      level 2. `node scripts/session_test.mjs` checks the rebuild. Owner browser test passed 2026-11-12: resume,
      leave dialog, dry run; the backend-down case was left untested by the owner.)
- [x] **S7d Build the word:** `activities/build_word.js`: the meaning and sound are shown; the learner taps the
      pieces in spoken order (consonant, vowel, final, tone mark) from tiles that include wrong pieces; when right,
      the assembled word appears ("ກ + ◌ິ + ນ = ກິນ"). No in-progress glyph composer. Also: letters just taught are
      highlighted in new words, and tone marks get their first check here (they have no sound to ask about).
      **Done when:** every lesson 1–4 word can be built; a wrong piece gets feedback. **Gate:** owner browser test.
      (2026-11-12: built, awaiting the owner's browser test. Used for recycled words at level ≥ 2 and, in the
      closing block, for the first new word carrying a new tone mark. Each tap is judged at once; a slip marks the
      tile and the question as missed but the learner carries on. The highlight is a "Made of" line on word cards,
      not colour inside the word. `session_test.mjs` builds every lesson 1–4 word. Owner browser test passed
      2026-11-12; open question on the strict spoken order, see NOTES "Open with the owner".)
- [x] **S7e Fill in the blank, one logical choice** (agreed 2026-11-10; built right after S7c, before S7d): `activities/fill_blank.js` per DESIGN "Fill in the blank: one logical choice"; the planner
      gives a recycled sentence fill in the blank and falls back to build the sentence. Frontend only (the bundle
      fields come in S7c). **Done when:** lessons 3 and 4 each ask a fill in the blank on their recycled sentence;
      for `ກິນ __` and `ລາວກິນ __`, ນ້ຳ is never an option; a wrong answer shows the full sentence. **Gate (user):**
      browser test.
      (2026-11-12: built, awaiting the owner's browser test. `session_test.mjs` confirms lessons 3 and 4 plan one
      and ນ້ຳ is never offered after ກິນ over 200 seeds. Owner browser test passed 2026-11-12.)
- [ ] **S7w Letter writing practice** (owner request 2026-11-11; built, awaiting the owner's browser and phone test):
      `#/write` grid and per-letter flow (`js/write.js`, `js/writing/pad.js`, `js/writing/score.js`), stroke data
      `data/strokes.json` from `scripts/strokes_build.js`. Frontend only. **Done when:** on a phone, every step of
      two letters can be completed with a finger; a careless trace fails; drawing ຂ when asked for ຊ is refused with
      "looks like ຂ"; a finished letter shows a tick on the grid. **Gate (owner):** browser and phone test.
      Later: vowels, tone marks and ໜ ໝ; use inside lessons; progress in the DB.
      (2026-11-12 owner desktop test: drawing and judging good. Fixed: a stray "null" under the result after Check,
      and the printed letter now hides on every from-memory step, not only the whole-letter one. Phone untested.)
- [ ] **S8 Home and stats:** `learner_stats()` RPC (streak, letters known, words known), home screen with Continue
      (the next open lesson), the stats, and settings moved to the learner's profile.
- [ ] **S8b Practice sessions:** `practice_items(limit)` RPC (due by fixed intervals, then weak, then oldest),
      practice mode in the planner (recall first, no teach cards), `complete_practice` summary, Practice button and
      due count on home; adds matching and flashcards (practice is where they fit). Done when a learner with lesson
      1 done can run a practice session and see its summary.
- [ ] **S9 FSRS:** design note first, then implement over the fixed intervals.
- [ ] **S9b Tone drill:** only once the first tone-rule lesson exists (LESSON_RULES decision 11).
- [ ] **S10 Native feedback on lesson content, and audio:** native-role checks on review RPCs, queue (lesson content
      first), word/unit feedback, owner views, the feedback subroutine; `item_audio` + the `audio` bucket, bundles
      gain `audio_url`; then "Listen and choose" and "Say it". (detail below)
- [ ] **S11 Deploy:** password reset, Netlify, Supabase auth URLs. Also: frontend `config.js` for
      the deployed site (below), and move `LAO_UI_REVIEW.md` and
      `export_lao_review.py` out of the frontend repo before connecting Netlify.
- [x] **S7f Bonus words and runner readiness (script change + SQL + small frontend)** (added 2026-11-10 with the
      curriculum path; LESSON_RULES decisions 20–22). `lesson_tool.py`: role `bonus` (a word only; readable; not
      allowed in the lesson's sentences; outside the "uses something new" rule; a later lesson may list a bonus
      word as `new` to make it core, also outside that rule); `brief` lists readable bonus candidates.
      `db_sql.py` and a migration: `lesson_items.role` check gains `bonus`; `get_lesson` returns the role;
      `list_lessons.covers` shows bonus words apart. Planner: a bonus word gets its card with a "Bonus word"
      label and recognition checks only. `next_lesson_prompt.md`: read `docs/CURRICULUM_PATH.md`, follow it,
      and use its per-lesson budget flags. Then rebuild lesson 4 (withdraw and re-merge: ຂາ bonus, ລາວຂາວ and
      ຂາວ out).
      **Done when:** `lesson_tool.py check` passes a draft with a bonus word and rejects a bonus word used in a
      sentence; rebuilt lesson 4 shows ຂາ with the bonus label in the browser.
      **Gate:** `app/backend/tests/s7c_s7f_test.sql` passes; owner browser test.
      (2026-11-11: scripts, migration `20261111020000_activity_data_bonus.sql` and the lessons 1–4 backfill are done.
      Left: rebuild lesson 4, the planner's bonus label and the `badge_bonus` string, the SQL test.
      2026-11-12: lesson 4 rebuilt in place by `20261112195124_lesson_l0004.sql` (`db_sql.py lesson L0004`, no
      withdrawal, so no reset); bonus label, planner rule and "Bonus words" line on the lesson list built;
      `s7c_s7f_test.sql` passed. ຂາວ added as a second bonus word at the owner's request. Owner browser test
      passed 2026-11-12.)
- [ ] **S7g Conversations (canned content)** (added 2026-11-10; LESSON_RULES decision 23). Design note first
      (DESIGN): tables `dialogues` and `dialogue_lines` (ordered sentence ids, speaker A/B), a `dialogue`
      lesson item, a conversation card (lines shown in order with speaker sides), then fill in the blank on its
      lines (needs S7e). Until this is built, a lesson carries its conversation lines as ordinary sentences in
      order, so lessons 8 and 10 can be built first and the dialogue rows added by a `db_sql.py change`.
      **Done when:** lesson 10 shows its conversation as one card and asks a fill in the blank on one line.
      **Gate:** design agreed with the owner; SQL check; owner browser test.
- [ ] **S7h Untaught real words as wrong options in fill in the blank** (owner, 2026-11-12). Early lessons have
      too few known words to fill a blank safely, so wrong options may be real words the learner has not been
      taught. **Every option is a real Lao word** (words.csv): never an invented spelling (global rule, owner
      2026-11-12). No look-alike table and no ranking (owner correction): get_lesson ships `distractors.untaught`
      (every other word with a word_categories row); `fill_blank.js` draws from it at random only when the pool's
      safe distractors run short, under the same option rule; `lesson_tool.py check` lists the qualifying ones. A
      few common short words are tagged for it. Particles become blankable (`function` = never an option); slots
      added for ແລ້ວ, ບໍ່, ແນ່; ນ້ຳ/ແກ້ວ excluded as personal names in subject slots.
      **Done when:** a fill in the blank on ແລ້ວ in "ລາວກິນເຂົ້າ __" (S000002877) built from the lesson 5 bundle
      has only real words.csv words as options, untaught ones among them, and check prints them; lesson 6 has a
      fill in the blank on a recycled sentence.
- Bonus words also enter the practice pool (S8b): `practice_items` includes them like core words.

## Detail for later slices

### Foundation left over (S11)
- [ ] Forgot password / reset flow; Supabase auth URLs set for the Netlify site
- [ ] Netlify deploy of `app/frontend`
- [ ] Frontend config for the deployed site: `config.js` is git-ignored and points at local Supabase. Either Netlify
      builds it from `SUPABASE_URL` / `SUPABASE_ANON_KEY` env vars (already in `netlify.toml`) or a production `config.js`
      with the publishable key only is committed. Needs the hosted Supabase project first.
- [ ] Move `LAO_UI_REVIEW.md` and `scripts/export_lao_review.py` out of the frontend repo (Netlify would serve them):
      into the main repo, fix the script path to `app/frontend/js/strings.json`, update `app/README.md`.

### S10: Native feedback on lesson content
- [ ] **S10r Recording mode** (owner 2026-11-12): natives record words and sentences, lesson content first, on an
      iPhone. Consent once (credit: no name, first name or nickname), recording tips once per page load, "is this
      natural?" before recording (if not, they type their own wording and record that), "could this word be a
      name?" on words, listen and redo, raw takes. No letter sounds (owner not keen on letter names; words carry
      the sounds). **Done when:** the recording mode is available to the owner's wife: a native account on the
      deployed site can record, redo, save and skip lesson 1–11 items in order, and the rows and files are in the
      DB. (2026-11-12: built; SQL test and an HTTP run against local Supabase passed; browser untested.)
- [ ] Review RPCs require `role = 'native'` (today any signed-in user could call them); the `recordings` storage
      insert policy likewise lets any signed-in user upload to their own folder (S10r's RPCs already check the role)
- [ ] Queue prioritises what planned lessons use (lesson sentences first, then their words), then the pool
- [ ] Feedback on words (gloss, tone, IPA, pron tip) and units/teach cards, not only sentences; one
      `feedback` shape keyed by `(item_type, item_id)`
- [ ] Recordings for words and sentences (the audio question in DESIGN)
- [ ] Owner views: all feedback per item, side by side, verified reviewers marked

### S10: Feedback review subroutine (owner runs it with the agent)
- [ ] Getting feedback out: the owner runs a saved SQL query (or `supabase` CLI export) that writes pending
      feedback for one lesson to a file in `tmp/feedback/`, verified reviewers flagged
- [ ] The agent reviews it and writes decisions (accept correction / keep / needs owner); a script
      turns accepted decisions into a migration that updates the rows, sets confidence/source
      (`native review <reviewer ids>`), and marks the feedback resolved; the owner reviews and applies it
- [ ] Audio: an accepted recording becomes lesson audio: `item_audio(item_type, item_id, recording_id,
      approved_at)`, copied from the private `recordings` bucket to a learner-readable `audio` bucket. Only
      recordings from verified natives can be accepted.
- [ ] Learner-reported problems ("this looks wrong") feed the same queue

### S9: FSRS design
- [ ] Where scheduling runs. Recommendation: one small JS module (FSRS-5/6 formulas, default weights) used by
      the client, server re-validates ranges; or the same formulas in plpgsql for a server-authoritative
      schedule. Write it up before coding.
- [ ] Activity outcome → rating: teach card no rating; recognition correct → Good at reduced weight (or a
      separate recognition card); recall correct → Good/Easy by latency; wrong → Again
- [ ] Card granularity: units, words, maybe sentences; Lao→English and English→Lao as separate cards?
- [ ] Ladder (DESIGN levels) gates activity types; FSRS decides timing. No demotion.
- [ ] Daily review session: due items across lessons, capped; suggest a new lesson when the queue is short
- [ ] Later: fit weights offline from `review_log`

## Later
Admin role and in-app owner tools, dialogues, PWA/offline, analytics on drop-off and difficulty, trust scores.

## Decisions log
- 2026-11-10 (learning-experience plan; detail in DESIGN "Decisions log"): one curriculum lesson = one app
  lesson, screens come from the planner; teach and check are interleaved; a lesson is completed by reaching the end
  (missed questions replayed, no pass mark); build the word is v1 and the tone drill waits for a tone-rule lesson.
  Slices S6–S8b re-cut so S6a–S6c make lessons 1–4 playable. No change to merged lessons.
- 2026-10-19: everything goes in the DB; lesson content is DB-master once planned; all content changes are
  SQL migrations the owner applies; hosted Supabase is the master, local = hosted + proposals.

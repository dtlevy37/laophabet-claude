# Plan

Open work for the app and the lessons, in working order. One slice at a time; each slice has a "Done when" line.
Tick a slice when the owner's check passes. Design: `docs/DESIGN.md`. Current state and next step: `docs/NOTES.md`.

Ground rules that cut across slices:
- **The DB is the source of truth for course content.** Every content change is a migration file written by the
  scripts; `data/*.csv` is the working copy (local DB + migrations not yet applied). Nothing is hosted yet.
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

## Working order
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

# App plan: phases (draft, 2026-10-19)

One web app in `app/` (was `native/`): Supabase backend (`app/backend`), vanilla HTML+JS+CSS frontend
(`app/frontend`, ES modules, no build step except writing `config.js`), hosted on Netlify. Learners and native
reviewers share one login; the profile's `role` decides the view. Activity rules are in `_agent/APP_DESIGN.md`.

Ground rules that cut across phases:
- **The CSVs in `data/` stay the source of truth for content.** The DB holds a read-only copy, loaded by the seed
  generator. Native feedback flows DB → reviewed export → `data/` (apply_columns / merge) → pipeline → re-seed.
  Nothing edits curriculum rows in the DB directly.
- **Stable IDs everywhere** (W/S/L/R/unit IDs), so progress and feedback survive re-seeding. Removing an item
  from the curriculum retires it; it never reuses its ID.
- **Learner and reviewer data live only in app tables** (profiles, progress, reviews), never in the seed tables.
- **Writes go through RPCs** (security definer, role-checked); tables are read-only or own-row-only under RLS.
- **Privileged roles** (admin) live in a separate table users cannot write; `profiles.role` is self-declared.

## Phase 1: Foundation: accounts and roles  ← current
- [x] Move `native/` → `app/`; retire the leftover React sources
- [x] `profiles.role` (learner | native) set at sign-up via metadata (migration `..0500_roles.sql`)
- [x] Sign-up: pick role first (bilingual cards), then the form in that role's language; login with a
      ພາສາລາວ / English toggle; accounts with no role are asked after login
- [x] Routing: native → onboarding → sentence review; learner → learner home (placeholder)
- [ ] User: create the Supabase project (or local `supabase start`), `db push`, try both sign-ups in a browser
- [ ] Forgot password / reset flow; Supabase auth URLs set for the Netlify site
- [ ] Netlify deploy of `app/frontend`

## Phase 2: Content in the DB
- [ ] Lesson tables in the DB mirror: `lessons`, `lesson_items`, `units`, `rules` (dialogues later); extend
      `generate_seed.py` and the curriculum migration together
- [ ] Content version: one row per seed run (`content_versions`), so feedback and progress can say which
      version they saw
- [ ] One read RPC per lesson, `get_lesson(lesson_id)` → JSON bundle: items in order, the rows each needs
      (unit/rule teach text, word gloss/respelling/IPA/tones/pron tip, sentences with word links), plus the
      distractor pool allowed at that lesson (APP_DESIGN distractor rule). The client never assembles a lesson
      from raw tables.
- Depends on Phase 9 (lesson 1 built and merged) for real data; can start with a hand-made fixture.

## Phase 3: Learner progress model (schema + RPCs, no UI yet)
- [ ] `lesson_progress(user, lesson, started_at, completed_at)`
- [ ] `learner_items(user, item_type, item_id, level 0–4, FSRS state: stability, difficulty, due, reps, lapses,
      last_review)`; one row per learner and item (unit, rule, word, sentence)
- [ ] `review_log`: every answer (item, activity type, direction recognition/recall, correct, rating, latency,
      lesson or review session, content version). Append-only; the raw material for tuning FSRS later.
- [ ] RPCs: `start_lesson`, `record_answers(batch)`, `complete_lesson`, `due_items(limit)`; RLS own rows only

## Phase 4: FSRS design
- [ ] Decide where scheduling runs. Recommendation: one small JS module (FSRS-5/6 formulas, default weights)
      used by the client to compute the next state, with the server re-validating ranges; or the same
      formulas in plpgsql if we want the server authoritative. Write it up before coding.
- [ ] Map activity outcomes to ratings: recognition correct → Good with reduced weight (or a separate
      recognition card), recall correct → Good/Easy by latency, wrong → Again; teach card → no rating
- [ ] Item granularity: which items get cards (units, words; sentences maybe), and whether Lao→English and
      English→Lao are separate cards
- [ ] Ladder (APP_DESIGN levels) vs FSRS: level gates activity types; FSRS decides timing. No demotion.
- [ ] Daily review session: due items across lessons, capped; new lesson suggested when the queue is short
- [ ] Later: fit personal or global weights offline from `review_log`

## Phase 5: Activity engine
- [ ] Session planner: lesson bundle + learner levels → ordered list of activity specs (show first, test later)
- [ ] Activity registry: each activity is a module `{ type, canUse(item, level), render(root, spec, done) }`
      that builds itself from the bundle and reports an answer object. Same modules serve lessons and reviews.
- [ ] v1 activities in order: teach card (+ info icon), spot it, multiple choice, matching, flashcards,
      fill in the blank, build the sentence, tone drill
- [ ] Result screen; answers flushed to `record_answers` in batches (tolerates a dropped connection)

## Phase 6: Learner views
- [ ] Hash router (`#/home`, `#/lesson/L0001`, `#/review`, `#/item/W000123`)
- [ ] Home: path of lessons (locked / next / done), "continue", reviews due count
- [ ] Teach-card viewer for any item (the info icon target); settings (respelling/IPA toggles)

## Phase 7: Native feedback v2
- [ ] Review RPCs check `role = 'native'` (today any signed-in user could call them)
- [ ] Review more than sentences: words (gloss, tone, IPA, pron tip), teach cards, lesson UI text, the app's
      own Lao strings (replaces the LAO_UI_REVIEW.md hand-off)
- [ ] Recordings for words and sentences (answers APP_DESIGN open question 1: audio)
- [ ] Prioritise review of what the next lessons use

## Phase 8: Feedback → curriculum
- [ ] `admins` table; admin view: per item, all reviews side by side, agreement, recordings
- [ ] Decisions (accept correction / keep / needs discussion) stored per item
- [ ] Export accepted decisions as ID-keyed CSVs for `apply_columns.py` (approved script); confidence becomes
      `verified` with source `native review <ids>`; then pipeline → re-seed (new content version)
- [ ] Learner-reported problems ("this looks wrong") feed the same queue

## Later
Audio playback everywhere, dialogues, PWA/offline, analytics on drop-off and difficulty, trust scores.

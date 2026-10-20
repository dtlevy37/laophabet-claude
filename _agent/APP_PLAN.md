# App plan: phases (draft, 2026-10-19; rev 2 same day: DB becomes the source of truth)

One web app in `app/` (was `native/`): Supabase backend (`app/backend`), vanilla HTML+JS+CSS frontend
(`app/frontend`, ES modules, no build step except writing `config.js`), hosted on Netlify. Learners and native
reviewers share one login; the profile's `role` decides the view. Activity rules are in `_agent/APP_DESIGN.md`.

Ground rules that cut across phases:
- **The DB is the source of truth for course content** (user, 2026-10-19): the unit list (letters, vowels,
  role-units, rules), the complete word list, lessons, and the sentences lessons use. After a one-time import,
  `data/*.csv` for those tables is a **working copy** pulled from the DB, not the master (see Phase 2).
- **Native feedback attaches directly to DB rows** (sentence, word, unit, lesson) by ID.
- **Native status is self-declared; feedback is unverified until the owner verifies the person**
  (`reviewer_trust.native_verified_at`, set by hand in SQL; migration `..0600`). Verification is looked up at
  read time, so verifying someone later upgrades all their earlier feedback.
- **Stable IDs everywhere** (W/S/L/R/unit IDs). Removing an item retires it; IDs are never reused.
- **Learner and reviewer data live only in app tables** (profiles, progress, reviews, recordings).
- **Writes from the app go through RPCs** (security definer, role-checked); tables are read-only or
  own-row-only under RLS.
- **Privileged roles** (admin) live in a separate table users cannot write; `profiles.role` is self-declared.
- Natives can try the learner view (topbar switch, per browser); their learner progress is their own like anyone's.

## Phase 1: Foundation: accounts and roles  ← current
- [x] Move `native/` → `app/`; retire the leftover React sources
- [x] `profiles.role` (learner | native) set at sign-up via metadata (migration `..0500_roles.sql`)
- [x] Sign-up: pick role first (bilingual cards), then the form in that role's language; login with a
      ພາສາລາວ / English toggle; accounts with no role are asked after login
- [x] Routing: native → onboarding → sentence review; learner → learner home (placeholder)
- [x] Native verification by hand (`..0600`), owner view `sentence_feedback` with `verified_native`
- [x] Natives can switch to the learner view and back
- [ ] User: create the Supabase project (or local `supabase start`), `db push`, try both sign-ups in a browser
- [ ] Forgot password / reset flow; Supabase auth URLs set for the Netlify site
- [ ] Netlify deploy of `app/frontend`

## Phase 2: DB becomes the source of truth (do before lesson 1 is merged: no lessons exist yet)
Model: **pull → work on files → push**, like a checkout. The existing file tools (lesson_tool, check_drafts,
merge_words, tone fill, validate) keep working on CSVs; only the ends change.
- [ ] Migration: content tables gain `updated_at` (+ trigger) and `retired_at`; new tables `units`, `rules`,
      `lessons`, `lesson_items`; a `content_changes` log (who/what/when per push) for history now that git no
      longer holds the master
- [ ] One-time import of the current CSVs (the seed generator already does this; extend it to the new tables)
- [ ] `db_sync.py` (approved script, stdlib only, Supabase REST with a key from an environment variable):
  - `pull`: DB → `data/*.csv` working copy + `data/.pulled.json` (per-row `updated_at` at pull time)
  - `diff`: what changed locally since the pull
  - `push`: upsert changed rows by ID; **refuses rows changed in the DB since the pull** (someone accepted
    feedback meanwhile), so nothing is silently overwritten; logs to `content_changes`
- [ ] `lesson_tool.py merge` / `next_lesson.ps1`: pull before the brief, push after the merge + pipeline
- [ ] Which tables the DB owns vs. file-only staging (templates, fillers, learning_order, common list, letter
      map stay file-only) and whether the unused sentence pool is owned too: **user decision pending**
- [ ] Key handling for scripts: **user decision pending** (see the end of this file)
- [ ] `get_lesson(lesson_id)` RPC → JSON bundle (items in order, unit/rule teach text, word
      gloss/respelling/IPA/tones/pron tip, sentences with word links, allowed distractor pool). The client never
      assembles a lesson from raw tables.

## Phase 3: Native feedback on lesson content
- [ ] Review RPCs require `role = 'native'` (today any signed-in user could call them)
- [ ] Queue prioritises what planned lessons use (lesson sentences first, then their words), then the pool
- [ ] Feedback on words (gloss, tone, IPA, pron tip) and units/teach cards, not only sentences; one
      `feedback` shape keyed by `(item_type, item_id)`
- [ ] Recordings for words and sentences (the audio question in APP_DESIGN)
- [ ] Owner views: all feedback per item, side by side, verified reviewers marked

## Phase 4: Feedback review subroutine (owner runs it with the agent)
- [ ] Approved script `feedback.py`: export pending feedback for one lesson (or item list) to
      `_agent/feedback/<lesson>.md` / CSV, verified reviewers flagged
- [ ] The agent reviews it and writes decisions (accept correction / keep / needs owner) to a decisions file;
      the owner approves; `feedback.py apply` writes accepted changes to the DB (same conflict check as push),
      sets confidence/source (`native review <reviewer ids>`), and marks the feedback resolved
- [ ] Audio: an accepted recording becomes lesson audio: `item_audio(item_type, item_id, recording_id,
      approved_at)`, copied from the private `recordings` bucket to a learner-readable `audio` bucket. Only
      recordings from verified natives can be accepted.
- [ ] Learner-reported problems ("this looks wrong") feed the same queue

## Phase 5: Learner progress model (schema + RPCs, no UI yet)
- [ ] `lesson_progress(user, lesson, started_at, completed_at)`
- [ ] `learner_items(user, item_type, item_id, level 0–4, FSRS state: stability, difficulty, due, reps, lapses,
      last_review)`
- [ ] `review_log`: every answer (item, activity, direction recognition/recall, correct, rating, latency,
      session). Append-only; the raw material for tuning FSRS later.
- [ ] RPCs: `start_lesson`, `record_answers(batch)`, `complete_lesson`, `due_items(limit)`; RLS own rows only

## Phase 6: FSRS design
- [ ] Where scheduling runs. Recommendation: one small JS module (FSRS-5/6 formulas, default weights) used by
      the client, server re-validates ranges; or the same formulas in plpgsql for a server-authoritative
      schedule. Write it up before coding.
- [ ] Activity outcome → rating: teach card no rating; recognition correct → Good at reduced weight (or a
      separate recognition card); recall correct → Good/Easy by latency; wrong → Again
- [ ] Card granularity: units, words, maybe sentences; Lao→English and English→Lao as separate cards?
- [ ] Ladder (APP_DESIGN levels) gates activity types; FSRS decides timing. No demotion.
- [ ] Daily review session: due items across lessons, capped; suggest a new lesson when the queue is short
- [ ] Later: fit weights offline from `review_log`

## Phase 7: Activity engine
- [ ] Session planner: lesson bundle + learner levels → ordered list of activity specs (show first, test later)
- [ ] Activity registry: each activity is a module `{ type, canUse(item, level), render(root, spec, done) }`
      that builds itself from the bundle and reports an answer object. Same modules serve lessons and reviews.
- [ ] v1 activities: teach card (+ info icon), spot it, multiple choice, matching, flashcards, fill in the
      blank, build the sentence, tone drill
- [ ] Results flushed to `record_answers` in batches (tolerates a dropped connection)

## Phase 8: Learner views
- [ ] Hash router (`#/home`, `#/lesson/L0001`, `#/review`, `#/item/W000123`)
- [ ] Home: path of lessons (locked / next / done), "continue", reviews due count
- [ ] Teach-card viewer for any item (info icon target); settings (respelling/IPA toggles)

## Later
Admin role and in-app owner tools, dialogues, PWA/offline, analytics on drop-off and difficulty, trust scores.

## Open decisions (user)
1. Sentence pool: does the DB own all ~2,800 sentences (one rule for all; natives can still review the
   pool), or only sentences a lesson uses, with the rest staying in CSV and promoted when a lesson picks one?
2. How scripts reach the DB: service-role key in an environment variable (fast, full access), a restricted
   key/role limited to content tables, or SQL files the owner applies by hand (slowest, safest). Also whether
   the unattended lesson runner may push, or pushes wait for the owner.
3. One Supabase project (production) or local Supabase as the working DB with pushes to production.

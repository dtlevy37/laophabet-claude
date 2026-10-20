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
Decided (user, 2026-10-19):
- The schema holds **everything** (all content tables, lessons, units, rules; dialogues later), and everything
  is imported. Content that a lesson plans is DB-master from that moment. Unplanned pool rows may still be
  bulk-refreshed from the CSVs until the CSVs are retired; **a bulk refresh never touches a row that a lesson
  uses** (the generated SQL skips rows referenced by `lesson_items`).
- **Every content change is a SQL migration file the owner reviews and applies** (`supabase db push`). Scripts
  and the unattended runner never connect to the DB. The hosted project is the true master; a local Supabase
  is hosted + pending proposals, used to test them (`supabase db reset`).
- Because every change passes through a file in the repo, the repo can always rebuild the content, and the
  CSVs in `data/` stay the agent's **read model** (working copy = hosted + pending migrations). No pull/push
  over the network.

Starting notes for a fresh session:
- Read first: this section, `_agent/SCHEMA.md` (column specs for units, rules, lessons, lesson_items),
  the docstring of `approved-scripts/lesson_tool.py` (what merge writes today), `app/README.md`.
- Existing migrations: `app/backend/supabase/migrations/` (`..0000_curriculum_tables.sql` defines the content
  tables; latest is `..0600`). Name new ones `YYYYMMDDhhmmss_<name>.sql`, after the latest.
- Seed generator: `app/backend/scripts/generate_seed.py` (`TABLES` spec must match the migration). It is not
  an approved script, so the agent edits it but the user runs it.
- `lesson_tool.py` and `next_lesson.ps1` are approved scripts: write changed versions to
  `_agent/proposed-scripts/` and ask for approval of the whole group at once (CLAUDE.md).
- No lessons exist yet (`data/lessons.csv` absent), so the new tables start empty.
- Shell: no `cd` chaining, no `git -C`; use absolute paths or Read/Grep.

Work:
- [ ] Migration: new tables `units`, `rules`, `lessons`, `lesson_items`; content tables gain `updated_at`
      (+ trigger) and `retired_at` (retire, never delete)
- [ ] Seed generator → initial import uses `on conflict do nothing`; later pool refreshes are generated as a
      migration that skips lesson-referenced rows
- [ ] Lesson merge emits a migration: `lesson_tool.py merge` writes the CSV working copy **and**
      `app/backend/supabase/migrations/<timestamp>_lesson_<id>.sql` (lesson, items, units, rules, plus every
      word/sentence/sentence_words row it uses, upserted), from one script so the two cannot drift.
      `next_lesson.ps1` leaves the migration for owner review; the runner never applies it.
- [ ] Track pending vs applied: `_agent/lessons/PENDING_MIGRATIONS.md` (the runner appends; the owner ticks
      after `db push`), so lesson N+1 can be planned while lesson N awaits approval
- [ ] Feedback decisions (Phase 4) also become migration files
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
- [ ] Getting feedback out: the owner runs a saved SQL query (or `supabase` CLI export) that writes pending
      feedback for one lesson to a file in `_agent/feedback/`, verified reviewers flagged (scripts never
      connect to the DB)
- [ ] The agent reviews it and writes decisions (accept correction / keep / needs owner); an approved script
      turns accepted decisions into a migration that updates the rows, sets confidence/source
      (`native review <reviewer ids>`), and marks the feedback resolved; the owner reviews and applies it
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

## Decisions log
- 2026-10-19: everything goes in the DB; lesson content is DB-master once planned; all content changes are
  SQL migrations the owner applies; hosted Supabase is the master, local = hosted + proposals.

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

## Slices (re-sliced 2026-10-24; this is the working order)
User rule: build small pieces, one slice at a time, stop and check after each. Phases 1–8 below stay as detail
for their topics; each slice names the phase it draws from. Tick here.
- [x] **S1 Approve scripts:** user approves lesson_tool.py, next_lesson.ps1, next_lesson_prompt.md, pipeline.sh
      (proposed-scripts/ → approved). Agent then runs `db_sql.py check` and `seed` (current seeds are the old generator's).
- [ ] **S2 Local backend boots:** supabase CLI and Docker present; `supabase start`, `supabase db reset` applies
      migrations ..0000–..0700 and seeds; existing sign-up and native review flow works in a browser. (Phase 1 test, Phase 2 run)
- [ ] **S3 Lesson 1 (ກິນ):** built interactively with `lesson_tool.py` brief → check → merge; apply its migration;
      `select get_lesson('L0001')` returns the bundle. (2026-10-24: merged; migration `20261025013136_lesson_l0001.sql`
      pending. Left: user applies it locally and runs the get_lesson check.)
- [ ] **S4 Learner read-only view:** hash router, lesson list, lesson page rendering the `get_lesson` bundle as teach
      cards, info-icon card. No scoring. (Phase 8, part)
- [ ] **S5 Progress tables + RPCs (SQL only):** sessions (kind lesson|practice, lesson_id, learner's local day,
      started/completed), lesson_progress, learner_items (level 0–4, no FSRS fields yet), review_log (with session_id
      and lao_word_ids); start_lesson, record_answers, complete_lesson (returns the session summary: words read,
      accuracy, new items, level-ups, streak; APP_DESIGN "Stats and encouragement"). Tested in SQL. (Phase 5)
      **Done when:** after `supabase db reset`, the hand-over SQL block (as a signed-in test user) starts lesson 1,
      records 5 teach-card views (C01 V04 C13 C13f W000018) + 3 answers (ກ right, ◌ິ wrong, ກິນ right), shows 5
      learner_items rows (C01 and W000018 at level 2, the rest at 1), and complete_lesson returns words_read 1,
      accuracy 67, new_items 5, level_ups 2, streak 1; a replayed batch saves 0; an anonymous call fails and
      another user sees no rows. Table is `learner_sessions` (not `sessions`, to stay clear of auth.sessions).
- [ ] **S6 Activity shell + Spot it + Multiple choice + summary screen:** module interface `{type, canUse, render}`,
      minimal session planner, answers sent to record_answers, summary screen after the lesson. Done when a learner
      finishes lesson 1, levels update, and the summary shows words read and % correct. (Phase 7, part)
- [ ] **S7 More v1 activities, two per slice:** matching + flashcards; fill in the blank + build the sentence; tone drill.
- [ ] **S8 Home, path and stats:** locked / next / done, continue; streak, letters known and words known from a
      `learner_stats()` RPC. (Phase 8, rest)
- [ ] **S8b Practice sessions:** `practice_items(limit)` RPC (due by fixed intervals, then weak, then oldest),
      practice mode in the planner (recall first, no teach cards), `complete_practice` summary, Practice button and
      due count on home. Done when a learner with lesson 1 done can run a practice session and see its summary.
- [ ] **S9 FSRS:** design note first, then implement over the fixed intervals. (Phase 6)
- [ ] **S10 Native feedback on lesson content:** native-role checks on review RPCs, queue, word/unit feedback, owner views;
      then the feedback subroutine. (Phases 3–4)
- [ ] **S11 Deploy:** password reset, Netlify, Supabase auth URLs. (Phase 1, rest) Also: frontend `config.js` for
      the deployed site (env vars vs a committed production file; see PLAN Phase 10), and move `LAO_UI_REVIEW.md` and
      `export_lao_review.py` out of the frontend repo before connecting Netlify.
- In parallel from S3: after lesson 1 is reviewed, `next_lesson.ps1 -Count N` in small batches; about 10 lessons are
  enough to build S4–S8 against. Audio is v2 (teach cards use respelling + IPA; audio column nullable).

## Phase 1: Foundation: accounts and roles
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

Work (2026-10-19; written, scripts awaiting approval, nothing run against a DB yet):
- [x] Migration `..0700_lesson_tables.sql`: new tables `units`, `rules`, `lessons`, `lesson_items` (item
      references checked by trigger); every content table gains `updated_at` (+ trigger) and `retired_at`
      (retire, never delete); view `lesson_locked` + `is_lesson_locked(kind, id)`
- [x] Seed generator replaced by `approved-scripts/db_sql.py` (old `generate_seed.py` → `_trash/`):
      `seed` = initial import with `on conflict do nothing`; `refresh` = pool migration via staging tables that
      upserts changed rows, retires missing ones, and skips lesson-referenced rows (in Python and in SQL)
- [x] Lesson merge emits a migration: `lesson_tool.py merge` validates data/ (`db_sql.load`), writes the CSV
      working copy, then `db_sql.lesson_migration` writes `<stamp>_lesson_<id>.sql` from those CSVs (lesson,
      items, units + their letter/vowel rows, rules, words, sentences, sentence_words, target words,
      templates, tone exceptions; changed rows only; self-contained). `next_lesson.ps1` stops if the file is
      missing and commits it for review; the runner never applies it.
- [x] Track pending vs applied: `_agent/PENDING_MIGRATIONS.md` (moved up from `_agent/lessons/` because change
      and refresh migrations are listed too); every db_sql migration appends a line, the owner ticks after
      `db push`
- [x] Feedback decisions (Phase 4) also become migration files: `db_sql.py change --name <n> <ids>`
- [x] `get_lesson(lesson_id)` RPC → JSON bundle (items in order with unit/rule/word/sentence detail via
      `unit_json` … `sentence_json`, distractor pool through lesson `max(order, 5)`). The client never
      assembles a lesson from raw tables.
- [ ] User: approve the script group (db_sql.py new; lesson_tool.py, next_lesson.ps1, next_lesson_prompt.md,
      pipeline.sh changed), then the agent runs `db_sql.py check` and `seed` (seeds are still the old
      do-update ones)
- [ ] User: `supabase db reset` locally (migrations + seeds), then after lesson 1: apply its migration and try
      `select get_lesson('L0001')` as a signed-in user

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

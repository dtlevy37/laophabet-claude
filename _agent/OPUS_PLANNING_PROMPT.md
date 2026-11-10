# Planning session: the learning experience, before more content (for Opus 5.5)

Paste this as the first message of a fresh session, or say "follow `_agent/OPUS_PLANNING_PROMPT.md`".
This is a **planning** session. Do not build app code and do not build lessons. Output is revised plan documents.

## Why this session exists
Four lessons are merged (L0001–L0004) and the user has reviewed them in the browser. What a learner sees today is
teach cards only (slice S4). There is no quiz, no "lesson completed" state, no progress on screen. The plan puts
activities (S6–S8b) after more content is built. The user's fear: building lessons 5+ before the learning experience
is settled forces a refactor of all content. **Lesson building is paused at 4 until this plan is agreed.**

## Read first (fully)
CLAUDE.md, `_agent/PLAN.md`, `_agent/PROGRESS.md`, `_agent/APP_DESIGN.md`, `_agent/APP_PLAN.md` (Slices), `_agent/LESSON_PLAN.md`,
`_agent/SCHEMA.md`. Then selectively: `data/lessons.csv`, `data/lesson_items.csv`, `app/README.md` (RPCs, tables),
`app/frontend/js/` (what exists), `app/backend/tests/s5_progress_test.sql`, the `activity-module` and `app-slice` skills.

## Questions to settle (recommend an answer to each, with a reason; ask the user where it is theirs to decide)
1. **Teach/check order.** All teach cards, then the quiz (current plan) or show a card, check it, next card
   (listed under "Proposed" in PROGRESS)? Consider cognitive load, the ladder (show first, test later) and how a
   lesson's `lesson_items` order maps to a session.
2. **Data the activities need.** Walk each v1 activity in APP_DESIGN "Activities" and list exactly which columns or
   tables it needs. Check them against the merged data: is `sentence_words` enough for fill-in and build-the-sentence?
   Where do distractors come from in lessons 1–5 (pool rule in APP_DESIGN)? Do we need a confusable-sets table now?
3. **What "completed" means.** All cards seen, all quiz answers given, or a minimum accuracy? What does retrying do?
   What does the lesson list show (locked / next / done, accuracy, date)? How does that tie to `learner_sessions`,
   `lesson_progress` and `complete_lesson` already drafted in S5?
4. **"Build the word" in v1?** Assembling ກ + ◌ິ + ນ is the core reading skill. Decide if it moves ahead of the tone
   drill, and what data and UI it needs (syllable parse).
5. **Audio and speaking placeholders.** Recordings are expected from about December 2026 (decision 12). What UI and
   schema hooks should exist now so audio does not force a refactor (nullable column exists; player slot? "Say it"?).
6. **Anything else the user's goal implies** ("a full learning experience, not paged walls of text"): session
   length, feedback after a wrong answer, encouragement, resume after leaving mid-lesson, offline or not.

## Audit existing content against the answers
For L0001–L0004, list every change the agreed design would force (new columns, re-ordered items, added sentences,
rewritten teach text). Prefer a design that needs **no** change to merged lessons. If changes are unavoidable,
say whether `db_sql.py change` or a rebuild is cheaper (nothing is hosted yet, so rebuilding is still allowed;
see "How a lesson gets built" in PROGRESS).

## Deliverables (edit these files; nothing else)
- `_agent/APP_PLAN.md`: re-ordered, re-sliced "Slices" list. Target: the earliest slice that gives **one playable
  vertical slice** (lessons 1–4: teach, quiz, summary, completed tick on the lesson list, progress recorded).
  Each slice has a "Done when" line and a named user gate (apply a migration, approve a script, test in a browser).
- `_agent/APP_DESIGN.md`: update the sections the decisions change; log each decision with the date and "(user)" or
  "(agent recommendation, user approved)".
- `_agent/LESSON_PLAN.md` / `_agent/SCHEMA.md`: only if the lesson format or columns change.
- `_agent/PLAN.md` and `_agent/PROGRESS.md`: tick this item, record the decisions still in force and the next step.
- A short "Content impact" list (what to change in lessons 1–4, or "none"), in PROGRESS.md.
- Stage anything that needs a config or script change in `_agent/proposed-config/` or `_agent/proposed-scripts/`.

## Rules
- Follow CLAUDE.md. You cannot run the app, the DB, supabase, npm or node, and cannot edit `CLAUDE.md`, `.claude/`
  or `approved-scripts/`.
- Use the `researcher` / `scholar` agents for facts (e.g. how comparable apps gate lesson completion, FSRS), not
  from memory. Max 2 subagents at once. Consider `curriculum-reviewer` on the content-impact audit.
- Do not over-engineer: this is an app for a handful of early learners plus native reviewers. Prefer the smallest
  design that does not force content rework.
- Stop after the plan. Hand over: the decisions made, the new slice order, and what the user must approve. Then
  commit a checkpoint (`checkpoint: learning-experience plan`). Do not start building.

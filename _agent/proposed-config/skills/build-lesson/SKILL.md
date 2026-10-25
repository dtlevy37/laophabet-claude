---
name: build-lesson
description: Build the next lesson interactively with the user present — lesson_tool brief, choose items, draft, check, curriculum review, user review, merge (writes the lesson migration), pipeline, commit. Use for any lesson built in chat. The unattended runner uses approved-scripts/next_lesson_prompt.md instead.
---

# Building a lesson with the user

## 1. Brief
- `python approved-scripts/lesson_tool.py brief` writes `_agent/lessons/next-brief.md` (state, ranked candidates,
  recycle list, draft formats). Read it fully, and read `_agent/LESSON_PLAN.md` (decisions and budget) and
  APP_DESIGN "What a lesson must contain".
- Check fixed decisions in LESSON_PLAN (lesson 1 ກິນ, lesson 2 ເຂົ້າ "rice", ລາວ in lesson 3 or later). They
  override the brief's ranking.
- Look up instead of reading data whole: `lesson_tool.py lookup <lao|id>`, `lesson_tool.py can-read "<spaced words>"`.

## 2. Propose before drafting
Give the user a 5–8 line proposal: new units/rules (with role), new words, recycled words, the payoff phrase or
sentence, and anything doubtful (missing words.csv rows, a homograph, a tone point not yet taught). Mention 1–2
alternatives if the choice is close. Wait for their answer.

## 3. Draft
- Missing words or new sentences: the `draft-content` skill (tag `L<nnnn>`), merged before the lesson draft.
- Write `_agent/lessons/drafts/next/` (lesson.csv, items.csv, units.csv, rules.csv; formats at the end of the brief).
  Item order is teaching order: each new unit, then the words that use it, then sentences.
- `teach_en`: 1–3 short sentences for an English speaker: what they see, what it sounds like (from pron_tip in
  letters.csv / vowels.csv), and the tone point if it matters now. Only claims those files and SCHEMA.md support.
  Explain any term (class, dead syllable) the first time, or leave it out.

## 4. Check and review
- `python approved-scripts/lesson_tool.py check` until 0 errors (warnings about unverified rows are expected).
- Run the `curriculum-reviewer` agent on `_agent/lessons/drafts/next/`. Fix blockers and majors.
- Show the user the teach texts, words and sentences (compact table) with the reviewer's open points, and wait for
  approval.

## 5. Merge
- `python approved-scripts/lesson_tool.py merge` appends to data/ and writes
  `app/backend/supabase/migrations/<stamp>_lesson_<id>.sql` (listed in PENDING_MIGRATIONS.md by db_sql). Never edit it.
- `bash approved-scripts/pipeline.sh`: 0 errors.
- CHANGELOG entry; PROGRESS only if something is open; `git add -A`, `git commit -m "checkpoint: lesson <id> (<title>)"`.
- Hand-over: the migration file to apply (`supabase db reset` locally), and the route to view it
  (`#/lesson/<id>`).

## Batches from the runner
After the user runs `next_lesson.ps1 -Count N`: run the `curriculum-reviewer` agent on the new lesson IDs together
(pacing across lessons), summarise its findings for the user, and fix accepted points with
`db_sql.py change` migrations (lesson rows are DB-master; never hand-edit migrations).

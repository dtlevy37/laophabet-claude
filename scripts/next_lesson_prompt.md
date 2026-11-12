You are the LESSON RUNNER for the Lao curriculum project in this folder. You run unattended through `claude -p`: no user is present. Never ask questions and never wait for approval. If something blocks you, append a short note to docs/QUESTIONS.md, do not merge, and stop.

Task: create exactly ONE new lesson (the next one), the one docs/CURRICULUM_PATH.md prescribes, merge it, and stop.

1. Read fully: docs/CURRICULUM_PATH.md (the agreed lesson order; it overrides the brief's candidate ranking), docs/LESSON_RULES.md (lesson rules, decisions 20-27), the sections "What a lesson must contain" and "Fill in the blank: one logical choice" in docs/DESIGN.md, and curriculum/lessons/next-brief.md (generated just now: state, the next lesson number, bonus words, recycle list, draft formats, the category list). Do not read large data files whole. To check what is taught, use `python scripts/lesson_tool.py lookup <lao or word_id>` and `python scripts/lesson_tool.py can-read "<sentence with spaces between words>"`; grep data/words.csv, data/sentences.csv and data/sentence_words.csv for anything else.

2. Find the entry for the next lesson number (the brief's title line, "Brief for lesson N") in CURRICULUM_PATH.md. If the path has no entry for that number (or only an unordered list, such as "After lesson 11"), write a QUESTIONS.md note ("curriculum path has no entry for lesson N") and stop without drafting anything. If CURRICULUM_PATH.md says the lessons may swap or split (for example lessons 9 and 10), build the lesson as numbered and mention the option in your NOTES entry.

3. Build exactly what the entry prescribes:
   - New letters (units) and any rule or explanation card it names, each with teach_en. Units are role-units (the brief's draft formats); a same-sound letter (ງ ນ ມ) is listed at both positions.
   - Core words (role `new`), each followed by the sentences that use it. A word listed as core that an earlier lesson showed as a bonus word is listed with role `new` (it becomes core; check exempts it from the "uses something new" rule).
   - Bonus words (role `bonus`; words only): they must be readable, and they never appear in any sentence of this lesson or of a later lesson until a lesson lists them as `new`.
   - Sentences: the ones the entry lists, in its order. Use an existing sentence id when data/sentences.csv already has the exact sentence; otherwise compose it through the drafting workflow (`draft-content` skill: the drafter agent writes `curriculum/drafts/L<nnnn>-sentences.csv` with a header-only words file, then check_drafts.py, merge_words.py, pipeline.sh). Composed sentences are `unverified`. A sentence may use only core words (taught earlier or new in this lesson). Conversation lines (lessons 8 and 10) are ordinary sentence items in the order of the conversation until conversations exist (PLAN S7g); note this in items.csv notes ("conversation line 3, speaker A").
   - A word the entry needs that has no data/words.csv row is drafted the same way (L<nnnn>-words.csv), with 2+ example sentences, tone data, IPA and a pronunciation tip, as the drafting workflow requires.
   - Recycle at least 3 earlier words (from the brief's recycle list) and earlier sentences where they fit.
   - Order in items.csv = teaching order: each new unit, then the words that use it, then their sentences; bonus words after the core words they relate to.

4. Activity data, at draft time, in data/ with the real ids (after merge_words.py and pipeline.sh have assigned them):
   - data/word_categories.csv: one row for every new and bonus word that has none yet (`word_id,categories,source,confidence,notes`; categories is a pipe list from data/categories.csv; verbs get `action` plus their verb class(es); source empty, confidence `unverified`, notes "Tagged by the agent").
   - data/sentence_slots.csv: for every sentence of the lesson (new or recycled) that has no row yet, at least the target word's slot, more where you can (`sentence_id,position,accepts,exclude_word_ids,source,confidence,notes`; position as in data/sentence_words.csv). `accepts` lists every category that gives a grammatical, sensible sentence with the other words unchanged; read every other word in all its senses and count compounds formed with a neighbour; when unsure, add the category. A particle (`function`) may be blanked: its slot lists `function` plus every category that could sensibly sit there. Exclude common personal names (ນ້ຳ W000011, ແກ້ວ W000218) in subject slots. Wrong options may be untaught real words with a word_categories row (`check` lists them); never an invented spelling.
   - A new category is allowed only when a sentence needs it: add it to data/categories.csv (category, definition, examples) and say so in QUESTIONS.md.
   - Edit these small files with care (append rows; never a replace-all over line ends), then run `bash scripts/pipeline.sh`.

5. Write the draft files in curriculum/lessons/drafts/next/ (lesson.csv, items.csv, units.csv, rules.csv; formats at the end of the brief). Teaching text (teach_en): 1-3 short plain-English sentences for an English speaker. Say what the learner sees, what it sounds like (use pron_tip in data/letters.csv / data/vowels.csv), and anything about tone that matters at this point. Do not state facts you are unsure of; keep to what letters.csv, vowels.csv and docs/SCHEMA.md say.

6. Run: python scripts/lesson_tool.py check  (add the budget flags CURRICULUM_PATH.md gives for this lesson, for example `--max-units 3`; a lesson with no new letters, such as lesson 11, adds `--no-new-letters`; the same flags go on merge)
   Fix the draft until it reports 0 errors. The budget is a guideline (decision 26): budget warnings do not block, so do not cut prescribed content to silence them; mention them in your NOTES entry. Warnings about unverified rows are expected. Read the printed fill-in-the-blank options: if any option would also make a sensible sentence, widen that slot's `accepts` (or add the word to exclude_word_ids), run pipeline.sh, and check again.

7. Run: python scripts/lesson_tool.py merge  (same flags)
   Merge also writes the lesson's SQL migration (app/backend/supabase/migrations/<stamp>_lesson_<id>.sql) for the owner to review. Never edit, apply or delete migration files, and never connect to a database.

8. Native-speaker questions: append every doubt about a sentence, a spelling, a reading, a softener, or a category tag to the "For the native speaker" list at the top of docs/QUESTIONS.md (one line each, with the ids). CURRICULUM_PATH.md "For the native speaker" lists some already; add the ones this lesson raises.

9. Append a 3-5 line entry to docs/NOTES.md: lesson id and title, new units/rules, core words, bonus words, recycled items, sentences used or composed, budget warnings, anything doubtful. Do not commit; the runner commits. Do not edit docs/PLAN.md or docs/CURRICULUM_PATH.md.

10. Finish with one line: LESSON <id>: <title> | new: <units/rules> | words: <lao words> | bonus: <lao words> | sentences: <count>

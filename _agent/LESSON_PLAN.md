# Lesson design and build plan (2026-10-19, rev 1)

Goal: turn the existing data (letters, vowels, ~1400 words, ~2800 sentences, 1617 common words, the letter map)
into an ordered series of short lessons. Material is filled in after the lessons are mapped, from the database,
not before (user, 2026-10-19). Phase 7 (growing to 3000 words) stays paused.

## Decisions (user, 2026-10-19)
1. **Lesson size:** a lesson takes 5–10 minutes, and most learners do one a day. A lesson has about 3–4 new items.
   Learners who study longer just do several lessons in a row.
2. **Items:** a consonant, a vowel pattern, a tone mark, a rule (tone class, dead syllables, final sounds, ...) or a
   word. Vowels, tone marks and rules count as items in their own right, not as extras alongside consonants.
3. **No review lessons.** Every lesson re-shows earlier material (recycled words, phrases, sentences), and the app
   offers other activities such as flashcard review.
4. **Spaced repetition is the app's job** and should track how well each learner knows each item (some words stick,
   others don't). The data gives the order and the item IDs. The scheduler is app-side (see "App side" below).
5. **Lesson 1 is ກິນ "eat"** (changed 2026-10-24 from ລາວ). Its units are ກ (initial) + ◌ິ + final ນ: a plain live
   syllable and a verb that makes sentences possible early (ກິນເຂົ້າ, ກິນປາ). ລາວ (the language, the people, the
   country, he/she; units ລ + ◌າ + final ວ) becomes a lesson 2 or 3 payoff. ພາສາລາວ, ຄົນລາວ and ປະເທດລາວ follow as
   soon as their units are in.
6. **Earlier exclusions are lifted in stages** (my proposal, user agreed):
   - ດ and ບ as initials from the start, because they sound plain there; their final sounds (t, p) are a later rule lesson.
   - ອ early, as its own rule lesson (silent carrier; needed for ຂ້ອຍ and vowel-initial words).
   - ຍ, ວ and ຫ by about lessons 8–12. Final ວ comes in with ລາວ (lesson 2 or 3).
7. **Sentences come as early as is realistic,** then question and answer pairs, then short dialogues on a topic.
8. **Targeting specific words is not the aim at this stage** (except ກິນ and ລາວ); the aim is common, useful words.

## Unit order guide (2026-10-24)
`_agent/letter_map/lesson_rules/chain.csv` (greedy chain from the old base ລາວ, 30 steps, ~362 readable common words) is the
advisory unit order. It predates the switch to ກິນ as lesson 1; `lesson_map.py` takes its base from lesson_tool's
FIRST_UNITS, so a chain-only rerun (seconds) gives a ກິນ-based chain once the new lesson_tool is approved. The exhaustive search (k4–k11) beat it by only one word at k8 and k9, so it was not pursued
further. `lesson_tool.py brief` still ranks candidates each lesson; the chain is a tiebreaker, not a rule.

## Lesson model
- **Units carry a role.** The same glyph can have several roles, and each role is learned separately: ດ-initial
  and ດ-final, ວ-final, ວ-initial and ວ in a vowel, ອ as carrier and ອ in a vowel, ຫ as h and as silent tone leader.
  This replaces the exclusion list. The planner orders role-units; it does not ban glyphs.
- **Budget per lesson** (planner defaults; tune after looking at the first 20 lessons):

  | Lesson | New units / rules | New words | Recycled |
  |---|---|---|---|
  | 1 | 3 (ກ ◌ິ ນ-final) | 1 (ກິນ) | none |
  | Normal | 1–2 | 2–3 | 4–8 earlier words, in phrases once possible |
  | Rule lesson | the rule + at most 1 unit | 1–2 words that show the rule | words that contrast the rule |

  Weights: consonant 1, vowel pattern 1.5, tone mark or rule 2, word 1. A lesson's new-item weight is about 4–5.
- **Every new word contains at least one new unit or rule** of that lesson or the previous one, so new letters get practice.
- **Word choice:** only readable words (signature ⊆ units learned so far). The usefulness weight favours words that
  build sentences: pronouns, core verbs, ບໍ່, question words, ແມ່ນ, ນີ້, ມີ, then everyday nouns. Category in
  common_words.csv gives a first weight; the agent can adjust single words.
- **Recycling:** the planner lists, for each lesson, which earlier words it reuses (oldest or least recently shown
  first). The app's scheduler can override this per learner.

## Sentence stages
1. **Phrases** (about lesson 5 on): noun + describing word (ປາໃຫຍ່), verb + noun (ກິນປາ).
2. **Simple sentences:** pronoun + verb (+ object), with ບໍ່.
3. **Question and answer pairs:** ບໍ / question words; e.g. ເຈົ້າໄປໃສ? / ໄປນາ.
4. **Dialogues:** 4–6 lines on a topic (weather, school, market, family). Needs the dialogue tables below.
- Sources of sentences: existing sentences.csv first (a sentence fits a lesson when every word in it is
  readable by then); then new composed ones, which stay `unverified` until a native speaker reviews them.

## Build steps (Phase 9 in PLAN.md)
1. Notes updated (this file, PLAN, PROGRESS, SCHEMA).
2. Finish the k ≤ 10 letter-map run (`_agent/letter_map/k10/`) and keep it as the reference for early unit order.
3. **One lesson at a time** (revised 2026-10-19; replaces a whole-course planner). Scripts proposed together:
   - `lesson_tool.py`: `brief` (state + ranked candidates for the next lesson), `check` (budget, readability,
     teach texts, recycling, lesson 1 fixed), `merge` (appends to data/lessons.csv, lesson_items.csv, units.csv,
     rules.csv), `status`. Role-unit IDs are derived from parse_syllable, so no hand-made units table is needed.
   - `next_lesson.ps1` + `next_lesson_prompt.md`: the user runs it; per lesson it writes the brief, starts a fresh
     `claude -p` session that drafts, checks and merges one lesson, then runs the pipeline and commits.
     `-Count N` builds N lessons in a row; it stops at the first failure or if `_agent/BLOCKED` exists.
4. **Build lesson 1 (ກິນ) interactively** with the user present, as the reference for the runner.
5. **Review the first ~10–20 lessons with the user** and tune budget, weights and the runner prompt.
6. **Gaps are filled per lesson:** a lesson word with no words.csv row is drafted in that lesson's run (drafting
   workflow), as are new phrases and sentences.
7. **Dialogues:** add the tables and a `dialogue` item type once Q&A pairs exist.
8. **Postgres:** schema and import for all data tables, lessons and the app-side learner tables.
9. Later: grow vocabulary and lessons from the database (Phase 7 resumes as needed).

## App side (notes for later; not CSV)
- Per learner and item: memory state (difficulty, stability), due date, reps, lapses, last review, last grade.
  An FSRS-style scheduler models exactly "some words stick": difficulty is learned per item and per learner.
- The data provides stable item IDs (unit, rule, word, sentence, dialogue) and the lesson order; the app records reviews.

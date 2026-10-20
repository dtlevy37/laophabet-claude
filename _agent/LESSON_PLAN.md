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
5. **Lesson 1 is ລາວ** (Lao: the language, the people, the country, and the pronoun he/she). Its units are
   ລ + ◌າ + final ວ. ພາສາລາວ, ຄົນລາວ and ປະເທດລາວ follow as soon as their units are in.
6. **Earlier exclusions are lifted in stages** (my proposal, user agreed):
   - ດ and ບ as initials from the start, because they sound plain there; their final sounds (t, p) are a later rule lesson.
   - ອ early, as its own rule lesson (silent carrier; needed for ຂ້ອຍ and vowel-initial words).
   - ຍ, ວ and ຫ by about lessons 8–12. Final ວ comes in at lesson 1 only through ລາວ.
7. **Sentences come as early as is realistic,** then question and answer pairs, then short dialogues on a topic.
8. **Targeting specific words is not the aim at this stage** (except ລາວ); the aim is common, useful words.

## Lesson model
- **Units carry a role.** The same glyph can have several roles, and each role is learned separately: ດ-initial
  and ດ-final, ວ-final, ວ-initial and ວ in a vowel, ອ as carrier and ອ in a vowel, ຫ as h and as silent tone leader.
  This replaces the exclusion list. The planner orders role-units; it does not ban glyphs.
- **Budget per lesson** (planner defaults; tune after looking at the first 20 lessons):

  | Lesson | New units / rules | New words | Recycled |
  |---|---|---|---|
  | 1 | 3 (ລ ◌າ ວ-final) | 1 (ລາວ) | none |
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
3. **Units table:** `data/units.csv` with role-units (letter or vowel + role) and `data/rules.csv`. Small, hand-made.
4. **Propose `lesson_plan.py`:** role-unit signatures, lesson 1 fixed, budget and weights above, readable-word and
   readable-sentence checks, recycling lists. Output drafts to `_agent/lessons/` (lessons.csv, lesson_items.csv,
   plus a readable report). User approves the script.
5. **Review the first ~20 lessons with the user** and tune budget and weights.
6. **Fill gaps for the planned lessons only:** lesson words with no words.csv row get full rows (IPA, tones,
   sentences) through the drafter, in small batches (see the efficient-drafter TODO in PROGRESS.md).
7. **Sentences per lesson:** pick readable sentences; compose phrases and Q&A pairs where missing; add dialogues.
8. **Postgres:** schema and import for all data tables, lessons and the app-side learner tables.
9. Later: grow vocabulary and lessons from the database (Phase 7 resumes as needed).

## App side (notes for later; not CSV)
- Per learner and item: memory state (difficulty, stability), due date, reps, lapses, last review, last grade.
  An FSRS-style scheduler models exactly "some words stick": difficulty is learned per item and per learner.
- The data provides stable item IDs (unit, rule, word, sentence, dialogue) and the lesson order; the app records reviews.

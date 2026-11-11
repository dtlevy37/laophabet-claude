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
5b. **Lesson 2 is ເຂົ້າ "rice" (W000019, kao)** (user, 2026-10-24). Teach the 'rice' meaning only (the 'enter' sense
   shares the spelling and waits). New units: ຂ (C02, high-class initial), ເ◌ົາ (V35) and the tone mark ◌້ (T2), plus the
   tone rule they need (high class + live + mai tho → low-falling) if it fits the budget. Payoff: the first sentence,
   ກິນເຂົ້າ "eat (a meal)", from lesson 1's ກິນ. ລາວ moves to lesson 3 or later.
6. **Earlier exclusions are lifted in stages** (my proposal, user agreed):
   - ດ and ບ as initials from the start, because they sound plain there; their final sounds (t, p) are a later rule lesson.
   - ອ early, as its own rule lesson (silent carrier; needed for ຂ້ອຍ and vowel-initial words).
   - ຍ, ວ and ຫ by about lessons 8–12. Final ວ comes in with ລາວ (lesson 2 or 3).
7. **Sentences come as early as is realistic,** then question and answer pairs, then short dialogues on a topic.
8. **Targeting specific words is not the aim at this stage** (except ກິນ and ລາວ); the aim is common, useful words.
9. **Teach texts are one line** (user, 2026-10-24; card layout in APP_DESIGN "Teach cards"). units/rules teach_en is
   the card's front: a sound cue ("Sounds like the g in 'get'") plus at most one sentence of essential context. No
   IPA, class, length or letter names in it (the card's "More" section shows those from letters/vowels). Lesson
   titles and summaries are short and do not name the lesson's word before its card, and are not shown on cards.
10. **Same-sound letters are taught at both positions at once** (user, 2026-10-24). ງ ນ ມ sound the same at the
   start and the end of a syllable (ipa_initial = ipa_final, no "(final x)" respelling), so their initial and final
   units are new in the same lesson, count as one unit, and share one card whose text covers both positions.
   Letters that change at the end (ກ ດ ບ ຍ ວ ...) keep separate role-units. Enforced by lesson_tool check (rev
   pending approval, 2026-10-24). L0001 now teaches C13 + C13f.

11. **Natural learning first; rules are a backup** (user, 2026-11-09). The learner should absorb tones and spellings
   by meeting words again and again, not by memorising rules and applying them. A tone mark is first taught as
   "changes the melody of the word", and each word's tone is learned with the word (tone picture, later audio).
   Rules (consonant classes, dead syllables) come later, once contrast pairs exist, as short "there is a pattern
   here" cards that help when the learner keeps getting an item wrong. Lesson 2 teaches ◌້ this way, with no rule.
12. **Audio: build as if native recordings exist** (user, 2026-11-09). The first user is the owner, and a native
   speaker is expected to be available from about December 2026. Lessons and UI keep audio slots and play buttons
   (hidden or disabled while empty); listening and tone-by-ear activities wait for the recordings. No TTS.

13. **Two transliteration styles; teach texts must work in both** (user, 2026-11-09). The app shows respellings in
   the learner's chosen style: **Standard** (default: ກ k, ຂ/ຄ kh, ປ p, ຜ/ພ ph, ຕ t, ຖ/ທ th, ຈ ch) or
   **English-style** (ກ g, ຂ/ຄ k, ປ bp, ຜ/ພ p, ຕ dt, ຖ/ທ t, ຈ j). Everything else is the same in both (ວ w, ຊ s,
   ເ◌ົາ always "ao"). The data keeps storing the English-style respelling (SCHEMA "Learner respelling scheme"); the
   app converts it for display (`app/frontend/js/translit.js`). So a teach text never names a respelling letter as
   the sound ("sounds like g"): it cues with an English example word and describes the sound, e.g. "Like the k in
   'sky': a k with no puff of air." Never write respellings of Lao words inside teach texts, titles or summaries.

14. **Lesson 3 is ລາວ** (user, 2026-11-09): ລ, ◌າ, final ວ; the word ລາວ as "he, she" (the everyday word; W000031)
   with "Lao" (W000058) on the same card; first full sentence ລາວກິນເຂົ້າ. A first lesson-3 draft with ເຂົາ and ເກົ້າ
   was withdrawn.
15. **Look-alikes wait until the first one is solid** (user, 2026-11-09). A word that differs from a taught word only
   by a tone mark or one small sign (ເຂົາ vs ເຂົ້າ) is not introduced in the next lessons. Let the first word come
   back in several lessons, then bring in the second as a deliberate contrast. ເຂົາ is glossed "they" first (the
   user has only heard it as they/them; ລາວ is the everyday he/she): confirm with the native speaker.
16. **Translations show alternatives, never "or"** (user, 2026-11-09). `sentences.english` is the natural
   translation. Alternatives are separated by " / " and shown one per line: "He eats. / She eats." No "literally"
   clause: the word chips under the sentence give the word-by-word meaning. Brackets only for a real nuance:
   "To eat (a meal)."
17. **From lesson 4 on: fewer new letters, more words** (user, 2026-11-09), so sentences come earlier. Prefer
   lessons with 0–1 new units and 2–3 new words built from known letters, as soon as enough letters exist.
   Choose very common words over merely readable ones: ນ້ຳ "water" yes, ນາ "rice field" no; ຂາ "leg" and ຂາວ
   "white" are fine. Likely lesson 4: ◌ຳ → ນ້ຳ, ກິນນ້ຳ, plus ຂາ / ຂາວ from lesson 3's ◌າ. The user will suggest
   early words too; propose candidates and let them pick.

18. **Explain apparent contradictions; recap cards** (user, 2026-11-09). A learner who half-remembers something and
   then sees what looks like a contradiction, with no explanation, gets confused. When the same shape or spelling
   turns up with a different job (the stroke າ in ◌າ, ເ◌ົາ and ◌ຳ; one word with two meanings; one letter with two
   sounds), add a short recap card that shows the cases side by side, as soon as all of them have been taught. A
   recap is a `rule` item (R02 "One shape, three vowels" in lesson 4 is the model; R01 stays reserved for dead
   syllables) and needs `--max-weight` raised on check/merge, since it is a reminder, not new load. Its `teach_en`
   is one or two sentences, then one row per case: `prose || Lao | sounds like | cue || Lao | sounds like | cue`.
   The app shows the rows as a table. Every row repeats the sound itself ("aa"), not only the example word: a
   learner who has forgotten the sound gets nothing from "as in 'father'" alone (user, 2026-11-09). The same
   applies to any card that refers back to an earlier item.
19. **Lesson layout and reading load** (user, 2026-11-09). A new unit's card is followed directly by a word that
   uses it; words that need nothing new go in their own block first ("words you can already read"). Early cards
   may carry up to a short paragraph when they explain how the app works (motivated learners read it); later
   lessons carry less reading and more exercises.

20. **The path is planned backwards from natural sentences and conversations** (user, 2026-11-10). Order:
   letters → words → sentences → conversations and stories. Pick the next thing a person would really say, then
   add the letters it needs; never a forced sentence because its words happen to be readable. **The agreed order
   for lessons 4–11 is `_agent/CURRICULUM_PATH.md`: read it before building any of those lessons and follow it**
   (it overrides the brief's ranking and the chain). In short: 5 ແລ້ວ · 6 ບໍ່, ຂໍ, ແນ່ · 7 ດີ, ນີ້ · 8 ສະບາຍດີ ·
   9 ຫິວ, ເຈົ້າ · 10 ຂ້ອຍ, ນອນ + the first full conversation · 11 no new letters (ສີ, ຂາວ, ດຳ, ຂາຍ, ນ້ອຍ).
   Then ມີ/ມາ, ອາຫານ/ເອົາ, ຢາກ, ມັກ, ຄົນ with a "three k letters" recap card (ກ ຂ ຄ), ໃຫຍ່.
21. **Core words and bonus words** (user, 2026-11-10). Core words are used in sentences. A bonus word is readable
   with the letters known, common, shown in the lesson under a "bonus" label (one or two per lesson), never used
   in a sentence, and available in practice alongside core words. A bonus word becomes core the first time a
   lesson uses it in a sentence: as we go when a lesson has room, or several at once in a lesson with no new
   letters (a review of letters that still brings new content). Needs the `bonus` role (APP_PLAN S7f).
22. **Lesson 4 changes** (user, 2026-11-10): the sentence ລາວຂາວ is removed; ຂາ is the lesson's bonus word; ຂາວ
   moves to lesson 11 with ສີ. Lessons 1–3 stay as they are.
23. **Conversations are canned content** (user, 2026-11-10): a fixed, ordered set of lines shown as a
   conversation, followed by fill in the blank (one logical answer) on those lines. First ones: lesson 8 (hello,
   how are you) and lesson 10 (hello, are you hungry, I've eaten already). Needs APP_PLAN S7g.
24. **Real spoken Lao over tidy Lao** (user, 2026-11-10): teach the natural form even when slightly irregular,
   when the sentence is real and useful. A request is ຂໍ … ແນ່ (the softener the user hears; the pool has ແດ່:
   native-speaker question).
25. **The cut-off (dead syllable) card is one brief line** (user, 2026-11-10), first needed for ສະ in lesson 8.
   No rule to memorise (decision 11).

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

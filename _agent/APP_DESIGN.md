# App design: activities and presentation (draft, 2026-10-19)

Scope: what the learner does in the app and what data each activity needs. The data project (this folder)
supplies the content; the app chooses activities per learner. See `_agent/LESSON_PLAN.md` for lesson rules.

## Core principle: show first, test later (user, 2026-10-19)
Never test an item the learner has not been shown and had explained. Each item (unit, rule, word, sentence)
climbs a ladder per learner, and an activity may only use items at or above the level it needs:

| Level | Name | How the item reaches it | Activities allowed |
|---|---|---|---|
| 0 | unseen | — | none |
| 1 | introduced | a teach card was shown (glyph or word, sound, meaning, explanation, example); it stays reachable through the info icon | the teach card itself, then a "spot it" check with the answer still visible |
| 2 | recognised | answered correctly in a recognition activity | Lao → meaning or sound: matching, multiple choice, flashcards (front = Lao) |
| 3 | recalled | answered correctly in a recall activity | meaning → Lao: multiple choice with close distractors, fill in the blank, build the word, build the sentence, flashcards (front = English) |
| 4 | in use | read correctly inside phrases, sentences and dialogues over several days | dialogues, longer reading, spaced reviews only |

- A lesson first teaches its new items (level 0 → 1), then practises them right away at level 2, mixed with
  recycled items at levels 2–3. Recall activities for a new item normally start in a later session.
- **Distractors** (wrong options in multiple choice and matching): the *tested* item must always have been
  taught, but wrong options may also come from nearby lessons, because early on the learner knows too few items
  to fill four options. In lessons 1–5, distractors may come from any of lessons 1–5. From lesson 6 on, distractors
  come only from items already taught (user, 2026-10-19).
- **Info icon instead of demotion** (user, 2026-10-19): items never drop a level. Every item, everywhere it
  appears (activities, feedback after a wrong answer, sentences, flashcards), has a small info icon that opens
  its original teach card: glyph or word, sound, meaning, explanation, example words, and the lesson it came from.
  After a wrong answer, the feedback screen shows the correct answer with the info icon. No new data needed: the card
  is built from units.teach_en / rules.teach_en, letters/vowels pron_tip, words gloss/respelling/pron_tip, and the
  intro lesson in lesson_items.csv.
- Spaced repetition (FSRS-style, per learner and item) decides what comes back and when. Each answer updates the
  item's memory state, and recall answers count for more than recognition answers. A failed item simply comes
  back sooner. This is how the app learns which words stick for which learner.

## Teach cards (user, 2026-10-24)
A new learner is overwhelmed by text, so a card shows only what it teaches.
- **Lao first** (user, 2026-11-09): the Lao glyph or word is the largest thing on the card and sits on its own row at
  the top; the English cells ("Sounds like", "Means", tone) go below it, smaller. This also fits a phone screen.
- **Layout:** a small table. Small labels over large content: `Lao letter | Sounds like` (ກ | g), then one hint
  line under it ("A hard g, as in the word 'get'."). Words: `Lao word | Sounds like`, then `Means` and `Tone`. The
  sound value comes from letters/vowels respelling (a final takes the "(final x)" part). No lesson title on the cards.
- **Front:** the glyph or word; its sound as a simple English cue ("A hard g, as in the word 'get'"); the meaning for
  words (common senses together are fine: ກິນ "eat; drink"); at most one sentence of essential context ("Written
  above the consonant, but said after it"); for words, a tone picture per syllable (a pitch line on a 5-level
  scale, `js/tone.js`), not tone names.
- **Behind "More"** (closed on the card, open in the info dialog): IPA, consonant class, vowel length, role label,
  tone names in words, part of speech, classifier, the longer pron_tip.
- **Never shown before it is taught:** a letter's name word (ໄກ່ "chicken" for ກ), example words that come later
  in the lesson, or a lesson title/summary that gives the lesson's word away.
- units.teach_en / rules.teach_en hold only the front text: one or two short sentences.

## Activities

| Activity | What it looks like | Tests | Data it needs | When |
|---|---|---|---|---|
| Teach card | front: glyph or word, sound cue, meaning, at most one sentence, tone picture for words; the rest behind "More" (see "Teach cards" below) | nothing (show) | units.teach_en, rules.teach_en, letters/vowels pron_tip, words gloss/respelling/pron_tip, audio | v1 |
| Spot it | "Which of these is ລ?" with the card still visible | level 1 | same | v1 |
| Matching | tap pairs: Lao ↔ English, Lao ↔ respelling, letter ↔ sound | recognition | words, units | v1 |
| Multiple choice | Lao → pick meaning; meaning → pick Lao; sound → pick letter | recognition or recall | words, units, confusable sets | v1 |
| Flashcards | self-graded (again / hard / good / easy); Lao front first, English front later | recognition, then recall | words, sentences | v1 |
| Fill in the blank | sentence with one gap; pick the word from tiles | recall in context | sentences, sentence_words | v1 |
| Build the sentence | put word tiles in order to match the English | recall, word order | sentences (lao_spaced), sentence_words | v1 |
| Tone drill | see a syllable, pick its tone; later, apply the rule (class + live/dead + mark) | rules | words.tone_by_syllable, tone_derivation, rules | v1 |
| Build the word | tap letter and vowel pieces into place (shows where vowels sit) | spelling recognition | units, syllable parse | v2 |
| Listen and choose | hear audio, pick the word | listening | audio per word and sentence | v2 (needs audio) |
| Dialogue reader | line by line, tap for translation, then comprehension questions | reading in context | dialogues, dialogue_lines, sentences | v2 |
| Say it | hear, record yourself, play both back, grade yourself | speaking (self-graded) | audio | v2 |
| Speech recognition | app grades pronunciation | speaking | Lao ASR (very hard; not planned) | later / maybe never |
| Typing Lao | keyboard input in Lao script | writing | Lao keyboard | out of scope (writing is out of scope) |

## Practice sessions (user, 2026-10-24)
Lessons introduce material; practice sessions make the learner recall what they already know.
- **No new items and no teach cards.** The info icon still opens any item's teach card.
- Available once lesson 1 is done. The home screen shows a Practice button and the number of items due.
- **What comes up:** introduced items only (level ≥ 1). Due items first (FSRS from S9; before that, fixed intervals
  such as 1, 3, 7, 14 and 30 days), then weak items (wrong recently), then the least recently seen.
- **Recall first:** items at level ≥ 2 get recall activities (meaning → Lao, fill in the blank, build the sentence);
  level-1 items get recognition activities so they can climb. Mixed activity types; never the same item twice in a row.
- **Length:** about 15–20 answers (about 5 minutes) by default. The learner can stop early and still gets the summary.
- Practice answers count for levels and scheduling exactly like lesson answers.

## Stats and encouragement (user, 2026-10-24; definitions confirmed)
Shown on the home screen and after every lesson or practice session, to keep learners coming back. The DB computes
every number from `review_log`, `learner_items` and sessions, and RPCs return them; the client never counts on its own.
- **Streak:** consecutive days, in the learner's local time zone, with at least one completed lesson or practice
  session. Before today's session, the home screen still shows yesterday's streak with a "keep it going" nudge. A
  missed day resets it to 0. (Streak freezes: later, maybe.)
- **Letters known:** distinct Lao glyphs (consonants, vowels, tone marks) with at least one role-unit at level ≥ 2
  (recognised). ດ as an initial and as a final count once. One number, no breakdown (user, 2026-10-24).
- **Words known:** words at level ≥ 2. A later "mastered" count can use level ≥ 3.
- **Session summary** (returned by `complete_lesson` / `complete_practice`):
  - *words read*: Lao words the learner had to read to answer, counting repeats (each answer reports its
    `lao_word_ids`). Repeats count (user, 2026-10-24): it appears only in the end-of-session summary, and its job
    is to hype the learner up.
  - *accuracy*: answers correct on the first try ÷ answers (teach cards excluded), e.g. "80% correct".
  - new items learned (lessons), items that moved up a level, and the streak including today.
  - One encouraging line chosen by thresholds. Never shaming: a low score gets "these will come back soon" framing.

## Presentation
- Lao script is always the main text. Respelling and IPA can be toggled; respelling fades as the learner advances
  (a setting, default on for the first lessons).
- Sentences show `lao_spaced` (spaces between words) as a reading aid. Spaces on or off is a site-wide learner
  setting (Settings in the top bar; `js/settings.js`, remembered per browser), not a per-card switch (user, 2026-11-09).
- Lao is set in a looped typeface (Noto Sans Lao Looped): the loops are what learners meet in print and on signs
  (user, 2026-11-09).
- **Transliteration is a learner setting** (user, 2026-11-09; LESSON_PLAN decision 13): Standard (k, kh; default) or
  English-style (g, k). The data stores the English-style respelling; `js/translit.js` converts it for display
  (initial consonants only). Every place that shows a respelling goes through `respell()`. Known gap: `pron_tip`
  texts (under "More") are stored prose and may quote English-style spellings.
- **Lesson 1 opens with one intro card** (app text, not lesson content): Lao has sounds English lacks, so the
  English letters are only hints. **The transliteration choice sits on the first letter card (ກ)**, under the
  hint, so the learner chooses with a real example in front of them and sees "Sounds like" change; it says the
  choice can be changed in Settings (user, 2026-11-09). Other display choices are introduced the same way, on the
  card where they first matter.
- **Rule and recap cards** show their text with the Lao parts enlarged in the Lao font (LESSON_PLAN decision 18).
- **Settings** (top bar; `js/settings.js`, remembered per browser for now): transliteration style, Lao font, spaces
  between words. Move to the learner's profile when there is a home screen (S8).
- **"Read more" links** under "More": Wikipedia pages for the terms used there (aspiration, vowel length, tones,
  IPA for Lao, the Lao script). They open in a new tab.
- Internal IDs (L0001, W000018) are never shown to learners. A lesson is "Lesson 1" at most (user, 2026-11-09).
- Tone shown from `tone_by_syllable` (colour or a small contour icon per syllable); one convention throughout.
- In new words, the letters just taught are highlighted.
- Homographs (ລາວ "Lao" / ລາວ "he, she") are shown on one card with both meanings.

## What a lesson must contain (for the lesson runner)
A lesson is content, not a script of screens: the app turns it into activities by the ladder above.
- **New items** (role `new`): units and rules, each with `teach_en`; 1–3 words, each readable with what has been
  taught, each using something new from this or the previous lesson.
- **Recycled items** (role `recycle`): at least 3 earlier words, so old material stays fresh.
- **Phrases or sentences** (item_type `sentence`): 1–3 that are readable at this point, once any exist. They are
  used for fill in the blank, build the sentence and reading.
- Order in items.csv = teaching order: each new unit, then the words that use it, then sentences.

## Open questions
1. **Audio:** native recordings (best, needs a speaker) or Lao text-to-speech (availability and quality to check).
   Needed for teach cards, listening and tone drills.
2. **Confusable sets** for multiple choice distractors (ບ ປ ພ ຟ, ດ ຕ, ຍ ຢ, ຂ ຄ ...): a small data table, later.
3. Dialogues table (planned in SCHEMA.md) and when the first dialogue appears.

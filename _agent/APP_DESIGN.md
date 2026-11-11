# App design: activities and presentation (draft, 2026-10-19)

Scope: what the learner does in the app and what data each activity needs. The data project (this folder)
supplies the content; the app chooses activities per learner. See `_agent/LESSON_PLAN.md` for lesson rules.

## Curriculum lesson, app lesson, session (user, 2026-11-10)
Three things share the word "lesson"; keep them apart.
- **Curriculum lesson** (L0001; LESSON_PLAN): the linguistic content. An ordered list of items (units, rules, words,
  sentences) with a role (`new` / `recycle`). It names no screens and no activities.
- **App lesson:** one entry on the learner's lesson list. **One curriculum lesson = one app lesson** (user,
  2026-11-10). Splitting or grouping lessons in the app is not built; if it is ever wanted it is an app-side mapping,
  not a content change.
- **Session:** one play-through. A *lesson session* is generated from the curriculum lesson by the planner
  (`js/session.js`) and the learner's levels; a *practice session* is generated from the learner's items alone.
- **App features** (activities, feedback, stats, audio, settings) belong to the app and may change without touching
  content. The test for any new feature: can the planner build it from what a merged lesson already carries? If not,
  the missing data is added as a generated or additive table (as `word_units` is), never by rewriting lessons.

## Core principle: show first, test later (user, 2026-10-19)
Never test an item the learner has not been shown and had explained. Each item (unit, rule, word, sentence)
climbs a ladder per learner, and an activity may only use items at or above the level it needs:

| Level | Name | How the item reaches it | Activities allowed |
|---|---|---|---|
| 0 | unseen | — | none |
| 1 | introduced | a teach card was shown (glyph or word, sound, meaning, explanation, example); it stays reachable through the info icon | the teach card itself; then recognition activities (the first one comes right after the card, with the card gone) |
| 2 | recognised | answered correctly in a recognition activity | Lao → meaning or sound: matching, multiple choice, flashcards (front = Lao) |
| 3 | recalled | answered correctly in a recall activity | meaning → Lao: multiple choice with close distractors, fill in the blank, build the word, build the sentence, flashcards (front = English) |
| 4 | in use | read correctly inside phrases, sentences and dialogues over several days | dialogues, longer reading, spaced reviews only |

- A lesson teaches each new item (level 0 → 1) and checks it straight away (a right answer → level 2), then mixes
  the new items with recycled items at levels 2–3 (see "Lesson session"). Recall activities for a new item normally
  start in a later session.
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
| Multiple choice | unit: sound → pick letter, letter → pick sound; word: Lao → pick meaning (recognition), meaning → pick Lao (recall). The check right after a card is this activity (the separate "Spot it" with the card visible was dropped 2026-11-10) | recognition or recall | bundle items; pool units (lao, sound) and pool words (lao, gloss_en) from `get_lesson` | v1 (S6c) |
| Build the sentence | put word tiles in order to match the English | recall, word order | `sentence_json.words` (position, word_id, lao), english; extra tiles from pool words | v1 (S7a) |
| Fill in the blank | sentence with one gap; pick the word from tiles; exactly one option is logically valid (see "Fill in the blank: one logical choice") | recall in context | `sentence_json.slots`, pool words with `cats` (new, S7c) | v1 (S7e) |
| Build the word | meaning and sound shown; tap the pieces in spoken order (consonant, vowel, final, tone mark); the assembled word appears when right | spelling, where vowels sit | `word_units` (new, generated; S7c), pool units | v1 (S7d) |
| Matching | tap pairs: Lao ↔ English, letter ↔ sound | recognition | words, units (needs 3+ pairs) | v1 (S8b) |
| Flashcards | self-graded (again / hard / good / easy); Lao front first, English front later | recognition, then recall | words, sentences | v1 (S8b, practice) |
| Tone drill | see a syllable, pick its tone; later, apply the rule (class + live/dead + mark) | rules | words.tone_by_syllable, tone_derivation, rules | after the first tone-rule lesson (S9b) |
| Listen and choose | hear audio, pick the word | listening | audio per word and sentence | v2 (needs audio) |
| Dialogue reader | line by line, tap for translation, then comprehension questions | reading in context | dialogues, dialogue_lines, sentences | v2 |
| Say it | hear, record yourself, play both back, grade yourself | speaking (self-graded) | audio | v2 |
| Speech recognition | app grades pronunciation | speaking | Lao ASR (very hard; not planned) | later / maybe never |
| Typing Lao | keyboard input in Lao script | writing | Lao keyboard | out of scope (writing is out of scope) |

### Fill in the blank: one logical choice (agreed with the user 2026-11-10)
From `_agent/FILL_BLANK_BRIEF.md`. **Rule:** exactly one option makes a sensible Lao sentence. A distractor that could
also fit, even with another sense or as a stretch, is a defect, because it marks a correct reading wrong. Example:
`ລາວ ກິນ __` with answer ເຂົ້າ: ນ້ຳ may never be an option; ຂາ "leg" and ຂາວ "white" may.

**Approach: categories on words, accepted categories on slots** (brief option 2, with the slot data per sentence
rather than per verb). Each word is tagged once and each blankable slot once, so the work grows with the content
and not with words × slots, as hand lists of wrong fillers (option 1) would. A verb → category table was rejected:
in Lao the object of a verb is not marked, and serial verbs make it hard to tell which verb governs a slot. The
templates (option 3) only list words that fit, never words that are wrong, and none covers ກິນ, so they are not
reused. Part of speech (option 4) is used only to order the distractors.

**Data (two new CSVs, two new tables; additive, nothing merged changes):**
- `data/word_categories.csv`: `word_id, categories` (pipe list from a closed set), `source, confidence, notes`.
  One row per word. A word with no row is never a distractor.
- `data/sentence_slots.csv`: `sentence_id, position` (as in `sentence_words`), `accepts` (pipe list: every category
  that gives a sensible sentence in that gap), `exclude_word_ids` (optional; words to keep out despite their
  categories, for stretch cases), `source, confidence, notes`. A position with no row is never blanked.
- `data/categories.csv`: the closed set (`category, definition, examples`), checked by the pipeline only and not
  loaded into the DB. First set: `person` (pronouns, people), `animal`, `plant`, `food`, `drink`, `body`,
  `clothing`, `object`, `place`, `time`, `number`, `quality` (adjectives, colours, states), `action` (verbs),
  `function` (particles, negation, question words, classifiers; never blanked and never an option). Grow the set
  when sentences need it. A finer verb category (e.g. `consume` for ກິນ, ດື່ມ) would let other verbs such as ໄປ
  become distractors in a verb gap. With only `action`, a verb gap gets non-verb distractors.
- Confidence: `unverified` when the agent tags (the normal case), `verified` only once a native speaker has
  reviewed the row. Both files go on the native-speaker review list.

**Authoring rule for `accepts`** (drafter brief and `draft-content` skill): list every category that gives a
grammatical, sensible sentence with the other words unchanged. Read every other word in **all** its senses, and
count compounds formed with a neighbour. Example: in `__ ເຂົ້າ`, ລາວ gives ລາວເຂົ້າ "he enters" (ເຂົ້າ also means
"enter"), so that slot accepts `action|person|animal`. When unsure, add the category: a wider `accepts` only
removes distractors, never adds a wrong one.

**Option rule** (one rule, used both by the client and by the check script):
- Options come from the bundle's pool, the same pool as multiple choice (lessons 1–5 share one pool; taught items
  only from lesson 6).
- A pool word is a safe distractor when: it has categories; none of them is `function`; the **union of categories
  over every live word with the same Lao spelling** has nothing in common with `accepts` (this handles homographs,
  so ເຂົ້າ "enter" counts as an `action`); it is not in `exclude_word_ids`; and its Lao differs from the answer's
  and from the other options.
- Prefer distractors with the answer's part of speech (a noun gap gets nouns first), so the question tests meaning
  rather than grammar. 4 options when there are 3 safe distractors, 3 when there are 2, otherwise no fill in the
  blank for that sentence (same as multiple choice).

**Which gap:** only positions with a slot row, and only content words (never `function`). The answer word must be
at level ≥ 2 for this learner. If a sentence has several slots, pick the one whose answer word has the lowest
level, then by the session seed. Drafters tag at least the target word's slot in every sentence a lesson uses, and
more slots where they can.

**Bundle:** `get_lesson` adds `slots: [{position, accepts, exclude}]` to each sentence's `sentence_json`, and
`cats` (the union over the spelling, as above) to each pool word. The client still reads content only through
the RPC.

**Module:** `activities/fill_blank.js`, `{type: 'fill_blank', canUse, render}`. `canUse`: the sentence is at
level ≥ 1, it has a slot whose answer is at level ≥ 2, and `build` finds at least 2 safe distractors. Screen: the
English on top, the Lao sentence with one gap as the main text, and the word tiles below. A wrong answer shows the
full sentence with the right word marked (shared feedback, as in multiple choice). Ladder: recall (a right answer
can raise the answer word to level 3). Logged: one answer for the answer word (recall) and one for the sentence,
both with `first_try`.

**Planner:** a recycled sentence gets fill in the blank. When no slot qualifies, it gets build the sentence
instead.

**Checks (agent side):** `lesson_tool.py check` (and a pass over all merged lessons) runs the option rule for each
lesson's sentences against that lesson's pool, and:
- errors on an answer whose own categories miss its slot's `accepts`, on a category outside `categories.csv`, and,
  for lessons merged after S7c, on a new word with no categories or a lesson sentence with no slot;
- warns on a slot with fewer than 2 safe distractors (the question will be skipped), on a slot where another word
  in the sentence has a homograph (re-check `accepts` against the other sense), and on a lesson where no recycled
  sentence can be a fill in the blank;
- prints each lesson's sentences with the options the rule would offer, so the user or a native speaker can scan
  for a second valid answer.

**Lessons 1–4:** covered additively by one content migration (`db_sql.py change`): categories for the L1–5 pool
words (ກິນ, ເຂົ້າ, ເຂົ້າ "enter", ລາວ ×2, ຂາ, ຂາວ, ນ້ຳ, and lesson 5 words once chosen) and slots for S000002870,
2872–2874 and 2876. Expected result: L3 recycles ກິນເຂົ້າ → `ກິນ __`, options ເຂົ້າ plus ຂາ, ລາວ, ຂາວ (ນ້ຳ
excluded); L4 recycles ລາວກິນເຂົ້າ → a gap at ລາວ (`person|animal`) or ເຂົ້າ (`food|drink`).

## Lesson session (2026-11-10)
The planner walks `lesson_items` in `position` order; that order is the backbone of the session, so lessons need no
extra columns.

| Item | Steps |
|---|---|
| new unit | teach card, then one check (sound → letter or letter → sound). A same-sound pair (C13 + C13f) is one card and one check; both ids are sent as shown. A unit with no sound of its own (tone mark) gets no check until build the word |
| new word | teach card, then Lao → meaning. Homographs on one card (ລາວ) accept either meaning, and no option is another word with the same spelling |
| new rule / recap | card only |
| recycled word | no card; one question: meaning → Lao if the learner's level is ≥ 2, else Lao → meaning |
| new sentence | reading card (Lao, meaning, word chips), then build the sentence (from S7a) |
| recycled sentence | fill in the blank (from S7e); build the sentence when no slot qualifies or before S7e; before S7a, nothing |

- **Closing block:** each new unit and word once more, shuffled, in the other form where there is one (at most 8).
  Then every question missed on the first try comes back until answered right once (at most twice each).
- **Questions on words test meaning, never the English-letter spelling** (kao / kaao look alike); questions on
  units test the sound, labelled exactly as on the unit's teach card.
- **Options:** 4 where the pool allows (3 at least; otherwise the planner skips that question). Wrong options come
  from the bundle's pool (lessons 1–5 share one pool, then taught items only), never two with the same Lao or the
  same label. No confusable-sets table yet: with under about 15 units every pool unit is a candidate. Add one (or
  derive it from letter shapes and sounds) when lessons pass about 10.
- **Feedback:** right → a short confirmation, then Continue. Wrong → the correct option is marked and shown with
  the item's Lao, sound, meaning and info icon, then Continue. No hearts, timers or fail state.
- **Length:** about 10–25 first-try answers (lesson 1 about 10, lesson 4 about 25). A progress bar shows steps left.
- **Completed** (user, 2026-11-10) = the learner reached the end and `complete_lesson` ran. No pass mark. The summary
  shows first-try accuracy (`review_log.first_try`); replays do not count against it but can raise a level.
- **Lesson list:** `done` (tick, date; tap to play again or "Read the cards"), `open` (lesson 1, the lesson after a
  done one, or one already started), `locked`. Playing a done lesson again is a normal session: it counts for the
  streak and levels, and `lesson_progress.completed_at` keeps the first date.
- **Leaving mid-lesson:** answers already sent stay (levels are kept). From S7b the same device resumes at the same
  step on the same day; otherwise the lesson starts again. **No offline mode** (unsent answers are retried while
  the page is open).
- **Authoring review:** `#/read/L0005` shows any lesson's cards without a session (and from S7b can dry-run the
  questions without recording), so a new lesson can be reviewed after `supabase db reset` without replaying 1–4.

## Audio and speaking hooks (2026-11-10; LESSON_PLAN decision 12)
Nothing in the content tables changes for audio.
- **UI now (S7b):** one `audioButton(detail)` in `js/audio.js`, placed on unit, word and sentence teach cards, on
  wrong-answer feedback and in sentence activities. It renders nothing while `detail.audio_url` is absent.
- **Schema later (S10):** `item_audio(item_type, item_id, recording_id, approved_at)` and a learner-readable `audio`
  bucket (APP_PLAN Phase 4); `unit_json` / `word_json` / `sentence_json` then add `audio_url`. Keyed by item id, so
  recordings attach to lessons that are already merged.
- **Activities later:** "Listen and choose" (logged as `recognition`) and "Say it" (self-graded; reuses
  `js/recorder.js`) are new modules; `record_answers` needs no change.
- Recording order for the native speaker: units, words and sentences of the merged lessons first.

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
1. **Final ວ sound label: "ao"** (user, 2026-11-10; first "-ao", changed after the S6c browser test: the hyphen
   adds confusion). A display rule (`SOUND_LABEL` in `js/activities/teach_card.js`; letters.csv keeps
   "w (final o/w)", which scripts read). Same label as ເ◌ົາ, so the two are never options in one question. Every
   taught word so far has ວ after າ; revisit when a word with ວ after another vowel (ແມວ) is taught. If the two
   "ao" sounds need telling apart, the user will decide later.
2. **Confusable sets** for multiple choice distractors (ບ ປ ພ ຟ, ດ ຕ, ຍ ຢ, ຂ ຄ ...): a small data table, once
   lessons pass about 10.
3. Dialogues table (planned in SCHEMA.md) and when the first dialogue appears.

## Decisions log
- 2026-11-10 (user, fill in the blank): the approach in "Fill in the blank: one logical choice" and the S7a/S7c/S7e
  re-cut are agreed. The first category list is agreed; add categories as sentences need them. Not every sentence,
  and not every word in a sentence, has to be blankable; basic sentences are the target (e.g. `<pronoun> __
  <food|drink>` expects ກິນ or ດື່ມ). Order: S7e before S7d. Distractors come from the same pool as multiple choice
  (lessons 1–5 share one pool). One answer is logged for both the word and the sentence.
- 2026-11-10 (agent, S6c, provisional; say if you disagree):
  - Both unit questions (letter → sound, sound → letter) are logged as `recognition`; only meaning → Lao is `recall`.
  - The check after a card is letter → sound or Lao → meaning; the closing block asks the other form. For a card
    with two meanings (ລາວ) the check asks the first meaning and the closing block asks the second.
  - In a question the info icon appears only after the answer (right or wrong): before it, the teach card would
    give the answer away.
  - "ao" (final ວ) and "ao" (ເ◌ົາ) are the same label, so they are never options in the same question.
  - A recycled word the learner has never been shown (level 0) gets no question.
  - "Words read" counts the tested word once per word question (not the Lao words among the options).
  - Summary line: 90% or more, 60% or more, below 60% ("these will come back" framing).
- 2026-11-10 (user): one curriculum lesson = one app lesson; the planner makes the screens, content names none.
- 2026-11-10 (agent recommendation, user approved): teach and check are interleaved (card, check, next card, then
  a closing mixed block). Basis: testing beats restudy at 2 days and 1 week (Roediger & Karpicke 2006,
  https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/).
- 2026-11-10 (agent recommendation, user approved): completed = reached the end; missed questions come back at the
  end of the session; no pass mark, no fail state. Duolingo replays mistakes at the end of a lesson
  (https://blog.duolingo.com/spaced-repetition-for-learning); errors followed by corrective feedback tend to help
  (Metcalfe 2017, doi 10.1146/annurev-psych-010416-044022, abstract only). No source was found for a
  minimum-accuracy rule in comparable apps.
- 2026-11-10 (agent recommendation, user approved): build the word is v1, ahead of the tone drill; it needs the
  generated `word_units` table. The tone drill waits for the first tone-rule lesson.
- 2026-11-10 (agent recommendation; say if you disagree): the check right after a card is asked with the card gone
  and counts as recognition (level 2), so "Spot it" with the card visible is dropped and `record_answers` keeps its
  three directions; audio is keyed by item id in `item_audio`, with an empty play-button slot from S7b; resume is
  same-device only; no offline mode.

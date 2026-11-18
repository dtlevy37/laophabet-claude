# 1_new_learner: new learner on a phone (second lens: heritage learner)

I walked through sign-up, intake, home, lessons 1 and 2 step by step, the summaries, home again, the reader cards,
letters, words, practice and settings, then dry runs of lessons 9 and 10, mostly from `tmp/review/shots/phone/` and
its `index.json`. The shot set never actually ran a practice session, so I filled that gap in the live app with
account `review_agent1`: I played L1 at random, ran a 2-minute review, opened the ⓘ sheet and left L2 part way
through. The script is `tmp/review/scratch/1_new_learner/probe.js`, and its shots are in
`tmp/review/shots/extra/1_new_learner/`.

Overall: the teaching order is good. Every letter, vowel and word gets a card before it is tested, and the
wrong-answer feedback is calm and always in the same place. The problems are mostly at the edges: the feedback
screens on a narrow phone, what the summary tells you, how long lessons get, and a few screens that have no way back.

## Findings

### F1 The build-the-sentence feedback is cut off on a phone, and "Right answer" can look empty
- Screen/route: build the sentence, wrong-answer feedback (`#/lesson/L0002`, `#/try/L0009`)   - Device(s): phone   - Severity: high
- Evidence: `phone/107_L2_21-27_card_mc_fb.png` (the "Right answer" row shows nothing at all),
  `phone/081_L2_12-20_card_mc_fb.png` and `phone/237_L9try_15-44_card_mc_fb.png` (the chips run off the right edge).
  `styles.css:415-417`: `.cmp { overflow-x: auto }` with a `max-content` grid. `js/activities/compare.js:4-9` lines
  the two rows up column by column.
- What happens: the "Your answer / Right answer" grid scrolls sideways inside a 360px screen, and nothing signals that
  it scrolls. If the learner tapped extra words first, the right-answer row begins with empty placeholder cells. On
  screen it then reads "Right answer: (nothing)" under three red ✗ chips (107). With 5–6 tiles (L9) you see only
  2–3 columns. A beginner who just failed cannot see what was right, and that is exactly when they need to.
- Suggestion: below about 560px, drop the two-row grid. Show "Your answer" as a wrapping row of chips (✗ on the
  wrong ones, a dashed `[missing]` chip where a word is missing). Let the feedback box below carry the right answer,
  since it already shows ກິນ ເຂົ້າ (kin khao, "to eat (a meal)") with ▶ and underlined words. Keep the grid for
  tablet and desktop.
- Why: feedback has to be readable at a glance, and hidden horizontal scroll is a well-known mobile failure.
- Confidence: high (seen in the shots, cause found in the CSS).

### F2 The lesson summary does not say what you learned, and two of its numbers confuse
- Screen/route: lesson summary (`#/lesson/L0001` at the end)   - Device(s): all   - Severity: high
- Evidence: `phone/059_L1_summary.png`, `extra/1_new_learner/04_L1_summary.png`,
  `extra/1_new_learner/09_practice_summary.png`. `js/summary.js:48-62` (stats, line, missed list only).
  `strings.json`: `summary_words_read` "Lao words read (with repeats)", `summary_new_items` "New things learned".
- What happens: after lesson 1 the screen says "5 LAO WORDS READ (WITH REPEATS) · 56% · 5 NEW THINGS LEARNED",
  then lists only what you **missed**. Problems:
  - The learner saw four new things: ກ (k), ◌ິ (i), ນ (n) and ກິນ (kin, "eat"). The fifth is the hidden
    "ນ at the end of a syllable" unit (`data/units.csv` C13f), which was taught on the same card.
  - The same split makes the review summary list "ນ n" twice (`09_practice_summary.png`).
  - "Lao words read (with repeats)" is unclear, and in a review it reads "1 LAO WORDS READ".
  - Nothing on the screen answers "what can I do now?", so you could not tell a friend what lesson 1 taught you.
- Suggestion:
  - Add a "New in this lesson" list above "Missed on the first try", built from the lesson's new items and merging
    same-letter role units: "ກ k · ◌ິ i · ນ n · ກິນ kin 'eat'". For a lesson with sentences, add one line:
    "You can now read: ລາວ ຫິວ ເຂົ້າ (laao hiw khao, 'He is hungry')."
  - Count `new_items` and `missed` by base letter, or collapse C13/C13f to one row on the client.
  - Rename `summary_words_read` to "Lao words read" and drop "(with repeats)", or remove the stat. Use the singular
    for 1.
  - Retitle "Missed on the first try" to "Worth another look". It is gentler, and the line above it already says
    misses come back.
- Why: a short recap of what was learned (retrieval plus a sense of accomplishment) motivates more than raw counts,
  and numbers that do not match what the learner saw erode trust.
- Confidence: high on what the learner sees. The C13f cause is inferred from the duplicate and from `units.csv`, not
  traced through the SQL.

### F3 The tone picture appears from lesson 1 with no explanation
- Screen/route: word teach card (`#/lesson/L0001` step 8, and every word card after it)   - Device(s): all   - Severity: med
- Evidence: `phone/019_L1_8-15_card_teach.png` shows the label "TONE" over a bare curve. The words "Low rising:
  starts low, rises a little" appear only under "More" (`phone/837_words_detail.png`). The L2 tone-mark card says
  only "It changes the melody of the word" (`phone/071_L2_7-19_card_teach.png`). `docs/PLAN.md` already has
  "L3 Teaching tone" as an open item.
- What happens: a learner who has never met a tonal language sees an unlabelled line graph on the very first word.
  Is it a pitch? Should I do something with it? Lao is tonal, and that matters more than anything else on the card,
  yet nothing says what the line is until a later lesson that is not built yet.
- Suggestion (interim, until L3 exists):
  - The first time a learner sees a tone picture, put a one-line caption under it: "Lao words have a melody. This
    line shows it: ກິນ (kin, 'eat') starts low and rises a little. Listen ▶ and copy it." Use the existing `tone_*`
    strings for the second sentence.
  - On every later card, show the short tone name (`tone_low-rising` without the explanation) under the picture.
- Why: teach before you show. The memory note "Teach, not flashcards" asks for a principle line before what it
  explains.
- Confidence: high.

### F4 Long lessons, a total that keeps growing, and a place that is kept only for the same day
- Screen/route: every lesson; the leave dialog   - Device(s): phone   - Severity: med
- Evidence:
  - Planned length: L1 14 steps, L2 17, L8 30, L9 40, L10 39, L12 45 (step 1 of each run in `phone/index.json`).
  - With random answers L9 reached 73 steps and L12 96 (`phone/379_L9try_73-73_*`, `phone/826_L12try_96-96_*`).
  - `js/session.js:645-647`: each miss is added to the end. `session.js:1032-1033`: the bar's max and the
    "n / total" counter both use `s.steps.length`.
  - `strings.json` `leave_body`: "open this lesson again today on this device". `session.js:577` requires
    `r.day === localDay()`.
- What happens: each wrong answer adds one to the total ("6 / 15" becomes "10 / 16", then "17 / 19"), so the bar
  slides backwards just when the learner is struggling. Later lessons take 40+ taps. For someone in short phone
  sittings, stopping overnight loses the place.
- Suggestion (keep the replays; they are intended):
  - Base the bar and counter on the planned steps only. Show replays as a separate small label, "Another go: 2 left",
    instead of raising the total.
  - From about L8 on, show a "Good place to stop" marker halfway, after the last new item's practice. Keep the place
    for several days, not one; at least say "you can carry on later" when that is true.
  - Make "Lessons: 5 to 15 minutes" on `#/about` match reality, or split the longest lessons.
- Why: a sense of progress keeps motivation up, and goals that move discourage beginners. Short sessions suit phone
  learners.
- Confidence: high on the counter and the same-day rule. Med on actual minutes, since nobody timed a real learner.

### F5 The review time-picker has no way back
- Screen/route: `#/practice` (the "How long do you have?" screen)   - Device(s): all, worst on phone   - Severity: med
- Evidence: `phone/830_practice_start.png` has no header, no Back and no ✕. `js/learn.js:36-38` treats `practice` as
  a lesson route, so `app.js:122` hides the top bar. `js/practice.js:20-53` draws no back link.
- What happens: a learner who taps Review just to look, or picks it by mistake, cannot get back to home except with
  the browser's back button. That button is hidden in a home-screen web app.
- Suggestion: add "← Back" (`home_back`-style) above the "Review" heading, or show the normal top bar until a time is
  picked.
- Why: every screen needs a visible exit (Nielsen: user control and freedom).
- Confidence: high.

### F6 Lesson titles do not say what you will be able to do, and the summary line is hidden on phones
- Screen/route: home "Next" card, `#/lessons`   - Device(s): phone   - Severity: med
- Evidence:
  - `phone/004_home_new.png`, `phone/005_lessons_new.png`, `phone/833_lessons.png`.
  - Titles from `data/lessons.csv`: "A second word and a first phrase", "A new word and a first sentence", "Already",
    "Hungry, you", "I, and the conversation", "Have, come, be".
  - `styles.css:547` hides `.continue-summary` below 560px, so the good `summary_en` lines never show on a phone.
- What happens: a beginner cannot tell what the next lesson gives them, or why it matters. "Hungry, you" reads like a
  typo.
- Suggestion:
  - Show `summary_en` on phones too, one line, clamped.
  - Retitle around the payoff, e.g. L9 "Are you hungry?" (ເຈົ້າ ຫິວ ເຂົ້າ ບໍ່? chao hiw khao baw?, "Are you
    hungry?") and L10 "Your first conversation". Add the payoff phrase to the "Next" card as Lao with its English.
    Titles are content, so they go through `db_sql.py`.
- Why: goal-gradient and relevance. Learners persist when they can see the next payoff.
- Confidence: high.

### F7 The heritage learner: the intake asks, then nothing changes
- Screen/route: intake, then lessons 1–2   - Device(s): all   - Severity: med
- Evidence:
  - `phone/003_intake.png` asks how much Lao you speak and whether you read it, Thai, goals and reasons.
  - `grep intake app/frontend/js` shows the answers are only stored (`app.js:45,157`). No code reads them.
  - Lessons unlock strictly one after another (`strings.json` `lesson_locked`).
  - L1 asks "What does this word mean? ກິນ" three times (`phone/020`, `041`, `050`).
- What happens: a learner who ticks "I speak it well / Not at all (reading)" gets exactly the same path. They spend
  most of lesson 1 on meaning questions about a word they have said all their life. Bored, and a little patronised.
  The parts that help them (sound-first cards, ▶ on every word, "Which word do you hear?") are good.
- Suggestion: when the intake says "I can have a simple conversation" or "I speak it well":
  - Leave out the English-meaning question forms ("What does this word mean?", "Which word means this?") for words
    rated level 1. Keep sound → letter, listening and build questions.
  - Show one line on home: "You already speak Lao, so lessons focus on reading what you know."
  - A later option: a "Test out" checkpoint that unlocks the next group of lessons.
- Why: adaptive difficulty. Respect the learner's prior knowledge (andragogy).
- Confidence: high that the intake is unused. The suggestion is a design proposal.

### F8 Teach notes mix romanization systems
- Screen/route: ເຂົ້າ word card "How it is used" (L2, L9 recap)   - Device(s): all   - Severity: low
- Evidence:
  - `phone/072_L2_8-19_card_teach.png` reads "ກິນເຂົ້າ (gin kao, "eat rice")" while the card above it says
    "khao" and the sentence card says "kin khao".
  - Source: `data/word_notes.csv` line 3 (W000019), with the romanization written into the note.
  - Related: ຈ shows "SOUNDS LIKE ch" with "The j in 'jaw'" (`phone/224`). This is acceptable, but a beginner sees
    two different letters.
- What happens: on the very card that asked "Standard or English-style?", the note uses the other system and drops
  the h of kh. A new learner wonders which is right.
- Suggestion: let notes carry Lao only and have the app add the romanization for the learner's setting (the
  `laoText` path), or rewrite this note as ກິນເຂົ້າ (kin khao, "eat rice"). Grep `word_notes.csv` and `rules.csv`
  for other hard-coded romanizations.
- Why: one convention throughout (DESIGN, teach cards).
- Confidence: high.

### F9 Wording: a few instructions are long or unclear
- Screen/route: build the sentence, conversation, word gloss   - Device(s): phone   - Severity: low
- Evidence: `phone/080_L2_12-20_build_sentence.png`, `phone/432_L10try_24-49_conversation.png`,
  `phone/042_L1_16-18_*_fb.png`.
- Suggestions:
  - `bs_howto`: "Tap the Lao words to build the sentence. Lao word order is often different from English, so go by
    how Lao is said. Tap a placed word to take it back." → "Tap the words in Lao order. Tap a word again to take it
    back."
  - Conversation intro: "Read the Lao first. Tap a word for its meaning, Reveal for a line's sound and English, ▶ to
    hear it." → "Try reading each line first. Tap a word for its meaning. Reveal shows the sound and the English."
  - Gloss of ກິນ (kin): "eat; (colloquial) drink" is long on every answer button in lesson 1 and the parenthesis puzzles
    beginners. Try "eat (also: drink)". That is content, via `db_sql.py change`.
  - ຫິວ (hiw, "hungry") culture note: "A native speaker tells us that 'I'm hungry' with ຫິວ alone sounds
    unfinished" → "On its own, ຫິວ sounds unfinished: Lao says what you are hungry for." Also, its label "Culture"
    fits a usage note poorly; "How it is used" is already the heading.
- Why: short instructions get read, long ones get skipped.
- Confidence: med (wording taste).

### F10 Icon-only ⚑ in the header, and sound plays before you can say "not now"
- Screen/route: home header, lesson header, first word card   - Device(s): phone   - Severity: low
- Evidence:
  - `phone/004_home_new.png`: ⚑ and ⚙ with no text. The `title` tooltip never shows on touch (`js/chrome.js:50-58`,
    `report.js`).
  - Word and sentence cards autoplay (`js/activities/teach_card.js:108`).
  - "Can't listen now" is offered only on listening questions (`listen_pick.js:185`) and deep in the settings sheet.
- What happens: a beginner on a bus starts lesson 1, and at step 8 ກິນ (kin) plays aloud. A flag icon on the home
  screen means nothing to them (report? language?).
- Suggestion:
  - Add the "Can't listen now" link to lesson 1's first card ("Lao has its own sounds"). That card is also a natural
    place for one line explaining the chrome: "▶ plays the sound · ⚑ reports a problem · ⓘ shows the card again."
  - On home, give the flag a text label ("Report").
- Confidence: high.

## Missing features / sections
- **"What you can read now" recap** (part of F2): a list of new items and the sentences you can now read, on the
  summary and on each lesson row. For every learner. S.
- **Resume across days and devices** (F4): keep the session place server-side for a few days. For phone learners in
  short sittings. M.
- **Heritage fast path / test-out** (F7): use the intake to skip English-meaning questions, plus a test-out
  checkpoint. For heritage learners and learners who know Thai. M.
- **First-run guide to the controls** (F10): one card or tooltip pass for ▶, ⓘ, ⚑, Hint and "Can't listen now". S.
- **Hear the letter itself**: letter cards play only a word containing the letter. A recorded syllable such as ກະ or
  the letter name would help a beginner hear the k sound alone. It needs recordings. M.
- **Alphabet progress**: "3 of 27 consonants, 2 of 28 vowels" on the Letters page. The page currently shows only the
  letters used up to lesson 12, and the home tile still says "Every letter and the sound it makes". S.
- **Level legend on My words**: "Recalled" appears with no ladder (Seen → Recognised → Recalled → Spelled)
  (`phone/836_words.png`, `837`). S.
- **Reminder or nudge** to keep a streak (an opt-in email or push). It was expected, but it is optional for the
  alpha. M.

## Top 5 (most valuable changes, ranked)
1. **F1**: on phones, replace the sideways-scrolling "Your answer / Right answer" grid with wrapping chips, and let the
   feedback box show the right sentence.
2. **F2**: the lesson summary lists what was learned and what you can now read. Merge the C13/C13f duplicates; drop
   "(with repeats)".
3. **F4**: base the progress bar and counter on planned steps (replays shown separately), and keep the place for more
   than one day.
4. **F3**: a first-time caption that says what the tone line means, until the L3 tone lesson exists.
5. **F5 + F6**: add a Back link on the review time-picker; show the lesson summary line on phones and give lessons
   payoff titles.

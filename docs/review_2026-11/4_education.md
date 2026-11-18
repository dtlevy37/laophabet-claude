# 4_education: PhD in educational theory (SLA, early reading)

Scope: lessons 1–12 as played (desktop shots, plus phone `index.json` for full step lists of L1, L2, L9), the
planner (`app/frontend/js/session.js`), the activities, the practice scheduler (SQL), and the curriculum data
(`data/lesson_items.csv`, `rules.csv`, `words.csv`). Overall, the design is principled. Show first and test later,
lessons that work back from real sentences, a conversation as the payoff of a section, no demotion, and a
non-shaming summary are all sound. The weak points are in what happens between sessions (spacing and assessment)
and in speaking, which the app's goal names but no activity trains.

## Findings

### F1 The review scheduler treats repeats within one lesson as spaced successes
- Screen/route: `#/practice` (what comes up and when)   - Device(s): all   - Severity: high
- Evidence: `app/backend/supabase/migrations/20261114120000_s8b_practice.sql:9-18, 31-45, 59-62`. `box` is the
  number of trailing right *first asks* (`attempt = 0`), and the item is due again 0/1/3/7/14/30 days later. In a
  lesson, every distinct question on an item is a first ask (`session.js:671-684`: `attempt = spec.replay || 0`,
  and closing questions are new specs). Fill in the blank also logs a first ask for its answer word and for the
  sentence (`fill_blank.js:155-156`). Hinted right answers count too.
- What happens: take a new word in L9 such as ຫິວ (hiw, "hungry"). It gets the check after its card, a listen and
  pick, and three fill in the blanks where it is the gap (phone `265`–`293`, `L9try`), all within about 10
  minutes. Five right answers give box 5, so the word is next due in **30 days**. A word answered right three times
  in its own lesson is due in 7 days, which skips the reviews at one and three days that matter most for new
  items. Expanding intervals only work when each success is itself spaced.
- Suggestion: count at most one success per item per day (group `firsts` by the learner's local day: the newest
  answer of each day decides). Or count only first asks made at least about 12 hours after the previous counted
  one. Treat a hinted right answer as neither a success nor a lapse. This is a few lines in `practice_queue` with
  no client change, and it stays valid when FSRS replaces it in S9.
- Why: the spacing effect and the lag effect (Cepeda et al. 2006). Massed successes within a session do not
  predict retention, so a schedule must grow its intervals on spaced retrievals only.
- Confidence: high, from reading the code (I did not query a live DB).

### F2 "Known" and "Recalled" are earned too cheaply to tell anyone what has been mastered
- Screen/route: home stats strip, lesson summary, `#/words` level badges   - Device(s): all   - Severity: high
- Evidence: phone `134_L2_summary.png` shows "20% RIGHT FIRST TIME" (random taps), yet `832_home.png` shows
  "6 LETTERS KNOWN 2 WORDS KNOWN". Levels come from `20261114140000_h1_hinted_level4.sql:122-131`: one right
  recognition answer gives level 2 ("known"), on any attempt, so the replay of a missed question with the **same
  four options reshuffled** (`multiple_choice.js:118-121`) counts. Meaning → Lao multiple choice is logged as
  `recall` (`multiple_choice.js:109`), so picking from four options earns "Recalled" (`words_level_3`). Levels
  never drop (DESIGN "no demotion").
- What happens: you get "known" by seeing the card, missing the check, being shown the answer, and then tapping
  that same answer a minute later, which is a 25% guess plus short-term memory. "Words known" and "Letters known"
  only ever go up, so neither the learner nor the owner can tell retained items from items they were merely
  exposed to. That matters for the alpha, whose data the owner will read.
- Suggestion: keep the ladder for the rule "which activity may use an item", but compute the *displayed* "known"
  from retention evidence: a right first ask (attempt 0, no hint) at least one day after the item was introduced.
  Show the ladder level in My words as it is, and add a strength cue from F1's box ("Strong" when box ≥ 3,
  "Getting there", "Due for review"). Rename `words_level_3` "Recalled" to "Picks it from English", or keep
  level 3 for build the word and fill in the blank only. Do not let a replay (attempt > 0) raise an item above
  level 1.
- Why: assessment validity. Immediate performance is a poor index of learning (Soderstrom & Bjork 2015), and
  learners' judgements of learning are inflated by fluency unless delayed evidence is shown (calibration,
  metacognition).
- Confidence: high.

### F3 Nothing builds speaking: no step asks the learner to say anything
- Screen/route: every lesson, conversations (L8, L10)   - Device(s): all   - Severity: high
- Evidence: the activity list (`js/activities/index.js`) has teach card, multiple choice, build word, build
  sentence, fill blank, listen and pick and compare. "Say it" is "v2" in DESIGN "Activities". Conversations end in
  reading blanks (`085/086_L10try_*complete_the_conversation*`). `js/recorder.js` already exists for natives.
- What happens: the app's goal is "read **and speak**", but every activity is receptive. The learner hears good
  recordings and could practise saying them, yet never takes a speaking turn, even in the target conversation of
  lesson 10.
- Suggestion: two small additions with no content changes:
  1. **Say it** after the first check of each new word and new sentence: ▶ the native clip, a "Your turn: say it
     aloud" line, an optional 🎙 record button, then your take and the native's played one after the other. Tap
     Next with no grading, or self-rate (Again / Good) and log it as `direction: 'speak'` so it never affects
     levels. Hide it with "Can't speak now", as "Can't listen now" works for listening.
  2. **Take B's part** as a last step of each conversation: the app plays A's line, shows B's line in Lao (sound
     and English behind Reveal), and the learner says it. ▶ then plays the native B to compare. Then swap roles.
- Why: Swain's output hypothesis and noticing the gap: comparing one's own recording with a model is what makes
  learners notice errors. Shadowing and repetition build articulatory fluency (Hamada 2016). Role-play turns a
  read dialogue into rehearsed speech.
- Confidence: high (that it is absent); medium on the exact form.

### F4 Tones: one mark gives two melodies with no explanation, and no activity trains hearing tones
- Screen/route: word cards from L2; `listen_pick`   - Device(s): all   - Severity: med
- Evidence: `data/words.csv` `tone_by_syllable`. With ◌້, ເຂົ້າ (khao, "rice"), ຂ້ອຍ (khoy, "I") and ຫ້າ (haa,
  "five") are low-falling, while ນ້ຳ (nam, "water"), ແລ້ວ (leo, "already"), ນີ້ (nee, "this") and ເຈົ້າ (jao,
  "you") are high-falling. The ◌້ card says only that it "changes the melody" (`units.csv` T2). Listen and pick
  never offers two words with the same respelling (DESIGN "Activities"), so it never asks the learner to tell
  apart two words that differ only in tone.
- What happens: by lesson 5 the learner has the same mark with two melodies. LESSON_RULES decision 18 says an
  apparent contradiction like this needs a recap card, but none exists. Tone, the hardest part of Lao for English
  speakers, is shown (the tone picture) but never practised or tested.
- Suggestion: (a) Add a short recap card, with no class rules (decision 11): "The same mark can give different
  melodies. Learn each word's melody with the word", with tone pictures of ເຂົ້າ and ນ້ຳ side by side. This fits
  L9, where ຫ້າ (haa, "five") brings in a second word on the low-falling side. (b) Add a **Which melody?**
  activity: play a known word, then pick its tone picture from 2–3. Use the existing `tone_by_syllable`, audio and
  `js/tone.js`. Log it as recognition on the word.
- Why: perceptual training. Short tone-identification training with feedback improves tone perception and carries
  over to production (Wang, Spence, Jongman & Sereno 1999). Decision 18 applies here as well.
- Confidence: high on the gap; the card wording needs the native speaker.

### F5 Lessons run about twice the designed length, mostly from three steps per new sentence
- Screen/route: `#/lesson/*`   - Device(s): all   - Severity: med
- Evidence: planned steps at step 1 are L1 14, L2 17, L8 30, L9 40, L10 39 and L12 45 (shot names `*_1-NN_*`).
  DESIGN "Lesson session" says "about 10–25 first-try answers". `session.js:150-154`: every new sentence gets its
  card, build the sentence right after it, and a fill in the blank that is always kept (`fillSteps`). L9 has 5 new
  sentences, which makes 15 steps, and 3 of its 5 closing blanks test the same gap word ຫິວ (phone `265`–`293`).
  L11 has 6 new words and L12 has 4 core words plus 2 units (`lesson_items.csv`). L12 also teaches ບໍ່ມີ (bo mee,
  "not have") as a word item right after the sentence ບໍ່ມີ, which already shows it as ບໍ່ + ມີ.
- What happens: building the sentence one screen after its card is copying from working memory, not retrieval,
  and it adds length without much learning. With real errors and replays, L9–L12 will run past the 5–10 minutes
  in LESSON_RULES decision 1.
- Suggestion: (a) Show the new sentence cards back to back (or with the word check between them), then do their
  builds after them, so each build has a lag of 2–4 steps. Nothing is cut. (b) Keep one fill in the blank per
  *new word* rather than per new sentence, and do not blank the same word in more than 2 sentences of one lesson
  (`fill_blank` slot choice: prefer an answer not yet blanked in this session). (c) For lessons after 12, hold
  new sentences to about 3–4 per lesson and do not make a transparent compound such as ບໍ່ມີ (bo mee) its own new
  item.
- Why: cognitive load theory (element interactivity). Lag and desirable difficulties make retrieval after a short
  delay more effective than immediate copying (Bjork 1994; Karpicke & Roediger 2007).
- Confidence: med. Step counts are from dry runs with random answers; real learners will have fewer replays.

### F6 Autoplay on "What does this word mean?" lets the learner answer by ear instead of reading
- Screen/route: multiple choice, Lao → meaning   - Device(s): all   - Severity: med
- Evidence: `multiple_choice.js:135-138` plays the word when the question appears; `settings.js:27` has
  `autoplay: true` by default. Shot `desktop/009_L1_9-16_choice_what_does_this_word_fb.png`.
- What happens: the question meant to test reading (map print to sound to meaning) becomes listening
  comprehension. The learner never has to decode the Lao before hearing it.
- Suggestion: on Lao → meaning, play the clip **after** the answer (on the feedback), and keep ▶ before the answer
  as a hint tier (logged `hinted`). Keep autoplay on teach cards as it is.
- Why: the self-teaching hypothesis (Share 1995). Learners build orthographic knowledge by decoding a word
  themselves and then getting feedback, not by being told the pronunciation first.
- Confidence: high on the behaviour; med on the size of the effect.

### F7 Wrong options in letter questions can be ruled out by their form, and replays reuse them
- Screen/route: "Which one makes this sound?" / "What sound does this make?"   - Device(s): all   - Severity: med
- Evidence: phone `023_L1_10-17`: "k" with options ເ◌ົາ ກ ◌າ ◌ຳ, where the only option without a dotted circle is
  the answer. `208_L9try_2-40`: ຫ with options aa, n, h, am. `multiple_choice.js:90, 100-104` draws unit options
  at random from all pool units, whatever their kind. `again()` (`:118-121`) reuses the same options in a new
  order.
- What happens: a learner can pass without knowing the letter, by picking "the one that is a consonant" or by
  remembering which option was wrong last time.
- Suggestion: draw wrong options from the same kind as the answer (consonant with consonants, vowel with vowels,
  final with finals) whenever the pool has at least 2 of that kind, and fill with other kinds only if needed. On a
  replay, draw fresh wrong options (or ask the other form, sound → letter instead of letter → sound).
- Why: item-writing principles. Wrong options must be plausible and look alike, or the question rewards
  test-taking skill instead of knowledge (Haladyna & Rodriguez 2013).
- Confidence: high.

### F8 The "pronouns are often left out" card comes after the sentences it explains
- Screen/route: L9 (`lesson_items.csv` L0009 pos 10, 13, 14)   - Device(s): all   - Severity: low–med
- Evidence: ບໍ່ຫິວ (bo hiw, "I'm not hungry", pos 10) and ຫິວນ້ຳ (hiw nam, "I'm thirsty", pos 13) are shown and
  built before R04 (pos 14). Pronoun-less sentences start in L5: ກິນແລ້ວ (kin leo, "I've eaten").
- What happens: the learner builds "I'm not hungry" from two tiles with no "I" before anything tells them why.
  This goes against the owner's own rule that principle cards come before what they explain.
- Suggestion: if L9 is not yet on the hosted DB, move R04 to just before position 10. If it is, add the point
  ("No 'I' needed: Lao leaves it out when it's clear") as one line on the ບໍ່ຫິວ sentence card. For later
  lessons, `lesson_tool.py check` could warn when a rule item comes after a sentence in the same lesson that it
  cites in its `teach_en`.
- Why: advance organisers and worked examples. Telling the learner the principle first lowers extraneous load
  when they first meet the examples (Ausubel; Sweller).
- Confidence: high.

### F9 Wrong-answer feedback says what is right but not what the chosen answer was; sentence feedback repeats itself
- Screen/route: all question types   - Device(s): all (phone overflow seen)   - Severity: low–med
- Evidence: `mc_wrong` "Not quite. The answer is:" (desktop `009_L1_*_fb`: the learner picked "rice, food"
  for ກິນ and is not told that "rice, food" is ເຂົ້າ). Build the sentence feedback (phone `223_L9try_8-43`) shows
  the right sentence three times (the "Right answer" row, the transliteration, and the Lao again in the box),
  and the "Your answer" row runs off the screen.
- Suggestion: add one contrast line when the picked option is a real taught item: "'rice, food' is ເຂົ້າ (khao)."
  For a unit: "n is ນ." (new key `mc_wrong_picked`: "{picked} is {lao} ({sound})."). For build the sentence, drop
  the Lao line in the feedback box (the "Right answer" row already shows it), keep the sound line and ▶, and let
  the "Your answer" row wrap.
- Why: elaborated feedback that addresses the specific error works better than verification alone (Shute 2008).
  Showing the same content three times adds extraneous load (the redundancy effect, Sweller).
- Confidence: med.

### F10 Reviews happen only if the learner thinks to open Review
- Screen/route: home; lesson summary   - Device(s): all   - Severity: med
- Evidence: `desktop/112_home.png`: "Next · lesson 3 [Start]" is the main card, and Review is a tile ("A few
  minutes, whenever you have them"). After a lesson, `summary.js:58-59` makes "Next lesson" the primary button.
  In-lesson recycling is the curriculum's fixed list, not the learner's due items (DESIGN "Recycling: the app's
  scheduler can override this per learner", which is not built).
- What happens: the natural path is lesson, lesson, lesson. Spaced retrieval of due items depends on the learner
  choosing it, which novices rarely do.
- Suggestion (keeping the owner's rule of no "N due" counts): start each lesson with a **warm-up** of 3–4
  questions on the learner's most overdue items (from `start_practice` order, at practice question forms), shown
  with the label "Warm-up" and the same effort budget. Alternatively, when items are due and the learner has
  already finished a lesson today, make the summary's primary button "2-minute review" and the secondary "Next
  lesson".
- Why: spacing and interleaving. Mixing old items into new practice improves retention and discrimination
  (Rohrer & Taylor 2007). A default that builds the habit beats relying on learners to choose it (choice
  architecture).
- Confidence: med.

### F11 The summary shows scores and misses but not what the learner can now do; the respelling never fades
- Screen/route: lesson summary; teach cards and feedback   - Device(s): all   - Severity: low–med
- Evidence: `desktop/016_L1_summary.png` shows the stats, a line, "Missed on the first try" (`summary_missed`),
  and the missed items. `summary.js:48-61` has no list of what was learned. DESIGN "Presentation" says the
  "respelling fades as the learner advances (a setting, default on for the first lessons)", but no code does this
  (`grep fade` finds nothing). Respellings stay large on every card and feedback, for example "chao sa-baai-dii
  baw?" on `086_L10try_*_fb`.
- Suggestion: (a) Above the misses, add "You can now read:" with the lesson's new letters and words (Lao, ▶,
  gloss) from `bundle.items` with role `new`. Rename `summary_missed` from "Missed on the first try" to "Coming
  back for practice". (b) Make the respelling fade: hide it behind a tap on cards and feedback once a word is at
  ladder level 3 (or from lesson 11 on), with a setting to keep it.
- Why: self-determination theory. Visible competence ("I can read ກິນເຂົ້າ") sustains motivation more than a
  percentage. Fading scaffolds moves the learner from the crutch to the Lao script (Renkl & Atkinson 2003).
- Confidence: med.

## Missing features / sections
- **Say it (shadow and compare)** after new words and sentences: speaking practice with self-comparison. Basis:
  the output hypothesis and noticing (Swain; Schmidt), shadowing (Hamada 2016). For every learner. Size M
  (`recorder.js` exists).
- **Take a part in the conversation** (role-play with the native recording as model): the first real speaking
  turn, at the section goal of lesson 10. Basis: rehearsal and transfer-appropriate processing. Size S–M.
- **Which melody? (tone identification)** on known words, from audio plus tone pictures. Basis: perceptual tone
  training (Wang et al. 1999). For every learner, from about L5. Size M.
- **Warm-up of due items at the start of a lesson** (F10). Basis: spacing and interleaving (Cepeda 2006; Rohrer &
  Taylor 2007). Size S–M.
- **Memory strength in My words and Letters** ("Strong / Getting there / Due", from the box, F2). Basis:
  calibration of judgements of learning (metacognition). Size S.
- **A short decodable story at each section end** (5–8 lines of the section's words, read with ▶ per line, then
  2–3 comprehension questions). It delivers the "conversations and stories" stage of CURRICULUM_PATH and gives
  connected reading. Basis: decodable text practice for beginning readers (Mesmer 2005; Cheatham & Allor 2012).
  Size M (content plus the existing dialogue card).
- **Delayed retention signal for the owner** (alpha analytics): the first-try accuracy of items asked ≥ 1 day
  after their last success, per lesson. It shows which lessons' items do not stick. Basis: delayed testing as the
  valid measure of learning. Size S (SQL view).

## Top 5 (most valuable changes, ranked)
1. F1: count at most one success per item per day in `practice_queue`, so new items come back at one and three
   days (spacing).
2. F3: add "Say it" (shadow and compare) and "Take B's part" in conversations, the minimal speaking path.
3. F2: base "known" on delayed evidence, keep replays from raising levels, and show memory strength
   (assessment validity, metacognition).
4. F10: a 3–4 question warm-up of due items at the start of each lesson (spaced, interleaved review by default).
5. F4 and F5 together: a "Which melody?" tone activity plus the ◌້ two-melody recap card, and the new sentences'
   builds moved after a short lag with fewer repeated blanks (tone perception; cognitive load).

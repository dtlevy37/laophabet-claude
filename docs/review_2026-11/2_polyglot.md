# 2_polyglot: experienced learner (Thai reader, phonetics), tablet

Viewpoint: I read Thai well and know IPA, tones and aspiration, and I study on a tablet in long sessions. Shots are
from `tmp/review/shots/tablet_p` and `tablet_l`. My own live-app shots (account `review_agent2`, 768x1024) are in
`tmp/review/shots/extra/2_polyglot/`.

## Findings

### F1 The intake asks if I read Thai or Lao, then nothing changes: no fast track and no way to test out
- Screen/route: `#/` intake → `#/lessons`, every lesson   - Device(s): all   - Severity: high
- Evidence: `tablet_p/003_intake.png` ("Do you know Thai? ... I can read Thai"); `app/frontend/js/intake.js:8`
  (answers are stored only "for the stats ... may set defaults later"); `tablet_p/114_lessons.png` (lessons 3+
  locked); checkpoints are locked until the section's last lesson
  (`app/backend/supabase/migrations/20261114160000_h4_checkpoints.sql:50,66,121`); `session.js:51` (`BUDGET = 30`, the
  same for everyone).
- What happens: as a Thai reader, I find almost every word in lessons 1–12 is a cognate that I can read on sight: ກິນ (kin,
  "eat"), ມີ (mii, "have"), ມາ (maa, "come"), ນ້ຳ (nam, "water"), ດີ (dii, "good"), ສະບາຍດີ (sa-baai-dii, "hello"),
  ແກ້ວ (kaew, "glass"), ນອນ (nawn, "sleep"). Still, each lesson takes 30–45 steps before retries (L12 dry run:
  45 steps, `tablet_p/095`). Lessons unlock one at a time, and the checkpoint opens only after lesson 10. Review on
  demand works well (Review 2/5/10 min, the `#/read` viewer, ⓘ). Going faster does not work at all.
- Suggestion (keeps "show first, test later", because every item still gets its card):
  1. **Adaptive closing block:** if every first check in a lesson was right on the first try, cut the optional
     closing questions to about 3 (the first checks, kept questions, conversation and retries stay as they are).
  2. **Use the intake:** for `thai = 'reads'` or `lao_reading` of "slowly" or better, show lessons in the current
     section as open (still in the suggested order) instead of 🔒, and default to the shorter closing block.
  3. A Settings choice "Lesson pace: Standard / Brisk" that sets the same budget, so the learner controls it.
- Why: expertise reversal. Practice that helps a novice wastes an expert's time, and it is the main reason experienced learners drop out.
- Confidence: high (code and shots); the effect on retention is my judgement.

### F2 There is no help for Thai readers. They will mostly read the letters right and the tones wrong
- Screen/route: letter, vowel and word teach cards, More   - Device(s): all   - Severity: high (for this audience)
- Evidence: no Thai mention in `docs/DESIGN.md`, `LESSON_RULES.md` or teach texts (grep); `tablet_p/118_words_detail.png`;
  tones from `data/words.csv` vs the Thai rules.
- What happens: Lao uses the same consonant classes and tone marks as Thai, but they give different tones. A Thai
  reader who carries the Thai tone over will get most early words wrong when speaking:
  - ກິນ (kin, "eat"): mid class, unmarked → Lao **low-rising** (Thai กิน is mid). Same for ດີ (dii, "good").
  - ມີ (mii, "have"), ມາ (maa, "come"), ລາວ (laao, "he/she"): low class, unmarked → Lao **high-rising** (Thai
    มี, มา are mid).
  - ◌່ gives **mid** with every class: ບໍ່ (baw, "not"), ແມ່ນ (maen, "that's right").
  - ◌້ on low class: ນ້ຳ (nam, "water") is **high-falling** (Thai น้ำ is high).
  Spelling and meaning traps the app could point out: Lao writes the short a that Thai leaves out (ສະບາຍດີ vs
  สบายดี). The Lao word for rice, ເຂົ້າ (khao), has the vowel shape of Thai เข้า, not ข้าว. ລາວ (laao) also means
  "he/she". ເຈົ້າ (chao) is the everyday polite "you". ຍ at the start of a word is "ny" (Thai ย is y).
- Suggestion: add an optional one-line "Thai readers:" note under More on letter, vowel, tone-mark and word cards.
  Show it when intake `thai = 'reads'`, or with a Settings toggle "I read Thai". Use a new nullable column
  (`thai_note`) on units and words, filled only where Lao and Thai differ. Start with the four tone lines above, on
  the ◌່ and ◌້ cards and on the first unmarked mid-class and low-class words (ກິນ in L1, ມີ in L12).
- Why: negative transfer is the main error source for learners of closely related languages. Naming the
  difference once prevents a habit that is hard to unlearn later.
- Confidence: high on the Lao tones (from `words.csv`, verified rows) and on the Thai tones.

### F3 Twelve lessons of tone marks and "consonant class" with no rule or reference anywhere
- Screen/route: `#/read/L0002/5` (◌້ card), `#/letters/C01`, word cards   - Device(s): all   - Severity: high
- Evidence: `extra/2_polyglot/c_read_L2_5_tonemark_more.png` ("It changes the melody of the word"; the only rule is
  hidden under More: "Gives low-falling after high-class letters, high-falling after mid- and low-class letters");
  `tablet_p/116_letters_detail.png` ("Consonant class: mid", never explained); L3 "Teaching tone" is still
  unbuilt in `docs/PLAN.md`.
- What happens: by lesson 12 I have met ◌້, ◌່, high/mid/low classes and live/dead syllables (ສະ in ສະບາຍດີ), and
  each word card shows a pitch line. I still cannot predict a single tone from the spelling, and no screen holds the
  system. The pitch picture has no legend.
- Suggestion: before the full L3 lesson, add a static **Tones** reference sheet (Letters and sounds → "How tones
  work"). Show the class × (live, ◌່, ◌້, dead long, dead short) table from `docs/SCHEMA.md` "Tone convention", with
  only cells the learner has reached and one taught word each (ກິນ kin low-rising, ມີ mii high-rising, ຫິວ hiw
  low-rising, ບໍ່ baw mid, ເຂົ້າ khao low-falling, ນ້ຳ nam high-falling, ສະ sa high-rising), each with its pitch
  line and ▶. Also add a legend link under every word card's TONE picture.
- Why: adults learn faster with explicit rules than by working them out themselves (explicit instruction), and a
  reference lets a fast learner check a rule on demand.
- Confidence: high.

### F4 Speaking: nothing asks me to say anything; add a role-play turn to conversations now
- Screen/route: conversation card and fill-in (L8, L10)   - Device(s): all   - Severity: high
- Evidence: `tablet_p/085_L10try_conversation_all_revealed.png`; `strings.json:251` `dialogue_intro`: "Read the
  Lao first. Tap a word for its meaning, Reveal for a line's sound and English, ▶ to hear it."; activities in
  `js/activities/` are all recognition or recall (no production); L5 "Say it" is unbuilt in `docs/PLAN.md`.
- What happens: the app says it teaches reading and speaking, but up to lesson 12 I only read, tap and listen.
  The lesson 10 conversation (ເຈົ້າຫິວເຂົ້າບໍ່? chao hiw khao baw?, "Are you hungry?") is the ideal moment to speak,
  and nothing prompts it.
- Suggestion (S, no recording or tech): after the conversation card, add a "Your turn: be B" step. A's line plays,
  B's line shows only the Lao with a "Say it, then tap" button, then B's recording plays so the learner can compare
  (shadowing). Change `dialogue_intro` to add "Say each line aloud before you reveal it." When L5 lands, the same
  step records the learner's take.
- Why: you only get fluent at producing speech by producing it (output hypothesis). Shadowing a native model is the
  cheapest effective form for beginners.
- Confidence: high that it is missing; the design is my proposal.

### F5 Tones are missing from every sound line outside the word card
- Screen/route: wrong-answer feedback, build-sentence feedback, conversation reveal   - Device(s): all   - Severity: med
- Evidence: `tablet_p/103_L12try_8-47_card_mc_fb.png` ("mii nam baw?"), `tablet_p/085` ("chao hiw khao baw?");
  `docs/SCHEMA.md` "Tone is not part of the respelling".
- What happens: when I read a sentence aloud, the only tone information is on each separate word card. Sentence and
  conversation lines give a toneless romanization, so speaking practice rehearses the wrong pitch.
- Suggestion: add a Settings toggle "Show tones in sounds" (off by default). It draws the existing small pitch line
  (`js/tone.js`) above each syllable of the sound line in feedback and conversation reveals, from the sentence's
  per-word `tone_by_syllable`.
- Why: for a tonal language, tone is part of the word's form, and a learner who sees tone with every word encodes it
  with the word.
- Confidence: med (I did not check whether sentence RPCs already return per-word tones).

### F6 Romanization contradicts itself on some cards
- Screen/route: ເຂົ້າ word card, ຈ letter card, final ວ   - Device(s): all   - Severity: med
- Evidence:
  - `data/word_notes.csv` W000019: "ກິນເຂົ້າ (gin kao, "eat rice")" is shown as-is under a Standard header "kin khao"
    (phone `072_L2_8-19_card_teach`). Prose notes do not go through `translit.js` `respell()`.
  - ຈ card: big label **ch** with the hint "The j in 'jaw'" (`extra/2_polyglot/b_read_L9_6_more.png`;
    `letters.csv` C05). The Standard label and the agreed hint disagree on the same card.
  - Final ວ is labelled "ao", the same as ເ◌ົາ (`docs/DESIGN.md` open question 1). But ລາວ (laao) has a long /aːw/
    and ເຂົ້າ (khao) a short /aw/, a length contrast that Thai readers know (ลาว vs เลา).
- Suggestion: (a) in word notes, write romanization as a marker such as `{gin kao}` and pass it through
  `respell()` when the note is rendered, or rewrite W000019 to drop it ("ກິນເຂົ້າ, literally 'eat rice', means 'have a
  meal'"). (b) For ຈ in Standard style, say "ch here means the j in 'jaw': no puff of air", matching the ກ hint
  ("a k with no puff of air"). Or let the owner choose "j" for ຈ in Standard. This is the owner's call, since the hint
  wording was agreed on 2026-11-17. (c) Label final ວ "w" (its own sound) and leave "aao" or "ao" to the words.
- Why: one learner should see one spelling system. Mixed systems on one card make the learner doubt both.
- Confidence: high on (a) and (b); (c) is a phonetics preference.

### F7 Tablet: conversations need scrolling for every line; Lao is not the biggest text in example rows
- Screen/route: conversation card, unit teach card, build-sentence feedback   - Device(s): tablet_l, tablet_p   - Severity: med
- Evidence: `tablet_l/082_L10try_24-48_conversation.png` (only 3 of 7 lines fit in 768px of height; each bubble is
  ~170px high because the Lao, ▶ and Reveal each take a row: `styles.css:758-761`); `tablet_p/019` and `tablet_l/018`
  (the "Hear it in a word" example ເຂົ້າ looks no bigger than "khao": `.unit-word-lao` 1.7rem, `styles.css:465`);
  `tablet_p/103` (build-sentence feedback puts "mii nam baw?" in bold as the headline, with the Lao below it).
- Suggestion: at min-width 600px, put ▶ inline at the end of the `.dlg-lao` line and Reveal on the same row as the
  sound/English, which roughly halves the bubble height so the whole lesson 10 dialogue fits on a landscape tablet.
  Raise `.unit-word-lao` to about 2.2rem from 600px. In build-sentence feedback, put the Lao line first and the
  romanization under it, as in the MC feedback.
- Why: a learner who sees the whole dialogue at once can follow turn-taking (coherence). Keeping the Lao script
  as the largest text follows the app's own rule.
- Confidence: high (shots and CSS).

### F8 Letters and sounds is a progress list, not a chart of the system
- Screen/route: `#/letters`   - Device(s): all   - Severity: med
- Evidence: `tablet_p/115_letters.png` (12 consonants in teaching order: ກ ນ ຂ ລ ວ ບ ດ ສ ຍ ຫ ຈ ມ; greyed tiles
  only for letters in built lessons; no class); `js/letters.js:11-16,66`; `tablet_p/119_write.png` shows all 27
  consonants in traditional order, so the data exists.
- What happens: a Thai reader expects the alphabet in its order (ກ ຂ ຄ ງ ຈ ສ ຊ ຍ ດ ຕ ຖ ທ ນ ບ ປ ຜ ຝ ພ ຟ ມ ຢ ຣ ລ ວ ຫ ອ ຮ)
  grouped or coloured by class, since class drives tone (F3). I cannot see the 15 consonants that are not in a lesson
  yet, how many vowels exist, or which are long and short pairs.
- Suggestion: add a "Chart" toggle on `#/letters` (keep the current "My letters" as the default). It shows all 27
  consonants in traditional order, each with a class label (high/mid/low), and taught ones tappable. It also shows the
  vowels as short/long pairs. Untaught tiles show only glyph and sound, not their name words, which keeps DESIGN
  "never shown before it is taught" for name words.
- Why: a whole-system overview (advance organiser) helps experienced learners place each new item.
- Confidence: high.

### F9 Two small display bugs seen while checking phonetics
- Severity: low (both cheap and clearly right)
- **Tone-mark card shows an empty "Consonant class" row**: `extra/2_polyglot/c_read_L2_5_tonemark_more.png`. The
  label prints with no value, and the tone rule below it reads as if it were the class.
  `js/activities/teach_card.js:242` tests `u.letter`, which is set for tone marks with a null class. Fix: test
  `u.letter?.consonant_class`, and label the tone-mark rule line "Tone it gives".
- **Fill in the blank: after a miss, the right word in the gap is drawn red**: `tablet_l/086_..._fb.png`
  (ສະບາຍດີ in red next to "The right word is now in the gap" and a green ✓ on the same word below).
  `js/activities/fill_blank.js:171` marks the filled word `wrong` when the pick was wrong, and `styles.css:400`
  colours it as danger. Fix: the filled word is always the right word, so always use `fb-fill right`. The cross
  already sits on the picked option.

## Missing features / sections
- **Fast track / pace setting** (F1): adaptive closing block + "Brisk" pace + use the intake's Thai and Lao reading
  answers. For experienced learners and heritage speakers. M.
- **Thai-reader notes** (F2): one optional line per card where Lao differs. For Thai readers (the intake already asks). S–M (content).
- **Tones reference sheet** (F3) with legend for the pitch picture, before L3. For everyone, needed by fast learners. M.
- **Speak-aloud role-play / shadowing in conversations** (F4), ahead of L5 "Say it". For every learner (speaking claim). S.
- **Tones in sound lines** toggle (F5). For learners practising speaking from sentences. S–M.
- **Full alphabet and vowel chart** with classes and short/long pairs (F8). For reference users. M.
- **Slow playback** (0.75×) on ▶ for sentences and conversation lines. No `playbackRate` in `js/audio.js`. For
  listening and shadowing. S.
- **Tone listening drill** (minimal pairs such as ຂາວ kaao "white" vs ລາວ laao "he/she") as soon as L3 lands: already
  planned as S9b. Raise its priority for speaking. M.

## Top 5 (most valuable changes, ranked)
1. F4: a "Your turn: be B" spoken role-play step in conversations, plus "say it aloud" in the intro (S; first
   real speaking practice).
2. F3: a Tones reference sheet with the class × syllable-type table, taught examples and the pitch-line legend (M).
3. F1: a fast track: an adaptive closing block, a Brisk pace setting, and the intake's Thai/Lao-reading answers
   unlocking the section (M).
4. F2: "Thai readers" notes, starting with the four tone differences (ກິນ kin low-rising, ມີ mii high-rising,
   ◌່ always mid, ນ້ຳ nam high-falling) (S–M).
5. F7 + F6: on tablets, put ▶ and Reveal inline so the whole conversation fits on screen, and make romanization
   consistent (the "gin kao" note, the ຈ "ch" vs "j in jaw" mismatch) (S).

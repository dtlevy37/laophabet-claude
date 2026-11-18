# App review, November 2026: report

**What this is:** a one-off review of the app's layout, flows, wording and curriculum by 7 simulated reviewers,
written so it can be cut into PLAN slices. Once its slices are in `docs/PLAN.md`, delete this folder (CLAUDE.md
rule on one-off docs). How to run the review again: `scripts/review/README.md`.

**How it was run (2026-11-17):**
- One shared set of about 1,500 screenshots: phone 360×760, phone in "desktop site" mode, tablet portrait and
  landscape, desktop 1440×900, and desktop at 200% zoom. Lessons 1, 2, 8, 9, 10 and 12 were played with random
  answers, so both right and wrong feedback appear.
- 7 agents, briefed blind (none saw the owner's notes):
  1. New learner, phone (with a heritage-learner lens)
  2. Polyglot who reads Thai, tablet
  3. Fluent English–Lao translator
  4. PhD in educational theory
  5. UX doctorate, phones
  6. UX doctorate, large screens
  7. Rendering-bug engineer
- Their full findings are beside this file (`1_new_learner.md` … `6_ux_large.md`), and the bug hunter's is in
  `7_vowel_bug.md`.
- The main agent checked the key claims against the code. The owner's notes were brought in only at the end
  (section 5).

**How to read it:**
- ×N means N reviewers found the same thing on their own. That is the strongest signal here.
- ✔ means the main agent confirmed the claim in the code.
- Severity: **H** high, **M** medium, **L** low.
- Every Lao judgment made by the simulated speaker is **unverified** until Na has seen it.

---

## 1. Top 10, ranked by value for cost

| # | What | Found by | Size |
|---|---|---|---|
| 0 | **Fonts on non-Windows devices.** The default Lao font exists only on Windows, so phones draw ◌ and its mark with system fonts: the mark sits beside its circle, or floats into the label (section 2). Add Noto Sans Lao to the default stack and self-host it | ×1 (bug hunter) ✔ | S |
| 1 | **Right word shown in red.** After a wrong pick in fill in the blank and Complete the conversation, the gap shows the right word in red (`fill_blank.js:171`, :177) ✔ | ×4 | XS |
| 2 | **"Right answer" off the screen on phones.** On a phone, the "Your answer / Right answer" comparison scrolls sideways, so the right answer is clipped or off screen on every wrong build-the-sentence answer (`styles.css:415`, `.cmp`) ✔ | ×3 | S |
| 3 | **One feedback layout for every activity.** Lao first, then sound and meaning; one speaker per screen; ⓘ always in the same place. Today the eye hunts by activity: two speakers on "What does this word mean?", none on letter questions, romanization before the Lao in build the sentence | ×4 + owner | M |
| 4 | **Speaking is never practised.** No step asks the learner to say anything. Pull L5 phase 1 forward and add "Take B's part" to the conversations | ×3 | M |
| 5 | **Reviews come back too late.** The scheduler counts every right answer within one lesson as a spaced success, so a new word is next due in 7–30 days instead of 1–3 (`20261114120000_s8b_practice.sql:11,41`) ✔ | ×1 (education) | S (SQL) |
| 6 | **A7 rest should fix height first, then width.** On laptops (1280×720) and at 200% zoom, the feedback pushes the question off screen. On desktop, the options and the button sit 250–600px below the prompt | ×2 + owner | M–L |
| 7 | **The lesson summary says what you missed, not what you learned.** Its counts confuse ("5 new things" after 4; ນ listed twice, from the C13/C13f pair), and it has no ⚑ or ⚙ | ×4 + owner | S–M |
| 8 | **The Review time-picker (`#/practice`) has no way back.** The top bar is hidden and the screen draws no Back link ✔ | ×3 | XS |
| 9 | **Romanization contradicts itself.** The ຈ card says "SOUNDS LIKE ch" beside "The j in 'jaw'" (`translit.js:17` ✔). A note shows "gin kao" on a Standard "kin khao" card | ×3 | S + owner decision |
| 10 | **Conversations are 2½–3 screens tall.** ▶ and Reveal each take a row per line. There is no "Play all", and Complete the conversation draws its line differently from the conversation card | ×4 | M |

---

## 2. The two bugs in the brief

### 2a. A vowel mark drawn beside its circle (Galaxy S10+): likely cause found ✔
- **Cause.** The default "Standard" Lao font is `'Leelawadee UI', sans-serif` (`settings.js:35`, and the same
  fallback at `styles.css:148,149,617`). Leelawadee UI exists only on Windows.
  - On the S10+ (and on iPhone, Mac, Linux), no Lao web font loads at all. The Noto faces load only if the learner
    picks Looped, Plain or Serif.
  - So the ◌ (U+25CC, a symbol, not a Lao character) and the vowel mark come from whatever fonts the phone has.
- **Failure A: the mark beside the circle.** When the ◌ and the mark come from two different fonts, the mark can't
  attach and lands up and to the right.
  - Reproduced in the live app in Firefox: ◌ິ, ◌ີ, ◌້ and every vowel and tone tile on `#/letters`.
  - Also reproduced on the Noto settings while the web font is blocked or still loading (`display=swap`).
  - Chromium and WebKit never split the cluster in testing. Not confirmed: which browser the S10+ used, and whether
    Samsung ships a different Lao font.
- **Failure B: marks floating high.** Android's stock Lao font (AOSP Noto Sans Lao v1.03) has no anchor on ◌ and has
  marks about 1em tall. In Chrome the mark floats well above a small circle.
- **Why testing never showed it.** Every review screenshot, and every check run on the owner's PC, used Leelawadee
  UI, because the browser ran on Windows. "Not reproduced in headless Chrome" was the expected result, not evidence
  that the app is fine.
- **Fix** (S; it keeps the owner's 2026-11-09 choice of Leelawadee on Windows):
  1. Default stack `'Leelawadee UI', 'Noto Sans Lao', sans-serif` in `settings.js` and the three CSS fallbacks.
     Looped and Serif fall back to Noto Sans Lao too. Windows never downloads Noto; every other device gets one font
     that anchors marks to ◌.
  2. Self-host the three Lao woff2 subsets (Noto Sans Lao is about 21 KB) with `font-display: block`, in place of
     Google Fonts `display=swap`. That ends the split-font flash and the dependency on Google Fonts.
  3. Make the settings sheet's font sample `ກິນເຂົ້າ ◌ິ ◌້`, so a wrong mark shows at once.
- **Done when:** the owner's S10+ shows ◌ິ, ◌້ and ◌ໍ on their circle on `#/read/L0001/3`, `L0002/5` and `L0006/1`
  in the Standard setting.
- **Owner checklist** (before or after the fix; one screenshot each):
  1. Which browser it was: Samsung Internet, Chrome or Firefox.
  2. Which Lao font is selected in the settings sheet.
  3. The three cards above on Standard, then on Plain. If Plain is right and Standard wrong, fix 1 is the fix.
  4. Phone Settings → Display → Font style.
  5. Whether the mark starts wrong and jumps into place after a second.

### 2b. A mark too close to the lesson text on the card that introduces it
- **With the app's own fonts it is clear everywhere.** Every intro card in lessons 1–12 was measured on all three
  engines, all devices and all four font settings:
  - Gap above at least 11px (short phone 360×640) and 16px on a 360×760 phone.
  - Gap below at least 23px.
  - No clipping.
- **With Android's stock font, the ◌ໍ card (`#/read/L0006/1`) touches its label.** The mark overlaps "LAO VOWEL" by
  1.8px at 360×640, and leaves a 3px gap at S10+ size. This is very likely the earlier bug the owner saw. Fix 1 above
  removes it.
- **Second fix.** Headroom is given by kind (`teach_card.js:228` adds `.mark` only for tone marks), so vowels written
  above the consonant get none. Test the content for an above-mark instead, and keep some padding on short screens
  (about 20px). (S)
- **Small extra.** The ◌ in "The dotted circle ◌ is not a letter" is a tiny body-font glyph that doesn't look like
  the card's circle. Render it as a Lao placeholder, as `build_word.js:413` already does.

---

## 3. Inputs for A7 rest (the large-screen layout)

Reviewer 6 did a blind pass first, then critiqued the plan in PLAN.md. Your note asking whether the desktop layout
is too spread out vertically points the same way.

**What the review confirms:**
- A lesson side rail on wide screens.
- Narrower option buttons: 600px instead of today's 686px.
- Checking at 200% zoom.

**What should change in the slice:**
1. **Fix height first.**
   - On screens with a mouse (`(hover: hover) and (pointer: fine)`), lay content out in reading order: options
     24–32px under the prompt, feedback under the options, the button right under the content. Cap the lesson frame
     at about 820px tall and centre it.
   - Keep the bottom-anchored (thumb-zone) layout for phones only.
   - At short heights (`max-height: 560px`, which covers laptops and 200% zoom): a smaller hero glyph, hide the
     key-hint line, put the dry-run chip in the head row, and drop the empty 56px reserved action slot
     (`styles.css:308`).
2. **Widen the Done-when:** "at 1280×720 and at 200% zoom on 1440×900, every question and its feedback show the
   prompt without scrolling". The topbar check in the plan is moot: lessons hide the topbar, and it already holds at
   200%. The lesson stage is what breaks.
3. **Keep the rail from giving answers away.** "No meanings or sounds" is not enough: in many activities the Lao form
   is the answer (which word do you hear, which word means this, fill in the blank, build).
   - While a question is unanswered, the rail collapses to a progress line ("3 new · 4 review · step 12 of 40").
   - The rail shows its list on teach cards, conversations and feedback only.
4. **Breakpoints.** The rail needs about 1200px (820 + 320 + gutters). From 1024 to 1199px: no rail, a single
   column, with point 1 applied. Use `min-width`, so 200% zoom drops the rail by itself.
5. **One lesson column.** Questions use a single 600–640px column. 820px is for reading cards and conversations only.
   That way the prompt's and the options' left edges never disagree.
6. **New vs recycled items in the rail: never green or red,** which mean right and wrong. Use the accent colour plus
   "New" and "Review" pills.
7. **Owner decision: navigation rail.** Reviewer 6 suggests the non-lesson rail be navigation on every page (Home,
   Lessons, Review, Letters, My words, Write, Settings) rather than stats on home only. Moving between Letters and My
   words today costs two clicks via home. DESIGN says "No tab bar". A desktop rail is not a phone tab bar, but it
   changes the app's shape.
8. Put the contextual key list (F8 below) in the rail. It gives height back to the stage.
9. Accessibility: `<aside aria-label="This lesson">` after the stage in DOM order, no live-region chatter, nothing
   moves under reduced motion.

**Smaller large-screen items** (independent of the rail; can ship first):
- Keep the Hint slot's height after answering, so the options don't jump 55px.
- On wide screens, use the 2×2 grid for meaning options when the glosses fit.
- Single-letter options at about 3rem: the small vowel marks are exactly what the learner must tell apart.
- My words and Letters as list + detail side by side, and Settings in two columns. These need the owner to agree to
  the rail first.

---

## 4. Findings by theme (candidate slices)

### S-A. Feedback bugs and quick fixes (XS–S each; batch into one slice)
- [H ×4 ✔] **Red gap word.** The gap word in fill in the blank and Complete the conversation should always be
  styled right (`fill_blank.js:171`, :177).
- [H ×3 ✔] **The comparison scrolls sideways on phones.** Below 560px, put the labels above the rows, let the rows
  wrap, and mark missing words with a dashed `[missing]` chip. Keep the grid on tablet and desktop.
- [M ×2] **Build-the-sentence feedback leads with romanization.** Show the Lao first, then the sound with ▶. Left-align
  the "Right answer" row with "Your answer".
- [M ×3 ✔] **The Review picker needs a way out:** a "← Back" link, or the lesson ✕.
- [M owner-note ✔] **Sentence-card words are not tappable when the sentence has punctuation.**
  `teach_card.js:460` compares the joined words with `s.lao` after stripping only spaces. "ກິນ ເຂົ້າ." (kin khao,
  "eat") then never matches, so the card falls back to plain text. Strip punctuation too, or compare
  `lao_spaced`. Check how many sentence cards this hits once fixed.
- [L ×1 ✔] **The tone-mark card prints an empty "Consonant class" row** (`teach_card.js:242`). Test
  `u.letter?.consonant_class` instead.
- [L ×1] **Settings sheet.** It has two close controls with the filled one on the left: keep ✕ and make "Close"
  secondary (or drop it). Radios and checkboxes ignore the theme: add `accent-color: var(--accent)`.
- [L ×2] **"He is hungry. / She is hungry." shows as two stacked bold sentences** in prompts. Write "He's / She's
  hungry.", or put the alternative on a small muted line.
- [L ×1] **The "Complete the conversation" heading is clipped** under the dry-run pill on desktop feedback.
- **Done when:** the right word in a gap is never red; on a 360px phone a wrong build shows the whole right answer
  without sideways scroll; `#/practice` has a visible exit; ກິນ ເຂົ້າ. on its sentence card has tappable words.

### S-B. One answer anatomy across activities (M; owner notes 3, 4, 5, 9, 10)
- **The problem.** Reviewer 5 mapped every activity on phone: where the prompt, the speaker, the answers, the
  feedback and the button sit.
  - The answer's sound and meaning appear in the panel for multiple choice and listening, above the options for fill
    in the blank, and mid-screen for conversations.
  - The speaker is sometimes doubled (two on "What does this word mean?" and on "Which word do you hear?") and
    sometimes missing (letter questions).
  - ⓘ jumps between inline and a row of its own.
- **One template:**
  - Row 1: the head ("Correct" / "Not quite. The answer is:").
  - Row 2: **Lao**, then the sound, then the meaning.
  - Row 3: 🔊 on the left, ⓘ on the right, fixed.
  - Sentences use the same rows, with the sentence in row 2.
- **One speaker per screen, beside the Lao it plays.**
  - On fill in the blank, after the answer the ▶ sits next to the completed sentence, not in the panel. This
    matches your note.
  - On "What does this word mean?", the prompt's speaker is the only one. See also S-F (autoplay).
- **Contrastive feedback** (education F9, Shute 2008). When the wrong pick is a taught item, add one line: "'rice,
  food' is ເຂົ້າ (khao)." New key `mc_wrong_picked`.
- **Prompt wording,** parallel across activities. A proposed set:

  | Key | Now | Proposed |
  |---|---|---|
  | `mc_q_*` Lao→meaning | What does this word mean? | **Pick the meaning** |
  | `mc_q_*` meaning→Lao | Which word means this? | **Pick the Lao word** |
  | `mc_q_*` letter→sound | What sound does this make? | **Pick the sound** |
  | `mc_q_*` sound→letter | Which one makes this sound? | **Pick the letter** |
  | `lp_question` | Which word do you hear? | **Pick the word you hear** |
  | `fb_q` | Pick the missing word | Pick the missing word (unchanged) |
  | `fb_q_dialogue` | Complete the conversation | **Pick the missing word** (the conversation above makes the context clear) |
  | `fb_wrong` | Not quite. The right word is now in the gap. | **Not quite. The answer is:** (same as `mc_wrong`) |
  | `bs_q` | Build the sentence in Lao | Build the sentence in Lao (unchanged) |
  | `bs_howto` | Tap the Lao words to build the sentence. Lao word order is often different from English, so go by how Lao is said. Tap a placed word to take it back. | **Tap the words in Lao order. Tap a placed word to take it back.** |

  Reviewer 5 suggested the opposite (questions for every pick-one). "Pick the …" is shorter and reads the same
  everywhere. Owner's call.
- **Tool links become buttons.** "Can't listen now" and "Hint" become small secondary (outlined) buttons in a fixed
  tool row under the prompt. Keep them visually quieter than the options, so a hint stays a deliberate choice, and
  keep the slot when they disappear.
- **The lesson summary gets the lesson chrome:** ✕, ⚑, ⚙. This was your note, and reviewer 5 found it independently.
- **Done when:** every question type's feedback shows Lao → sound → meaning in the panel with one 🔊 and ⓘ in the
  same place (check one screen of each type at 360 and 1440), and no screen shows two speakers for the same Lao.

### S-C. Lesson summary that shows competence (S–M)
- **Add "You learned".** The lesson's new letters and words with ▶, plus "You can now read: ລາວ ຫິວ ເຂົ້າ (laao hiw
  khao, 'He is hungry')".
- **Count by base letter.** Merge the C13/C13f-style role pairs in `new_items` and `missed`, so it doesn't say "5
  new things" after 4, or list ນ twice.
- **Wording:**
  - `summary_words_read`: "Lao words read (with repeats)" → "Lao words read", or drop the stat.
  - `summary_missed`: "Missed on the first try" → "Coming back for practice".
- **Each missed item becomes a row** with Lao, sound, gloss, 🔊 and ⓘ. Add "Practise these now" as a secondary
  button.
- **Done when:** lesson 1's summary lists ກ ◌ິ ນ ກິນ once each, with sound.

### S-D. Conversations (M; ×4)
- **Compact layout:** ▶ inline after the Lao, Reveal on the same row, bubbles `max-width: 75%`. A 6-line dialogue
  should fit at 1440×900 before Reveal.
- **"Play the conversation":** plays each line in turn and highlights the bubble being spoken.
- **Complete the conversation:**
  - Draw the completed line like a revealed line (sound and English inside the bubble).
  - On phones, show only the previous 2 turns as context and scroll so the gap line is at the top. Today the options
    sit below the fold at 360×760.
- **Wording:** `dialogue_intro` says "▶" but the button is a speaker icon. Change it to "Tap the speaker to hear a
  line".
- **Keyboard and screen reader:** Space plays the next unplayed line, R reveals. Give each line its own label ("Play
  line 3, speaker A"); today 14 buttons all say "Play the sound".
- **Speaking: "Your turn: be B".** A's line plays, B's line shows in Lao, and the learner says it aloud, then hears
  B's recording to compare. There is no recording and no grading. This is the first speaking step and can ship
  before L5 phase 1.

### S-E. Speaking (fold into L5 phase 1; ×3)
- The app says it teaches speaking, but every activity only asks the learner to recognise or build answers.
  - L5 phase 1 ("Say it", agreed 2026-11-13) is the right shape: hear the native → say it → optionally record and
    compare.
  - Raise it in the working order, ahead of A10.
  - Add "Take B's part" (S-D) as its conversation form.
- **Slow playback** (0.75×) on 🔊 for sentences and conversation lines. It is cheap (`playbackRate`) and helps with
  tones and vowel length. ×3.

### S-F. Spacing, assessment and practice quality (S–M; mostly SQL; education)
- [H ✔] **`practice_queue`: count at most one success per item per local day,** and treat a hinted right answer as
  neither a success nor a lapse. Without this, the reviews at 1 and 3 days never happen for new items.
- [H] **"Known" should mean retained.**
  - Today, tapping the right answer once (even on a replay with the same four options) makes an item "known", and
    picking from four is logged as "recall" (`multiple_choice.js:109`).
  - Proposal: the *displayed* "known" needs a right first ask at least a day after the item was introduced. Replays
    (attempt > 0) don't raise levels above 1. Show memory strength in My words ("Strong / Getting there / Due").
  - This touches DESIGN's ladder and "no demotion" rule, so the owner decides.
- [M] **Warm-up:** start each lesson with 3–4 questions on the learner's most overdue items. Today reviews happen
  only if the learner opens Review, and novices rarely do.
- [M ✔] **Better wrong options.** Draw wrong options from the same kind as the answer: consonants with consonants,
  vowels with vowels. In L1, "k" with options ເ◌ົາ ກ ◌າ ◌ຳ can be answered by picking the only option without a
  dotted circle. On a replay, draw fresh wrong options (`multiple_choice.js:90,118`).
- [M owner decision] **Autoplay on Lao → meaning** lets learners answer by ear instead of reading (Share's
  self-teaching hypothesis). Play the clip after the answer, and keep ▶ before the answer as a logged hint.
- **Owner analytics** (small SQL view): first-try accuracy on items asked at least a day after their last success,
  per lesson. Ties into A12.

### S-G. Lesson length and honest progress (M; ×3)
- **Lessons run long.** Planned steps: L1 14, L8 30, L9 40, L12 45; DESIGN targets 10–25. With misses, L9 reached
  73 and L12 96.
  - The main cause: every new sentence gets its card, an immediate build and a blank.
  - Proposal: show the sentence cards back to back and build them 2–4 steps later (lag, not copying). Keep one blank
    per new word, and blank the same word in at most 2 sentences.
  - Nothing is cut: replays stay, as intended.
- **The progress bar slides backwards.** It and the "n / total" counter are based on `s.steps.length`, which grows
  with each miss. Base them on the planned steps, and show replays as "Another go: 2 left".
- **Keep the learner's place for several days,** not just the same day (`session.js:577`). Say so in `leave_body`.
- From L8 on, add a "good place to stop" marker after the last new item's practice.

### S-H. Tones (fold into L3; interim pieces are S)
- **Interim, now:** a first-time caption under the tone picture ("Lao words have a melody. This line shows it: ກິນ
  (kin, 'eat') starts low and rises a little. Listen and copy it."), then the short tone name on later cards. ×3
- **A ◌້ recap card:** the same mark gives two melodies, ເຂົ້າ (khao, "rice") low-falling and ນ້ຳ (nam, "water")
  high-falling. LESSON_RULES decision 18 asks for a recap card for an apparent contradiction like this, and none
  exists.
- **A Tones reference sheet** under Letters ("How tones work"): the class × syllable-type table, showing only cells
  the learner has reached, one taught word each with ▶. Wait for L3, or ship a minimal version first.
- **"Which melody?":** play a known word, pick its tone picture. It belongs in L3's pitch check.
- **Optional "Show tones in sounds"** in sentence feedback and conversations (polyglot). Low priority.

### S-I. Romanization and content consistency (S; owner and native decisions)
- [H ×3 ✔] **ຈ in Standard style is written "ch"** (`translit.js:17`), while its card says "The j in 'jaw'". On
  2026-11-17 you decided "j sound, no mention of ch", but every ເຈົ້າ still shows "chao".
  - Recommendation: write ຈ as **j** in both styles (jao, jaan).
  - The alternative is a card line: "Written ch here, but said like the j in 'jaw'". That adds load for little gain.
- [M ×3] **Notes with romanization typed in.** W000019 shows "ກິນເຂົ້າ (gin kao, 'eat rice')" on a Standard card.
  In Standard, "kao" spells ເກົ້າ (kao, "nine"). Make notes Lao-only, or mark the romanization `{gin kao}` and pass
  it through `respell()`. Grep `word_notes.csv` and `rules.csv`.
- [M] **The ຫິວ note contradicts lesson 10.** The L9 note says bare ຫິວ (hiw, "hungry") "sounds unfinished", then
  L10 teaches bare ຫິວ as the answer. Rewrite the note: a plain ຫິວ is fine as a quick reply; ຂ້ອຍຫິວ (khawy hiw,
  "I'm hungry") alone sounds unfinished. Confirm the Lao with Na. The row's `notes` also cites the retired Q0010:
  stale.
- [M] **ບໍ່ ມີ is split two ways in L12:** "ບໍ່ ມີ" in one sentence, "ບໍ່ມີ" (baw mii, "don't have") in the next.
  Segment both as ບໍ່ + ມີ.
- [M] **English side of the sentence cards** (Lao is checked; the English is not):
  - ກິນເຂົ້າ. (kin khao) "To eat (a meal)." → "Have a meal." Confirm the meaning with Na.
  - Use "please" consistently for ແນ່ (nae).
  - "This colour is white." → "This one is white."
  - ລາວມາແລ້ວ (laao maa laew) "He/She has arrived." → "He's / She's here."
  - The full table is in `3_bilingual.md` F5.
- [L] **ກິນ gloss.** "eat; (colloquial) drink" → "eat; drink". ກິນນ້ຳ (kin nam, "drink water") is everyday Lao, and
  "(colloquial)" tells learners to avoid it. Confirm with Na.
- [L owner decision] **"khawy" / "nawy" are hard to read at sight.** Both pron tips already say "coy" and "noy".
  Consider ◌ອຍ → "oy" (khoy, noy). Also, the Standard hint's "As on signs, maps" overclaims for vowels.
- [L] **The ແ hint and the planned ເ hint both point at "say".** Write the two as a contrasting pair before ເ◌ is
  taught.

### S-J. Mobile Lao sizes (S; resolves the NOTES item "Font size on mobile")
Reviewer 5 measured real Lao at 360 and 412 in Leelawadee and Noto Sans Lao (`5_ux_mobile.md` F6). Lessons 1–12
mostly fit, but 4-word sentences already wrap at 360, and 5–8-word sentences take 3 lines.

**Sizes:**

| Element | Now | Proposed |
|---|---|---|
| Teach sentence | 2.6rem | 2.2rem |
| `.dlg-lao` | 1.8rem | 1.5rem |
| `.bs-tile .lao` | 2rem | 1.8rem, min-height 52px |
| `.fb-sentence` | — | clamp(1.9rem, 8.5vw, 2.6rem); a `.long` class (5+ words) steps down to 1.7rem |
| `.glyph` | — | Single letters only |
| `.glyph.word` (new, word prompts) | — | clamp(2.8rem, 15vw, 4.5rem), nowrap. At 22vw today, ພາສາອັງກິດ (paa-saa-ang-kit, "English") would break mid-syllable |
| `.bs-answer` | 2rem | Unused CSS: drop |
| `.mc-option .lao`, base `.lao` | 2.2rem, 2rem | Keep |

**Also:**
- One class for Lao inside English prose (1.4em). Today it appears at four different sizes.
- A **Lao text size** setting (one `--lao-scale` variable) for small phones and weaker eyes. ×2
- Check on the S10+ itself before merging. All the sizes were measured in Windows fonts (Leelawadee, Noto); measure
  again after the font fix in section 2.

### S-K. Pace and prior knowledge (M; ×2)
- **The intake asks about speaking Lao and reading Thai, then nothing changes** (`intake.js:8` ✔: stored "for the
  stats").
  - For heritage speakers: skip the English-meaning question forms on level-1 words, and add a home line ("You
    already speak Lao, so lessons focus on reading").
  - For Thai readers: a shorter closing block. Optionally unlock the current section, or add a "Brisk" pace setting.
  - A test-out checkpoint can come later.
- **"Thai readers:" notes,** one line per card where Lao differs, shown when the intake says so. Start with tones:
  - ກິນ (kin, "eat") is low-rising in Lao, mid in Thai.
  - ມີ (mii, "have") is high-rising in Lao, mid in Thai.
  - ◌່ always gives mid.
  - ນ້ຳ (nam, "water") is high-falling in Lao, high in Thai.
  - The Thai side is unverified.
- **Lesson titles should name the payoff:** e.g. L9 "Are you hungry?" rather than "Hungry, you". `summary_en` is
  hidden on phones (`styles.css:547`); show it, clamped to one line.

### S-L. Reference and orientation (S–M)
- **Letters chart toggle:** all 27 consonants in traditional order with their class, and vowels as short/long pairs.
  Untaught tiles show only glyph and sound. Also "3 of 27 consonants" progress.
- **A level legend on My words** (Seen → Recognised → Recalled → Spelled).
- **First-run guide to the controls** (▶, ⓘ, ⚑, Hint, Can't listen now) on lesson 1's first card. Add a text label to
  ⚑ on home.
- **Banner for desktop-site mode:** on a phone it shrinks everything to about 37%, so the Lao tone marks can't be
  told apart. Detect it with `pointer: coarse`, `screen.width < 600` and `innerWidth ≥ 900`. ×2

### S-M. Native-side Lao UI (S; Na reviews first)
- **"You" switches register.** `pause_body` uses ເຈົ້າ (jao) where every other string uses ທ່ານ (than).
- **The question word is spelled two ways:** ບໍ and ບໍ່.
- **The speech-register labels come in two sets:** ທຳມະດາ/ກັນເອງ, ກາງໆ/ທົ່ວໄປ.
- **`sg_respelling` "in your own letters"** reads as Lao letters to a Lao speaker.
- **Native questions are English-only** behind a Lao interface (`questions.js:98`). Add `question_lo`.
- Everything here goes through Na (`docs/LAO_UI_REVIEW.md`). The suggested Lao is the simulated reviewer's and is
  unverified.

---

## 5. Your feedback, assessed

| # | Your note | Verdict | Reasoning and where it lands |
|---|---|---|---|
| 1 | Lesson 2's romanization choice needs better table formatting | **Agree** | The card shows a table, then repeats the same choice as a radio list (phone `065_L2_3-18`), so the learner reads the same thing twice (redundancy effect). **Make the table the control:** column heads ກ, ຂ; two tappable rows, Standard (k, kh) and English-style (g, k); the chosen row highlighted with a check; one muted line under each row ("The h means a puff of air" / "Closer to how English speakers hear it"); drop the radio list. → S-B |
| 2 | R03 "starts on the page before its consonant…" is clunky | **Agree; change the wording** | Reviewer 3 flagged the same sentence on its own. Your draft says the symbols are "before and after", but ເ◌ົາ has three parts: ເ before, ◌ົ above, າ after. Proposed: **"The next vowel, ເ◌ົາ, is written around its consonant: before, above and after it. You still say the consonant first, then the vowel."** It is content: change it via `db_sql.py change`. |
| 3 | My eyes go to different places for the same information | **Agree, strongly** | Reviewers 4, 5 and 6 found it independently, and reviewer 5 mapped it activity by activity. This is the biggest UX theme of the review. → S-B |
| 4 | After picking the missing word, the speaker should be next to the sentence | **Agree** | Spatial contiguity: the sound belongs to the completed sentence. Reviewer 6 found fill in the blank's panel to be "only Correct and a lone ▶". → S-B (one speaker, beside its Lao) |
| 5 | Two speakers after "What does this word mean?" | **Agree** | Confirmed (`multiple_choice.js:208/217/225`). Reviewer 5 found the same on "Which word do you hear?". Keep the one under the prompt. → S-B, with S-F's autoplay question |
| 6 | Is the desktop layout too spread out vertically? | **Yes** | Measured: options start about 240px below the prompt, and Next sits up to 600px under a teach card's text. Short laptops have the opposite problem (overflow), and the same fix, content laid out in reading order on mouse devices, solves both. → section 3, point 1 |
| 7 | Word pills on sentence introduction cards? | **Yes, and it is partly a bug** | The card is coded to make the words tappable, but punctuation breaks it (S-A). Splitting an unspaced script into words before testing it is sound (pre-training). Tap-to-reveal keeps the learner reading the Lao first. → S-A, then S-B |
| 8 | With word pills, much of the ⓘ data is redundant | **Partly agree** | For sentences, yes: the ⓘ sheet's word list repeats the bubbles. Trim it to the sentence's notes, rules and Report, and let a word's bubble open its full card. For single words and letters, ⓘ still carries what the panel doesn't (tone, IPA, notes, Report), so keep it there. → S-B |
| 9 | "Can't listen now" and "Hint" are plain text links; should be buttons | **Agree, as secondary buttons** | They are actions, not navigation, so they should look tappable. But they must stay quieter than the answer options, so a hint stays a deliberate choice. Keep the slot's height when they disappear (fixes the 55px jump). → S-B |
| 10 | "Which word means this?" is clunky; "What does this word mean?" less so | **Agree** | Reviewer 5 found the prompts not parallel. Proposed set: "Pick the meaning / Pick the Lao word / Pick the sound / Pick the letter / Pick the word you hear". → S-B table |
| 11 | The lesson complete page has no ⚑ or ⚙ | **Agree** | Reviewer 5 noted the summary lacks the app's chrome. ⚑ matters most: a learner may want to report a wrong stat or a missed item. → S-B / S-C |

None of your notes conflicted with the agents' findings. Three of them (2, 3 and 6) were also found independently,
and the check of note 7 turned up a real bug.

---

## 6. Decisions only you can make

1. **ຈ in Standard style:** "j" (recommended) or "ch" with an explanatory line. (S-I)
2. **Desktop navigation rail** on non-lesson pages vs DESIGN's "No tab bar". (Section 3, point 7)
3. **Autoplay on Lao → meaning questions:** play after the answer instead of before. (S-F)
4. **What "known" means:** delayed evidence for the displayed counts, and replays don't raise levels. (S-F; touches
   the ladder and "no demotion")
5. **Speaking first:** raise L5 phase 1 and "Take B's part" above A10 in the working order? (S-D, S-E)
6. **Use the intake:** a heritage or Thai fast path, and a pace setting. (S-K)
7. **Prompt style:** "Pick the …" set or questions. (S-B)
8. **◌ອຍ romanization** "awy" → "oy". (S-I)

## 7. Proposed questions for Na (after your OK)

Each is one plain question. Each needs your approval before it goes into QUESTIONS / `open_questions.csv`. Details
are in `3_bilingual.md`, "Questions for the native speaker".
1. Someone says just ກິນເຂົ້າ (kin khao). What do they mean?
2. In a shop, ມີນ້ຳບໍ່? (mii nam baw?): "Do you have water?", "Is there water?", or either?
3. ລາວມາແລ້ວ (laao maa laew): is the person already here, or on the way?
4. At home, do you say ກິນນ້ຳ (kin nam) for "drink water", to anyone?
5. With a friend your own age, do you put your hands together (ນົບ, nop) when you say ສະບາຍດີ (sa-baai-dii,
   "hello")?
6. After ຂ້ອຍສະບາຍດີ (khawy sa-baai-dii, "I'm well"), how do you ask the other person back? Please write it in Lao.
7. Which label fits "with friends and family" better: ທຳມະດາ (thammada) or ກັນເອງ (kan eng)?
8. When an app talks to you, which "you" feels right: ເຈົ້າ (jao) or ທ່ານ (than)?
9. Is a bare ຫິວ (hiw, "hungry") fine as a quick answer to ເຈົ້າຫິວເຂົ້າບໍ່? (jao hiw khao baw?, "Are you hungry?")

## 8. Suggested slice order

0. **The Lao font fix** (section 2). It is small, and it decides how every phone in the alpha shows Lao.
1. **S-A quick fixes** (one small slice; mostly one-liners).
2. **S-F scheduler fix** (one SQL migration). It is cheap and protects the alpha's data.
3. **S-B answer anatomy, with S-C summary.** These cover most of your notes.
4. **A7 rest, revised per section 3.**
5. **S-D conversations, then S-E speaking** (L5 phase 1).
6. **S-J mobile sizes**, then S-I content fixes after decisions 1 and 8 and Na's answers.
7. Later: S-G lesson length, S-H tones (with L3), S-K pace, S-L reference, S-M native UI.

Once A7 rest and S-B are built and the alpha has run, run a second, targeted review round
(`scripts/review/README.md`).

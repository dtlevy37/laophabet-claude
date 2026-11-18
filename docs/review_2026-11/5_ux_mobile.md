# 5_ux_mobile: UX doctorate, phones (consistency, controls, wording, Lao font sizes, dark mode)

Sources: the `phone` set (360×760) and `phone_desksite`, plus my own live captures in
`tmp/review/shots/extra/5_ux_mobile/`. Those are `p360_*` (360×760, L10 and L12 dry runs), `p412_*` (412×915, L10),
`dark360_*`, `teal_dark360_*` and `indigo_dark360_*`. Per-shot overflow metrics are in `metrics_p360.json` and
`metrics_p412.json`, and the font sweep is in `font_sweep.json`. Scripts are in `tmp/review/scratch/5_ux_mobile/`
(`cap.js` and `sweep.js`).

**Note for the team:** the shared set's `phone/843–862_dark_*` shots are **not dark**. They show the light theme.
The capture script sets `theme: 'dark'` in localStorage and then calls `page.goto` with a hash-only change. That does
not reload the page, and `settings.js` reads localStorage only once, at load (`settings.js:42-53`). So it is a bug in
the capture, not in the app. My `dark360_*` shots reload the page and show the real dark mode.

## Activity × element map (phone, 360×760)

| Activity (prompt string) | Prompt/Lao position | Speaker before answer | Answer area | Feedback panel holds | Speaker after answer | Primary button |
|---|---|---|---|---|---|---|
| What sound does this make? | huge glyph, centred top | none | 2×2 romanization, centred in the free space | Lao (2rem) + sound + ⓘ | **none** | Continue, bottom right, after answer |
| Which one makes this sound? | romanization as the prompt | none | 2×2 Lao | Lao + sound + ⓘ | none | same |
| What does this word mean? | huge Lao (.glyph) | pill under the Lao, then Hint link | 1 column, English | Lao + sound + gloss + 🔊 + ⓘ (ⓘ wraps to its own row) | **two**: pill under the prompt and pill in the panel | same |
| Which word means this? | English, bold 2rem | none | 2×2 Lao | Lao + sound + gloss + 🔊 + ⓘ | panel only | same |
| Which word do you hear? | 88px ▶ circle, then "Can't listen now" and "Hint" links | ▶ (a different icon) | 2×2 Lao | Lao + sound + gloss + 🔊 + ⓘ | **two**: big ▶ and pill 🔊 | same |
| Pick the missing word | Lao sentence with gap | none | 2×2 Lao | **only** head + 🔊 + ⓘ; the sound and English appear *above the options*, in the prompt area | panel | same |
| Complete the conversation | bubbles, then the line with the gap | none | 2×2 Lao, partly **below the fold** (`phone/450`) | head + 🔊 + ⓘ; the sound and English appear mid-screen, and the context bubbles scroll off the top | panel | same |
| Build the sentence | English, bold 1.4rem, then how-to text | none | answer line + tile bank (centred wrap), Check visible but disabled | "Your/Right answer" grid (scrolls sideways), then the panel: **romanization first, big and bold**, 🔊, ⓘ, *then* the Lao, then rule notes | panel | Check, then Continue |
| Conversation card | title, intro text, then bubbles | 🔊 pill per line, Reveal link per line | none | none | per line | Next |
| Teach card | label, glyph, sound, text, "Hear it in a word" box | 🔊 in the box | none | none | in the box | Next |

What the table shows. The eye looks for the answer in a different place each time: in the panel for MC and listen,
above the options for fill-in-the-blank, and mid-screen for conversations. The speaker is sometimes doubled and
sometimes missing. The ⓘ jumps between inline and its own row. Lao is the first item in MC feedback but comes after
the romanization in build-the-sentence feedback.

## Findings

### F1 The build-the-sentence "Your answer / Right answer" grid overflows sideways on every wrong answer
- Screen/route: build the sentence, wrong-answer feedback   - Device(s): phone 360 and 412   - Severity: high
- Evidence: `phone/081`, `phone/237`. `extra/5_ux_mobile/p360_016_L0010_build_sentence_fb.png`: the "Right
  answer" row is **completely empty** on screen, and all the right words are 275px off to the right. Also
  `p412_013` (412px still clips), `dark360_012`. The metrics show `cmpOverflow` > 0 in **8 of 8** wrong answers at
  360 (18–275px) and **4 of 4** at 412 (58–127px). Code: `compare.js:80-116`, `styles.css:415-426` (`.cmp
  {overflow-x:auto}`, `.cmp-grid {grid-auto-flow: column; width:max-content}`, labels in the first column).
- What happens: each word gets its own column, and the two labels take about 90px. With only 3–4 words the grid is
  wider than the screen. Nothing shows that the grid scrolls, so the learner sees ✗ tiles and an empty or clipped
  "Right answer" row. The feedback panel below repeats the sentence anyway.
- Suggestion:
  - (a) Put the labels above the rows, not beside them. Let each row wrap (`flex-wrap`) and drop the column
    alignment on phones (`@media (max-width: 560px)`).
  - (b) Or show only "Your answer" with its ✗ and [missing] marks, and let the panel's Lao sentence be the right
    answer, with the →-marked words highlighted.
  - (c) At minimum, shrink `.cmp-cell .lao` to 1.3rem with `padding: 0 6px` and `min-width: 40px`, and set
    `scrollLeft = 0` after render.
- Why: never hide the correction a learner needs (error feedback must be visible without hunting; Nielsen
  "visibility of system status").
- Confidence: high

### F2 In fill-in-the-blank and Complete the conversation, the right word shows in red after a wrong answer
- Screen/route: pick the missing word and complete the conversation, wrong answer   - Device(s): all   - Severity: high (cheap fix)
- Evidence: `phone/201` (ບໍ່ (baw, question word) red in the gap, green in the grid). `extra/.../p360_041`
  (ນອນ (nawn, "sleep") red in the sentence, green ✓ in the option). `p360_032` (ຫິວ (hiw, "hungry") red in the
  bubble). Code: `fill_blank.js:171` (`fb-fill ${ok ? 'right' : 'wrong'}`), `styles.css:399-400`, `708-709`.
- What happens: the gap always holds the *right* word, but it gets the danger colour when the learner was wrong. The
  same word is green in the options. Red on a correct word teaches the wrong association.
- Suggestion: always style the filled gap as right (`--ok`, bold, underlined). Or use a neutral accent, and keep the
  ✗ on the picked option as the only error signal. The comment at `styles.css:5-7` already says red is only for "wrong".
- Why: the meaning of a colour must stay consistent (one code per meaning).
- Confidence: high

### F3 The feedback panel differs by activity: Lao comes second in build-the-sentence, the speaker is doubled or missing, and ⓘ moves
- Screen/route: every question's feedback   - Device(s): phone   - Severity: med
- Evidence:
  - Romanization first: `phone/081`, `237`, `extra/p360_016`; `build_sentence.js:331-338` (answer-sound, then
    audio, then info, *then* `inlineSentence`).
  - Two speakers: `phone/021`, `027`; `multiple_choice.js:217/225` and `:208`; `listen_pick.js:170` and `:162`.
  - No speaker on letter questions: `phone/009`, `024`.
  - Empty panel on fill-in-the-blank: `phone/086`; `fill_blank.js:200-212`.
  - ⓘ on its own row: `extra/p360_007`, `phone/237`.
- What happens:
  - The L1 intro card says "Keep your eyes on the Lao". Yet build-the-sentence feedback leads with "kin khao." at
    1.4rem bold and puts the Lao under it.
  - Fill-in-the-blank and conversation feedback scatter the sound and English above the options. Their panel says
    only "Correct" plus icons.
- Suggestion: one panel template for every activity.
  - Row 1: the head ("Correct" / "Not quite. The answer is:").
  - Row 2: the **Lao** (2rem), then the sound (1.1rem, muted weight 600), then the gloss.
  - Row 3: 🔊 on the left, ⓘ on the right (a fixed `justify-content: space-between` row, never inline).
  - For sentences (build, fill-in-the-blank, conversation), put the Lao sentence in row 2 and the English under it.
    Drop the copy that appears above the options in fill-in-the-blank, or keep only the filled gap there.
  - Hide the prompt-area speaker once the panel's 🔊 appears, or keep the prompt one and drop the panel one. One
    speaker per screen.
  - Give letter questions a 🔊 in the panel too, if the letter has audio.
- Why: consistency and standards (Nielsen #4). A fixed answer location lowers search time across 40–90 steps a lesson.
- Confidence: high

### F4 Complete the conversation at 360: the options sit below the fold, and feedback scrolls the context away
- Screen/route: `#/try/L0010` steps such as 30/52 and 28/55   - Device(s): phone 360×760   - Severity: med
- Evidence: `phone/450`: only the top half of the first row of options is visible. Two-part line 7 has ບໍ່ ຫິວ (baw
  hiw, "not hungry") then ___ ກິນ ເຂົ້າ ແລ້ວ (gin kao laew, "have eaten already"). `extra/p360_032` / `_033`: after
  answering, the stage auto-scrolls (`session.js:1105`) and cuts the top bubble mid-glyph, and the "Complete the
  conversation" prompt disappears. The metrics show 2 of 4 options below the fold. 412×915 fits (`p412_019–026`).
- What happens: the learner has to scroll inside the stage to see all the choices. After answering, the screen jumps
  and shows a half-cut bubble.
- Suggestion:
  - Show at most the **previous two turns** above the gap line on phones. Collapse earlier turns behind a "Show
    earlier lines" link.
  - Shrink the context Lao (`.dlg-context .dlg-line:not(.dlg-now) .dlg-lao`) from 1.3rem to 1.2rem and the bubble
    padding from 8px to 6px.
  - On feedback, scroll so the gap line is the top item (`scrollIntoView({block:'start'})` on `.dlg-now`) rather than
    "nearest", so no bubble is cut.
- Why: on a phone a choice the learner cannot see does not exist for them. Keep the question and its options in one
  view (thumb-zone guidance).
- Confidence: high

### F5 Conversation card: the wording says ▶ but the button shows a speaker; heavy per-line chrome; no Play all
- Screen/route: conversation card (L8, L10)   - Device(s): phone   - Severity: med
- Evidence: `phone/197`, `434`, `extra/p360_019–021`. Strings `dialogue_intro`, `dialogue_intro_shown`. The
  stage overflows by 984–1066px at 360 (about 2.5 screens).
- What happens:
  - `dialogue_intro`: "Read the Lao first. Tap a word for its meaning, Reveal for a line's sound and English, ▶ to
    hear it." The button in each bubble is a 🔊 pill, not ▶. The ▶ circle is the listen-question control.
  - Each line has its own row of Lao, a 44px speaker on its own line, and a Reveal link. A 7-line conversation is
    long, and the B bubbles centre their speaker while the A bubbles left-align it.
  - Next stays live while most lines are unseen (fine), but there is no way to hear the whole exchange.
- Suggestion:
  - Wording: `dialogue_intro` → "Read the Lao first. Tap a word for its meaning. Tap the speaker to hear a line, and
    Reveal for its sound and English." `dialogue_intro_shown` → "Read it through. Tap a word for its meaning, or the
    speaker to hear a line."
  - Put the 🔊 inline at the end of the Lao line (`dlg-part` as a flex row with `align-items: baseline`). Put Reveal
    as a small link under it, on the speaker's own side.
  - Add a "Play the conversation" button under the title that plays each line in turn and highlights the bubble
    being spoken (see Missing features).
- Why: labels must match icons (recognition over recall). Fewer rows per turn lets more of the dialogue fit on screen.
- Confidence: high (wording); med (layout)

### F6 Font-size sweep: lessons 1–12 fit, but sentence-level Lao is too large for the sentences coming next
- Screen/route: teach sentence cards, fill-in-the-blank, conversation, build tiles, word prompts   - Device(s): 360, 412   - Severity: med (it grows with the curriculum)
- Evidence: `extra/5_ux_mobile/font_sweep.json`, made by `sweep.js`, which renders real Lao from
  `data/sentences.csv` at the app's sizes and widths, in Leelawadee UI and Noto Sans Lao.
  - Longest lesson sentences (4 words, 17 characters): S000002887 ເຈົ້າ ຫິວ ເຂົ້າ ບໍ່? (jao hiw kao baw?, "Are you
    hungry?") and S000002890 ຂ້ອຍ ກິນ ເຂົ້າ ແລ້ວ. (kawy gin kao laew, "I've eaten already.").
  - Longest lesson word: ສະບາຍດີ (sa-baai-dii, "hello").
  - Future-length checks:
    - S000001821 (5 words): ການເດີນທາງ ໄປ ຫຼວງພະບາງ ໃຊ້ເວລາ ຫຼາຍ (gaan-doen-taang bpai luang-pa-baang
      sai-wee-laa laai, "The trip to Luang Prabang takes a long time")
    - S000000740 (6 words): ນັກຮຽນ ມາ ໂຮງຮຽນ ເພື່ອ ຮຽນ ພາສາອັງກິດ (nak-hian maa hoong-hian peua hian
      paa-saa-ang-git, "The students come to school to study English")
    - S000002057 (8 words): ມື້ອື່ນ ພວກເຮົາ ໄປ ເບິ່ງ ໜັງ ຢູ່ ໂຮງໜັງ ບໍ່? (meu-eun puak-hao bpai boeng nang yuu
      hoong-nang baw?, "Shall we go and see a movie at the cinema tomorrow?")

  Lines taken (360 / 412):

  | Element (current size) | 4-word S2890 | 5–8 words |
  |---|---|---|
  | teach sentence `.teach>.sentence-words>.lao` 2.6rem | **2** / 1 | 3 / 3 |
  | conversation `.dlg-lao` 1.8rem | **2** / 1 (also seen in `phone/434`) | 3 / 2 |
  | fill-in-the-blank `.fb-sentence` clamp(2.2rem, 10vw, 3rem) | 1 / 1 | 3 / 3 |
  | conversation gap line clamp(1.8rem, 8vw, 2.4rem) | 1 / 1 | 3 / 2–3 |
  | base `.lao` 2rem (feedback panel) | 1 / 1 | 2 / 2 |
  | `.bs-tile` 2rem, with 2 distractors | 2 rows | 3–4 rows (6 words: 4 rows at 2rem, 3 at 1.8rem) |
  | `.mc-option .lao` 2.2rem, 2 columns (125px inside) | ສະບາຍດີ 118px fits | compounds such as ຮ້ານອາຫານ (haan-aa-haan, "restaurant") at 160px drop to 1 column (`fitOptions`, fine) |

  `.glyph` on a word prompt (`multiple_choice.js:132`) is 22vw, which is 79px at 360. At that size ຮ້ານອາຫານ or
  ພາສາອັງກິດ (paa-saa-ang-git, "English") is about 360px wide, more than the 328px column. `.lao` has
  `word-break: break-word`, so the word would break mid-syllable. I measured the width, not the break itself, which
  is untested on screen.
- Recommendation (sizes):
  - `.glyph`: keep clamp(4rem, 22vw, 6rem) for **single letters** (teach cards, "What sound does this make?").
  - Add `.glyph.word`, used for word prompts and word cards: clamp(2.8rem, 15vw, 4.5rem) with `white-space: nowrap`.
  - Base `.lao`: keep 2rem.
  - `.mc-option .lao`: keep 2.2rem (the 1-column fallback already handles long compounds).
  - `.bs-tile .lao`: **1.8rem** (saves a row at 6+ words), with `min-height: 52px`.
  - `.bs-answer`: drop it. It is in `styles.css:223` but no JS uses it. Otherwise match the tiles at 1.8rem.
  - Teach sentence: **2.2rem**.
  - `.dlg-lao`: **1.5rem**.
  - `.fb-sentence`: clamp(1.9rem, 8.5vw, 2.6rem). Add a `.long` class (5+ words) that steps every sentence size down
    to 1.7rem, so long sentences take 2 lines, not 3.
  - Separately, offer a Lao text-size setting (Missing features).
- Why: line breaks inside short sentences hurt reading of an unspaced script. Readers of a new script need the whole
  phrase in one or two fixations.
- Confidence: high (measured); med (exact values: check with Android's own Lao font, which I could not run)

### F7 Lao inside English text comes in four sizes
- Screen/route: teach-card text, info sheet, rule notes, pair notes   - Device(s): all   - Severity: low-med
- Evidence:
  - Body size, 1em: `extra/p360_001` (ບໍ່, ອ, ຂ້ອຍ in the unit text), `p360_004` (info sheet).
  - 2rem: `phone/237`, where the rule-note ບໍ່ is huge and spreads the lines (`build_sentence.js:12` uses class
    `lao`, which is 2rem).
  - `.lao-note` 1.3em and `.lao-inline` 1.8em: `styles.css:146`, `457`.
- What happens: in some places the Lao is too small to read its marks; in others it breaks the line rhythm.
- Suggestion: one class for Lao inside prose, at `font-size: 1.4em; line-height: 1`. Use it in teach text (`hint`),
  info sheets, rule notes, `laoPart` and `cmp-note`.
- Why: typographic consistency. Lao marks need about 1.3–1.5× Latin size to be legible inline.
- Confidence: high

### F8 Several sentences' English shows as two stacked sentences
- Screen/route: build-the-sentence prompt, fill-in-the-blank feedback, conversation feedback   - Device(s): all   - Severity: low-med
- Evidence: `extra/p360_032`: "I'm hungry. / Hungry." renders as two bold lines, "I'm hungry." then "Hungry.".
  `p360_016` and `041`: "He's asleep already." / "She's asleep already.". Code: `build_sentence.js:344-365`,
  `fill_blank.js:236/249`.
- What happens: the alternatives read as two sentences, or as a second clue.
- Suggestion: show the first English, then the alternatives on one muted line: "He's asleep already." with
  "also: She's asleep already." in small type. For he/she pairs, "He's / She's asleep already." reads cleanly.
- Confidence: high

### F9 Prompt and instruction wording is not parallel
- Screen/route: all question types   - Device(s): all   - Severity: low
- Evidence: `strings.json`. The pick-one prompts are questions (`mc_q_*`, `lp_question`). The build and gap prompts
  are imperatives (`bs_q` "Build the sentence in Lao", `fb_q` "Pick the missing word", `fb_q_dialogue`). The wrong
  heads have three different shapes.
- Suggestions (key: current → proposed):
  - `fb_wrong`: "Not quite. The right word is now in the gap." → "Not quite. The answer is:" (same as `mc_wrong`;
    then the panel shows the Lao word, its sound and gloss, per F3).
  - `bs_q`: "Build the sentence in Lao" → "Build this sentence in Lao".
  - `fb_q`: "Pick the missing word" → "Which word fills the gap?" (pick-one prompts stay questions; build tasks stay
    imperatives).
  - `fb_q_dialogue`: "Complete the conversation" → "Which word completes this line?"
  - `bs_howto` (3 sentences, about 30 words): "Tap the Lao words to build the sentence. Lao word order is often
    different from English, so go by how Lao is said. Tap a placed word to take it back." → "Tap the words in Lao
    order. Lao order often differs from English. Tap a placed word to take it back."
  - `summary_words_read`: "Lao words read (with repeats)" (it shows uppercase and wraps) → "Lao words read".
- Confidence: med (taste); high that the current mix is inconsistent

### F10 Screens outside lessons: the Review picker has no exit, the summary list does nothing, the lesson list truncates titles
- Screen/route: `#/practice`, the lesson summary, `#/lessons`   - Device(s): phone   - Severity: med
- Evidence:
  - Review picker: `phone/830`. The top bar is hidden (`app.js:122`, `isLessonRoute`), and the picker draws no ✕
    or ← Back, so there is no way back except the browser.
  - Summary: `phone/059`. No chrome. "Missed on the first try" is a plain bullet list: Lao at about 1.6rem with tiny
    romanization, no audio, nothing tappable.
  - Lessons list: `phone/833`. "A second word and a …" is clipped because of the Review link. "7 more lessons" is
    unstyled blue text with no chevron. The lock is a colour emoji 🔒 among flat line icons.
- Suggestion:
  - Give the Review picker the lesson chrome (✕ on the left, ⚙ on the right) or the learner top bar with "← Back".
  - Summary:
    - Make each missed item a row: Lao (2rem), sound, gloss, and a 🔊 with ⓘ (open its card).
    - Add a button: "Practise these now" as secondary, "Next lesson" as primary on the right.
  - Lessons list:
    - Let `.path-name` wrap to 2 lines, or make "Review" an icon button (↻ with aria-label) so titles are not clipped.
    - Give "N more lessons" a ▸ / ▾ disclosure mark.
    - Swap 🔒 for a monochrome SVG lock in `--muted`.
- Why: user control and freedom (always an exit). Feedback lists should be actionable.
- Confidence: high

### F11 Settings sheet: two close controls with the primary on the left; radios ignore the colour theme
- Screen/route: ⚙ in a lesson or the header (settings sheet), `#/settings`   - Device(s): phone   - Severity: low
- Evidence: `phone/842` (✕ top right *and* a filled "Close" bottom left), `phone/839`. The radio and checkbox dots
  are the browser's default blue in every palette: `styles.css` sets `accent-color` only on the progress bar (line 176).
- Suggestion:
  - Keep the ✕. Make the bottom "Close" a full-width secondary button, or drop it. A filled primary on the left
    breaks the app's "primary on the right" rule.
  - Add `input[type=radio], input[type=checkbox] { accent-color: var(--accent); }`.
  - On touch-only devices, hide the Keyboard section (`@media (hover: none)`).
- Confidence: high

### F12 Dark mode and the colour themes: in good shape
- Screen/route: home, lessons, every activity   - Device(s): phone 360   - Severity: low
- Evidence: `extra/dark360_001–022`, `teal_dark360_*`, `indigo_dark360_*`.
- What happens: the tokens carry through cleanly. Right and wrong stay distinct (#5fd08a / #ff8a7a with ✓ / ✗), the
  primary reads as a light fill with dark text, and the Lao contrasts well. The only thing I noticed is that options
  and tiles use `--bg`, darker than the card, so in dark mode they look sunk rather than raised. That is acceptable
  and consistent.
- Suggestion: no change needed. Fix the capture script (note at the top) so future reviews see dark shots.
- Confidence: high

### F13 Desktop-site mode on a phone shrinks everything to about 37%
- Screen/route: all   - Device(s): `phone_desksite`   - Severity: low-med
- Evidence: `phone_desksite/010`, `086`: a 980px layout drawn at 360px. Lao options are about 13px physical,
  primary buttons about 18px tall, and on tall layouts the options sit far below a huge empty gap. The capture also
  shows the keyboard hints ("Keys: 1–9 choose …") and number badges. On a real phone (`pointer: coarse`) they probably
  would not show; I could not confirm this.
- Suggestion: when `matchMedia('(pointer: coarse)').matches && innerWidth >= 900 && screen.width < 600`, show a
  one-line dismissible banner: "Your browser is showing the desktop site. Turn off 'Desktop site' in the browser menu
  for bigger text."
- Confidence: med

## Missing features / sections
- **Lao text size setting** (Small / Medium / Large, scaling every Lao class through one `--lao-scale` variable):
  for learners with small phones or weaker eyesight, and because sentences will get longer. Size S.
- **Play the whole conversation** (sequential playback that highlights the bubble being spoken, with a Stop): for
  listening and shadowing practice in conversation cards. Size M.
- **Slower playback** (a long-press or second tap on 🔊 plays at 0.75×): for tones and vowel length, which beginners
  miss at full speed. Size S–M (needs audio playbackRate only).
- **Actionable summary**: tap a missed item to hear it or open its card, plus "Practise these now". For every
  learner after every lesson. Size S.
- **Exit on the Review picker** (F10). Size S.
- **Optional haptic or sound cue on right and wrong** (off by default): mobile learners often glance away, and a
  short vibration confirms the tap. Size S.

## Top 5 (most valuable changes, ranked)
1. **F1**: make the "Your answer / Right answer" comparison wrap or stack on phones. Today the right answer is
   clipped or entirely off-screen on every wrong build-the-sentence answer at both 360 and 412.
2. **F2**: never colour the correct word red in the gap (fill-in-the-blank and Complete the conversation). It is a
   one-line fix that removes a contradictory signal.
3. **F3**: one feedback-panel template with Lao first, one speaker per screen, and ⓘ in a fixed spot. Fill-in-the-
   blank and build-the-sentence then show the answer where every other activity does.
4. **F4**: fit Complete the conversation on a 360×760 screen (trim the context to two turns, scroll to the gap line
   on feedback). Today options sit below the fold and bubbles are cut mid-glyph.
5. **F6**: step down the sentence-level Lao sizes (teach sentence 2.2rem, conversation 1.5rem, tiles 1.8rem,
   fill-in-the-blank clamp(1.9rem, 8.5vw, 2.6rem), a word-specific `.glyph.word`) and add a Lao text-size setting
   before 5+ word sentences arrive.

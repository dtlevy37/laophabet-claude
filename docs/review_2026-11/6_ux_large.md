# 6_ux_large: UX doctorate, large screens (responsive layout, density, accessibility)

Devices reviewed: `desktop` (1440×900), `tablet_l` (1024×768), `tablet_p` (768×1024), `desktop_zoom200` (720×450 CSS
at 2×), plus my own live probes at 1440×900, **1280×720** (the most common laptop size, missing from the set) and
720×450 (200% zoom). Probe script: `tmp/review/scratch/6_ux_large/probe.js`; extra shots:
`tmp/review/shots/extra/6_ux_large/`.

**Capture caveat (not an app bug):** every `*_dark_*` shot in `desktop/` and `phone/` is actually light. The capture
script sets the theme in localStorage and then navigates with a hash-only `page.goto`, which does not reload, so
`settings.js` never re-reads it (`scripts/browser/review_capture.js:232-236`). With a real reload dark mode works and
looks sound (`extra/6_ux_large/a11y_dark_home.png`, `a11y_dark_fb.png`, `a11y_dark_convo.png`).

# Pass 1 (blind: written before reading docs/PLAN.md)

## Findings

### F1 The right word in the gap turns red after a miss, while the same word's option is green ✓
- Screen/route: Pick the missing word, Complete the conversation (`#/lesson/…`, `#/try/L0010`)   - Device(s): all   - Severity: high
- Evidence: `tablet_p/087_L10try_25-52_choice_complete_the_conversation_fb.png` (ເຈົ້າ, chao, "you": red in the
  sentence, green ✓ in the options), `tablet_l/086_…_fb.png`, `desktop/088_L10try_33-56_choice_pick_the_missing_word_fb.png`
  (ນອນ, nawn, "sleep", red), `extra/6_ux_large/laptop_complete_fb.png` (ບໍ່, baw, question word, red).
  Code: `js/activities/fill_blank.js:171` (`fb-fill ${ok ? 'right' : 'wrong'}`), `styles.css:399-400`.
- What happens: the feedback says "Not quite. The right word is now in the gap." and the gap shows the right word in
  the *danger* colour. Everywhere else in the app red + ✗ means "this is wrong". The learner sees the correct Lao
  painted as an error, next to the same word in green.
- Suggestion: the word placed in the gap is always `fb-fill right` (green, underlined). The miss is already carried by
  the red feedback bar, its heading and the ✗ on the picked option. One-line change at `fill_blank.js:171` (and :177).
- Why: a colour code must mean one thing (consistency, Nielsen #4); "right answer in red" teaches the wrong association.
- Confidence: high

### F2 Feedback scrolls the question away at 720–768px tall and at 200% zoom
- Screen/route: every question, worst on Complete the conversation and Pick the missing word   - Device(s): 1280×720
  laptop, `tablet_l`, `desktop_zoom200`, and even 1440×900 for Complete the conversation   - Severity: high
- Evidence: probe at 1280×720 (`extra/6_ux_large/laptop_*`): Complete the conversation feedback scrolls the stage 183px,
  so the prompt and the earlier turns leave the screen. At 200% zoom (`extra/6_ux_large/zoom_*`,
  `desktop_zoom200/043_…what_does_this_word_fb.png`, `087_…complete_the_conversation_fb.png`): the stage's scroll box is
  only 275 of 450 CSS px; after an answer the Lao word that was asked (ສະບາຍ, sa-baai, "comfortable; well") sits at
  −162…−62px, so the learner reads "Not quite. The answer is: …" without the question; on Complete the conversation
  "The right word is now in the gap" points at a gap that is off-screen. `desktop/086_…complete_the_conversation_fb.png`
  shows the clipped "Complete the conversation" heading at 1440×900. Before answering at 200%, only the top edge of
  option 1 is visible (`desktop_zoom200/042_…what_does_this_word.png`).
- Why it happens: fixed chrome eats the height (lesson head + dry-run chip + an *empty* 56px reserved action slot,
  `styles.css:308` `.stage:not(:has(> .actions))::after`, + the key line), the hero glyph is sized by width only
  (`.glyph { font-size: clamp(4rem, 22vw, 6rem) }`, `styles.css:238`; the only height rule is `max-height: 720px`, which
  a zoomed 1440×900 window does not reach in the same way), and options are pushed to the bottom of the free space (F3).
- Suggestion:
  1. Height-aware sizing: `@media (max-height: 560px)` → `.glyph` ≈ 3rem, `.mc-option` min-height 48px, hide
     `.kbd-hint`, put the dry-run chip inside the lesson head row.
  2. When the answer is shown and the stage would overflow, scroll so the **prompt stays in view** and the feedback is
     reached by collapsing the three unpicked, disabled options into one compact row (they carry no information after
     the answer except the ✗/✓ pair).
  3. Complete the conversation: after the answer, `scrollIntoView({block: 'nearest'})` on `.dlg-now`, or repeat the
     completed line (Lao, then sound) inside the feedback box, so "now in the gap" is always visible.
- Why: WCAG 1.4.10 Reflow / 1.4.4 Resize text; feedback must be seen together with what it is about (contiguity).
- Confidence: high (measured)

### F3 On a desktop the options sit far below the question; the teach card's Next is 600px from its text
- Screen/route: all lesson steps   - Device(s): desktop, tablet_l, tablet_p   - Severity: med
- Evidence: `desktop/006_L1_3-14_…what_sound_does_this.png` (glyph at y≈190, options start at y≈430),
  `desktop/010_…which_one_makes_this.png` ("k" at y≈147, options at y≈400), `desktop/054_…which_word_do_you.png`,
  `desktop/005_L1_1-14_card_teach.png` (two lines of text at the top, Next at y≈823), `tablet_l/045_…build_sentence.png`
  (Check 370px below the tiles). Code: `styles.css:309-316` (`align-content: end`, the A7 step 9 thumb zone) and the
  lesson frame always stretching to the full viewport height (`.card.lesson-frame { flex: 1 }`).
- What happens: the thumb-zone layout is right on a phone, but with a mouse it means a long eye and pointer trip from
  prompt to options to the button, and big dead bands of white in the middle of the card.
- Suggestion: inside `@media (hover: hover) and (pointer: fine)`, drop the bottom alignment: options follow the prompt
  with a fixed 24–32px gap, the feedback follows the options, and the Continue/Check/Next button sits directly under the
  last content (right-aligned) instead of pinned to the frame bottom. Cap the lesson frame at about 820px tall and centre
  it vertically on tall screens. Keep the phone layout as is.
- Why: Fitts's law and proximity (Gestalt): related things close together; the thumb-zone rationale does not apply to a
  pointer.
- Confidence: high

### F4 Things move when the answer appears (the "nothing moves" rule is broken in two places)
- Screen/route: What does this word mean?, Which word do you hear?; option layouts across steps   - Device(s): all large   - Severity: med
- Evidence: `desktop/008_…what_does_this_word.png` → `009_…_fb.png`: the options jump up 55px because the **Hint**
  link disappears on answer. Across consecutive steps the options switch between a 2×2 grid and four full-width 686px
  bars (`.mc-options.wide` for word_meaning, `multiple_choice.js:229`), so on a desktop the answers are in a
  different place every question (`desktop/006` vs `008` vs `010`); short glosses like "leg", "white" sit in 686px bars.
- Suggestion: keep the Hint slot's height after answering (`visibility: hidden`, not removed). On ≥ 600px wide, use the
  2×2 grid for meaning options too whenever every gloss fits on one line in half the width (`fitOptions` already
  measures); fall back to one column only for long glosses.
- Why: spatial consistency lets the eye and the pointer (and keys 1–4 in a 2×2 pattern) learn where answers are.
- Confidence: high

### F5 Build the sentence: feedback shows the romanization first and bigger than the Lao
- Screen/route: Build the sentence, wrong answer   - Device(s): all   - Severity: med
- Evidence: `desktop/026_L2_12-21_card_mc_fb.png`, `extra/6_ux_large/zoom_build_fb.png`: "kin khao." large and left,
  ▶ beside it, then ກິນ ເຂົ້າ (kin khao, "eat rice / have a meal") centred underneath. Code:
  `js/activities/build_sentence.js:331-338` (answer-line with `.answer-sound` before `inlineSentence`).
- What happens: the one place a whole sentence is corrected leads with English letters, against the app rule "Lao
  script is always the main text", and in a different order from the multiple-choice feedback (Lao, sound, meaning, ▶).
  The sound is left-aligned and the Lao centred, so the eye zig-zags.
- Suggestion: same order as the other feedback: the Lao sentence first (left-aligned, ≈2rem), then a line with the
  sound, ▶ and ⓘ. Also left-align the "Right answer" row with the "Your answer" row in the compare view (it is
  right-aligned under the last two tiles in `desktop/026`, which reads as a different sentence).
- Why: consistent answer anatomy across activities; primacy of the target script.
- Confidence: high

### F6 The conversation is three screens tall on a laptop, in a nested scroll box
- Screen/route: conversation card (L8, L10)   - Device(s): desktop, tablet_l, 1280×720, zoom 200   - Severity: med
- Evidence: `desktop/082_L10try_24-52_conversation.png`, `083_…one_revealed.png`, `084_…all_revealed.png`,
  `tablet_l/082_…`, `desktop_zoom200/085_…all_revealed.png`. Probe at 1280×720: dialogue 1489px tall in a 513px
  scroll box. Code: `styles.css:743-768`.
- What happens: each bubble stacks Lao / ▶ / Reveal vertically (≈170px per line before Reveal) and bubbles hug the left
  and right edges, leaving a 400px empty gutter between speakers. At 1440×900 only 3½ of 6 lines are visible; the
  learner never sees the exchange as a whole, which is the point of a conversation. The scroll box is inside the card,
  so a mouse wheel over the margin does nothing.
- Suggestion: on ≥ 600px: put ▶ inline after the Lao and Reveal on the same row (one row per line before Reveal),
  bubbles `max-width: 75%`, gap 6px. Target: a 6-line dialogue fits at 1440×900 before Reveal. Let the page, not an
  inner box, scroll on desktop, or show a fade at the bottom edge as a scroll cue.
- Why: chunking a dialogue as one visible unit supports comprehension; nested scroll regions are a known usability and
  accessibility trap.
- Confidence: high

### F7 Complete the conversation looks and behaves differently from the conversation card
- Screen/route: Complete the conversation   - Device(s): all   - Severity: low-med
- Evidence: `desktop/085_…complete_the_conversation.png`, `086_…_fb.png`, `tablet_p/087_…_fb.png`.
- What happens: earlier turns lose their ▶ (Reveal only); after the answer the completed line's sound and English
  appear *outside* the bubble, centred under it in large type, while in the conversation card they sit inside the
  bubble, left-aligned and smaller; the feedback box then holds only "Correct" and a lone ▶.
- Suggestion: render the completed line exactly like a revealed conversation line (sound and English inside the
  bubble, ▶ inline), give the context turns a small ▶, and move the ▶ out of the feedback box (it duplicates the one in
  the bubble).
- Why: same object, same anatomy (consistency); learners build one mental model of "a line".
- Confidence: high

### F8 Keyboard: Space always plays the first sound; no key for Reveal; the key line is the same everywhere
- Screen/route: all lesson steps   - Device(s): desktop   - Severity: med
- Evidence: `js/session.js:1175-1177` (`stage.querySelector('.audio-btn')`), `strings.json` `kbd_hint`
  ("Keys: 1–9 choose · Enter next · Space play · Backspace undo · Esc leave").
- What happens: in a conversation Space plays line 1 every time, so the keyboard user cannot hear lines 2–6 without
  tabbing through 14 buttons; Reveal has no key. The hint line lists Backspace undo on teach cards and multiple choice,
  where it does nothing, and is 12px muted text at the very bottom.
- Suggestion: in a conversation, Space plays the next unplayed line (or the focused line) and **R** reveals the next
  line; make the key line contextual per activity (e.g. multiple choice: "1–4 choose · Space play · Enter next";
  conversation: "Space play next line · R reveal · Enter next"); add **?** to open a small keys sheet.
- Why: keyboard parity (WCAG 2.1.1) and recognition over recall.
- Confidence: high (code read; Space behaviour inferred from the selector, not pressed live)

### F9 Screen-reader names do not say which line or word
- Screen/route: conversation, feedback, word pages   - Device(s): all   - Severity: med
- Evidence: live probe: the L10 conversation has 14 buttons named "Play the sound" and 6 named "Reveal", nothing
  else to tell them apart. What is good: the progress bar is labelled ("Progress in this lesson: step 4 of 40"), the
  speakers are labelled "Speaker A/B", Lao spans carry `lang="lo"`, and after an answer focus moves to Continue.
- Suggestion: `aria-label` "Play line 3, speaker A" / "Reveal line 3" (or `aria-describedby` pointing at the line's
  Lao), and "Play ກິນ" style names on word buttons.
- Why: WCAG 2.4.6 Headings and Labels; identical names in a list make the list unusable by ear.
- Confidence: high

### F10 The Review picker has no way out
- Screen/route: `#/practice`   - Device(s): all (seen on desktop)   - Severity: med
- Evidence: `desktop/110_practice_start.png` (no top bar, no Back), `js/practice.js:23-50`, `js/app.js:122`
  (`topbar.hidden = learnerView && isLessonRoute()`).
- What happens: the time picker is treated as a lesson route, so the header is hidden, and the picker itself has no
  Back link. The only exit is the browser's Back button.
- Suggestion: add the same "← Back" link the Lessons and Words pages have (or a ✕ like the lesson head).
- Why: user control and freedom (Nielsen #3).
- Confidence: high

### F11 Outside lessons, a wide screen is a phone column in the middle of the page
- Screen/route: home, lessons, letters, words, settings   - Device(s): desktop, tablet_l   - Severity: med
- Evidence: `desktop/003_home_new.png` (everything in the top 550px of 900), `113_lessons.png` ("7 more lessons"
  folded with 450px free below), `114_letters.png`, `116_words.png`, `117_words_detail.png`, `119_settings.png`
  (2000px single column), `118_write.png`.
- What happens: every screen is the 720px card; navigation is hub-and-spoke (home tiles → page → "← Back"), so moving
  from My words to Letters takes two clicks via home; the word list's sound column is not aligned (it starts after
  each Lao word, `116_words.png`); detail pages are long single columns.
- Suggestion (in order of value): (a) at ≥ 1024px a left nav rail with Home, Lessons, Review, Letters, My words, Write,
  Settings, replacing "← Back" as the way around; (b) Lessons: show all lessons, no fold, when they fit; (c) Words and
  Letters as list + detail side by side (click a word, the detail opens on the right, list keeps its scroll);
  (d) word list as a grid with a fixed Lao column so sounds and meanings line up; (e) Settings in two columns (Display,
  Reading help | Audio, Activities, Keyboard, Account) or a sticky section index.
- Why: a wide screen should reduce navigation cost and show relationships (overview + detail, Shneiderman's mantra).
- Confidence: med (direction is clear; exact breakpoints are a judgment call)

### F12 Single-letter options are small inside very wide buttons
- Screen/route: Which one makes this sound?   - Device(s): desktop, tablets   - Severity: low
- Evidence: `desktop/010_…which_one_makes_this.png`, `053_…_fb.png` (◌ະ and ◌ໍ marks barely visible), live probe:
  35.2px font, ~24px of ink, in 336×88px buttons.
- Suggestion: one-glyph options at ≈3rem (`.mc-option .lao` when the option is a unit). The dotted-circle carrier and
  small vowel marks are exactly what the learner must tell apart.
- Why: legibility of the discriminating feature; space is not the constraint here.
- Confidence: med

## Wide-screen opportunities (argued, not yet findings)
- **Two-pane question at ≥ 1024px wide and ≤ 800px tall:** prompt (Lao + ▶ + Hint) on the left, options and feedback
  on the right. It solves F2 and F3 at once on laptops, which are wide and short, and keeps prompt and feedback side by
  side. Language apps on desktop mostly stay single-column; the reason to differ here is the tall Lao prompt.
- **A lesson side rail** (hidden on phone) with this lesson's new items (letters and words, each with ▶) so the learner
  can glance back at what was taught without leaving the step. Useful because the app teaches first and tests later;
  it should hide during a question that tests those items, so it never gives answers away.
- **Hover**: word bubbles already open on mouseover; extend to the summary's "Missed on the first try" list (Lao,
  sound, ▶ on hover) — currently a bare bullet list without sound (`desktop/033_L2_summary.png`).

# Pass 2: the planned design

*(written after reading the A7 rest entry in docs/PLAN.md)*

The plan (PLAN.md "A7 rest"): content up to 820px plus a 320px rail; options and feedback stay at 600px; in a lesson
the rail previews the Lao words the lesson will show (new ones colour-coded, recycled ones labelled "Review"; no
meanings or sounds while checks run); a home rail with stats and sections; check the topbar at 200% zoom. Done when a
1920 screen shows the rail without giving answers and the topbar holds at 200% zoom.

## Where Pass 1 pointed the same way
- **A lesson side rail with the lesson's items** (my "wide-screen opportunities"), with the same worry about giving
  answers away.
- **A rail outside lessons** (plan: home rail with sections; mine: F11a, a nav rail on every non-lesson page).
- **Narrower options than today** (plan: 600px; today 686px). That supports F4: at 600px the 2×2 grid suits nearly
  every option set.
- **200% zoom matters**: the plan names it, I measured it.

## Where it does not, and what I would change
1. **It treats the wide screen as a width problem; the measured problems are height problems.** On a laptop
   (1280×720, 1024×768) and at 200% zoom, the step plus its feedback does not fit and the prompt scrolls away (F2); on
   a tall desktop the options and the button drift to the bottom of an 870px-tall frame (F3). Adding a rail fixes
   neither. Add to the slice: the pointer-fine vertical layout (F3) and the height-aware sizing (F2), and extend the
   Done-when to "at 1280×720 and at 200% zoom on 1440×900, every question and its feedback show the prompt without
   scrolling".
2. **The 200% check targets the wrong element.** The topbar is hidden in lessons (`app.js:122`) and holds at 200%
   already (`desktop_zoom200/113_home.png`). The thing that breaks at 200% is the lesson stage (F2).
3. **"No meanings or sounds while checks run" is not enough to keep the rail answer-safe.** In this app the Lao form
   *is* the answer in several activities: Which word do you hear? (pick the Lao), Which word means this? (pick the
   Lao), Pick the missing word, Complete the conversation, Build the sentence, Build the word (spelling). A rail that
   lists ສະບາຍ (sa-baai, "comfortable; well") and ເຂົ້າ (khao, "rice") narrows those option sets or spells the answer.
   Change: the rail shows its list on teach cards, conversations and feedback only, and **collapses to a progress
   summary** ("3 new · 4 review · step 12 of 40") while any question is unanswered. Test it with Build the word on,
   not only the default settings.
4. **Breakpoint and the 1024–1199px band.** 820 + 320 + gutters needs about 1200px. Say what 1024–1199 gets (my
   advice: no rail, today's single column with F2 and F3 applied). Use `min-width` so 200% zoom (720 CSS px)
   automatically drops the rail.
5. **Keep one lesson column, not 820 for some parts and 600 for others.** If the prompt is 820 wide and the options
   600, their left edges disagree and the eye hunts. Use 820 only for reading cards and conversations (two speakers
   need the width; F6), and a single centred 600–640px column for questions, with the extra width going to the rail.
6. **New vs recycled: not by colour alone, and never green/red.** Those two colours mean right/wrong (DESIGN
   "Palette"). Use the accent plus a "New" pill (the conversation card already has one) and the plan's "Review" label.
7. **Home rail: make it navigation on every non-lesson page, not stats on home only.** The navigation cost is on Words,
   Letters, Lessons and Settings (F11), and home already shows the stats. DESIGN "Home and navigation" says "No tab
   bar"; a desktop rail is not a phone tab bar, but it needs the owner's yes.
8. **Accessibility of the rail:** `<aside aria-label="This lesson">` after the stage in DOM order (Tab reaches the
   options first, keys 1–9 unaffected), no live-region chatter as items tick, and no motion under reduced motion.
9. **Use the rail for the keys.** A contextual key list in the rail (F8) replaces the 12px line at the bottom of the
   frame and gives height back to the stage (F2).

Not covered by the plan at all: F1, F4, F5, F6, F7, F8, F9, F10, F12. Of these, F1, F4 (Hint slot), F5 and F10 are
small, independent fixes that should not wait for the rail.

## Missing features / sections
- **Play the whole conversation** (one ▶ that plays every line in order, highlighting the current line): the natural
  desktop use of a dialogue and the best listening practice the app could offer for speaking. Learners; S.
- **Slower playback** (0.75× toggle next to ▶, `audio.playbackRate`): there is none (`js/audio.js`). Adult beginners
  copying tones need it. Learners; S.
- **Keyboard help sheet** on **?** and contextual key hints (F8). Desktop learners; S.
- **Persistent desktop navigation** (F11a). All learners on desktop; M.
- **List + detail for My words and Letters** on wide screens (F11c). Desktop; M.
- **Sound on the lesson summary's "Missed on the first try" list** (each with sound and ▶; today Lao + gloss only,
  `desktop/033_L2_summary.png`). All; S.
- **A Back link on the Review picker** (F10). All; S.

## Top 5 (most valuable changes, ranked)
1. **F1** Show the right word in the gap in green, never red (`fill_blank.js:171`). One line, every device.
2. **F2** Height-aware lesson stage: keep the prompt in view with the feedback at 1280×720, 1024×768 and 200% zoom
   (smaller hero at short heights, no empty reserved slot, collapse unpicked options, keep the completed conversation
   line on screen).
3. **F3** On a desktop with a mouse: options right under the prompt, the button right under the content, the frame
   capped in height. Fold this and F2 into A7 rest, with the Done-when widened as in Pass 2 point 1.
4. **F6 + F7** A compact conversation (▶ and Reveal inline, the whole dialogue visible at 1440×900), and the
   completed line in Complete the conversation drawn like any revealed line.
5. **F5** Build the sentence feedback: the Lao sentence first, then sound and ▶, the same order as every other
   feedback.

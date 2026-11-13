# A6 UX review (2026-11-13): findings and revamp proposal

Three subagent personas played the app on local Docker with throwaway accounts (Playwright, screenshots looked at):
absolute beginner on a laptop (1280, plus 375/768 spot checks), returning learner on a phone (375, 768), impatient
desktop keyboard user (1280, 1920). Full reports with screenshots: `tmp/a6/beginner.md`, `tmp/a6/phone.md`,
`tmp/a6/desktop.md` (git-ignored; shots in `tmp/a6/<persona>/shots/`). No console errors in any run.
Caveats: the personas answered with bots, so accuracy figures and "slip" counts are the bots', not a person's. The
desktop report's claim that build the sentence has no drag is wrong (`build_sentence.js` has pointer drag); it only
tapped. Audio playback itself was not judged.

**Status: proposal, not agreed.** Done when (PLAN A6): the owner agrees the revamp proposal (section 3); then it
moves into DESIGN and A7 builds it.

## 1. Findings (merged, most important first)

| # | Sev | Where | Finding | Seen by |
|---|---|---|---|---|
| 1 | major | Home | No "Continue": nothing marks the next or half-done lesson; the next "Start" looks like every other row. | all 3 |
| 2 | major | Home | The list is long: done cards ~295px each on a phone (lesson 6 at y≈1760 after 5 lessons); 8 locked cards ~115px each on desktop; "Practice writing letters" is below all lessons. | all 3 |
| 3 | major | Home | No orientation or progress: bare "Welcome", no streak, no letters/words known, no sense of the path. | beginner, desktop |
| 4 | major | Lesson 1, first letter card | The "How should we write the sounds?" radios sit under ກ before the learner knows what a letter is; the 2nd option is hidden behind the pinned Next (375 and 1280). Move to onboarding / Settings. | all 3 |
| 5 | major | Lessons | Too much repetition: L0001 is ~43 steps / 45 clicks for 4 items; missed questions come back up to 3 times; L0007 dry run ~45 steps with the same 5-word build three times. No "12 / 40" counter. | beginner, desktop |
| 6 | major | Lessons, desktop | No keyboard support: number keys do nothing; Enter/Space only on a focused button; focus resets to body on each step, so Tab reaches Settings / Sign out first (the bot signed itself out). | desktop |
| 7 | major | Lessons, phone | Top-heavy: options and tile bank in the top half, empty space above the pinned button; the button is 140px, left-aligned. Put answers and the button in the thumb zone; full-width button. | phone |
| 8 | major | Layout | 720px white card on grey; at 1920 ~600px empty each side; Next ~450px below the question; flat look, no brand colour, no reward on a right answer. | beginner, desktop |
| 9 | major | Fill in the blank, phone | Lao options wrap inside 2-column buttons (ສະບາຍດີ breaks; ✓ takes a 3rd line). | phone |
| 10 | major | Build the word | "Find all of its pieces" with unlabeled pieces incl. ◌ placeholders is unclear to a beginner; a one-line how-to on first use. | beginner |
| 11 | major | Summary | Thin: three numbers; "words read" counts letters and vowels (L0001: "5 words read" after 3 letters + 1 word); no list of what was missed; no "Next lesson" button. | beginner, desktop |
| 12 | major | Header, phone | Wraps to 2 lines; email takes the space; Settings / Sign out are 24px tall; "Welcome" and "Lessons" are two stacked h1s. | phone |
| 13 | minor | Dry run | The "Dry run: nothing is saved" badge overlaps Sign out (768/1280) or the email (375): accidental sign-out risk. | all 3 |
| 14 | minor | Settings | Modal only (`#/settings` shows the list); taller than the screen, Close not pinned; stays open after a hash change and blocks the next page. | all 3 |
| 15 | minor | Write | `#/write` shows all 27 letters unlabeled; nothing marks taught letters or the next one. | beginner, desktop |
| 16 | minor | Audio | ⚑ (report) has the same weight as ▶, inviting accidental reports; "Voice: Na" is noise on every card. | phone |
| 17 | minor | Tap targets | "All lessons" 74×24, dialog "Leave" 40×24, sentence word chips 38px tall. | phone |
| 18 | minor | ລາວ | Card says "he, she" and "Laos; Lao"; the quiz asks one sense. Respelling differs between screens ("lao" vs "laao"): check. | beginner |

Keep (all three agree): Lao script as the main text with sound and English beside it; short teach cards before any
question; specific feedback that never relies on colour alone; real-word wrong options; fill in the blank and build
the sentence feel natural; the lesson frame (pinned button always in view), leave dialog and resume; "Review lesson
material"; the dry-run labelling; the writing stroke animation. Dark mode already follows the system
(`styles.css` `prefers-color-scheme`).

## 2. Quick fixes (bugs, no design decision needed)
- DONE 2026-11-13 (Playwright-checked at 768: badge inside the head row; dialog closes on a hash change): dry-run badge overlap (13: `.badge` is the absolutely positioned corner
  badge; `.badge.dry` is now static in the lesson head row); Settings dialog closes on a route change (14).
- DONE 2026-11-13 (Playwright: L0007 dry run played to the end with keys only at 1280; L0010 fill in the blank shot
  at 375 and 300): lesson keyboard (6): 1–9 option / bank tile, Enter primary button, Backspace last placed tile
  (build the sentence), Space first play button, Esc leave dialog; focus moves into the stage after every draw;
  corner number badges and one key line on mouse desktops only (`session.js` onKey/focusStage, styles.css). Option
  wrap (9): Lao in options is nowrap, ✓/✗ sits in the corner, and `fitOptions` (dom.js) drops the grid to one
  column when an option does not fit two to a row.
- Not a bug: "words read" (11) is `session_summary` counting every Lao word read in questions, repeats included
  (`20261110120000_played_lesson.sql`). For A7: label it "Lao words read (with repeats)" or switch to distinct words
  (a new migration; stats stay in the DB).

## 3. Revamp proposal (for A7; owner to agree or change)
1. **Home = Continue + path + sections.** Top: one large "Continue: Lesson N · title" card (or the half-done lesson
   with "Resume"), full-width button. Under it a stats strip from the DB (streak, letters known, words known; S8's
   `learner_stats()`). Then the path, compact: done lessons as one-line rows with a tick (tap = review material),
   the next lesson and the following two open, the rest folded ("8 more lessons"). Then section tiles: Review,
   Letters and sounds (A8), My words (A9), Write. Target: one phone screen tall in the common case.
2. **Navigation.** Slim header: logo + gear (Settings as a route `#/settings`, a page on phone, dialog on desktop).
   Phone: bottom tab bar, 48px targets: Learn · Practice · Write · Me. Desktop: the same four as a top bar, current
   area highlighted. Email and Sign out move into Me/Settings. In a lesson: an ✕ (44px) top left + the progress bar
   with a "12 / 40" counter; no header links.
3. **Lesson screens.** Phone: prompt at the top, options / tiles and the full-width primary button together in the
   lower part (thumb zone). Desktop: primary button directly under the question; keyboard: 1–4 pick an option,
   Enter = Check/Continue, Space = play audio, Backspace = undo last tile, Esc = leave dialog; focus set on each
   render; small key hints on desktop. Fill-in-the-blank options never wrap a Lao word (one column when needed).
4. **Keep the repetition, make it feel lighter; clearer first lessons.** Owner 2026-11-13: repetition is the point
   and learners sign up for it, so no replay cap or step target. Streamline the UX instead (a step counter, quick
   transitions, Enter/number keys, less reading between questions); later, practice sessions (S8b) go straight to
   questions without new material. Personas' "43 steps" for L0001 counts every teach card, question and replay as
   one step, as the progress bar does. The sound-spelling choice moves to onboarding (asked once, with an
   example) and Settings; build the word gets a one-line "Tap the letters and vowel marks that make this word" and
   labels ◌ ("the circle marks where the consonant goes") the first time.
5. **Summary.** Accuracy, new letters, new words (counted correctly), the missed items with their Lao / sound /
   meaning and ▶, and two buttons: "Next lesson" (primary) and "Back home".
6. **Look.** One brand colour (suggest a Lao-flag-adjacent deep blue with a warm red accent, used sparingly),
   bigger Lao glyphs on prompts, a short success flourish on a right answer, pressed states on tiles; wider layout on
   desktop (content column + a side rail with lesson progress). Dark mode: keep the system default, add a manual
   toggle in Settings.
7. **Audio buttons.** ▶ large and primary next to the Lao; ⓘ and ⚑ small and secondary (⚑ moves into the ⓘ sheet
   or a "…" menu); the voice credit moves into the ⓘ sheet.
8. **Sentence words: tappable inline** (phone persona's recommendation, the desktop and beginner agree): each word
   in the sentence has a subtle underline; a tap opens a small popover (word, sound, meaning, ▶, 44px targets);
   the chip row under the sentence goes. Tiles stay only in build the sentence, where they are the task.

## 4. Questions for the owner
1. Agree the proposal as a whole, or which points to change?
2. (Answered 2026-11-13: no replay cap, no step target; keep the repetition.) Primary button on the right: done.
3. Brand colour: deep blue + warm red accent, or your own choice?
4. Phone bottom bar with 4 tabs (Learn, Practice, Write, Me): OK, given Practice (S8b) is not built yet (the tab
   could open Review until then)?

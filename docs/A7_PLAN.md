# A7 revamp: readiness and step plan (draft 2026-11-13, from a Plan-agent review; not agreed)

Input: `docs/A6_UX_REVIEW.md` section 3. Owner constraints: repetition stays; do not lock in big UI direction too
early; stats come from the DB (S8 `learner_stats()` not built); A8/A9 come after A7.

## Readiness
- Routing is small (`learn.js` `parseHash`/`showLearnerHome`; `app.js` boot, header `showTopbar` ~72-91, header is
  rebuilt only in `render()`, not on hashchange). Home = `learn.js` `showLessonList` (uses `list_lessons` only).
- Lesson frame = `session.js` `draw()`/`stepView()` + `styles.css` `.lesson-frame` block. Summary = `session.js`
  `summaryView`/`dryEndView` (~665-715). Settings = modal only (`settings.js` `openSettings`); `translitChoice` is
  reused on the ກ card, which fakes a hashchange to redraw.
- `session.js` is ~750 lines: planner, runner (resume, flush, A3 stamping), screens, keyboard.
- Colours are tokens with a dark block; no spacing/radius/width tokens (`.card` max-width 720px).
- **Risk: an unwritten selector contract.** Keyboard (A6) and A3 tap counting find elements by class:
  `.stage`, `.actions` (last child) `button.primary`, `button.mc-option`, `.bs-bank > button`,
  `.bs-line > button.bs-tile`, `.audio-btn`, `.info-btn`/`.info-icon`. Renaming any silently breaks keys and stats.
  No visual regression tests; the A6 Playwright harness (`tmp/a6/`) can give before/after shots.

## Sorting the proposal
- **Cheap, reversible, ship any time:** Settings as a route; sound-spelling choice off the ກ card (onto the lesson 1
  intro card); slim header (email + Sign out into Settings); in a lesson a 44px ✕ and "12 / 40"; home Continue card +
  compact path (`list_lessons` + the local resume record); summary "Next lesson" + relabel "Lao words read (with
  repeats)"; build-the-word how-to + ◌ label; ⚑ and voice credit into the ⓘ sheet; thumb zone as CSS only;
  theme toggle (`data-theme`) without changing the palette.
- **Direction-setting (mockup + owner sign-off first):** brand palette, success flourish, wide desktop layout /
  side rail; navigation model (bottom tab bar + top bar vs slim header + home tiles); section tiles (A8/A9/Practice
  do not exist yet); tappable inline sentence words (touches 3 activities via `chips()`, needs a popover).
- **Backend first:** stats strip (S8 `learner_stats()`); missed list on the summary (new `session_summary` key
  `missed`, from `review_log` first-try misses); distinct "words read" if wanted; A8/A9 per-item RPCs.

## Steps (each shippable; each ends with `check_frontend.js` and 375/1280 screenshots when layout changes)
0. **Groundwork, no visible change:** move end screens to `summary.js` (keep `buildPlan`/`dryLevels` exports for
   `session_test.mjs`); split `settingsPanel()` from `openSettings()`; write the selector contract into the
   activity-module skill; add `--content-max`, `--radius` tokens. Done when tests pass and the keyboard dry run of
   L0007 plays to the end.
1. **Settings route + spelling choice off the ກ card.** Done when `#/settings` is a scrollable page at 375/1280 and
   Back returns; the ກ card has no radios; the intro-card choice updates "Sounds like".
2. **Slim header + lesson chrome** (header hidden in lessons; ✕, progress, counter; native header unchanged). Done
   when the header is one line at 375 and Esc still opens the leave dialog.
3. **Home: Continue + compact path** (`home.js`; done lessons one line with ✓; next + 2 shown, rest folded; Write
   as a link row). Done when a learner with 5 done lessons sees home in one 375×700 screen.
4. **Summary part 1** ("Next lesson" primary, "Back home" secondary, relabel). Done when L0001's end opens L0002.
5. **Audio hierarchy + build-the-word how-to** (keep `.audio-btn`). Done when no ⚑ on a card face, reports still
   work from ⓘ, Space still plays.
6. **Mockup gate (no app change):** static `tmp/mockups/a7/*.html` using the real `styles.css`: home (Continue,
   dummy stats marked as such, path, tiles greyed vs hidden), navigation A vs B (home + in-lesson), 2–3 palettes
   light/dark on a multiple-choice screen (right/wrong states), thumb zone current vs lower-half (375×667/812),
   sentence words chips vs inline popover, desktop 720 column vs wide + side rail at 1920. Done when the owner
   picks navigation, palette, sentence words and desktop width (recorded in DESIGN).
7. **Look** (after 6): tokens, theme toggle, chosen palette, reduced-motion-safe flourish.
8. **Navigation shell** (after 6): `nav.js`, active tab on hashchange, hidden in lessons, Practice → Review until S8b.
9. **Thumb zone + inline sentence words** (after 6): keep the info-after-answer rule; `countTaps` must still count.
10. **Stats + missed list** (backend first): `learner_stats()` and `session_summary.missed` migrations, then UI.

Contract notes: nav and ✕ belong to the runner, never to an activity; activities do not know lesson vs practice;
inline words must not show a popover on the gap/answer before Check; new strings in `strings.json` (`lo` for
native screens); mockups stay in `tmp/`.

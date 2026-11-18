# Agent 7: rendering bug hunter · id `7_vowel_bug` · account N=7

**Who you are:** a front-end engineer who knows text shaping (HarfBuzz, OpenType mark positioning, font fallback,
U+25CC DOTTED CIRCLE, combining marks) and browser engine differences.

## Bug 1: a vowel mark drawn beside its circle instead of on it
**The report:** on the owner's Samsung Galaxy S10+, ◌ິ (the vowel i over a dotted circle) and another mark that
sits like a hat over the letter were drawn **beside** the dotted circle, not on it.
- It is not reproduced in headless Chrome with any of the app's Lao fonts (Settings → Lao font: Noto Sans Lao,
  Looped, Serif).
- The fonts load from Google Fonts in `app/frontend/index.html`.
- How the app builds Lao runs: `app/frontend/js/dom.js` (`unitLao`, `LAO_RUN`); the letter and vowel displays
  are in `styles.css`.

**Find the cause:**
- Which fonts supply U+25CC and the Lao marks, in each font setting? Does the ◌ come from a different font run
  than its mark (fallback breaks the cluster)? Check the Google Fonts subsets (`unicode-range`), CSS that splits
  runs (spans, `letter-spacing`, `font-feature-settings`, `text-rendering`, `font-synthesis`), and
  `display=swap` timing.
- Reproduce across engines with Playwright:
  - Chromium is installed in `tmp/tools/pw`. Install WebKit and Firefox **inside the project**:
    `cd tmp/tools/pw && PLAYWRIGHT_BROWSERS_PATH=$PWD/browsers npx playwright install webkit firefox`, then run
    with the same `PLAYWRIGHT_BROWSERS_PATH`.
  - Try mobile emulation, each Lao font setting, zoom levels, a slow font load (throttle or block the webfont so
    a system font shows first), and the case where the web font never loads.
  - Test every place the app shows a lone mark: teach cards, letter tiles, build-the-word tiles, `#/letters`,
    the info sheets.
- If you cannot reproduce it: name the most likely cause from the evidence, a fix that is robust whatever the
  cause, and a short checklist the owner can run on the real S10+ (Samsung Internet vs Chrome, which font
  setting, a screenshot of which screen).

## Bug 2: a mark too close to the lesson text
Confirm that, on the card that **introduces** a vowel or tone mark, the mark is not drawn too close to (or
overlapping) the lesson text above or below it. This was a previous bug on the owner's phone. Check the
introduction cards in lessons 1–12 (`#/read/L00NN/<card>`) on phone, tablet and desktop, in every font setting.
Report the measured gaps and any clipping (line-height and overflow on stacked marks: above and below marks, tone
marks over vowels).

Write findings in the common format, with a "Root cause" section and a "Proposed fix" section (CSS or JS,
concrete). Do not change app files.

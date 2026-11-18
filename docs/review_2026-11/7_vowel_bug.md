# 7_vowel_bug: rendering bug hunter (lone Lao marks on the dotted circle)

Scripts: `tmp/review/scratch/7_vowel_bug/` (`harness.js`, `harness2.js`, `fontload.js`, `letters.js`, `live.js`,
`live_short.js`, `live_andfont.js`, `shot_l6.js`, `fontcheck*.py`, results in `live_*.json`). Shots:
`tmp/review/shots/extra/7_vowel_bug/`. Engines: Playwright Chromium 1194, Firefox 1495 and WebKit 2215, all on
Windows 10 (browsers in `tmp/tools/pw/browsers`). I had no Android device or emulator. To stand in for one I used
two things: Android's own system Lao font, taken from AOSP (`external/noto-fonts/other/NotoSansLao-Regular.ttf`,
android10 and android12 branches, "Version 1.03 uh"; saved in `scratch/7_vowel_bug/dl/`), and a font stack with no
Leelawadee UI.

## Root cause

**In short:** the app only controls which font draws the Lao on Windows. On every other device, the default
setting hands the Lao and the ◌ to whatever fonts the system has. Those fonts break the dotted-circle display in two
ways that I could reproduce.

1. **The default "Standard" setting is `'Leelawadee UI', sans-serif`** (`app/frontend/js/settings.js:35`, and the
   same fallback in `styles.css:148,149,617`). Leelawadee UI ships only with Windows. On the S10+ (and on iPhone,
   Mac and Linux) no Lao web font is requested at all. The Noto faces in `index.html:9` load only when the learner
   picks Looped, Plain or Serif. So the ◌ and the mark come from the system's fallback chain. The comment at
   `settings.js:32-33` ("other devices fall back to their own Lao font") is where the risk is accepted.
2. **Failure A: the cluster is split across two fonts, so the mark is drawn beside the circle.** This happens when
   the ◌ (U+25CC, a symbol and not a Lao character) is taken from one font and the Lao mark from another. GPOS
   mark-to-base attachment only works inside one font, so the mark is left at its default offset. Its default offset
   hangs it to the upper right of whatever comes before it.
   - Reproduced in Firefox in the live app. With a stack that has no Leelawadee (what an Android phone gets),
     ◌ິ (i), ◌ີ (ii) and ◌້ (mai tho) all sit up and to the right of the circle: the mark's ink reaches
     0.25–0.30 em past the circle's right edge (`live_firefox.json`, font `android`). Shots:
     `live_firefox_phone_android_L0001_3.png`, `live_firefox_phone_android_L0007_2.png`,
     `android_sim_firefox_letters.png` (every vowel and tone tile on `#/letters`).
   - The same split happens with the Noto setting while the web font is blocked or not yet loaded:
     `fontload_firefox_blocked_L0001_3.png` and `fontload_firefox_blocked_L0002_5.png`. These match the owner's
     report: "◌ິ and a hat-like mark beside the circle".
   - Chromium and WebKit pick one font for the whole cluster when any single font covers both characters, so they
     did not split in any of my runs (`harness_chromium.png`, `harness_webkit.png`). Gecko falls back character by
     character, so it splits (`harness_firefox.png`, rows B, C, D, F).
3. **Failure B: Android's own Lao font has no anchor on its dotted circle and very tall marks.** I checked the AOSP
   font (Noto Sans Lao v1.03) with fontTools:
   - `uni25CC` is not a base in any GPOS mark-to-base lookup, and it has no GDEF class.
   - Its marks are designed to hang over a full-height consonant: ◌ໍ reaches 1.01 em above the baseline and ◌້
     reaches 1.02 em, against about 0.84 em in the Google Fonts v2.003 build. The v2.003 build does attach marks
     to ◌ (GPOS lookup 0).
   - In Blink with this font, the mark floats high above a small circle. On the ◌ໍ (aw) card it runs into the label
     above it: `androidfont_short_L0006_1.png` (360×640, overlaps by 1.8 px) and `androidfont_s10_L0006_1.png`
     (412×869, S10+ size, 3 px gap). This is very likely the "mark too close to the lesson text" bug the owner saw
     before.
4. **Not the cause.** The app never splits a ◌ from its mark across elements:
   - `LAO_RUN` (`dom.js:113`) includes ◌.
   - `unitLao` (`dom.js:108`) only strips ◌ before a consonant.
   - `highlightWord` (`unit_word.js:75-97`) keeps whole clusters together.
   - No CSS on Lao text sets `letter-spacing`, `font-feature-settings`, `text-rendering` or `font-synthesis`.
   - The Google Fonts `lao` subsets already include U+25CC (`unicode-range: U+0E81-0EDF, U+200C-200D, U+25CC`, all
     three families; `scratch/7_vowel_bug/gf.css`), so on the Noto settings the ◌ and the marks come from one face
     once the font has loaded.

**What I could not confirm:** which browser the owner used, and whether Samsung's One UI ships a different Lao font
from AOSP. Failure A matches the report exactly, but I reproduced it only in Gecko (Firefox, including Firefox for
Android's engine). For Samsung Internet or Chrome (Blink) to split the cluster, the S10+'s fonts would have to differ
from AOSP's, for example a Samsung or downloaded "Font style" that covers ◌ but not the Lao marks. I could not test
that. Failure B does happen in Blink with the stock Android font. Both go away with the same fix.

## Findings

### F1 The default Lao font is a system font everywhere except Windows, so marks come off their circle
- Screen/route: every place a lone mark is shown. That is the unit intro cards (`#/read/L0001/3` ◌ິ,
  `L0002/4` ເ◌ົາ, `L0002/5` ◌້, `L0006/1` ◌ໍ, `L0006/4` ◌່, `L0007/2` ◌ີ), the `#/letters` tiles, the "made of"
  pieces, build-the-word tiles and the info sheets (all use `--lao-font`). - Device(s): any non-Windows device on
  the default setting: Android (the owner's S10+), iPhone (untested) and Mac. Firefox anywhere. - Severity: high
- Evidence: `settings.js:35`; `live_firefox_phone_android_L0001_3.png`; `android_sim_firefox_letters.png`;
  `fontload_firefox_blocked_L0002_5.png`; `androidfont_s10_L0006_1.png`; `scratch/7_vowel_bug/live_*.json`.
- What happens: the vowel ◌ິ (i, as in ກິນ gin, "eat") and the tone mark ◌້ (mai tho, as in ເຂົ້າ khao, "rice")
  are drawn up and to the right of the circle (Firefox). With Android's stock font, ◌ໍ (aw, as in ຂໍ khaw,
  "ask for") floats well above the circle (Blink). The learner cannot see where the mark sits on the consonant,
  which is exactly what the card is there to teach.
- Suggestion: always give the Lao a web font that has ◌ with mark anchors, ahead of any system fallback (see
  Proposed fix 1 and 2). Windows keeps Leelawadee UI unchanged.
- Why: GPOS mark attachment only works within one font. A placeholder and its mark must come from the same face
  with an anchor on U+25CC.
- Confidence: high for the mechanism and for Firefox and stock Android. Medium that it is the exact path on the
  owner's S10+.

### F2 An above-mark vowel can touch the card label on short or Android screens
- Screen/route: `#/read/L0006/1` (◌ໍ). ◌ິ and ◌ີ are close too. - Device(s): Android stock font at 360×640
  (overlap) and 412×869 (S10+ size, 3 px). - Severity: med
- Evidence: `androidfont_short_L0006_1.png`, `androidfont_s10_L0006_1.png`,
  `scratch/7_vowel_bug/live_andfont_short_chromium.json`.
- What happens: `.cell .glyph.mark { padding-top: 0.45em }` (`styles.css:258`) only applies to tone marks (class
  `mark` is set for kinds other than vowel and consonant at `teach_card.js:228`). Vowels written above the
  consonant get no headroom. On screens up to 720 px tall, `.glyph` also drops to `line-height: 1.25`
  (`styles.css:322`). With the AOSP font, ◌ໍ's mark is 1.01 em tall, so its ink rises above the glyph's line box by
  6 px and overlaps "LAO VOWEL" by 1.8 px.
- Measured gaps (ink to ink) with the app's own fonts are all clear, on every engine, device and setting:
  - Above (label ink bottom to mark ink top), smallest: phone 360×760 16–37 px (smallest: Noto Sans Lao,
    ◌ິ); tablet and desktop 22–43 px; short phone 360×640 11–20 px; S10+ size 19–33 px.
  - Below (glyph ink to the next text), smallest: 23 px (short phone, Looped, ◌້), otherwise 31–54 px.
  - No ink leaves the glyph's own box on the app's fonts (at least 7 px of headroom). No clipping by any overflow
    box (`clips: []` everywhere).
  - With the AOSP Android font: ◌ໍ gap above is −1.8 px at 360×640 and 3.2 px at 412×869, with ink 6 px and 1 px
    above its box. ◌ິ and ◌ີ: 8 px and 17 px. Tone marks are fine (23–40 px) thanks to their padding.
- Suggestion: Proposed fix 1 removes the tall font on Android. Also add headroom by content rather than by kind
  (Proposed fix 3).
- Why: the line box only reserves the font's ascent. Stacked or tall above-marks need explicit room.
- Confidence: high (measured).

### F3 The circle in the English explanation is a different, tiny glyph
- Screen/route: `#/read/L0001/3` ("The dotted circle ◌ is not a letter …") and the More section
  ("The dotted circle ◌ shows where the consonant goes."). - Device(s): all. - Severity: low
- Evidence: `tmp/review/shots/phone/137_read_L0001_3.png` (the ◌ is a speck in the body font);
  `teach_card.js:236,239`; `strings.json:350-351`.
- What happens: the ◌ is drawn in `system-ui` (Segoe UI Symbol on Windows, Roboto or another font on Android) at
  body size. It does not look like the circle on the card it explains.
- Suggestion: put the circle in a placeholder, the way `bw_howto_circle` already does at `build_word.js:413`. Change
  `unit_dotted_circle_first` to "The dotted circle {c} is not a letter. It is a placeholder that shows where a real
  letter goes." and `unit_dotted_circle` to "The dotted circle {c} shows where the consonant goes." Then render them
  with `tParts(key, { c: h('span', { class: 'lao-inline', lang: 'lo' }, '◌') })`.
- Why: the thing being explained should look the same as the thing on screen.
- Confidence: high

### F4 The review shots and the owner's desktop checks cannot show this bug
- Screen/route: the test setup. - Device(s): `phone`, `tablet_*` shot sets. - Severity: med (process)
- Evidence: every `tmp/review/shots/phone/*` card is drawn in Leelawadee UI (CDP `getPlatformFontsForNode` on the
  live app: "Leelawadee UI:2" for ◌ິ on the default setting).
- What happens: the "phone" captures run headless Chromium on Windows, so they show a font no phone has. The brief's
  note that the bug is "not reproduced in headless Chrome" is the expected result, not evidence that the app is
  fine.
- Suggestion: add a capture mode that sets `--lao-font` to the AOSP `NotoSansLao-Regular.ttf` (as in
  `scratch/7_vowel_bug/shot_l6.js`) and runs one pass in Firefox. That covers both failures.
- Why: test on the fonts the learners actually get.
- Confidence: high

## Proposed fix

1. **Put a web font in the default stack**, so only Windows uses a system Lao font
   (`settings.js:34-39`, `styles.css:148,149,617`):
   ```js
   const FONTS = {
     standard: "'Leelawadee UI', 'Noto Sans Lao', sans-serif",
     looped: "'Noto Sans Lao Looped', 'Noto Sans Lao', sans-serif",
     plain: "'Noto Sans Lao', sans-serif",
     serif: "'Noto Serif Lao', 'Noto Sans Lao', serif",
   }
   ```
   ```css
   [lang='lo'] { font-family: var(--lao-font, 'Leelawadee UI', 'Noto Sans Lao', sans-serif); }
   /* same var() fallback in .lao and .word-lao */
   ```
   On Windows, Leelawadee UI covers ◌ and every mark, so the browser never downloads Noto. Elsewhere, the ◌ and the
   marks both come from Noto Sans Lao v2.003, which anchors marks to ◌. Update the `settings.js:32-33` comment.
2. **Self-host the Lao subsets and do not show the fallback.** Copy the three `lao`-subset woff2 files
   (Noto Sans Lao is about 21 KB, variable 100–900) to `app/frontend/fonts/`, then drop them from the Google Fonts
   link:
   ```css
   @font-face { font-family: 'Noto Sans Lao'; src: url(fonts/NotoSansLao-lao.woff2) format('woff2');
     font-weight: 100 900; font-display: block; unicode-range: U+0E81-0EDF, U+200C-200D, U+25CC; }
   /* same for 'Noto Sans Lao Looped' and 'Noto Serif Lao' */
   ```
   `font-display: block` replaces `display=swap`. For up to about 3 s the Lao is invisible instead of drawn in a
   split or unanchored fallback, which is what the owner may have caught. Self-hosting removes the dependency on
   fonts.googleapis.com, which content blockers sometimes cut, and on the font-loading timing. Optionally add
   `<link rel="preload" href="fonts/NotoSansLao-lao.woff2" as="font" type="font/woff2" crossorigin>`.
3. **Headroom by content, not by kind** (`teach_card.js:228`):
   ```js
   const ABOVE = /[ັິ-ືົ່-ໍ]/
   h('span', { class: `glyph lao${ABOVE.test(u.lao) ? ' mark' : ''}`, lang: 'lo' }, unitLao(u.lao))
   ```
   and in `styles.css`, keep `.cell .glyph.mark { padding-top: 0.45em; }` and add
   `@media (max-height: 720px) { .cell .glyph.mark { padding-top: 0.3em; } }`. Every vowel or tone written above the
   consonant then gets the room tone marks already get. Check that the lesson step still fits on 360×640. It costs
   about 20 px.
Measurement note: in `live_webkit.json` the "beside" numbers for the Noto and Leelawadee settings come from
WebKit's canvas `measureText`, which ignores mark positioning. WebKit draws those cards correctly
(`live_webkit_phone_plain_L0001_3.png`). WebKit on Windows has no system Lao fallback (tofu on the `android` stack),
so that row says nothing about iOS.

**Checklist for the owner on the S10+** (one screenshot each):
1. Which browser was it: Samsung Internet or Chrome? If it was Firefox, that alone explains the bug.
2. In the app's settings sheet, which Lao font was selected (Standard, Looped, Plain or Serif)?
3. Open `#/read/L0001/3` (◌ິ), `#/read/L0002/5` (◌້) and `#/read/L0006/1` (◌ໍ) on **Standard**, then the same three
   on **Plain**. If Plain looks right and Standard is wrong, it is the system font, and fix 1 is the fix.
4. Phone Settings → Display → Font size and style → Font style: which font (Default, SamsungOne, or a downloaded
   one)?
5. Does the mark start out wrong and then jump into place after a second? That is the swap period, which fix 2
   addresses.

## Missing features / sections
- A font check in the settings sheet: make the sample `ກິນເຂົ້າ ◌ິ ◌້` instead of `ກິນເຂົ້າ` (`settings.js:40`), so
  a learner (or the owner) sees at once whether marks sit on their circle in each font. For the learner and for
  support. S.
- A cross-device capture mode (Android font injected, plus Firefox) in `scripts/browser/review_capture.js`. For
  the owner and agents. S.

## Top 5 (most valuable changes, ranked)
1. Default stack `'Leelawadee UI', 'Noto Sans Lao', sans-serif` in `settings.js:35` and the three CSS fallbacks.
   This fixes the mark beside the circle and the floating marks on Android, iPhone, Mac and Firefox (F1).
2. Self-host the Lao woff2 subsets with `font-display: block` instead of Google Fonts `display=swap` (F1: no split
   flash, no dependency on Google Fonts).
3. Give every above-mark glyph the `.mark` headroom (test on content at `teach_card.js:228`) and keep some of it on
   short screens (F2).
4. Capture review shots with Android's own Lao font and in Firefox, so this class of bug shows up before the alpha
   (F4).
5. Show the ◌ in "The dotted circle ◌ is not a letter" as a Lao placeholder at card size (F3), and add ◌ິ ◌້ to the
   font sample in settings.

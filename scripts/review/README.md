# App review with simulated users

A repeatable review of the app's layout, flows, wording and curriculum by subagents playing different users. The
first run was 2026-11-17; its report was cut into PLAN slices and deleted (it is in git history under
`docs/review_2026-11/`). Run it again after a big change (for example the
large-screen layout) or after alpha feedback, with briefs adjusted to what changed.

## Steps
1. **Set up.**
   - Start the local Supabase (`supabase status` in `app/backend`), and serve `app/frontend` on :5500
     (`python -m http.server 5500`). Playwright lives in `tmp/tools/pw` (`npm i playwright@1.56.1` there if
     missing).
   - Run `bash scripts/review/accounts.sh` to get fresh accounts: one per capture device and one per agent. It
     deletes the old review accounts first, so do not run it while a capture or an agent is using them.
2. **Capture the shared screenshots.**
   - Run `NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/review_capture.js` (all devices). Devices can
     run in parallel: one process each, with the device id as the argument.
   - Output goes to `tmp/review/shots/<device>/`, with `index.json` holding each shot's route and visible text.
   - Look at a few shots from each device before going on.
   - Change the lessons it plays (`play(...)` calls) as the course grows. Keep the lessons that have
     conversations, and the newest ones.
   - **Known gap:** headless Chromium on Windows draws Lao in Leelawadee UI, a font no phone has. Font bugs only
     show with the fonts learners get. For a font check, add a pass that sets `--lao-font` to Android's own
     `NotoSansLao-Regular.ttf`, and run one pass in Firefox (AOSP `external/noto-fonts/other/`;
     `PLAYWRIGHT_BROWSERS_PATH=tmp/tools/pw/browsers npx playwright install firefox`). To see which font really
     draws a node, use CDP `DOM.getPlatformFontsForNode`.
3. **Brief the agents.**
   - Each prompt is `briefs/common.md` followed by one role brief (`briefs/<n>_<role>.md`).
   - Use general-purpose agents at effort high, all launched in parallel. Each writes
     `tmp/review/findings/<id>.md` and returns a 5-line summary.
   - Keep the owner's own notes out of the briefs, so the agents stay unbiased. Store the notes outside the
     project and bring them in only at synthesis.
4. **Synthesise (the main agent).**
   - Remove duplicates, and verify each claim against the code.
   - Rank higher what several agents found independently.
   - Assess each owner note: agree, modify or disagree, with the principle behind it.
   - Copy the findings to `docs/review_<yyyy-mm>/` and write `REPORT.md` there: A7 or layout inputs, bugs, tightening, new features, owner
     notes assessed, and proposed slices with "Done when" lines, ranked.
   - Lao doubts go to `docs/QUESTIONS.md`. Simulated-native judgments are unverified.
   - Once its slices are in `docs/PLAN.md`, fold anything still open into PLAN and delete the report (CLAUDE.md
     rule on one-off docs). Before deleting, move any lesson about running the review itself into this README.

## Roster used in 2026-11
1. New learner, phone (+ heritage-learner lens)
2. Polyglot, tablet (+ Thai-reader lens)
3. Fluent English–Lao, phone desktop-site mode + desktop
4. Educational theory PhD
5. UX, phones (+ font-size sweep)
6. UX, large screens (blind pass, then critiques the A7 plan)
7. Rendering bug hunter
8. Visual designer, blunt (added 2026-11-18: the UX briefs judged function, so nobody gave a verdict on looks)

Seven was judged enough. More personas from the same model tend to repeat each other; spend extra budget on a
later, targeted round instead.

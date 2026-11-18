# Common brief for every review agent

You are one of several independent reviewers of **Laophabet**, a web app that teaches English speakers to **read
and speak** Lao (Standard Vientiane). Writing is out of scope. The app is early: lessons 1–12 exist, and an alpha
with a few real learners is about to start. The owner expects tightening of flows, wording and layout, plus a few
suggested features or sections, but not a dramatic redesign. Your role and your angle are in your own brief, below
this one.

## What you have
- **First read `tmp/review/shots/INDEX.md`:** notes on this run's shot set, including which gaps to fill from the
  live app.
- **Screenshots:** `tmp/review/shots/<device>/NNN_<name>.png`, one shared set. Each folder has an `index.json`
  with every shot's route and its visible text (Lao included), so you can read the wording without guessing from
  pixels. Devices:
  - `phone`: 360×760 phone, mobile site. The most complete set: every step of lessons 1, 2, 9, 10, every reader
    card of lessons 1, 2, 9, 12, and dark mode.
  - `phone_desksite`: the same phone using the browser's "desktop site" mode. The page is laid out 980px wide and
    shown scaled down to 360px, so everything looks about 37% of its size.
  - `tablet_p` 768×1024, `tablet_l` 1024×768, `desktop` 1440×900 (with dark mode), `desktop_zoom200` (1440×900
    at 200% browser zoom).
  - Non-phone devices show the first screen of each activity type: its question, then its feedback.
  - Prefixes: `L1`, `L2` are lessons played for real; `L8try`, `L9try`, `L10try`, `L12try` are dry runs; `read_`
    is the read-only card viewer; `practice` is review practice.
  - Answers were tapped at random, so you see both right and wrong feedback.
  - Conversations (spoken dialogues with a Reveal per line, then "Complete the conversation" blanks) are in
    lessons 8 and 10.
- **The live app**, if you need a screen the set lacks:
  - URL `http://127.0.0.1:5500/`; account `review_agent<N>@test.local` / `review-pass-1` (N is in your brief).
  - `#/try/L00NN` dry-runs any lesson, `#/read/L00NN/<card>` shows its cards.
  - Playwright: `NODE_PATH=tmp/tools/pw/node_modules node <your script>`. Copy patterns from
    `scripts/browser/review_capture.js`, put your script in `tmp/review/scratch/<your id>/`, and save shots to
    `tmp/review/shots/extra/<your id>/`.
  - Use only your own account.
- **The code:** `app/frontend/` (vanilla JS; `js/strings.json` holds every on-screen string; `js/activities/` the
  question types; `js/session.js` plans a lesson; `styles.css`).
- **The design and curriculum:**
  - `docs/DESIGN.md` (app spec) and `docs/LESSON_RULES.md`
  - `docs/CURRICULUM_PATH.md` (the agreed lesson order) and `docs/SOUND_HINTS.md`
  - `curriculum/` (lesson folders)
  - `data/*.csv`: big files, so grep them, never read one whole
  - `docs/SCHEMA.md`

## Rules
- **Read-only.** Write only your findings file (`tmp/review/findings/<your id>.md`), plus scripts in
  `tmp/review/scratch/<your id>/` and shots in `tmp/review/shots/extra/<your id>/`.
- **Stay inside `Z:\dev\laophabetv2`.** Do not read `CHANGELOG.md`, `tmp/review/REVIEW_PLAN.md`, or other agents'
  findings files: your view must be independent.
- **Judge what the learner sees first.** Then check the code to confirm a finding: cite `file:line` or a
  screenshot path. If you could not confirm something, say so.
- **Real Lao only.** Never suggest an invented word or spelling. Every Lao example you write carries a
  romanization and the English, e.g. ກິນ (gin, "eat").
- **Be concrete.** "Move the speaker button next to the sentence on fill-in-the-blank feedback" beats "improve
  audio placement". For wording, give the current string (and its key in `strings.json`) and your proposed text.
- **Prioritise.** A few sharp findings beat a long list. Skip nitpicks unless they are cheap and clearly right.
- Repetition and replays in lessons are intended. Suggest making them smoother, not cutting them.

## Findings file format (`tmp/review/findings/<your id>.md`)
```
# <your id>: <role>
## Findings
### F<k> <short title>
- Screen/route: ...   - Device(s): ...   - Severity: high | med | low
- Evidence: <shot path or file:line>
- What happens: ...
- Suggestion: ...
- Why (theory or principle, one line): ...
- Confidence: high | med | low
## Missing features / sections
- <feature>: why, for whom, rough size (S/M/L)
## Top 5 (most valuable changes, ranked)
```
When done, reply to the main agent with **only a 5-line summary**: the top findings and the path to your file.

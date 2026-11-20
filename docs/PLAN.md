# Plan

Open work only, in working order. One slice at a time; each has a "Done when" line. A slice that is built leaves this
file: its record goes in `CHANGELOG.md`, and anything the owner still has to try goes in `docs/NOTES.md` "Waiting on
the owner". Design: `docs/DESIGN.md`.

Cross-cutting rule not in CLAUDE.md: **native status is self-declared; feedback is unverified until the owner
verifies the person** (`reviewer_trust.native_verified_at`, set by hand in SQL). Privileged roles live in a table
users cannot write.

## Working order
Owner checks of what is built (lesson 13, the tone lesson, once Na's takes are in), then lesson 14 (ອ) and more
lessons; L5 phase 1, A10, L4, and A19 rest when Na answers. Later: A21, A22. On hold until the owner has thought it through: prior-knowledge features (DESIGN "Who it is for").

## Lessons
- [ ] **L6 A final letter folded into its first word's card.** The owner wanted final ກ (lesson 21) to have no card
  of its own: the ຢາກ card would show it. teach_card.js `cardItems` folds a final unit only into its initial's
  card (same-sound letters). Add an opt-in fold (e.g. a unit item whose next item is a word using it, flagged in
  the lesson data) and retire L0021's C01f card text. Done when: `#/lesson/L0021` opens on the ຢາກ card, which
  names final ກ, and C01f is still recorded as shown.
- [ ] **L1d leftover.** "This is white": ນີ້ຂາວ (nee khao) fits a wall's colour, ນີ້ມັນສີຂາວ (nee man sii khao) an
      object in hand; check lesson sentences with this pattern.
- [ ] **L3b "How tones work" sheet** under Letters: class × syllable type, only the cells the learner has reached, one
      taught word each with ▶. Goes with (or after) the consonant-class lesson. **Done when:** the sheet shows the
      reached cells with a word and ▶ each.
- [ ] **L4 Two voices in conversations.** Conversations are built (DESIGN "Conversations"); when a second native
      records, speaker B's lines play their take. **Done when:** lesson 10's card plays A and B in different voices.
- [ ] **L5 Speaking practice.** Design `docs/L5_SPEAKING_DESIGN.md`; owner answered its questions 2026-11-13 (phase 1
      "Say it" in lessons with a Settings opt-out, no self-grade, voice never leaves our client/server). Next: write
      the phase 1 build slice. Add its conversation form, "Your turn: be B": A's line plays, B's line shows in Lao,
      the learner says it aloud, then hears B's recording (no recording of the learner, no grading). Slow playback
      (0.75×, `playbackRate`) on sentence and conversation ▶.
- [~] **H6 More listening.** Audio on more question types as recordings arrive; no transliteration by default.
      Listen for meaning is built but planned only for tone pairs; next: use it for every recorded word.
- [ ] **A12 analysis.** Views, queries and a one-page report on `learner_sessions.active_ms` and `review_log` (start
      from the view `review_retention_by_lesson`); waits for data.

## App slices
- [ ] **U1b Fixed screen, the last movers** (proposal after U1, owner to decide). At the default floor (Medium):
      conversation blanks at 360x640 still shift the line up to ~16px when the answer card makes the text shrink,
      and at 320x568 they and some build-the-sentence answers scroll. Options: fit once for the larger of the
      question and answer states (measure the answer cards off-screen first), or a smaller answer card in
      conversations. **Done when:** `node scripts/browser/u1_fit.js … L0018 L0026` shows no "moved" over 5px at
      360x640.
- [ ] **A19 rest: content fixes waiting on Na** (Q0037–Q0043). The romanization, rule, hint and sentence fixes
      that needed no answer are built.
      - The ຫິວ note (lesson 9) says bare ຫິວ sounds unfinished, then lesson 10 teaches it: rewrite after Q0043.
      - Sentence-card English: S000000047 "He's / She's here." (after Q0037).
      - The ກິນ gloss "eat; (colloquial) drink" → "eat; drink" (after Q0038). The W000001 note: "often said with the
        palms together and a slight bow, the ນົບ (nop), especially to older people" (after Q0039); keep its
        romanization out of Standard cards (W000019's note was made Lao-only).
      - Owner decision: lesson 12 item 8 teaches ບໍ່ມີ (W000823, "said as one"), but its sentences are now segmented
        ບໍ່ + ມີ (baw mii, "don't have"), so no lesson 12 sentence uses W000823. Keep it as a word, or replace it?
      **Done when:** every item above is applied or dropped.
- [ ] **A10 Notes: grammar, how Lao works, culture** (owner 2026-11-13). A home section that lists every rule card
      (R##) and culture/usage note from lessons the learner has reached, grouped (Reading and writing, Grammar,
      Culture), each opening as its full card; locked ones hidden. Backend first: a `learner_notes()` RPC (rules and
      `word_notes` by intro lesson vs the learner's progress). **Done when:** a learner with lessons 1–9 done sees
      R03, R02, R01, R04 and the ຫິວ note under Notes and can open each; one with only lesson 1 done sees none.
- [ ] **A21 Reference and orientation (later).** A level legend
      on My words (Seen → Recognised → Recalled → Spelled); a text label on home's ⚑; a dismissible banner when a
      phone shows the desktop site (`(pointer: coarse)`, `screen.width < 600`, `innerWidth >= 900`), which shrinks
      Lao until ◌່ and ◌້ cannot be told apart. No first-run guide (owner 2026-11-18).
      **Done when:** each piece is checked on a 360px phone.
- [ ] **A22 Practice quality (later).** Wrong options of the same kind as the answer (consonants with consonants,
      vowels with vowels: in L1, "k" with ເ◌ົາ ກ ◌າ ◌ຳ is answered by the only option without ◌), and fresh wrong
      options on a replay (`multiple_choice.js:90,118`); a warm-up of 3–4 overdue items at the start of each lesson.
      **Done when:** no multiple-choice question mixes consonants and vowels, and a lesson with overdue items opens
      with them.
- [ ] **A5 leftovers.** The one-off "translations are not literal" card (needs a merged-lesson change). Notes are
      unverified; the ສະບາຍດີ and ເຂົ້າ notes now follow Na's answers (Q0022, Q0028).
- [ ] **S7w2 Letter writing, next (scoped, not built).** Two parts, in this order:
      1. A single trace card when a letter is first introduced in a lesson (the learner traces that letter once,
         right there; the full `#/write` routine stays in its own area).
      2. Vowels and tone marks in `#/write` (stroke data, scoring, grid), plus ໜ ໝ; progress in the DB only if the
         owner wants it.
      Needs a design pass first (activity module or teach-card extension; whether its answer goes through
      `record_answers`). **Done when:** scoped into a build slice with a "Done when".
- [ ] **N7 Native stroke capture** (owner 2026-11-19). A "how do you write this letter?" question type for natives:
      the prompt, then the writing pad (`js/writing/pad.js`) on a blank grid, and her strokes saved (points, order,
      timing) in a native-only table for analysis. Then `strokes_build.js` takes start, direction and order from her
      captures. Na's general rule, for the builder now: **strokes start at the bottom left, always, even when that
      means retracing a line** (the builder currently starts at the loop). Q0031–Q0034 (the writing checks she
      could not answer in words) are retired; ask writing questions only this way. **Done when:** Na can write
      ກ ມ ອ on the native question screen, the captures are in the DB, and a script prints them per letter.
- [ ] **N4 Native feedback report.** A script that lists, from `recording_feedback`: styles to apply to `register`,
      original -> own version pairs (`spoken_lao`), the "not sure what it means" list, names/nicknames, other
      meanings, English corrections, comments; with each native's region and verified flag. **Done when:** one run
      prints every N3 answer, grouped, and the owner can turn it into `db_sql.py` changes or QUESTIONS lines.
- [ ] **N5 Lao UI text review.** Export every native-facing string (`strings.json` keys with `lo`) as a sheet for the
      wife; apply her fixes. Known already:
      - The question word is ບໍ່ everywhere (owner, settled); `profile_english`, `comments` and `cf_question` still use
        ບໍ. Fix without asking.
      - One "you": `pause_body` uses ເຈົ້າ, the rest ທ່ານ (Q0042). One set of register labels: `register_*` vs
        `style_*` (Q0041).
      - `sg_respelling` "in your own letters" reads as Lao letters to a Lao speaker: say "in English letters, e.g.
        sabaidee". `cf_yes` is cut short; `feedback_done` ແລ້ວ alone is odd as a button.
      **Done when:** every `lo` string has been seen by a native and the `_note` says so.
- [ ] **N6 Native polish before invites.** Rewrite the 16 open questions in plain Lao with examples, not terms
      (`data/open_questions.csv`, `questions_tool.py migration`); Suggest a word: English optional, only word, example
      and voice visible, the rest under "More details". Questions show only English behind the Lao interface
      (`questions.js:98`): add `question_lo` to the CSV and RPC, and show the Lao first.
      **Done when:** a native without English can answer every question and send a suggestion.
- [ ] **S9 FSRS:** design note first. Open points: client JS module vs plpgsql; outcome → rating (recognition at
      reduced weight, recall by latency, wrong = Again); card granularity and direction; the ladder gates activity
      types, FSRS decides timing, no demotion; daily session capped; later fit weights from `review_log`.
      **Owner direction 2026-11-15 (proposed, not built; Opus may review the design note):**
      - Mastery comes from FSRS stability, so a word cannot be proven "known" until weeks after introduction. The
        0-4 ladder level stays the activity gate (no demotion); "words known" and the home stats switch to stability
        once it exists. Seen (level >= 1) is a badge only.
      - A lesson counts as one review event per item per day, so in-session repeats do not inflate stability.
      - Spelled (level 4) stays a badge; it may count as an Easy rating, giving a bigger stability jump.
      - Write side: update stability/difficulty/last_review_at/reps/lapses per answer (in or beside `record_answers`).
        Read side: retrievability computed on the fly in `practice_items` and the stats RPCs. plpgsql, matching the
        stats-in-DB rule. Tiers use stability, not retrievability, so they do not flicker.
      - Proposed tiers (guesses, to be checked against a simulated schedule; computed at read time, so retunable
        without a migration): learning < 4 days; familiar 4-14; strong 14-30; known 30+ (about 3-5 weeks, 4-5
        successful spaced reviews).
      - Review timing today (owner 2026-11-18): boxes 1/3/7/14/30 days, due from the start of the learner's local
        day; a hinted right answer counts for nothing. FSRS may change the timing.
      - Existing learners have no stability: replay `review_log` through the formula, or start from zero.
      - From the November review: today one right tap, even on a replay with the same four options, raises a level
        and counts as "known", and a pick from four is logged as recall (`multiple_choice.js:109`). Decide in the
        design note whether replays (attempt > 0) may raise levels.
- [ ] **S9b Tone drill:** can be built now that lesson 13 (tone) is merged; owner prefers melody learned with meaning, so check the design with the owner first.
- [ ] **S10 Native feedback:** review RPCs and the `recordings` insert policy require `role = 'native'`; queue
      lesson content first; feedback on words and units, one `feedback` shape keyed by `(item_type, item_id)`; owner
      views with verified reviewers marked; export → agent decisions → migration (source `native review <ids>`);
      learner reports feed the same queue.
- [ ] **S11 Deploy leftovers:** password reset; email sending (built-in mailer is rate-limited).

## Small fixes and unsliced ideas
- The "Complete the conversation" heading clipped under the dry-run pill on desktop feedback (November review): not
  reproduced; check with a 1440px screenshot.
- `list_lessons` counts a `dialogue` item in `new_items` and gives done lessons an empty `covers` row for it
  (no client reads either yet): filter `item_type <> 'dialogue'` when list_lessons is next touched.
- Stale notes on W000035 and W001415 still mention W000019 for the "enter" sense.
- The "Read more on Wikipedia" links under "More" were written from memory; verify.
- Bonus words are tested without a sentence (learning review).
- "Lock in" a new word (owner): ask each piece's sound before the word's card; the word appears at the end.
- Respelling hint on meaning → Lao questions (owner): hinted answers count for letters, not for word knowledge.
- Prior knowledge (on hold, owner 2026-11-18, to talk through): the intake's "speak Lao" / "read Thai" answers change
  nothing (`intake.js:8`); a "Brisk" pace setting; "Thai readers:" notes. Not for now (DESIGN "Who it is for").
- Lesson side rail (the lesson's words beside the stage on wide screens): scrapped for now (owner 2026-11-18). If it
  comes back: in many activities the Lao is the answer, so it must collapse while a question is unanswered.
- A21a leftovers: tone-mark tiles show the glyph only (the DB has no sound or name for T1–T4); vowels are counted
  by written form ("of 36"); a letter's page lists only example words the learner has learned.
- A18 leftovers: measure the Lao sizes again with the self-hosted Noto Sans Lao (non-Windows); lessons 1–12 have no
  5-word sentence, so the two-line rule was checked on a synthetic one. The Lao text size setting labels have no `lo`.
- A17 leftover: "Show earlier lines" on a phone fill-in (the planner already passes only 2 context turns).
- A7a leftovers at 720×450 (200% zoom): a wrong build-the-sentence with a two-line compare strip, and a fill-in under
  a long conversation (up to 361px of bubbles), still push the prompt off screen; needs a side-by-side layout.
  build_word was not measured.
- The rail's Review item always links to `#/practice`; the home tile gates it until lesson 1 is done.
- With the A7b rail: list + detail side by side on My words and Letters, and two-column Settings.
- A23 leftovers (if wanted): loading skeletons instead of "Loading…"; a hidden `#/kit` page showing every
  component in light and dark, so drift does not come back.
- Lesson summary "New things learned" counts a letter's role pair (C13 / C13f) twice: the stat comes from
  `session_summary`/`complete_lesson`; count role pairs once there (the summary's list already does).
- Later: admin role and in-app owner tools, PWA/offline, analytics on drop-off and difficulty, trust scores.

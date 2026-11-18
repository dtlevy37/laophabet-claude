# Plan

Open work only, in working order. One slice at a time; each has a "Done when" line. A slice that is built leaves this
file: its record goes in `CHANGELOG.md`, and anything the owner still has to try goes in `docs/NOTES.md` "Waiting on
the owner". Design: `docs/DESIGN.md`.

Cross-cutting rule not in CLAUDE.md: **native status is self-declared; feedback is unverified until the owner
verifies the person** (`reviewer_trust.native_verified_at`, set by hand in SQL). Privileged roles live in a table
users cannot write.

## Working order
Owner checks of what is built, then A7 rest, A10, L3, L4, L5. Owner-gated slices (S7w, S10r) close when
the owner's check or answer comes in.

## Lessons
- [ ] **L1d leftover.** "This is white": ນີ້ຂາວ (nee khao) fits a wall's colour, ນີ້ມັນສີຂາວ (nee man sii khao) an
      object in hand; check lesson sentences with this pattern.
- [ ] **Bug: a vowel mark drawn beside its circle instead of on it** (◌ິ, and another mark that sits like a hat over
      the letter), seen on the owner's Galaxy S10+; not reproduced in headless Chrome with any Lao font. Next: play-test
      on real devices (S10+ first) and note browser, Settings → Lao font and the screen. **Done when:** reproduced and
      fixed, or a device sweep finds nothing.
- [ ] **L3 Teaching tone.** A proper lesson: what tone is, the pitch line legend, tone marks and consonant class in
      plain words, recorded pairs that differ only by tone (ຂາວ khaao "white" vs ລາວ laao; ໃກ້ "near" vs ໄກ "far", to
      verify; ເຂົ້າ "rice" vs ເຂົ່າ "knee" once both are taught), and a hear-and-pick-the-pitch check. Owner 2026-11-17:
      ຂາວ / ລາວ (both already taught) is the recap example there, on a card with a table (word, meaning, tone, ▶),
      like the vowel card with three sounds.
      **Done when:** merged with at least two recorded pairs and a pitch check.
- [ ] **L4 Two voices in conversations.** Conversations are built (DESIGN "Conversations"); when a second native
      records, speaker B's lines play their take. **Done when:** lesson 10's card plays A and B in different voices.
- [ ] **L5 Speaking practice.** Design `docs/L5_SPEAKING_DESIGN.md`; owner answered its questions 2026-11-13 (phase 1
      "Say it" in lessons with a Settings opt-out, no self-grade, voice never leaves our client/server). Next: write
      the phase 1 build slice.
- [~] **H6 More listening.** Audio on more question types as recordings arrive; no transliteration by default.
- [ ] **A12 analysis.** Views, queries and a one-page report on `learner_sessions.active_ms` and `review_log`; waits
      for data.

## App slices
- [ ] **A7 rest: desktop wide layout + rail** (content up to 820px + a 320px rail; options and feedback stay at 600px).
      In a lesson the rail is a lesson preview: the Lao words the lesson will show, new ones colour-coded, recycled
      ones labelled "Review"; no meanings or sounds while checks are running. Home rail: stats (`learner_stats`) and
      sections. Also check the topbar (now with ⚑ ⚙) at 200% zoom. Contract: nav and ✕ belong to the runner, never to
      an activity; new strings in `strings.json`.
      **Done when:** a 1920 screen shows the rail without giving answers, and the topbar holds at 200% zoom.
- [ ] **A10 Notes: grammar, how Lao works, culture** (owner 2026-11-13). A home section that lists every rule card
      (R##) and culture/usage note from lessons the learner has reached, grouped (Reading and writing, Grammar,
      Culture), each opening as its full card; locked ones hidden. Backend first: a `learner_notes()` RPC (rules and
      `word_notes` by intro lesson vs the learner's progress). **Done when:** a learner with lessons 1–9 done sees
      R03, R02, R01, R04 and the ຫິວ note under Notes and can open each; one with only lesson 1 done sees none.
- [ ] **A5 leftovers.** Pool words in `get_lesson` lack the usage note (ⓘ from a sentence chip shows none); the
      one-off "translations are not literal" card (needs a merged-lesson change). Notes are unverified; the ສະບາຍດີ
      and ເຂົ້າ notes are asked in QUESTIONS.
- [ ] **S7w Letter writing.** Owner finds it "weird", notes to come. **Done when:** on a phone two letters can be
      completed with a finger; a careless trace fails; ຂ drawn for ຊ is refused; a finished letter shows a tick.
      Later: vowels, tone marks, ໜ ໝ; use in lessons; progress in the DB.
- [ ] **S10r Recording mode, owner checks:** check takes (`recording_feedback` view, bucket `recordings`).
- [ ] **N4 Native feedback report.** A script that lists, from `recording_feedback`: styles to apply to `register`,
      original -> own version pairs (`spoken_lao`), the "not sure what it means" list, names/nicknames, other
      meanings, English corrections, comments; with each native's region and verified flag. **Done when:** one run
      prints every N3 answer, grouped, and the owner can turn it into `db_sql.py` changes or QUESTIONS lines.
- [ ] **N5 Lao UI text review.** Export every native-facing string (`strings.json` keys with `lo`) as a sheet for the
      wife; apply her fixes. **Done when:** every `lo` string has been seen by a native and the `_note` says so.
- [ ] **N6 Native polish before invites.** Rewrite the 16 open questions in plain Lao with examples, not terms
      (`data/open_questions.csv`, `questions_tool.py migration`); Suggest a word: English optional, only word, example
      and voice visible, the rest under "More details".
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
      - Existing learners have no stability: replay `review_log` through the formula, or start from zero.
- [ ] **S9b Tone drill:** after L3.
- [ ] **S10 Native feedback:** review RPCs and the `recordings` insert policy require `role = 'native'`; queue
      lesson content first; feedback on words and units, one `feedback` shape keyed by `(item_type, item_id)`; owner
      views with verified reviewers marked; export → agent decisions → migration (source `native review <ids>`);
      learner reports feed the same queue.
- [ ] **S11 Deploy leftovers:** password reset; email sending (built-in mailer is rate-limited).

## Small fixes and unsliced ideas
- `list_lessons` counts a `dialogue` item in `new_items` and gives done lessons an empty `covers` row for it
  (no client reads either yet): filter `item_type <> 'dialogue'` when list_lessons is next touched.
- Stale notes on W000035 and W001415 still mention W000019 for the "enter" sense.
- The "Read more on Wikipedia" links under "More" were written from memory; verify.
- Bonus words are tested without a sentence (learning review).
- "Lock in" a new word (owner): ask each piece's sound before the word's card; the word appears at the end.
- Respelling hint on meaning → Lao questions (owner): hinted answers count for letters, not for word knowledge.
- After lesson 12: ອາຫານ, ຢາກ, ມັກ, ຄົນ, ໃຫຍ່ around a second conversation (ordering food).
- Later: admin role and in-app owner tools, PWA/offline, analytics on drop-off and difficulty, trust scores.

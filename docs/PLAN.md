# Plan

Open work only, in working order. One slice at a time; each has a "Done when" line. A slice that is built leaves this
file: its record goes in `CHANGELOG.md`, and anything the owner still has to try goes in `docs/NOTES.md` "Waiting on
the owner". Design: `docs/DESIGN.md`.

Cross-cutting rule not in CLAUDE.md: **native status is self-declared; feedback is unverified until the owner
verifies the person** (`reviewer_trust.native_verified_at`, set by hand in SQL). Privileged roles live in a table
users cannot write.

## Working order
Owner checks of what is built, then (owner 2026-11-18, from the November app review): A17
conversations, L5 phase 1, A18 Lao sizes, A19 romanization and content, L6 lesson titles, then A10, L3, L4. Later:
A20, A21, A22. On hold until the owner has thought it through: prior-knowledge features (DESIGN "Who it is for").

## Lessons
- [ ] **L1d leftover.** "This is white": ນີ້ຂາວ (nee khao) fits a wall's colour, ນີ້ມັນສີຂາວ (nee man sii khao) an
      object in hand; check lesson sentences with this pattern.
- [ ] **L6 Lesson titles name the payoff** (owner 2026-11-18). Titles approved by the owner 2026-11-18; set
      `title_en` in `data/lessons.csv` and ship with `db_sql.py`: 1 Read your first word; 2 Have a meal; 3 He's
      eating; 4 Drink some water; 5 I've eaten already; 6 Water, please; 7 This water is good; 8 Hello, how are
      you?; 9 Are you hungry?; 10 Your first conversation; 11 A small glass, please; 12 Is there water?. Also show
      `summary_en` on phones, clamped to one line (hidden at `styles.css:547`).
      **Done when:** the lesson list shows these titles, with a one-line summary on a 360px phone.
- [ ] **L3 Teaching tone.** A proper lesson: what tone is, the pitch line legend, tone marks and consonant class in
      plain words, recorded pairs that differ only by tone (ຂາວ khaao "white" vs ລາວ laao; ໃກ້ "near" vs ໄກ "far", to
      verify; ເຂົ້າ "rice" vs ເຂົ່າ "knee" once both are taught), and a hear-and-pick-the-pitch check. Owner 2026-11-17:
      ຂາວ / ລາວ (both already taught) is the recap example there, on a card with a table (word, meaning, tone, ▶),
      like the vowel card with three sounds. From the November review:
      - A first-time caption under the tone picture ("Lao words have a melody. This line shows it: ກິນ (kin, 'eat')
        starts low and rises a little. Listen and copy it."), then the short tone name on later cards. This could
        ship before L3.
      - A ◌້ recap card (LESSON_RULES decision 18): one mark, two melodies, ເຂົ້າ (khao, "rice") low-falling vs ນ້ຳ
        (nam, "water") high-falling.
      - "Which melody?" (hear a known word, pick its tone picture) as the pitch check.
      - Later, a "How tones work" sheet under Letters: class × syllable type, only cells the learner has reached, one
        taught word each with ▶.
      **Done when:** merged with at least two recorded pairs and a pitch check.
- [ ] **L4 Two voices in conversations.** Conversations are built (DESIGN "Conversations"); when a second native
      records, speaker B's lines play their take. **Done when:** lesson 10's card plays A and B in different voices.
- [ ] **L5 Speaking practice.** Design `docs/L5_SPEAKING_DESIGN.md`; owner answered its questions 2026-11-13 (phase 1
      "Say it" in lessons with a Settings opt-out, no self-grade, voice never leaves our client/server). Next: write
      the phase 1 build slice. Add its conversation form, "Your turn: be B": A's line plays, B's line shows in Lao,
      the learner says it aloud, then hears B's recording (no recording of the learner, no grading). Slow playback
      (0.75×, `playbackRate`) on sentence and conversation ▶.
- [~] **H6 More listening.** Audio on more question types as recordings arrive; no transliteration by default.
      Next type (owner 2026-11-18): hear a word with no text shown, pick its meaning (listening comprehension, kept
      apart from reading; see DESIGN "Answer panel").
- [ ] **A12 analysis.** Views, queries and a one-page report on `learner_sessions.active_ms` and `review_log` (start
      from the view `review_retention_by_lesson`); waits for data.

## App slices
- [ ] **A17 Conversations.**
      - Compact: ▶ inline after the Lao, Reveal on the same row, bubbles `max-width: 75%`; a 6-line dialogue fits at
        1440×900 before Reveal.
      - Speakers get made-up names (owner 2026-11-18), or the recording native's own name if they opted in to be
        credited (check whether that consent exists; if not, add it).
      - "Play the conversation" plays each line in turn and highlights the bubble being spoken. It keeps the playing
        line in view; if the learner scrolls, it does not fight them, and when they let go it returns to the line
        playing now.
      - Complete the conversation: draw the completed line like a revealed line; on phones show only the 2 turns
        before as context and scroll the gap line to the top.
      - `dialogue_intro`: "Tap the speaker to hear a line". Space plays the next unplayed line, R reveals; each ▶ has
        its own label ("Play line 3, speaker A").
      **Done when:** lesson 10's conversation fits one 1440×900 screen before Reveal, plays end to end with the
      playing line always visible (also after a manual scroll), and its fill-in shows the options above the fold at
      360×760.
- [ ] **A18 Lao sizes on phones.** Measured at 360 and 412 in Windows fonts: 4-word sentences already wrap at 360.
      - Teach sentence 2.6 → 2.2rem; `.dlg-lao` 1.8 → 1.5rem; `.bs-tile .lao` 2 → 1.8rem with min-height 52px.
      - `.fb-sentence` clamp(1.9rem, 8.5vw, 2.6rem), with a `.long` class (5+ words) at 1.7rem.
      - `.glyph` for single letters only; a new `.glyph.word` clamp(2.8rem, 15vw, 4.5rem) nowrap (at 22vw,
        ພາສາອັງກິດ, paa-saa-ang-kit, "English", would break mid-syllable).
      - Drop the unused `.bs-answer`; one class for Lao inside English prose (1.4em; today four sizes).
      - A Lao text size setting (`--lao-scale`). Measure again with the self-hosted Noto Sans Lao (non-Windows).
      **Done when:** on the S10+ a 5-word sentence fits in two lines on its card and no word prompt breaks inside a
      syllable.
- [ ] **A19 Romanization and content fixes** (owner 2026-11-18; the Lao items wait for Na's answers, Q0035–Q0043).
      - ຈ is "j" in both styles (`translit.js:17`): ເຈົ້າ (jao, "you"); the card's "SOUNDS LIKE ch" goes.
      - ◌ອຍ is "oy": ຂ້ອຍ (khoy, "I"), ນ້ອຍ (noy, "small"); "aw" stays for ◌ໍ and for ◌ອ◌ before other finals.
        Update SCHEMA "Learner respelling scheme" and the pron tips that say "Close to 'coy'".
      - The Standard hint's "As on signs, maps and in most books" overclaims for vowels: "Like the consonants on signs
        and maps: the h means a puff of air: kh, ph, th."
      - Notes with typed romanization (W000019 shows "gin kao" on a Standard card): make notes Lao-only or mark the
        romanization for `respell()`; grep `word_notes.csv` and `rules.csv`.
      - R03 (`db_sql.py change`): "The next vowel, ເ◌ົາ, is written around its consonant: before, above and after it.
        You still say the consonant first, then the vowel."
      - R04: "Lao often leaves out 'I', 'you' or 'he/she' when it is clear who is meant. To ເຈົ້າຫິວນ້ຳບໍ່? ('Are you
        thirsty?') you can simply answer ຫິວນ້ຳ ('I'm thirsty')."
      - `cmp_pair_hiw_kao`: "“Hungry” is {pair}: ຫິວ plus ເຂົ້າ, “hungry for rice”."
      - The ຫິວ note (lesson 9) says bare ຫິວ sounds unfinished, then lesson 10 teaches it: rewrite after Q0043, and
        drop its stale Q0010 reference.
      - ບໍ່ ມີ is segmented two ways in lesson 12: segment both as ບໍ່ + ມີ (baw mii, "don't have").
      - Sentence-card English: S000002870 ກິນເຂົ້າ. "To eat (a meal)." (after Q0035); "please" for every ແນ່ (nae)
        sentence (S000002880 and its siblings); S000002878 "He's already had some water."; S000002901 (after Q0036);
        S000000047 "He's / She's here." (after Q0037); ສີນີ້ຂາວ. "This one is white."; ສີນີ້ດີ. "This colour is
        nice."
      - The ກິນ gloss "eat; (colloquial) drink" → "eat; drink" (after Q0038). The W000001 note: "often said with the
        palms together and a slight bow, the ນົບ (nop), especially to older people" (after Q0039).
      - Before ເ◌ is taught, write the ແ and ເ sound hints as a contrasting pair (both point at "say" today).
      **Done when:** no card shows "ch" for ຈ or "aw" for ◌ອຍ, no note shows English-style romanization on a Standard
      card, and every item above is applied or waits on a named question.
- [ ] **A10 Notes: grammar, how Lao works, culture** (owner 2026-11-13). A home section that lists every rule card
      (R##) and culture/usage note from lessons the learner has reached, grouped (Reading and writing, Grammar,
      Culture), each opening as its full card; locked ones hidden. Backend first: a `learner_notes()` RPC (rules and
      `word_notes` by intro lesson vs the learner's progress). **Done when:** a learner with lessons 1–9 done sees
      R03, R02, R01, R04 and the ຫິວ note under Notes and can open each; one with only lesson 1 done sees none.
- [ ] **A20 Lesson length and honest progress (later).** Planned steps L1 14, L8 30, L9 40, L12 45 (DESIGN targets
      10–25); with misses, L9 reached 73 and L12 96.
      - Show sentence cards back to back and build them 2–4 steps later; one blank per new word, the same word
        blanked in at most 2 sentences. Replays stay.
      - Base the progress bar and "n / total" on planned steps (today `s.steps.length` grows with misses, so the bar
        slides back); show replays as "Another go: 2 left".
      - Keep the learner's place for several days, not just the day (`session.js:577`), and say so in `leave_body`.
      - From L8, a "good place to stop" marker after the last new item's practice.
      **Done when:** lesson 12 plans at most 30 steps and its progress bar never moves backwards.
- [ ] **A21 Reference and orientation (later).** A Letters chart toggle (27 consonants in traditional order with
      class, vowels as short/long pairs; untaught tiles show glyph and sound; "3 of 27 consonants"); a level legend
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
      unverified; the ສະບາຍດີ and ເຂົ້າ notes are asked in QUESTIONS.
- [ ] **S7w2 Letter writing, next (scoped, not built).** Two parts, in this order:
      1. A single trace card when a letter is first introduced in a lesson (the learner traces that letter once,
         right there; the full `#/write` routine stays in its own area).
      2. Vowels and tone marks in `#/write` (stroke data, scoring, grid), plus ໜ ໝ; progress in the DB only if the
         owner wants it.
      Needs a design pass first (activity module or teach-card extension; whether its answer goes through
      `record_answers`). **Done when:** scoped into a build slice with a "Done when".
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
- [ ] **S9b Tone drill:** after L3.
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
- After lesson 12: ອາຫານ, ຢາກ, ມັກ, ຄົນ, ໃຫຍ່ around a second conversation (ordering food).
- Prior knowledge (on hold, owner 2026-11-18, to talk through): the intake's "speak Lao" / "read Thai" answers change
  nothing (`intake.js:8`); a "Brisk" pace setting; "Thai readers:" notes. Not for now (DESIGN "Who it is for").
- Lesson side rail (the lesson's words beside the stage on wide screens): scrapped for now (owner 2026-11-18). If it
  comes back: in many activities the Lao is the answer, so it must collapse while a question is unanswered.
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

# Plan

Open slices in working order. One slice at a time; each has a "Done when" line; tick it when the owner's check
passes, then move it to the Done line. Detail of finished slices is in `CHANGELOG.md` and git. Design:
`docs/DESIGN.md`. State and next step: `docs/NOTES.md`.

Cross-cutting rule not in CLAUDE.md: **native status is self-declared; feedback is unverified until the owner
verifies the person** (`reviewer_trust.native_verified_at`, set by hand in SQL). Privileged roles live in a table
users cannot write.

## Done
S1–S6c (scripts, backend, lesson 1, reader, progress, session runner, multiple choice) · S7a build the sentence ·
S7b session comfort (resume, leave dialog, dry run `#/try/`) · S7c activity data · S7d build the word · S7e fill in
the blank · S7f bonus words · lessons 1–11 merged · hosted Supabase + Netlify · A1 wife's audio · A2 gentler
activities · A3 stats capture · L1 clearer activities · L2 listen and pick.

## Working order
L1b–L1e → A7 steps 0–5 → L3 → A7 steps 6–10 → L4 → L5. Owner-gated slices (A4–A6, S7h, S7w, S10r) close when the
owner's check or answer comes in.

## Alpha (owner 2026-11-14: the owner's sons test the app)
- [ ] **AL1 Alpha readiness.** *Built 2026-11-14; migration not pushed yet.* "All lessons" links go to `#/lessons`;
      optional sign-up questions (`learner_intake`: Lao spoken and read, Thai, goals, reasons, age range; Skip
      stores `skipped`); Settings → Send feedback (`app_feedback`); `LAO_UI_REVIEW.md` and its script moved out of
      the served frontend. **Done when:** the migration is on hosted, a new learner on the deployed site sees the
      questions once, and a feedback message reaches `app_feedback`.

## Learning slices (owner 2026-11-13)
- [ ] **L1c Answers and feedback.** *Built and pushed 2026-11-13; owner browser check pending.* (a) Build the word: Check before all pieces are placed. (b) Right in the end =
      green: slips (wrong tile tapped and taken back) no longer show red; they stay in `review_log`. (c) A wrong
      answer shows "Your answer" over "Right answer", aligned word by word, differences highlighted, a [missing] gap
      for a left-out word. (d) Accept an equally right answer (ສະບາຍດີບໍ່? sabaidee bor? for "How are you?" when the
      target is ເຈົ້າສະບາຍດີບໍ່?) with a note ("also right; ເຈົ້າ adds 'you'"); test ເຈົ້າ where the pronoun cannot be
      dropped. (e) Build the word, any order: one slot per piece in reading position; a tapped piece drops into its
      slot. **Done when:** (a)–(e) work on `#/try/L0007` and `#/try/L0009`, `session_test.mjs` covers (b) and (d),
      and A3 detail still records every tap.
- [ ] **L1b Vowel line and activity mix.** *(a) built and pushed 2026-11-13; (b) waits on the owner's split.* (a) Every vowel intro card says the vowel is one unit (all its parts,
      wherever they sit) and the consonant is said first. (b) Favour listen and pick and other quick recognition in
      lessons; build the word / sentence less in lessons, more in practice (S8b). Same number of checks. Owner said
      "might": confirm the split first. **Done when:** vowel cards carry the line (`db_sql.py change`); the mix is
      agreed and `session_test.mjs` checks it.
- [ ] **L1d Teaching notes.** *Built 2026-11-13 (R03 in L0002, R04 in L0009 after ຫິວນ້ຳ, not ບໍ່ຫິວ: kept there, owner left it to the agent; pushed). Missed-ເຂົ້າ note in the compare view built and pushed (`PAIR_NOTES` in `compare.js`); owner check pending. Left: S000002879, S000002888, S000002892 wait on QUESTIONS.* (a) Rule card "some vowels are written before (or around) the consonant, but you say the
      consonant first" at ເ◌ົາ in lesson 2. (b) Rule card "pronouns are often left out" at ບໍ່ຫິວ (bor hiw, "not
      hungry") in lesson 9. (c) ຫິວ (hiw) culture note and missed-ເຂົ້າ feedback ("hungry needs ເຂົ້າ"): bare ຂ້ອຍຫິວ
      sounds incomplete (native, 2026-11-13). Review bare-ຫິວ sentences: S000002892 ຫິວ and S000002888 ບໍ່ຫິວ
      (replies; ask if fine), S000000268, S000001655, S000000192 (add ເຂົ້າ or retire). (d) English fixes: S000002881
      "Could I have some rice, please?"; S000002889 and S000002892 drop "Yes,"; S000002879 per QUESTIONS.
      (e) "This is white" (native): ນີ້ຂາວ (nee khao) fits a wall's colour; for an object in hand ນີ້ມັນສີຂາວ (nee man
      sii khao). Check lesson sentences with this pattern. **Done when:** rule cards in lessons 2 and 9, English rows
      changed, pushed with the owner's go-ahead.
- [ ] **L1e Lesson order.** *Built and pushed 2026-11-13; owner check pending.* A word's first build (or hardest check) is in the lesson that teaches it (ສະບາຍດີ and
      ຫິວ were first built in lesson 9). Long words (3+ syllables) get "find the missing piece" before a full build.
      **Done when:** `session_test.mjs` asserts no first build outside the word's own lesson and long words get a
      missing-piece question.
- [ ] **Bug: ◌ິ drawn right of its circle** on the owner's screen; not reproduced in headless Chrome with any Lao font
      (`tmp/vowel_glyph.png`). Needs device, browser, Settings → Lao font, and where it showed.
- [ ] **L3 Teaching tone.** A proper lesson: what tone is, the pitch line legend, tone marks and consonant class in
      plain words, recorded pairs that differ only by tone (ຂາວ khaao "white" vs ລາວ laao, if ລາວ is long; ໃກ້ "near"
      vs ໄກ "far", to verify; ເຂົ້າ "rice" vs ເຂົ່າ "knee" once both are taught), and a hear-and-pick-the-pitch check.
      **Done when:** merged with at least two recorded pairs and a pitch check.
- [ ] **L4 Conversations** = S7g, with two voices when a second speaker records.
- [ ] **L5 Speaking practice.** Design `docs/L5_SPEAKING_DESIGN.md`; owner answered its questions 2026-11-13 (phase 1
      "Say it" in lessons with a Settings opt-out, no self-grade, voice never leaves our client/server). Next: write
      the phase 1 build slice.

## App slices
- [ ] **A4 "Sounds like" review.** Hints applied and pushed (`20261113143534_a4_sound_hints.sql`; table in the last
      section of `docs/A4_SOUNDS_LIKE_AUDIT.md`). **Done when:** the owner has read the changed-rows list.
- [ ] **A5 Usage and culture notes.** Built and on hosted; owner check passed 2026-11-13. Left: pool words in
      `get_lesson` lack the note (ⓘ from a sentence chip shows none); the one-off "translations are not literal" card
      (needs a merged-lesson change). Notes unverified (QUESTIONS).
- [ ] **A6 UX review.** Proposal in `docs/A6_UX_REVIEW.md` §3. **Done when:** the owner agrees it (questions 1, 3, 4).
- [ ] **A7 Revamp: home and sections.** Steps 0–10 in `docs/A7_PLAN.md` (mockup gate at step 6). Home: Continue,
      Review, Letters and sounds, My words, Write; stats on home (absorbs S8); dark mode with a System/Light/Dark
      switch (step 1); Culture/Bonus badges with more oomph (step 7). Also: where ▶ / ⚑ sit; topbar wrapping at
      narrow widths and 200% zoom.
      **Built, owner check pending:** step 0 (groundwork: `summary.js`, `settingsPanel()`, selector contract in the
      activity-module skill, `--content-max` / `--radius`); step 1 (`#/settings` page, sound-spelling choice on the
      lesson 1 intro card, System / Light / Dark); step 2 (slim one-line header, hidden in lessons; lessons show ✕,
      progress bar and "12 / 40"; email and Sign out on the settings page); review fixes; step 3 (home: Continue card
      + compact path, `home.js`); step 4 (summary: "Next lesson" primary, "Back home", "Lao words read (with
      repeats)"); step 5 (audio: ▶ is the one control on a card face, accent colour; voice credit and ⚑ report in
      "More", open in the ⓘ sheet; the ◌ note on the first 3 build-the-word questions with a ◌ tile); step 6 decided by the owner (`A7_PLAN.md`
      "Step 6 decided"); step 7 (Look: Lao blue + red is the default palette, Colours choice Lao / Indigo + saffron /
      Teal + gold via `html[data-palette]`, theme and palette set in index.html's head before the first paint, solid
      Bonus and Culture badges with a reduced-motion-safe pop, brand dot, streak in the warm colour); step 8 (model B,
      no tab bar: home = Continue card + tiles; Lessons (`#/lessons`, the path, "5 of 11 done") and Write live; Review,
      Letters and sounds, My words, Notes greyed "Soon", not focusable); step 9a (thumb zone: options centred in the
      free space with bigger targets, Continue unchanged; key hints hidden on touch and under 561px). Next: step 9 part B,
      inline sentence words with a popover.
- [ ] **A10 Notes: grammar, how Lao works, culture** (owner 2026-11-13). A home section that lists every rule card
      (R##) and culture/usage note from lessons the learner has reached, grouped (Reading and writing, Grammar,
      Culture), each opening as its full card; locked ones hidden. Backend first: a `learner_notes()` RPC (rules and
      `word_notes` by intro lesson vs the learner's progress). Principle: the app teaches; explanations are short but
      informative and come before the thing they explain. **Done when:** a learner with lessons 1–9 done sees R03,
      R02, R01, R04 and the ຫິວ note under Notes and can open each; one with only lesson 1 done sees none.
- [ ] **A8 Letters and sounds.** Every taught symbol with card info, examples from known words, audio; links into
      writing practice; vowels join writing practice.
- [ ] **A9 My words.** Every word seen, with card info and personal stats; needs a per-item stats RPC. Leads into S8b.
- [ ] **S7g Conversations.** Design note first: `dialogues` / `dialogue_lines` (ordered sentence ids, speaker A/B), a
      `dialogue` lesson item, a conversation card, fill in the blank on its lines. Lessons 8 and 10 carry their lines as
      ordinary sentences until then. **Done when:** lesson 10 shows its conversation as one card with a fill in the
      blank on one line.
- [ ] **S7h Untaught real words as wrong options.** Built 2026-11-12, owner test pending. **Done when:** a fill in the
      blank on ແລ້ວ in S000002877 (lesson 5 bundle) offers only real words, untaught ones among them; lesson 6 has a
      fill in the blank on a recycled sentence.
- [ ] **S7w Letter writing.** Built; desktop passed with fixes, owner finds it "weird", notes to come. **Done when:**
      on a phone two letters can be completed with a finger; a careless trace fails; ຂ drawn for ຊ is refused; a
      finished letter shows a tick. Later: vowels, tone marks, ໜ ໝ; use in lessons; progress in the DB.
- [ ] **S10r Recording mode.** Built and deployed. Open from the wife's first session: (b) as many questions per
      screen as fit, no scrollbar; ask all questions for an item in one go (ask the owner what exactly felt split).
      Then: check takes (`recording_feedback` view, bucket `recordings`), her view of the Lao UI text, verify her in
      `reviewer_trust` (README "Native verification").
- [ ] **S8 Home and stats:** `learner_stats()` RPC (streak, letters known, words known); settings move to the
      learner's profile (proposed, not agreed). Mostly absorbed by A7 step 10.
- [ ] **S8b Practice:** `practice_items(limit)` (due, then weak, then oldest; bonus words included), practice mode
      (recall first, no teach cards), `complete_practice` summary, due count on home; matching and flashcards.
      **Done when:** a learner with lesson 1 done can run a practice session and see its summary.
- [ ] **S9 FSRS:** design note first. Open points: client JS module vs plpgsql; outcome → rating (recognition at
      reduced weight, recall by latency, wrong = Again); card granularity and direction; the ladder gates activity
      types, FSRS decides timing, no demotion; daily session capped; later fit weights from `review_log`.
- [ ] **S9b Tone drill:** after L3.
- [ ] **S10 Native feedback:** review RPCs and the `recordings` insert policy require `role = 'native'`; queue
      lesson content first; feedback on words and units, one `feedback` shape keyed by `(item_type, item_id)`; owner
      views with verified reviewers marked; export → agent decisions → migration (source `native review <ids>`);
      learner reports feed the same queue.
- [ ] **S11 Deploy leftovers:** password reset; email sending (built-in
      mailer is rate-limited) (moving the Lao review files is done, AL1).

## Small fixes and unsliced ideas
- Stale notes on W000035 and W001415 still mention W000019 for the "enter" sense.
- The "Read more on Wikipedia" links under "More" were written from memory; verify.
- Bonus words are tested without a sentence (learning review).
- "Lock in" a new word (owner): ask each piece's sound before the word's card; the word appears at the end.
- Respelling hint on meaning → Lao questions (owner): hinted answers count for letters, not for word knowledge.
- After lesson 11: ມີ, ອາຫານ, ຢາກ, ມັກ, ຄົນ, ໃຫຍ່ around a second conversation (ordering food).
- Later: admin role and in-app owner tools, PWA/offline, analytics on drop-off and difficulty, trust scores.

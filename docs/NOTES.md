# Notes

Notepad for the next session: state, open work, decisions in force, next step. Remove what is finished (history is
in `CHANGELOG.md` and git). Slices: `docs/PLAN.md`.

## State (2026-11-11)
- **Harness refactored 2026-11-11:** guardrails reduced to a usage guard, folders renamed (`scripts/`, `docs/`,
  `curriculum/`), word-list and research work parked in `_shelf/`. **Not yet proven in the new setup:** the agent
  running the local Supabase itself (`supabase status` / `migration up` from `app/backend`, SQL through
  `docker exec -i <supabase_db container> psql -U postgres`; there is no `psql` on PATH) and the lesson runner
  (`scripts/next_lesson.ps1`). First use of each should be treated as a test.
- **Content pool:** 1425 words, 2816 sentences, 30 templates. Pipeline clean (0 errors, the usual 8 warnings).
- **Lessons merged: 4.** L0001 ກິນ (gin, eat) · L0002 ເຂົ້າ (kao, rice) · L0003 ລາວ (lao, he/she) · L0004 ຂາ, ຂາວ, ນ້ຳ
  (to be rebuilt, below).
- **Backend:** local Supabase only (Docker). Nothing is hosted, so any migration may still be replaced. A
  `supabase db reset` wipes accounts; the owner then signs up again.
- **App:** lessons 1–4 play end to end with teach cards, multiple choice, replay of missed questions and a summary
  (S6a–S6c passed). Build the sentence (S7a) passed on desktop, including drag tiles and `covers` on the lesson list.

## Next steps
1. Phone testing: `config.js` SUPABASE_URL uses the PC's LAN address (192.168.1.189); the app is at
   `http://192.168.1.189:5500/`. The lesson frame (`.lesson-frame`, 100dvh, pinned button) passed the phone test on 2026-11-11.
2. **Rebuild lesson 4** (LESSON_RULES decision 22): ຂາ (kaa, leg) W000389 becomes `bonus`; ຂາວ (kaao, white) W000538
   and the sentence ລາວຂາວ S000002876 leave the lesson (ຂາວ moves to lesson 11). Withdraw and re-merge (steps under
   "Lesson building"). Then run `app/backend/tests/s7c_s7f_test.sql` and build the frontend bonus label
   (`badge_bonus` string; the planner gives a bonus word its card and recognition checks only).
3. Then S7b, S7e, S7d and lessons 5–11 (PLAN "Working order").

## Decisions in force
- One curriculum lesson = one app lesson. Content names no screens; the planner (`js/session.js`) builds them.
- Interleaved: card, check, next card; a closing mixed block; missed questions replayed until right once.
- Completed = reached the end; no pass mark; summary accuracy counts first tries only.
- The check after a card counts as recognition (level 2). Audio is keyed by item id (`item_audio`, S10) with an empty
  button slot from S7b. Resume is same-device only. No offline.
- A done lesson links to "Review lesson material": read-only cards, never questions.
- Fill in the blank offers exactly one logical choice (DESIGN "Fill in the blank: one logical choice").
- Lesson budget is a guideline (decision 26). Order agreed: rebuild lesson 4, then lessons 5–11.
- Still wanted in a later lesson, not placed: ແມ່ນ (maen, yes / to be) W000004, ໄປ (bpai, go), and ເຂົາ (kao, they) /
  ເກົ້າ (gao, nine) once ເຂົ້າ is solid (decision 15).
- One row per spelling and meaning; sentences pick a meaning with `word_overrides`.
- Content sources: Wiktionary (words), SEAsite and Wikipedia (tone rules). Drafters compose sentences (`unverified`).

## Code map (frontend)
- `js/session.js`: `planLesson(bundle, rng)`; `advance` queues `again(spec)` for a missed question.
- `js/activities/multiple_choice.js`: forms; `build` returns null when it cannot fill 3 options.
- `js/activities/build_sentence.js`: tiles; `again` reshuffles.
- `js/activities/teach_card.js`: `cardItems`, `unitSound`, `openInfo`, `infoButton`, `chips`.
- `js/learn.js`: lesson list and the read-only viewer. `js/bundle.js`: `get_lesson` cache.

## Lesson building (what worked for lessons 3–4)
- `lesson_tool.py brief` → propose to the owner → `drafter` agent writes the content drafts and
  `curriculum/lessons/drafts/next/*.csv` from a brief that names every row → `check_drafts.py`, `merge_words.py`
  (a sentences-only merge needs a header-only words file as the positional argument), replace placeholder sentence
  ids, `pipeline.sh`, `lesson_tool.py check` → `curriculum-reviewer` → fix → `lesson_tool.py merge` → `db_sql.py seed`
  → `pipeline.sh` → CHANGELOG → commit.
- Flags used so far: L0002 and L0003 `--max-units 3`; L0003 `--min-recycle 2`; L0004 `--max-weight 7.5`.
- `db_sql.py` options go before the mode (`--name x change <ids>`).
- **Withdrawing a merged lesson** (allowed only while nothing is hosted): remove its rows from `data/lessons.csv`,
  `lesson_items.csv` and any units/rules it introduced, delete its migration, and remove its
  `curriculum/lessons/merged/<id>` folder (merge fails at the final move if it exists). Once hosted: `db_sql.py change`.
- Editing CSVs: a `replace_all` that removed text at line ends also removed the line breaks. Rewrite small CSVs whole.
- When lesson 6 is built, add to QUESTIONS: ແນ່ vs ແດ່ (which softener is everyday Vientiane speech), whether bare
  ຂໍນ້ຳ (kor nam, "water please") sounds abrupt, ຫິວເຂົ້າ (hiu kao) as the normal "hungry". ແນ່ as a softener has no
  words.csv row yet (the pool has ແດ່ W000308).
- Conversations (S7g) do not block lessons 8 and 10: they carry their lines as ordinary sentences in order.

## Open with the owner
- ລາວ vs ຂາວ vowel length: data has ລາວ short (`law`) but ຂາວ long (`kaao`), both ◌າ+ວ. Wiktionary gives the pronoun
  short and the noun long. Needs a native speaker (in QUESTIONS).
- ນ້ຳ (nam, water): keep the respelling "nam"; reword the pron_tip ("'num' as in 'number'").
- pron_tip texts under "More" use English-style spellings and the word "aspirated": reword?
- The "Read more on Wikipedia" links under "More" were written from memory and are unverified.
- Stale notes on W000035 and W001415 still mention W000019 for the "enter" sense (the links are fixed).
- Proposed, not agreed: move settings from the browser to the learner's profile when the home screen exists (S8).
- A native speaker is expected from about December 2026; audio is built as if recordings exist.

## Owner preferences
- Every Lao example in chat carries a romanization and the English. Use the owner's own spellings where they have
  given one (leo, khoy, mee, muk, jak, sabaidee).
- Keep usage down: do not re-read everything each session; work from this file and grep.
- Keep gate checks short: a handful of queries that confirm the Done-when line, not an exhaustive suite.
- Do not over-deliberate word choice.

# Progress

The full history up to 2026-10-10 is in `_agent/progress-archive.md`; read it only when you need the background of a past decision. Rules: CLAUDE.md. Data model and workflow: `_agent/SCHEMA.md`.

## Current state (2026-10-10)
- **Data:**
  - 1015 words (W000001–W001015; cap 3000); 2032 sentences; 30 templates.
  - All 35 required letters and 31 vowels introduced by word 600.
  - All nouns classified (classifier_word_id / classifier_type / classifier_confidence).
- **Last pipeline:** tone_derive 1627 syllables, 0 problems; build 3145 steps; validate 0 errors.
  - Known warnings: ໃຈ W000007 appears only in compounds; ສ່ວນຫຼຸດ W000647 comes before its part ສ່ວນ W000799.
- **Confidence:** words about 60% verified (Wiktionary is the only word source; about half of lookups are 404s). Sentences: 61 verified, everything else agent-composed and `unverified`.
- **Tools (approved):** tone_derive, build_order, validate_data, merge_words, apply_columns, check_drafts, rekey_ids (done; one-off), pipeline.sh.
- **Workflow:** drafter → check_drafts → (tone_derive on the draft) → merge_words --check → merge → pipeline.sh → move drafts to `_agent/drafts/merged/` → commit.

## Standing user decisions (most recent)
- **Target and cap:** target about 3000 words, hard cap 3000. Checkpoints at 1500, 2000, 2500 and 3000.
- **Order:** trunk (first ~100–200 words), then loose topic branches. No core field.
- **Meanings:** one row per spelling+meaning; `word_overrides` picks the meaning in sentences.
- **Approvals:** group script changes for approval.
- **Git:** never stash or checkout. `.gitattributes` keeps the approved scripts byte-exact.
- **Sources:**
  - In use: Wiktionary, Tatoeba.
  - Declined: sealang, Enfield's grammar.
  - Glosbe acceptable if needed.
- **Classifiers:** 3 columns (SCHEMA "Classifiers"). Templates TPL27–30 teach the classifier patterns.

## 2026-10-10 Drafter test batch t1 (15 hobby words): workflow validated
- 15 words (7 verified / 8 unverified) and 36 sentences (all composed) merged as W001001–W001015.
- check_drafts: 0 problems; draft tones 26/26 consistent; merge and pipeline clean.
- **Finding: real-sentence sources yielded nothing.**
  - Tatoeba's Lao collection is small, and its search API matches loosely: 0 hits for 7 words.
  - Big Brother Mouse pages show no Lao script as text.
  - Searching costs tokens with little return. Decision for the user: keep trying, or skip.
- **Doubtful items (in NEEDS_HUMAN):** ງານອະດິເລກ "hobby" (spelling modelled on Thai), ກີຕາ vs ກີຕ້າ, the loanword tone of ເກມ, ໜັງ "movie" sense, ເລື່ອງ as classifier.
- New topic value `hobbies` sits beside the existing `leisure` (7 words). Reconcile when branches are designed.
- Drafter cost: about 91k tokens for 15 words; fixed overhead dominates small batches.

## User decisions after t1 (2026-10-10)
- **Skip Tatoeba and Big Brother Mouse.** Drafters compose sentences (`unverified`) and still check words on Wiktionary.
- **Don't over-optimize word choice.** If reasonable candidates exist for a category, use them confidently; no long deliberation over which words to pick.
- **Next categories** (some partly covered already; the drafter skips existing words via vocab):
  - restaurants
  - clothes
  - gardening
  - fruits
  - vegetables
  - meat
  - animals
  - transportation
  - directions

## Next
1. **Done:** build_order rev 5 approved. The pipeline ran (0 errors) and created `_agent/vocab.csv` (1015 words). No need to re-run it before the first batch.
2. **Done by user** (report still mentions Tatoeba/BBM; drafter told to ignore): edits to `.claude/agents/drafter.md`:
   - Line 14: load the vocabulary from `_agent/vocab.csv`.
   - Remove the Tatoeba/BBM steps in "Sentences": compose directly.
   - Add: "Pick reasonable common words for the category without long deliberation."
   - CLAUDE.md also mentions Tatoeba/BBM in the drafter bullet, Accuracy rules and Sources.
3. **Phase 7 (in progress, see entries below):** one drafter batch per category (~50–100 words each, one after another; tags c1, c2, ...) → check_drafts → tone check → merge → pipeline → commit. Checkpoints at 1500/2000/2500/3000.

## 2026-10-10 Phase 7 batch c1 (restaurants) merged
- 56 words (21 verified, 35 unverified) and 112 composed sentences became W001016–W001071. Totals: 1071 words, 2144 sentences.
- check_drafts 0 problems; draft tones 112/112 ok; pipeline 0 errors.
- New benign warning: W001028 ບ່ອນນັ່ງ uses the noun ບ່ອນ as its classifier (valid usage).
- Doubtful items added to NEEDS_HUMAN. Drafter cost about 160k tokens.

## 2026-10-10 Batch c2 (clothes) merged
- 61 words (24 verified, 37 unverified) and 109 composed sentences became W001072–W001132. Totals: 1132 words, 2253 sentences.
- Homograph ຄຳ "gold" added; merge needs `--allow-homograph ຄຳ` (check_drafts too). Pipeline 0 errors; classifier-pos warning now also W001090 ຖົງມື→ຖົງ (benign).

## 2026-10-10 Batch c3 (gardening) merged
- 61 words (20 verified, 41 unverified) and 115 composed sentences became W001133–W001193. Totals: 1193 words, 2368 sentences.
- Homograph ບານ "bloom" (`--allow-homograph ບານ`). Pipeline 0 errors; classifier-pos warnings are repeaters (ສວນ etc.), benign.

## 2026-10-10 Batch c4 (fruits + vegetables) merged
- 78 words (13 verified, 65 unverified) and 144 composed sentences became W001194–W001271. Totals: 1271 words, 2512 sentences. Pipeline 0 errors.
- Components rule given to drafter: list every part whose spelling is a known word.

## 2026-10-10 Batch c5 (meat + animals) merged
- 79 words (19 verified, 60 unverified) and 158 composed sentences became W001272–W001350. Totals: 1350 words, 2670 sentences. Pipeline 0 errors.
- Homographs ເຂົາ "horn" and ມັນ "fat" (`--allow-homograph ເຂົາ,ມັນ`).
- Gap noticed: ຜູ້ is not a word yet; add it in a later batch.

## 2026-10-10 Batch c6 (transport + directions) merged; all listed categories done
- 74 words (19 verified, 55 unverified; includes ຜູ້) and 140 composed sentences became W001351–W001424. Totals: 1424 words, 2810 sentences. Pipeline 0 errors.
- Drafter cost c1–c6: about 150–180k tokens per batch on opus (~2.4k tokens per word).
- **User switched the drafter to `model: sonnet`** (2026-10-10). Next batch is a trial: compare cost and quality.
- To do: add ຜູ້ (now W0013xx) to components of ຜູ້ຊາຍ, ຜູ້ຍິງ, ຜູ້ຈັດການ, ໄກ່ຜູ້, ໂຕຜູ້.
- All user-listed categories are done.

## 2026-10-10 Batch c7 (weather, family, body): drafted on sonnet, NOT yet checked or merged
- 74 words and 148 sentences in per-word files `_agent/drafts/c7-001-words.csv` / `c7-001-sentences.csv` … `c7-074-*`. Words: 15 verified, 59 unverified. Cost about 147k tokens and 189 tool calls (barely below opus).
- Homograph ຕາ "maternal grandfather" (c7-W042), so use `--allow-homograph ຕາ`.
- Hand fix needed: c7-067 ຕາເວັນຂຶ້ນ gloss "sunrise; east" → "sunrise".
- **Resume here:** check_drafts on `c7-*-words.csv` / `c7-*-sentences.csv` → tone_derive on the drafts → merge_words (accepts several batch files) → pipeline → move to merged/ → commit. That reaches about 1498 words, so the 1500 checkpoint is next.
- To do: add ຜູ້ to the components of ຜູ້ຊາຍ, ຜູ້ຍິງ, ຜູ້ຈັດການ, ໄກ່ຜູ້, ໂຕຜູ້.

## TODO: more efficient drafter (next run)
The cost is in growing context: every tool call re-sends the whole transcript, so 190 calls × a growing context is the bill. Writing one word at a time inside one long agent run does not fix this.
1. **Main agent picks the word list** (lao + gloss) up front with one cheap grep against vocab.csv. The drafter does no candidate search.
2. **Short drafter runs:** about 10–15 words per call, many calls in sequence. Each run starts with a small context. Fixed overhead stays small once the next point is in place.
3. **Tiny brief, no big reads:** paste the words.csv/sentences.csv headers, 2 example rows and the classifier rules into the brief, so the drafter skips reading SCHEMA.md and data files. Grep vocab only for sentence tokens.
4. **Skip Wiktionary for compounds** of known words (they 404); take IPA from the components. Fetch only roots, and ask the fetch for only IPA, pos and classifier.
5. **Fewer writes:** one words file and one sentences file per run (not per word).
6. **Measure** tokens per word for each run and compare with about 2k per word for c1–c7.
- The user must update `.claude/agents/drafter.md` to match (the agent cannot edit `.claude/`). Its report section still mentions Tatoeba/BBM.

## 2026-10-19 Pivot: letter-set to word map (planning only)
- User asked for a map from learned unit sets to readable common words; best 3/4/5-unit sets; vowels are units; avoid multi-sound glyphs.
- Plan written to `_agent/LETTER_MAP_PLAN.md`; Phase 8 added to PLAN.md. c7 drafts remain unmerged (Phase 7 paused).
- User decisions (rev 2 of the plan): multi-role glyphs excluded from the first set; patterns and tone marks are units; multi-syllable ok; build a closed common-word list first, then the map is set math.
- Rev 3: commonness is the model's judgement (no source needed, sources don't imply common); Lao spelling keeps a confidence column; list has no cap (expect 1000–2000); no proposed/accepted status.
- Exclusion list confirmed. `common_list.py` (seed/merge/report) and `letter_map.py` (signatures, union-closure search, best sets, nested chain) written to `_agent/proposed-scripts/`; both import `parse_syllable` from approved build_order.py. Not yet run (cannot run unapproved scripts).
- 2026-10-19 scripts approved. Judged words.csv: 72 not common (`_agent/letter_map/not_common_ids.txt`), 1352 seeded into common_words.csv.
- v0 map: only 431 of 1352 are searchable (most need ດ/ບ/ວ/ຍ/ອ/ຫ or > 5 units). Best: k=3 ກ ປ ◌າ 3 words; k=4 ກ ງ ນ ◌າ 5; k=5 ກ ຕ ປ ◌າ ◌ີ 9. Chain ປ◌າ → +ກ → +◌ີ → +ຕ (ປາ ປາກ ປາກກາ ປີ ປີກ ຕາ ຕີ ຕາກ ກີຕາ). Too thin: the list lacks short everyday words.
- 7-unit run (rev 1): 1.54M candidate sets; k=6 13 words ກ ງ ປ ◌້ ◌າ ◌ີ; k=7 18 words ກ ງ ນ ປ ◌້ ◌າ ◌ີ. Saved as `_agent/letter_map/v1-map7-reference.txt`.
- letter_map rev 2 proposed (bitmasks, branch-and-bound DFS with live signatures, beam chain adding 1–2 units per step; default --max-k 7). After approval, check that its best-set counts match the rev 1 reference.
- enum_spellings.py proposed, awaiting approval.
- 2026-10-19 gap fill done: enum_spellings → 19 batches (5624 spellings) judged by drafter (sonnet, ~24k tokens each), reviewed by main agent (dropped Thai forms/spellings such as ຄ່ະ ຕຽມ ຖູກ ເພັງ ລິງ ເລັກ ເລ່ນ ໄໜ, non-standard ມູ່ ມຶກ ປື້ມ ໜໍ້), merged. Common list 1575 (861 unverified). 738 searchable.
- Map (k ≤ 7, 106 s): k=3 ງ ນ ◌າ 5; k=4 ກ ງ ນ ◌າ 8; k=5 +ຈ 11; k=6 ກ ງ ນ ລ ◌້ ◌າ 17; k=7 ກ ຄ ງ ນ ◌້ ◌າ ◌ົ◌ 24. Chain ນ◌າ → ງ → ກ → ◌້ → ຄ → ◌ົ◌ (score 66).
- Next: Wiktionary check of the words in the top sets; consider two-syllable compounds from top-set units.
- (old) gap fill with short words from allowed units (propose `enum_spellings.py`, then judge enumerated spellings).
- (old) once approved, judge words.csv for commonness → seed_ids.txt → `common_list.py seed` → `letter_map.py` v0 → category gap lists → drafter list batches → `common_list.py merge`.
- Weekly usage 55% at this point (stop at 60%).

## 2026-10-19 Zipf top-300 coverage check
- English list: Wiktionary "Frequency lists/TV/2006" ranks 1–300, folded into 186 base words (inflections and contractions merged; articles, fillers and names dropped). Lao candidates in `_agent/tmp/zipf300.tsv`, results in `_agent/tmp/zipf300-check.tsv`.
- 173/186 matched. 13 missing: life, guess, idea, honey, hell, oh, bad, never, nothing, everything, together, better, best. About 25 more matched only a weaker sense, with the main Lao word absent (ອື່ນ, ຫາ, ເດັກນ້ອຍ, ເຂົາເຈົ້າ, ຍ້ອນ, ດ້ວຍ, ສາມາດ, ກະລຸນາ …). Likely cause: the enum gap fill never generated ອ/ຫ-initial spellings.
- Merged 42 rows from `_agent/letter_map/proposals/zipf300.csv` (spelling unverified). Common list now 1617. Map not yet rerun.

## 2026-10-19 Pivot to lessons (Phase 9)
- k ≤ 10 map run started in the background → `_agent/letter_map/k10/` (k ≤ 7 outputs left in place). Not finished at this entry.
- User decisions, recorded in `_agent/LESSON_PLAN.md`: 5–10 minute lessons, about 3–4 new items each; vowels, tone marks and rules count as items; no review lessons (lessons recycle earlier material, and the app has flashcards); app-side spaced repetition per learner and item; lesson 1 = ລາວ (ລ ◌າ final-ວ); ດ/ບ as initials from the start, ອ early, ຍ ວ ຫ by lessons 8–12; sentences early, then Q&A, then dialogues; there is enough material to start, and gaps are filled after lessons are mapped.
- Design: role-units (glyph + role) replace the exclusion list. Planned tables in SCHEMA.md (units, rules, lessons, lesson_items, dialogues).
- **Next:** read the k10 results → write units.csv / rules.csv → propose `lesson_plan.py` → draft and review the first ~20 lessons.

## 2026-10-19 Lesson runner, app design, CLAUDE.md
- User wants one-lesson-at-a-time generation via a script that launches `claude -p`. Proposed (one group): `_agent/proposed-scripts/lesson_tool.py` (status/brief/check/merge), `next_lesson.ps1` (runner: brief → claude -p → verify +1 lesson → pipeline → commit), `next_lesson_prompt.md` (runner prompt, ASCII). Role-unit IDs are derived (C23, C24f, V03, T2), so units.csv is written per lesson by merge, not by hand. R01 = dead syllables.
- `_agent/APP_DESIGN.md`: show first, test later (levels unseen → introduced → recognised → recalled → in use), activity table (v1: teach card, spot it, matching, multiple choice, flashcards, fill in the blank, build the sentence, tone drill; v2: build the word, listening, dialogues, self-graded speaking; no ASR or Lao typing), and "What a lesson must contain".
- CLAUDE.md is edit-protected: the old version is archived at `_agent/archive/CLAUDE-wordlist-phase.md`; the new one is at `_agent/proposed-config/CLAUDE.md` for the user to copy.
- **Next:** user approves the three files and installs CLAUDE.md → build lesson 1 interactively → runner test with -Count 1.
- Later the same day: brief made size-bounded (counts + last 3 lessons + capped lists; new `lookup` and `can-read` modes). Distractors: lessons 1–5 may draw from lessons 1–5; from lesson 6 only taught items. No level demotion; every item has an info icon opening its teach card.
- k ≤ 10 map run stopped by the user (45 min, no output). Not needed: lesson_tool brief replaces it.

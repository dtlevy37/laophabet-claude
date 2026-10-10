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
- Next: wait for the user; then pick new categories (all user-listed ones done) and continue toward the 1500 checkpoint. Earlier list: fruits, vegetables, meat, animals, transportation, directions.

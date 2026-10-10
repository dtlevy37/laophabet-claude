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

## Next
1. Proposed (one approval): build_order also writes a compact `data/vocab.csv` (word_id, lao, pos, gloss_en, topic), so drafters don't read all of words.csv.
2. User to decide: Tatoeba/BBM searching (keep or skip); Sonnet for sentence-only drafting (test against check_drafts).
3. Then phase 7: topic batches of ~100 words, one after another, with checkpoints at 1500/2000/2500/3000.

# Letter-set to word map (plan, 2026-10-19, rev 2)

Goal: choose the FIRST units a learner learns. For each small set of units (consonants, vowel patterns,
tone marks), find which common words it can spell. Answer: which 3-, 4- and 5-unit sets spell the most
common words. Stop at 5 units for now. Keep early learning simple: no unit that follows more than one rule.

## Decisions (user, 2026-10-19)
1. Glyphs with several roles or sounds are **excluded completely** from the first set (not split into variants).
2. Vowel patterns are separate units (◌າ and ◌ຳ are different units). ◌່ ◌້ are units.
3. Multi-syllable words count, provided the whole word needs ≤ 5 units.
4. **Closed list first:** build an agreed list of common words, then the map is pure set math against that list.

## Units
- Consonants from `data/letters.csv`, vowel patterns from `data/vowels.csv`, tone marks ◌່ ◌້.
  Never in scope: ◌໊ ◌໋, ໆ ຯ ◌໌, digits.
- **Excluded from the first set (draft; user to confirm):**
  - Different sound as a final: ດ (d / t), ບ (b / p), ຍ (ɲ / j), ຣ (r / n). ກ (k / unreleased k) is kept as one sound.
  - Second role: ອ (silent carrier and vowel part), ວ (consonant and vowel part), ຫ (h and silent tone leader).
  - Vowel patterns that contain those glyphs: ◌ັອ◌ ◌ອ◌ ເ◌ັຍ ເ◌ຍ ເ◌ຶອ ເ◌ືອ ◌ົວະ ◌ົວ ◌ວ◌.
  - The script derives the list from letters.csv (ipa_initial vs ipa_final) plus the role list above, and prints it.
- Optional toggles, for comparison only: `--no-shared-glyphs` (no two chosen patterns share a glyph, e.g. ◌າ and
  ເ◌ົາ) and `--one-class` (all consonants of one class, so tone marks mean only one thing).
- Excluded words: any word whose spelling needs an excluded unit is left out of the first-set search,
  but stays in the common list for later stages.

## Step 1: the common-word list
File `_agent/letter_map/common_words.csv`:
`cw_id, lao, gloss_en, category, word_id (if in data/words.csv), source, confidence, status, proposed_by, notes`
- status: `proposed` → `accepted` / `rejected` (main agent review, user spot checks).
- "Common" = every grade-schooler knows it, or it is heard in everyday conversation.
- Categories: food and drink, feelings, spatial (up, in, near), temporal (now, day, tomorrow), colors, numbers,
  basic adjectives, basic verbs, pronouns, family, body, home, school, work, common places, greetings, animals,
  weather, clothes, transport, money and shopping, question words.
- Sources, in order:
  1. Existing `data/words.csv` (1424 words): each one judged common or not. It is a separate list, so the
     3000 word cap does not apply to it.
  2. Wiktionary Lao topical categories (e.g. Category:lo:Colors, lo:Foods): real, sourced words.
  3. Subagent proposals per category (lao, gloss, category, Wiktionary link). Every proposal is checked on Wiktionary;
     the ones not found stay `unverified` and are counted separately.
- Proposals arrive as small CSV batches in `_agent/letter_map/proposals/`; a script dedupes them against the list
  and words.csv, normalizes the Unicode, and appends them as `proposed`.
- Subagent: `researcher` (haiku) for Wiktionary category extraction (it reads pages, does not invent).
  `drafter` (sonnet) for category proposals, briefed for list rows only (no sentences, no tones) to keep cost low.
  One category per run, one after another.

## Step 2: the map (pure set math)
- Signature of a word = set of units needed to read it (same parsing as `build_order.py parse_syllable`).
  A word is spelled by set S iff signature ⊆ S.
- Only accepted words with signature size ≤ 5 and no excluded unit take part.
- Search (exact, no brute force): bucket words by signature; candidate k-sets are unions of signatures
  (adding an unused unit adds no words), built bottom-up from smaller sets (the user's set-addition idea).
  count(S) = sum of bucket sizes over the ≤ 32 subsets of S. New words from adding a unit = count(S) − count(T).
- Every set needs ≥ 1 consonant and ≥ 1 vowel pattern.
- Outputs in `_agent/letter_map/`:
  - `best_sets.csv`: k, rank, unit_ids, count_all, count_verified, word list (top 20 per k = 3, 4, 5).
  - `chain.csv`: the best nested path 3 ⊂ 4 ⊂ 5 (beam search), with the new words at each step.
    Optima per k may not nest; a learning order needs nesting.
  - `signatures.csv`: every common word with its units, size, and excluded reason if any.

## Step 3 (optional, later): find gaps
For the top sets, list every legal 1–2 syllable spelling they can make (`enum_spellings.py`). Spellings that are
not in the list go to a subagent to judge as possible common words → proposals → review. Only if the top
sets look thin.

## Scripts to propose (one approval round)
1. `common_list.py`: merge proposal batches into common_words.csv (dedupe, NFC normalize, link word_id, report counts
   by category and status).
2. `letter_map.py`: units and exclusions, signatures, search, reports (with the optional toggles).
3. `enum_spellings.py`: only if Step 3 is needed.
Domains: en.wiktionary.org (already approved). Nothing else expected.

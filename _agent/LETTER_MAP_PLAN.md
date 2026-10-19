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
- **Excluded from the first set (user confirmed 2026-10-19; 27 of 36 vowel patterns remain):**
  - Also every letters.csv cluster row containing ຫ or ວ (ຫງ ຫຍ ຫວ ຫຼ). Ligatures ໜ ໝ are single glyphs with one sound and stay.
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
`cw_id, lao, syllables, gloss_en, category, word_id (if in data/words.csv), confidence, source, notes`
(syllables pipe-separated as in words.csv; the map parses them)
- **Commonness is a judgement call, made by the model** (user, 2026-10-19). "Common" = every grade-schooler knows it,
  or it is heard in everyday conversation ("sad" yes, "melancholy" no). No source is needed for commonness, and
  being in a source does not make a word common. Being in the list means accepted; there is no status workflow.
- The **Lao spelling** still follows the accuracy rules: `confidence` = verified (Wiktionary or words.csv verified
  row) or unverified. Wiktionary is used where cheap, not required. Unverified rows still count in the map.
- Size: no cap. Expect about 1000–2000 (Zipf: the first 1000 cover most everyday speech); fine if it runs over 3000.
- Categories: food and drink, feelings, spatial (up, in, near), temporal (now, day, tomorrow), colors, numbers,
  basic adjectives, basic verbs, pronouns, family, body, home, school, work, common places, greetings, animals,
  weather, clothes, transport, money and shopping, question words.
- Build order:
  1. Main agent marks the common words in `data/words.csv` (1424) in one pass, by judgement. Separate list, so the
     3000 word cap does not apply.
  2. Per category, the main agent writes the English concept list of everyday words not yet covered.
  3. A `drafter` run per few categories (sonnet; list rows only: lao, gloss, category, Wiktionary link if found;
     no sentences or tones) gives the Lao. One run after another.
  4. Main agent reviews each batch and drops anything not everyday.
- Batches go to `_agent/letter_map/proposals/`; the script merges them (NFC normalize, dedupe against the list and
  words.csv, link word_id).

## Step 2: the map (pure set math)
- Signature of a word = set of units needed to read it (same parsing as `build_order.py parse_syllable`).
  A word is spelled by set S iff signature ⊆ S.
- Only accepted words with signature size ≤ 5 and no excluded unit take part.
- Search (exact, no brute force): bucket words by signature; candidate k-sets are unions of signatures
  (adding an unused unit adds no words), built bottom-up from smaller sets (the user's set-addition idea).
  count(S) = sum of bucket sizes over the ≤ 32 subsets of S. New words from adding a unit = count(S) − count(T).
- Every set needs ≥ 1 consonant and ≥ 1 vowel pattern.
- Outputs in `_agent/letter_map/`:
  - `best_sets.csv`: k, rank, unit_ids, word_count, word list (top 20 per k = 3, 4, 5).
  - `chain.csv`: the best nested path 3 ⊂ 4 ⊂ 5 (beam search), with the new words at each step.
    Optima per k may not nest; a learning order needs nesting.
  - `signatures.csv`: every common word with its units, size, and excluded reason if any.

## Step 3 (optional, later): find gaps
For the top sets, list every legal 1–2 syllable spelling they can make (`enum_spellings.py`). Spellings that are
not in the list go to a subagent to judge as possible common words → proposals → review. Only if the top
sets look thin.

## Scripts to propose (one approval round)
1. `common_list.py`: two modes. `seed` takes a file of word_ids marked common and copies those rows from words.csv
   (lao, gloss, topic as category, confidence). `merge` adds proposal batches (NFC normalize, dedupe, link word_id).
   Both print counts by category and confidence.
2. `letter_map.py`: units and exclusions, signatures, search, reports (with the optional toggles).
3. `enum_spellings.py`: only if Step 3 is needed.
Domains: en.wiktionary.org (already approved). Nothing else expected.

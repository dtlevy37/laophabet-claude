# Letter-set → word map (plan, 2026-10-19)

Goal: for each set of learned units (consonants, vowel patterns, tone marks), know which common everyday words
are fully readable. Answer: which 3-, 4-, 5-unit sets unlock the most words. Use the result to decide learning order.
Stop at 5 units for now.

## Definitions
- **Unit** = one thing a learner learns with one sound. Consonants from `letters.csv`, vowel patterns from
  `vowels.csv` (each pattern is its own unit: ◌າ and ◌ຳ are separate, ◌ະ and ◌ັ◌ are separate), tone marks ◌່ ◌້.
  Excluded: ◌໊ ◌໋, ໆ ຯ ◌໌, digits.
- **Signature** of a word = the set of units needed to read it (parse each syllable with the same logic as
  `build_order.py parse_syllable`). A word is readable from set S iff signature ⊆ S.
- **One sound per unit** (open decision, see below): glyphs with several roles (ອ carrier vs vowel part,
  ຫ silent marker vs h, ດ/ບ initial vs final, ຍ/ວ initial vs final vs vowel part) are either split into role
  variants (e.g. `C14i`, `C14f`) or words using the second role are excluded.
- **Everyday** flag per word: `yes` / `no`. Only `yes` words count. Judged by drafter-level model, reviewed by main agent.

## Search (no brute force needed)
count(S) = number of everyday words whose signature ⊆ S. Only signatures of size ≤ 5 matter.
1. Bucket words by signature: `sig → [word_ids]`.
2. Candidate sets = all unions of ≤5-size signatures, built bottom-up (the user's set-addition idea):
   level k = {A ∪ B : A in level ≤k, B a signature, |A ∪ B| = k}. Every optimal k-set is such a union
   (padding with an unused unit adds no words), so this is exact.
3. count(S) = sum of bucket sizes over the ≤32 subsets of S (superset sum) — no re-scanning of words.
   New words for S vs a known subset T = words whose signature ⊆ S but ⊄ T (the "only new combinations" delta).
4. Report per k: top 20 sets with counts and words; and the **best nested chain** 3 ⊂ 4 ⊂ 5 (beam search),
   because independent optima per k may not nest, and a learning order needs nesting.
Every set must contain ≥1 consonant and ≥1 vowel to read anything; the script can enforce that for speed.

## Word pool (where the words come from)
Two layers, both feed the same signature table:
- **A. Existing data** (1424 vetted words in `data/words.csv`, plus compounds). Gives a v0 map at no drafting cost.
- **B. Gap fill by enumeration + judging**, not free generation. For the top ~30 candidate sets per k, a script
  enumerates every legal spelling (1–2 syllables) readable from that set. A subagent only *classifies* each
  spelling: real common everyday word? gloss? Then Wiktionary check. Classifying a finite list is far more
  reliable than asking a model to invent Lao words under an alphabet constraint. New words go to
  `_agent/letter_map/candidates.csv` (not `data/` until reviewed; the 3000 cap applies only on merge).
- Iterate: recompute top sets with the enlarged pool → enumerate again for the new leaders → stop when the
  top 5 per k is stable across one round.

## Agents
- `researcher` (haiku) for judging enumerated spellings in batches of ~50 (cheap; one question per batch).
- Wiktionary check for each `yes`; unconfirmed words stay `unverified` and count in a separate column so the
  results show "verified-only" and "all" counts.
- Main agent reviews the top sets and their word lists by hand.

## Files
- `data/units.csv` (unit_id, glyph, role, sound, source unit id, included y/n) — only if role variants are chosen.
- `_agent/letter_map/signatures.csv` (word_id or candidate id, lao, unit_ids, n_units, everyday, confidence).
- `_agent/letter_map/best_sets.csv` (k, rank, unit_ids, count_all, count_verified, word_ids).
- `_agent/letter_map/chain.csv` (k, added_unit, cumulative words, new words).

## Scripts to propose (one approval round)
1. `letter_map.py` — build signatures from words.csv + candidates.csv, run the union search, write the reports.
2. `enum_spellings.py` — given a unit set, list every legal 1–2 syllable spelling readable from it.

## Open decisions (user)
1. Multi-role glyphs: split into role units (recommended) or exclude those words?
2. Tone marks: count ◌່ ◌້ as units (recommended), or ignore tone marks for this exercise?
3. Multi-syllable words: count them (recommended, up to 5 units total), or monosyllables only?

# Plan

Source of truth: CLAUDE.md "Domain context". Tick items as they finish.

## Phase 0: Foundations
- [x] List the web domains and scripts needed for the next stretch; ask the user to approve them in one sitting
- [x] `scholar`: Lao alphabet (consonants, vowels, classes) and Vientiane tone rules -> `_agent/research/`
- [x] Find candidate frequency lists and dictionaries; record in `_agent/research/sources.md`; get domains approved (user: no corpus ranking; usefulness by judgement; tatoeba approved)
- [x] Complete inventory of consonants and vowels with counts and sources -> `data/letters.csv`, `data/vowels.csv` (respelling column pending a scheme choice)
- [x] Choose the tone convention and finalize `_agent/SCHEMA.md`
- [x] Propose the tone-derivation script to `_agent/proposed-scripts/` for approval (awaiting approval)

## Phase 1: First 30 words
- [ ] Draft the top 30 words by frequency/usefulness, seeded by the user's list (eat, drink, need, want, have, ...)
- [ ] Fill all word fields; derive and cross-check tones
- [ ] 2+ example sentences per word, using introduced words as priority, using upcoming words 2nd priority
- [ ] First sentence templates
- [ ] **CHECKPOINT 30**: summary, commit, create `_agent/BLOCKED` for user review

## Phase 2: To 100 words
- [ ] Next 70 words; track letter and vowel coverage
- [ ] Sentences and templates
- [ ] CHECKPOINT 100: commit and continue

## Phase 3: To 300 words
- [ ] Next 200 words; keep new-letter introduction gradual
- [ ] CHECKPOINT 300: commit and continue

## Phase 4: To about 600 words
- [ ] Reach the target (hard cap 1000); every letter and vowel introduced by word 600
- [ ] Final coverage report: letters, vowels, sentences per word, confidence breakdown
- [ ] `learning_order.csv` and the letters-to-words-to-sentences map
- [ ] CHECKPOINT 600: commit; create `_agent/DONE`

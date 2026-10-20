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
- [x] Draft the top 30 words by frequency/usefulness, seeded by the user's list (eat, drink, need, want, have, ...) (34 words)
- [x] Fill all word fields; derive and cross-check tones (classifiers not sourced yet)
- [x] 2+ example sentences per word, using introduced words as priority, using upcoming words 2nd priority (53 sentences; ໃຈ only via compounds)
- [x] First sentence templates (8) + learning_order.csv (132 steps)
- [x] **CHECKPOINT 30**: summary, commit, create `_agent/BLOCKED` for user review

## Phase 2: To 100 words
- [x] Next 70 words; track letter and vowel coverage (67 words; reading-load report via build_order.py)
- [x] Sentences and templates (176 sentences, 14 templates)
- [x] CHECKPOINT 100: commit and continue

## Phase 3: To 300 words
- [x] Next 200 words; keep new-letter introduction gradual (0 heavy words)
- [x] CHECKPOINT 300: commit and continue

## Phase 4: To about 600 words
- [x] Reach the target (hard cap 1000); every letter and vowel introduced by word 600 (600 words; 35/35 letters, 31/31 vowels)
- [x] Final coverage report: letters, vowels, sentences per word, confidence breakdown (PROGRESS.md, CHECKPOINT 600)
- [x] `learning_order.csv` and the letters-to-words-to-sentences map (intro_word_id + new_*_ids + sentence_words)
- [x] CHECKPOINT 600: commit; create `_agent/DONE`

## Phase 5: To 1000 words (user request 2026-10-10; hard cap 1000)
- [x] tone_derive rev 4: ◌ົວ length, kw clusters, lexical exceptions, --quiet
- [x] build_order rev 3/4: ແຂວງ, ຫ່ວງ, ◌໌, ໄຫວ້, ຄລີ (tone_derive rev 5 in step)
- [x] Words 601–800 by topic (tier `extra`), 2+ sentences each, tones filled
- [x] CHECKPOINT 800: commit and continue
- [x] Words 801–990 by topic, 2+ sentences each; templates TPL15–26 for topic sentence building (990 after dropping 10 duplicates)
- [x] CHECKPOINT 1000 (final, 990 words): final report; commit; create `_agent/DONE`
- [x] Classifier model (3 columns) + 10 classifier words → exactly 1000

## Phase 6: Tooling for growth (user A–I, 2026-10-10)
- [x] Wide IDs (W 6 digits, S 9 digits) via rekey_ids; validate enforces the formats
- [x] check_drafts.py, pipeline.sh, merge_words rev 3 (sentence renumbering, override remap)
- [x] drafter subagent + guard allowlist; .gitattributes; CLAUDE.md updated by the user (cap 3000)
- [ ] Drafter test batch (small, ~15 words + sentences); check_drafts → merge → pipeline; review the workflow with the user

## Phase 7: To about 3000 words (hard cap 3000)
- [ ] Topic batches via drafter (sequential), each checked, merged and piped
- [ ] CHECKPOINT 1500
- [ ] CHECKPOINT 2000
- [ ] CHECKPOINT 2500
- [ ] CHECKPOINT 3000: final report; commit; create `_agent/DONE`

## Phase 8: Letter-set to word map (user pivot 2026-10-19; Phase 7 paused). See `_agent/LETTER_MAP_PLAN.md`
- [x] User decisions: multi-role glyphs excluded from the first set; patterns and tone marks are units; multi-syllable ok; closed common list first
- [x] User confirms the exclusion list
- [x] Propose `common_list.py` and `letter_map.py`; get approval
- [x] Common list: words.csv judged (1352 seeded), enum gap fill (+223), Zipf top-300 check (+42) → 1617
- [x] Map: signatures, best sets, nested chain (k ≤ 7)
- [x] Gap fill with `enum_spellings.py`
- [ ] k ≤ 10 run (`_agent/letter_map/k10/`); report best sets as the reference for early unit order

## Phase 9: Lessons (user, 2026-10-19). See `_agent/LESSON_PLAN.md`
- [x] Lesson decisions recorded; notes updated (LESSON_PLAN, PLAN, PROGRESS, SCHEMA)
- [x] App activities and presentation drafted (`_agent/APP_DESIGN.md`)
- [x] CLAUDE.md archived (`_agent/archive/CLAUDE-wordlist-phase.md`); new version proposed (`_agent/proposed-config/CLAUDE.md`)
- [ ] User approves `lesson_tool.py`, `next_lesson.ps1`, `next_lesson_prompt.md` and installs the new CLAUDE.md
- [ ] Lesson 1 (ລາວ) built interactively as the reference
- [ ] Runner test: `next_lesson.ps1 -Count 1`, then a few more; review the first ~10–20 lessons; tune
- [ ] Dialogues: tables and item type once Q&A pairs exist
- [ ] Postgres schema and import (data tables, lessons, app-side learner tables)

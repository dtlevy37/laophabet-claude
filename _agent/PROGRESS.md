# Progress log

<!-- Newest entry at the bottom. Each entry: date/time, what changed, decisions, next step. -->

## 2026-10-09 Phase 0 started
- Listed the Phase 0 domains for the user in chat: en.wikipedia.org, www.compart.com (the user chose it over unicode.org for the Lao block inventory), en.wiktionary.org, seasite.niu.edu, www.omniglot.com, sealang.net, archive.org, the Leipzig corpora domains, github.com and raw.githubusercontent.com.
- Listed the planned scripts (`tone_derive.py`, `validate_data.py`). Neither is written yet.
- Done: the SEAsite scholar study is in `_agent/research/lao-tones-seasite.md` (5 tones; 33 consonants = 27 letters + 6 ຫ-combinations; 28 vowels).
  - Open issues: the source contradicts itself on middle class + sonorant final ("low falling" on the lesson page vs low rising in the chart and examples); 5 vs 6 tones in the Hoshino/Marcus/Levy analysis; ຫຣ.
- Running: the Wikipedia + Lao-block (compart.com) scholar study -> `_agent/research/lao-script-wikipedia-unicode.md`.
- Next: the frequency-list/dictionary researcher. It hit the 2-subagent concurrency limit, so it runs after the scholar finishes. Then sources.md, reconcile the two tone tables, and the inventory CSVs.

## 2026-10-09 Wikipedia/compart study done
- Notes: `_agent/research/lao-script-wikipedia-unicode.md`.
  - 27 consonants (6 high, 8 mid, 13 low) + 6 ຫ-forms.
  - Vowels: 12 short + 12 long + 3 special.
  - Lao block: compart lists 82 code points, Wikipedia 83 (+U+0ECE, Unicode 15).
- The fetch tool summarized the tables inconsistently, so spot-check any cell before relying on it.
- Tone rules are not settled. The Lao script article has no tone matrix. The two Lao language tables conflict on dead syllables (mid class + long vowel: low falling vs high falling), and the 5 vs 6 tone question is open.
  - Decision: don't fix the tone convention or write tone_derive.py until a third authoritative source has been reconciled.
- Running in parallel:
  - Researcher: frequency lists and dictionaries.
  - Scholar: third tone source (FSI Lao Basic Course / Kerr intro / Enfield), with a cell-by-cell reconciliation -> `_agent/research/lao-tones-<source>.md`.
- Next: sources.md; ask the user to approve the domains; inventory CSVs.

## 2026-10-09 Sources survey done
- Wrote `_agent/research/sources.md`.
- Blocked: Leipzig (bot wall), SEAlang (expired certificate), Kerr (no open copy), FLORES+ on huggingface (fetch denied).
- Main gap: no reachable, segmented Lao frequency list.
- Asked the user in chat:
  - Frequency strategy.
  - New domains: fsi-language-courses.org, tatoeba.org, data.mendeley.com, huggingface.co, opus.nlpl.eu.
- Still running: the third-source tone study.

## 2026-10-09 Decision: no corpus frequency ranking
- User direction: don't establish or rank 600 words up front, and drop the corpus-frequency search.
  - Build incrementally from universal core concepts (eat, drink, need, want, go, hear, see; food, house, dog, cat; here, there, soon, near; pronouns) plus Lao-specific high-use words.
  - ສະບາຍດີ is word #1.
  - archive.org is low value, so deprioritize it. Content can be found as needed or adapted from other languages.
- Consequences:
  - `freq_rank` becomes a usefulness rank by judgement, labelled as such and never presented as corpus frequency.
  - Each Lao form must still be verified against a cited source (Wiktionary first, SEAsite as cross-check).
  - The corpus domains (huggingface, mendeley, opus, leipzig) are no longer needed.
- Next: finish the tone reconciliation, inventory CSVs, schema/tone convention, tone_derive.py proposal. Then Phase 1: the first 30 concepts.
- The user approved tatoeba.org in chat for example sentences.

## 2026-10-09 First-30 draft v2
- `_agent/tmp/first-30-draft.md`: 35 words, all unverified.
- User direction on ordering:
  - Put "yes" early.
  - Seed words are examples, not priorities; common and helpful words come first.
  - Words build on each other (ນ້ຳ → ຫ້ອງ → ຫ້ອງນ້ຳ).
  - Prefer common words that reuse letters already learned.
- Proposed schema addition: `component_word_ids` on words.csv.
- Next: user feedback on v2, then verify against Wiktionary.

## 2026-10-09 Tone convention fixed; tone script proposed
- Third tone study: `_agent/research/lao-tones-wiktionary-fsi-kerr.md`. FSI and Kerr OCR were unusable for the rules.
  - SEAsite chart, Wiktionary guidelines, Wiktionary Module:lo-pron and Wikipedia 7.1.1 agree on all 15 cells.
  - Outliers (D1, D2, D3, D5, D6) logged in NEEDS_HUMAN.md.
- Decision: 5-tone Vientiane convention.
  - Names from the Wiktionary Lao entry guidelines; Chao letters from Module:lo-pron (= Osatananda 1997), so we can cross-check against Wiktionary IPA.
  - Written in SCHEMA.md together with the matrix (cells 1–15) and the tone_derivation format.
- Schema changes:
  - `component_word_ids` added (user approved).
  - `lao_spaced` added to sentences.csv (user request: spaces between words for learners).
  - syllables / tone_by_syllable are pipe-separated.
- Proposed `_agent/proposed-scripts/tone_derive.py`: stdlib only; modes `--selftest` (23 example syllables from sources, all 15 cells), `--syl`, and CSV cross-check against tone_by_syllable and IPA tone letters. Awaiting user approval.
- User feedback on draft v2:
  - Teach ນອນ before ຫ້ອງນອນ.
  - Sprinkle numbers in gradually.
  - Continuation approved.
- Next: inventory CSVs (letters.csv, vowels.csv) from the notes, plus the validate_data.py proposal; then verify the first-35 words against Wiktionary.

## 2026-10-09 Inventory CSVs
- `data/letters.csv` (60 rows):
  - 27 consonants + 6 ຫ-combinations
  - 4 tone marks, 3 symbols, 10 digits
- `data/vowels.csv`: 36 written forms of 28 vowels.
- Counts and conventions are in SCHEMA.md. Source IDs are in sources.md.
- Respelling is blank pending the user's choice of scheme.
- Open questions are in NEEDS_HUMAN: the respelling scheme; whether rare items (ຣ, short diphthongs, rare closed forms) are required for coverage.
- Next: user answers; tone_derive.py approval; write the validate_data.py proposal; verify the first-35 words against Wiktionary.

## 2026-10-09 Respelling and coverage decisions
- User chose the English-friendly respelling. Scheme written in SCHEMA.md:
  - ກ g, ປ bp, ຕ dt, ຈ j; ຂ/ຄ k, ຜ/ພ p, ຖ/ທ t.
  - Long simple vowels doubled; digraph vowels ae/aw/eu/oe; tone kept separate.
  - Filled into letters.csv and vowels.csv.
- Rare items are reading-only. coverage_required set to `reading-only` for C22 ຣ and V14 V20 V25 V28 V30.
- Next: validate_data.py proposal; verify the first-35 words against Wiktionary (researcher), with the ນອນ→ຫ້ອງນອນ and gradual-numbers adjustments for batch 2.

## 2026-10-09 Wiktionary check of the first 35 words + validate_data.py
- Proposed `_agent/proposed-scripts/validate_data.py` (stdlib; schema, foreign-key, Lao-text, tone, sentence-segmentation, coverage, 2+ sentences, cap checks). Awaiting approval alongside tone_derive.py.
- Wiktionary (raw wikitext) confirms the entry and meaning for 30/35, plus ນອນ, ຫ້ອງນອນ, ເຂົ້າໃຈ.
  - Notable: ກິນ also "drink" (colloquial); ຂ້ອຍ colloquial; ເຈົ້າ polite affirmation confirmed; ລາວ pronoun pronounced as ເລົາ (short vowel), to confirm; ໃສ also "clear"; ບໍ່ has both negative and interrogative senses.
  - No classifiers are given on any noun page.
- 404 on Wiktionary: ບໍ, ອັນ, ເທົ່າໃດ, ຢາກ, ແດ່. Possible code-point order issue; second-source search running (Wiktionary search, Tatoeba, SEAsite).
- The raw wikitext doesn't expand lo-pron (no IPA), so a rendered-page IPA fetch is running.
- Next: merge results; once the scripts are approved, write words.csv rows for batch 1 with tones derived and cross-checked.

## 2026-10-09 Batch 1 written to data/words.csv (32 words)
- User direction:
  - Keep ຢາກ and ເທົ່າໃດ.
  - ບໍ່ = no + question marker (one word; spelling later).
  - Drop ອັນ and ແດ່ (low priority; noted in NEEDS_HUMAN).
- Result: 32 words W0001–W0032.
  - Tones taken from Wiktionary-rendered IPA (`_agent/research/batch1-wiktionary.md`).
  - ເທົ່າໃດ and ຢາກ have no IPA or tone yet (not on Wiktionary); the script will derive them.
  - ລາວ is the pronoun only (short vowel, law˧˥); the noun "Lao" comes later.
- Filled intro_word_id in letters.csv and vowels.csv:
  - 21 consonants/marks introduced: incl. T1 T2 and the ຫຍ cluster.
  - 16 vowel forms introduced.
  - ອ (C26) counts as introduced at ອາຫານ, because in ຂ້ອຍ it is part of the vowel ◌ອ◌.
- Classifiers not yet sourced (no noun page gives one).
- Blocked: approved-scripts/*.py are not in `.claude/approved-scripts.json`, so the guardrail refuses to run them. Asked the user to run `.claude/tools/approve-script.ps1` on both files.
- Next, once the scripts run:
  - tone_derive on words.csv; fill tone_derivation; derive the tones of ເທົ່າໃດ and ຢາກ.
  - validate_data.
  - Then sentences (Tatoeba first) and templates.

## 2026-10-09 Scripts registered; batch 1 tones done
- The user registered both scripts with `.claude/tools/approve-script.ps1` (it needs forward slashes when run from `!`).
- tone_derive `--selftest`: 23/23 pass.
- tone_derive on words.csv: 41 syllables; 37 match the Wiktionary tones, 0 mismatches.
  - 4 warnings are a known false positive: ◌ອ◌ is not counted as a written vowel. Fix in the next script revision; it needs re-approval.
- tone_derivation filled for all 32 words.
  - ເທົ່າໃດ = mid|low-rising.
  - ຢາກ = low-falling (cell 11, disputed D1).
  - IPA for those two was composed from the derivation and noted as not sourced.
- validate_data: 0 errors.
  - Warnings: missing tables; 8 nouns without classifiers.
  - Coverage: letters 21/45 required, vowels 16/31.
- Minor: the vowels.csv `sound_group` values are not consistently paired (24 groups); tidy later.
- Running: scholar collecting all Tatoeba Lao sentences -> `_agent/research/tatoeba-lao.md`; researcher on classifiers for the batch-1 nouns.
- Next: sentences.csv / sentence_words.csv / templates (Tatoeba first, then composed `unverified` ones), then CHECKPOINT 30.

## 2026-10-09 Batch 1 adjusted; learning-path model
- User model: the app opens on a LETTER. The path is letter(s) → word → letter → word → sentence once its words are known, and so on. `words.intro_order` = word priority; learning_order.csv = the final interleaved path (item_type `sentence` added in SCHEMA).
- Best-judgement changes (user delegated):
  - Questions stay: Lao questions are statement + final word, so they're easy. ຫຍັງ stays (combines known ຫ+ຍ; unlocks ບໍ່ເປັນຫຍັງ).
  - ເທົ່າໃດ moved to tier 100 (gloss unverified).
  - Added W0033 ນອນ and W0034 ຫ້ອງນອນ (verified, no new letters) at intro_order 14–15, right after ຫ້ອງນ້ຳ.
- Batch 1 = 33 words; validate 0 errors; tones 0 mismatches.
- Classifiers: none sourced. Candidate: the tci-thaijo paper "Classifiers in Lao language" (PDF unreadable through fetch). Deferred to the 100 tier.
- Next: once the Tatoeba corpus is in, build sentences.csv, sentence_words.csv, templates and learning_order.csv for batch 1; then CHECKPOINT 30.

## 2026-10-09 CHECKPOINT 30 (summary for user review)

### What exists
| File | Contents |
|---|---|
| `data/letters.csv` | 60 rows: 27 consonants + 6 ຫ-combinations, 4 tone marks, 3 symbols, 10 digits |
| `data/vowels.csv` | 36 written forms of 28 vowels |
| `data/words.csv` | 35 rows: 34 in tier 30, plus ເທົ່າໃດ parked in tier 100 |
| `data/sentences.csv` | 53 sentences, each with `lao_spaced` |
| `data/sentence_words.csv` | Word-by-word segmentation of every sentence |
| `data/templates.csv` | 8 templates |
| `data/template_fillers.csv` | 42 slot fillers |
| `data/learning_order.csv` | 132 interleaved steps (letter → vowel → word → template → sentence), opening on ສ |

- Coverage after batch 1: 21/45 required letters, marks and digits; 16/31 required vowel forms.
- validate_data: 0 errors. tone_derive: 46 syllables, 0 mismatches against Wiktionary IPA.

### Sources used
- **Script inventory:** Wikipedia "Lao script" + SEAsite (they agree); compart.com for code points.
- **Tone rules:** SEAsite tone chart + Wiktionary guidelines + Wiktionary Module:lo-pron + Wikipedia "Lao language" 7.1.1, which agree on all 15 cells. FSI and Kerr OCR were unusable.
- **Words:** Wiktionary entries (POS, gloss, rendered IPA) for 33/35. ຢາກ comes from Tatoeba (+ a SEAsite lesson). ເທົ່າໃດ is Tatoeba-only ("how old").
- **Sentences:** Tatoeba (CC BY 2.0 FR; 197-sentence corpus in `_agent/research/tatoeba-lao.md`), with code points checked for the 5 used. One Wiktionary usage example.

### How tones were derived
- The rule matrix is in SCHEMA.md (5 Vientiane tones, Wiktionary names, Osatananda/Module Chao letters).
- `approved-scripts/tone_derive.py` derives every syllable (class / live-dead / length / mark → cell) and cross-checks it against the recorded tone and the IPA tone letters.
- **Caveat:** Wiktionary's IPA is generated by the same rule set, so agreement shows the rules were applied consistently. It is not independent proof of the spoken tone.

### Confidence breakdown
| Table | verified | derived | unverified |
|---|---|---|---|
| Words | 33 | 1 (ຢາກ, IPA composed) | 1 (ເທົ່າໃດ, tier 100) |
| Sentences | 6 (5 Tatoeba + 1 Wiktionary) | — | 47 (composed by the agent; need native review) |
| Templates | 3 | — | 5 |
| Letters/vowels | all (IPA/class) | — | — |

pron_tips are agent-written guidance.

### Doubtful / needs a human
1. **All 47 composed sentences.** Most worth checking:
   - S0025 ເຈົ້ານອນແລ້ວບໍ່? (meaning nuance)
   - S0038/S0039 ບໍ່ເປັນຫຍັງ (set phrase, unsourced)
   - S0035 ມານີ້
   - S0012/S0022 ຂໍ + noun as "X, please"
2. **ບໍ່ vs ບໍ** as the question marker (Tatoeba writes ບໍ). Resolve later.
3. **Tone cells 11 and 15 are disputed** (NEEDS_HUMAN D1/D3). ຢາກ is in cell 11; no batch-1 word is in cell 15.
4. **Pronoun ລາວ** is pronounced with a short vowel (law˧˥) although it is written ◌າ. The respelling "lao" reflects this.
5. **Classifiers:** none sourced for the 9 batch-1 nouns. A tci-thaijo paper is a candidate; the new user-supplied CLCL list may help.
6. **ໃຈ** appears only inside compounds (ຂອບໃຈ, ເຂົ້າໃຈ), not in 2 standalone sentences.
7. **Glosses not stated by a source:** ຂໍ "may I have" sense; ເຂົ້າ "meal" sense.

### Next-revision script fixes (need re-approval)
- tone_derive: ◌ອ◌ triggers a false "no written vowel" warning.
- validate_data:
  - Check learning_order prerequisites (letters, vowels and component words before use; words before sentences).
  - Count component use toward the 2-sentence rule.
  - Tidy the vowels `sound_group` values.

### Banked resources (user, 2026-10-09)
- Big Brother Mouse Lao books.
- U. Iowa CLCL Lao resources list.
- Both in sources.md, not yet studied.

### User review guidance (2026-10-09)
- Early stages: don't derive or chase gaps. Pick common, well-attested words that are great to learn early in any language. If a word isn't readily sourced, swap it for another common word.
- Deeper work (classifier research, rare details, derivations) waits until much later.
- The tone script stays as a silent cross-check only.
- Writing my own example sentences is explicitly OK (marked `unverified`).

## 2026-10-09 CHECKPOINT 100
- User cleared checkpoint 30. Direction:
  - Pick common words from the agent's own knowledge; light checks only.
  - Review the first 100 for gradual letter/vowel increase.
  - Then continue to 300 and 600+.
- New approved scripts:
  - build_order.py: generates the derived tables plus a reading-load report.
  - tone_derive.py rev 2: `--fill`; ◌ອ◌/◌ວ◌ warning fixed.
  - Pipeline written in SCHEMA.md.
- Batch 2: W0036–W0102 (intro 35–101).
  - Wiktionary-checked: 62 of 66 have entries and IPA.
  - ມື້ອື່ນ, ເຮັດວຽກ, ຕ້ອງການ, ລໍຖ້າ are Tatoeba-attested; IPA joined or by rule (`derived`).
  - Added ວຽກ as a component and ລາວ (noun) as a homograph of the pronoun.
  - Classifiers filled where obvious: ຄົນ for people nouns, ໂຕ for animals.
- Review of the first 100: after ສະບາຍດີ (7, built syllable by syllable), no word adds more than 3 new symbols; 60/101 words add none.
  - Coverage at 100: letters 31/45, vowels 22/31.
  - Missing: ຝ ຫງ ຫວ ໆ, digits; ◌ຸ ເ◌ະ ແ◌ະ ໂ◌ະ ເ◌າະ ເ◌ີ ເ◌ຍ ◌ົວ ◌ວ◌. Target them early in batch 3.
- Sentences: 176 total (15 verified from Tatoeba/Wiktionary, 161 composed `unverified`). 14 templates. learning_order: 345 steps.
- validate: 0 errors. Warnings: classifier gaps (deferred per user); ໃຈ only via compounds.
- Next: batch 3 (intro 102–300). Introduce the missing vowels and letters early, numbers 6–10 and up, Lao digits, ໆ.

## 2026-10-09 CHECKPOINT 300
- Batch 3: W0103–W0300 (intro 102–300), plus ເທົ່າໃດ activated at intro 116.
  - Chosen from agent knowledge, ordered so the missing vowels and letters come early (◌ົວ ເ◌ຍ ແ◌ະ ເ◌າະ ◌ຸ ໂ◌ະ ຝ ເ◌ີ ຫວ ◌ວ◌ ໆ, all by word 131).
- Wiktionary IPA for ~140 of 198. The ~58 missing words (404) use agent spelling and IPA, confidence `unverified`.
  - ຂວາ: Wiktionary relay gave kʰuːə̯; the agent uses kʰwaː (noted).
  - ໆ words (ໄວໆ ຊ້າໆ ຊື່ໆ) have IPA written once with "(×2)", so the tools count one written syllable.
- Incident: tone_derive --fill crashed on an unquoted comma in the W0284 gloss and truncated words.csv after W0283. Rows were restored from context.
  - Mitigation: back up before --fill; script rev with atomic writes proposed.
- Sentences: 534 total (36 verified: Tatoeba + 1 Wiktionary; 498 composed `unverified`), including 22 new Tatoeba matches.
- Results:
  - tone_derive: 370 syllables, 0 mismatches.
  - build_order: 0 heavy words; coverage at 300 = letters 34/45, vowels 30/31.
  - Still missing: ຫງ, ເ◌ະ, the 10 Lao digits.
  - validate: 0 errors.
- Next:
  - Propose build_order rev2 (quiet mode, digits via number words, homograph warning summary) and tone_derive rev3 (atomic write).
  - Batch 4 (301–600): ຫງ (ເຫງົາ), ເ◌ະ (ເຕະ), Lao digits.

### Next after review
- Phase 2: words 35–100. Classifiers as items; numbers sprinkled in; ເທົ່າໃດ once sourced; ຫ້ອງນອນ chain extensions; ພາສາລາວ; ເຮືອນ.
- Study Big Brother Mouse for verified simple sentences.

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

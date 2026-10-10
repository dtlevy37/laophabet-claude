# Data schema (draft; the agent may refine it, recording changes in PROGRESS.md)

All files are UTF-8 CSV in `data/`, one header row, Lao text unmodified (no transliteration substitution), IDs stable once assigned.
Common columns on every table: `source`, `confidence` (verified | derived | unverified), `notes`.

- **letters.csv**: letter_id, lao, unicode, kind (consonant|consonant-cluster|consonant-ligature|tone-mark|other|digit), name_lao, name_gloss_en, ipa_initial, ipa_final, consonant_class (high|mid|low), romanization_bgn, respelling, pron_tip, coverage_required (yes|no), intro_word_id
  - IDs: C01–C27 single consonants in traditional order; C28–C33 the ຫ-combinations; T1–T4 tone marks; S1–S3 other symbols; D0–D9 digits.
  - `name_lao` holds the acrophonic key word (e.g. ໄກ່ for ກ), and `name_gloss_en` its meaning.
  - Vowel signs are not listed here; they are covered by the patterns in vowels.csv.
- **vowels.csv**: vowel_id, lao_pattern, form (open|closed|both|special), length (short|long|special), sound_group, ipa, romanization_bgn, respelling, pron_tip, coverage_required, intro_word_id
  - One row per **written form**: a vowel whose shape changes before a final consonant has two rows (◌ະ / ◌ັ◌) sharing a `sound_group`. This lets coverage track each shape a reader must recognise.
- `pron_tip` (all tables): advice written by the agent from the verified IPA and the SEAsite notes for English speakers. The English comparisons are approximations, and the row's `confidence` refers to the IPA and the class.
- `respelling`: the learner respelling (scheme below; chosen by the user 2026-10-09).
- `coverage_required`: `yes` (must be introduced through a vocabulary word by word 600), `reading-only` (rare items, taught with one example as a short reading exercise near the end and not counted among the 600; user decision 2026-10-09), or `no`.

### Learner respelling scheme ("English-friendly")
Tone is **not** part of the respelling; it is shown from `tone_by_syllable`. Syllables are joined with `-`.
- **Initials:**
  - Unaspirated: ກ g · ປ bp · ຕ dt · ຈ j
  - Aspirated: ຂ ຄ k · ຜ ພ p · ຖ ທ t
  - Others: ບ b · ດ d · ສ ຊ s · ຝ ຟ f · ຫ ຮ h · ມ m · ນ n · ງ ng · ຍ ny · ຢ y · ລ l · ຣ r · ວ w
  - ອ is not written. The ຫ-combinations are written as their sound: ຫງ ng, ຫຍ ny, ໜ n, ໝ m, ຫຼ l, ຫວ w.
- **Finals:** ກ k · ດ t · ບ p · ງ ng · ນ n · ມ m.
  - ຍ is `i` after a/aa (baai) and `y` elsewhere (kawy).
  - ວ is `o` after a/aa (laao) and `w` elsewhere (maew).
- **Simple vowels** are doubled when long: a/aa · i/ii · u/uu · e/ee · o/oo.
- **Digraph vowels** are spelled the same whether short or long: ɛ `ae` · ɔ `aw` · ɯ `eu` · ɤ `oe`. Their length shows in the IPA and the pron_tip.
- **Diphthongs:** ia `ia` · ɯa `eua` · ua `ua`.
- **Special vowels:** ໄ ໃ `ai` · ເ◌ົາ `ao` · ◌ຳ `am`.
- Examples: ສະບາຍດີ sa-baai-dii · ໄປ bpai · ຕາ dtaa · ກິນ gin · ຂ້ອຍ kawy · ຫ້ອງນ້ຳ hawng-nam.

### Inventory counts (2026-10-09)
- **Consonants: 27 single letters** (6 high, 8 mid, 13 low), per SRC-WP-SCRIPT and SRC-SEASITE (they agree), **plus 6 ຫ-combinations** (ຫງ ຫຍ ໜ ໝ ຫຼ ຫວ). That makes SEAsite's "33 consonants".
  - WP's lead says "7 ligatures" but lists 6. SEAsite once mentions ຫຣ. Neither is counted.
- **Vowels: 28** (SEAsite: 12 short + 12 long + 4 special, with ໄ and ໃ counted separately; WP tables: 12 + 12 + 3 with ໄ/ໃ combined). That is **36 written forms** once the closed-syllable shapes are included.
  - WP's lead figure of 33 is unreconciled.
- **Tone marks: 4**, of which 2 are common.
- **Unicode Lao block:** 82 assigned (compart) or 83 (WP, with U+0ECE).
- **words.csv**: word_id, lao, ipa, respelling, syllables, tone_by_syllable, tone_derivation (per syllable: class, syllable type, vowel length, tone mark), pos, classifier_word_id, classifier_type, classifier_confidence, component_word_ids, gloss_en, freq_rank, topic, tier (30|100|300|600|extra), intro_order, new_letter_ids, new_vowel_ids, pron_tip
  - `syllables`: the written syllables separated by `|`, e.g. `ສະ|ບາຍ|ດີ`.
  - `tone_by_syllable`: tone names separated by `|`, in the same order.
  - `component_word_ids`: for compounds, the IDs of the parts separated by `|`, in written order (ຫ້ອງນ້ຳ = ຫ້ອງ + ນ້ຳ). Empty for simple words. Approved by the user 2026-10-09.
  - **Classifiers** (user decision, 2026-10-10; designed for app logic as well as teaching). Lao counts nouns as noun + number + classifier (ໝາ ສອງ ໂຕ). The same classifier is used with demonstratives (ໝາ ໂຕ ນີ້), with ໃດ for "which" (ໂຕ ໃດ), and to single out one item (ລົດ ຄັນ ໃຫຍ່). Events are counted with ເທື່ອ/ຄັ້ງ after the verb; that is a template, not a per-word field.
    - `classifier_type`: required on every row whose `pos` contains `noun`; empty on all other rows.
      - `specific`: classifier_word_id is required and points to a separate classifier word.
      - `self`: the noun is its own classifier (ຄົນ ສອງ ຄົນ, ສອງ ມື້); classifier_word_id = the row's own word_id.
      - `measure`: a mass noun counted with a container or measure word (ນ້ຳ ສອງ ຈອກ); classifier_word_id = the typical container if one exists, else empty.
      - `none`: not normally counted (proper nouns, languages, abstract nouns); classifier_word_id is empty.
    - `classifier_confidence`: verified | derived | unverified, with the same meaning as `confidence` but for the classifier assignment only. Required whenever classifier_type is set. The row's `confidence` keeps describing the word itself (spelling, IPA, tone). Classifier sources and caveats go in `notes`, prefixed `Classifier:`.
    - App queries: "count N of X" = X + N + classifier(X); "which X?" = classifier(X) + ໃດ; "nouns taught with classifier C" = reverse lookup on classifier_word_id. Templates TPL27–TPL30 teach these patterns.
  - `freq_rank`: a **usefulness rank by judgement**, not corpus frequency (user decision, 2026-10-09). There is no reliable, segmented open Lao frequency list.
- **sentences.csv**: sentence_id, lao, lao_spaced, ipa, respelling, english, target_word_id, template_id
  - `lao`: standard orthography, written without spaces between words.
  - `lao_spaced`: the same sentence with a space between words, for learners (user request, 2026-10-09). It is not traditional, so learner material shows it as a reading aid. Word boundaries must match `sentence_words.csv`.
- **sentence_words.csv**: sentence_id, position, word_id
- **templates.csv**: template_id, lao_pattern, english_pattern, slot_names, intro_order
- **template_fillers.csv**: template_id, slot_name, word_id
- **learning_order.csv**: step, item_type (letter|vowel|word|sentence|template), item_id, why
  - This is the final app sequence, interleaving everything (user, 2026-10-09). The app opens on a **letter**, not a word: each syllable of a word is built from its letters and vowels, then the word follows, then a sentence as soon as its words are known. Rinse, repeat. Example opening: ສ → ◌ະ → ບ → ◌າ → ຍ → ດ → ◌ີ → ສະບາຍດີ → ດີ → ◌່ → ◌ໍ → ບໍ່ → sentence ສະບາຍດີບໍ່?
  - `words.intro_order` is the word-target priority order only. learning_order.csv is derived from it plus letters, vowels, sentences and templates.

## Tone convention

**Five tones (Vientiane).** The names come from the Wiktionary *Lao entry guidelines* (https://en.wiktionary.org/wiki/Wiktionary:Lao_entry_guidelines), which follow the SEAsite/NIU amalgam chart. The Chao tone letters are those of Wiktionary `Module:lo-pron`, which equal the Osatananda (1997, p. 40) values cited on Wikipedia. We chose this so our tones can be cross-checked mechanically against Wiktionary IPA.

| tone name (use exactly) | Chao | SEAsite name / digit | Osatananda name |
|---|---|---|---|
| `low-rising` | ˩˧ (13; ~11 when not phrase-final) | low rising / 4 | low |
| `high-rising` | ˧˥ (35) | high rising / 2 | high |
| `mid` | ˧ (33) | high-mid / # | mid level |
| `low-falling` | ˧˩ (31) | low falling / 3 | mid-fall |
| `high-falling` | ˥˨ (52) | high falling / 1 | high-fall |

**Derivation matrix** (cell numbers are used in `tone_derivation` and by `tone_derive.py`):

| class | live, unmarked | mai ek ◌່ | mai tho ◌້ | dead, long vowel | dead, short vowel |
|---|---|---|---|---|---|
| high (ຂ ສ ຖ ຜ ຝ ຫ ໜ ໝ, ຫ+sonorant) | 1 low-rising | 4 mid | 7 low-falling | 10 low-falling | 13 high-rising |
| mid (ກ ຈ ດ ຕ ບ ປ ຢ ອ) | 2 low-rising | 5 mid | 8 high-falling | 11 low-falling | 14 high-rising |
| low (ຄ ຊ ທ ພ ຟ ຮ ງ ຍ ນ ມ ລ ວ ຣ) | 3 high-rising | 6 mid | 9 high-falling | 12 high-falling | 15 mid |

- **Live:** ends in a long vowel, a sonorant final (ງ ຍ ນ ມ ວ ລ), or one of the special vowels ໄ◌ ໃ◌ ເ◌ົາ ◌ຳ. Live tone depends on class only, not on vowel length.
- **Dead:** ends in a stop final (ກ ດ ບ), or is open with a short vowel (an implied glottal stop).
- **Tone marks:** a tone mark overrides everything else.
- **Class:** comes from the first written consonant. ຫ + sonorant clusters and ໜ ໝ are high.
- **Rare marks:** ◌໊ (mai ti) and ◌໋ (mai catawa) are rare (interjections and onomatopoeia, per Kerr). Their tones (high-rising, low-rising) come only from uncited Wiktionary code, so they are always `unverified`.
- **Disputed cells:** 11, 13–14 (contour detail) and 15. See NEEDS_HUMAN.md. The table follows the majority of 4–5 sources.

**Recording a derivation.** `tone_derivation` holds one entry per syllable, separated by `|`, in the form `class/type/length/mark→cell`, e.g. `high/dead/short/none→13`. Tones derived by `tone_derive.py` from a verified spelling get confidence `derived`. A tone taken from a cited source's IPA and matching the derivation is `verified`.

**Lexical tone exceptions** (tone_derive rev 4). Loanwords and other words whose sourced tone breaks the spelling rule go in `data/tone_exceptions.csv` (word_id, syl_index, tone, source, note). The derivation keeps the rule result and gets the suffix `!lexical`, e.g. `mid/live/long/none→2!lexical`. tone_by_syllable holds the sourced tone. A source is required for every exception.

## Generated vs hand-maintained (2026-10-09)
- **Hand-maintained:**
  - words.csv (lao, syllables, ipa, respelling, gloss, intro_order, ...)
  - sentences.csv (lao, lao_spaced, english, optional `word_overrides` like `4=W0058` for homographs)
  - templates.csv (`requires_word_ids`)
  - letters.csv, vowels.csv
  - tone_exceptions.csv
- **Generated by `approved-scripts/build_order.py`:**
  - words.new_letter_ids / new_vowel_ids
  - letters/vowels intro_word_id
  - sentences target_word_id / ipa / respelling, where empty (sentence IPA = citation forms of the words joined)
  - sentence_words.csv, learning_order.csv
- **Generated by `approved-scripts/tone_derive.py --fill`:** words.tone_by_syllable (only where empty) and tone_derivation.
- After editing words or sentences, run: `tone_derive.py data/words.csv --fill` → `build_order.py` → `validate_data.py`.

## Display notes
- Learner-facing sentences use `lao_spaced`. `lao` keeps the standard spelling.

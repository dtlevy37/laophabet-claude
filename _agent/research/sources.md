# Candidate sources

## Source IDs (used in the `source` column of every CSV)
| ID | Source |
|---|---|
| SRC-WP-SCRIPT | Wikipedia, "Lao script" (oldid 1365847593, read 2026-10-09). Notes: `lao-script-wikipedia-unicode.md` |
| SRC-WP-LANG | Wikipedia, "Lao language" (sections 3.1, 5.3, 7.1.1). Same notes file |
| SRC-SEASITE | SEAsite / Northern Illinois University Lao writing-system lessons and tone chart. Notes: `lao-tones-seasite.md` |
| SRC-COMPART | compart.com Unicode Lao block U+0E80 (82 assigned; lacks U+0ECE) |
| SRC-WIKT-GUIDE | Wiktionary, "Lao entry guidelines" (tone table). Notes: `lao-tones-wiktionary-fsi-kerr.md` |
| SRC-WIKT-MODULE | Wiktionary `Module:lo-pron` (Vientiane tone tables; uncited code) |
| SRC-KERR | Kerr, *Lao–English Dictionary* (1972/1992), front matter Table III (archive.org CC0 item) |
| SRC-WIKT:&lt;entry&gt; | A Wiktionary Lao entry, e.g. `SRC-WIKT:ສະບາຍດີ` |
| SRC-TATOEBA:&lt;id&gt; | A Tatoeba sentence by ID |

Status key: **studied** (notes in `_agent/research/`), **candidate** (not yet studied), **blocked** (unreachable), **rejected**.
"Trusted for" is what we would rely on the source for. Everything else gets cross-checked.

## Script, inventory, tone rules

| Source | URL | Status | Trusted for | Caveats |
|---|---|---|---|---|
| SEAsite Lao (Northern Illinois Univ.) | seasite.niu.edu (see `lao-tones-seasite.md` for exact pages) | studied | Consonant classes, vowel list, 5-tone Vientiane matrix, pronunciation notes for English speakers | Self-contradiction on mid class + sonorant final. Dated spellings (ຣົດ, ເxັຽ). Some glyphs are images, and the fetch tool garbled some examples. |
| Wikipedia: Lao script | en.wikipedia.org/wiki/Lao_script | studied | Consonant chart (27 + ຫ-forms), vowel table, symbol functions | Fetches summarized and inconsistent; spot-check cells. Internal counts don't reconcile (33 vowels vs 27; 7 vs 6 ligatures). No tone matrix. |
| Wikipedia: Lao language | en.wikipedia.org/wiki/Lao_language | studied | Pointers to primary literature (Hartmann 2002, Osatananda 1997/2015, Enfield 2007) | Two partial tone tables that conflict on dead syllables. 5 vs 6 tone ambiguity. |
| Compart Unicode Lao block | www.compart.com/en/unicode/block/U+0E80 | studied (user-chosen) | Code points and Unicode names (82 assigned) | One version behind: lacks U+0ECE (Unicode 15). Unicode names for ຝ/ຟ and ຣ/ລ are swapped relative to the Lao names. |
| FSI *Lao Basic Course* | archive.org (`laocourse`, PD mark); fsi-language-courses.org | being studied (tone rules) | Vientiane phonology and tones, dialogues and drills with English | 1970s; dated vocabulary and spelling. No frequency data. |
| Kerr, *Lao–English Dictionary* (1972; White Lotus 1992 reprint) | not openly online (library catalogues only) | blocked | (would be the reference dictionary) | No open copy found. SEAlang's Lao dictionary page has an expired TLS certificate. |
| Enfield 2007, *A Grammar of Lao* | not openly online | not accessible | (authoritative grammar, classifiers) | Paywalled; only reachable through secondary citations. |

## Frequency

| Source | URL | Status | Notes |
|---|---|---|---|
| Hermit Dave FrequencyWords | github.com/hermitdave/FrequencyWords | candidate | CC-BY-SA-4.0, OpenSubtitles. Lao file not confirmed (check `content/2018/lo/`). Lao is unsegmented, so a "word" may be a whole phrase; would need re-segmentation. |
| Leipzig Corpora Collection | corpora.uni-leipzig.de | blocked | Bot-check wall; no Lao corpus confirmed. |
| HVULao_NLP (Mendeley Data, 2025) | data.mendeley.com | candidate | About 10k word-segmented sentences, optional POS. Could support a computed frequency list. Licence unchecked. |
| Wiktionary frequency lists | en.wiktionary.org/wiki/Wiktionary:Frequency_lists | rejected | No Lao list. |
| loTenTen (Sketch Engine) | sketchengine.eu | rejected | Commercial. |

## Example sentences

| Source | URL | Status | Notes |
|---|---|---|---|
| Tatoeba | tatoeba.org | **approved by user 2026-10-09** | 231 Lao sentences, various CC licences. Good for `verified` sentences where a translation exists; check each translation. Record the sentence ID and licence in `source`. |
| FSI Lao Basic Course | (above) | candidate | Largest open source of authentic sentences with English. |
| FLORES+ | huggingface.co/datasets/openlanguagedata/flores_plus | candidate (fetch denied) | Professional lao_Laoo↔eng translations, but encyclopedic register; few beginner sentences. |
| OPUS | opus.nlpl.eu | candidate | lo–en parallel corpora; size unknown, noisy. |

## Per-word lookup (IPA, tone, POS, classifier)

| Source | URL | Status | Notes |
|---|---|---|---|
| Wiktionary (Lao entries) | en.wiktionary.org | candidate | IPA, POS, sometimes classifiers. Coverage of basic words to be checked. |
| LaoNLP | github.com/wannaphong/LaoNLP | candidate (tool) | Apache-2.0 tokenizer and romanizer. Can't be used: running or installing it is blocked by policy. |

## Open problem
No reachable, properly segmented Lao frequency list has been found. Options are in PROGRESS.md and were raised with the user.

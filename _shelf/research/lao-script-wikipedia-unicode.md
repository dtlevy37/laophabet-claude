# Notes: Lao script (Wikipedia), Lao language phonology/tones (Wikipedia), Unicode Lao block (compart.com)

Read date: 2026-10-09.
Method caveat: WebFetch passes pages through a small summarizing model, which refused to reproduce tables "verbatim" and sometimes flattened them. Table data below was obtained by requesting the Wikipedia wikitext through `en.wikipedia.org/w/api.php?action=parse&prop=wikitext&section=N` and asking for cell-by-cell data. Treat every cell as "as relayed by the fetch tool"; spot-check against the live article before building on any single cell. Items marked [UNCERTAIN] need verification.

## Sources
1. Wikipedia, "Lao script" https://en.wikipedia.org/wiki/Lao_script. Page text last edited 24 July 2026 (oldid 1365847593). Sections: History; Consonants (Consonant chart, Consonantal digraphs and ligatures, Phonetic); Vowels (Short and long vowels, Special vowels); Punctuation; Numerals; Other languages in Lao script (Pali); Lao compatible software; Unicode; See also; References; Further reading.
2. Wikipedia, "Lao language" https://en.wikipedia.org/wiki/Lao_language. Sections used: 3.1 Vientiane Lao dialect; 5 Phonology (5.1 Consonants, 5.2 Vowels, 5.3 Tones [5.3.1 Smooth, 5.3.2 Checked], 5.4 Syllables); 7.1.1 Indication of tones. The Phonology consonant/vowel tables (5.1, 5.2) were NOT successfully extracted; only a prose summary was returned. Gap.
3. Unicode Lao block inventory: per coordinator instruction, taken from https://www.compart.com/en/unicode/block/U+0E80 (names given as title case there; Unicode official names are upper case, e.g. LAO LETTER KO). I did not use unicode.org. (Before the instruction, one fetch of the unicode.org PDF returned only unreadable binary and nothing from it is used here.) The Wikipedia "Lao (Unicode block)" page was used only as a cross-check and for version history; flagged where it differs.

---
## A. Lao script article

### A.1 Lead and history
- Abugida for Lao; also the primary script for other languages of Laos. Earlier form Tai Noi also wrote Isan before Thai script replaced it.
- Lead counts (verbatim claim as relayed): 27 consonants, 7 consonantal ligatures, 33 vowels, 4 tone marks.
- Derived from Old Khmer script via Sukhothai script; sister of Thai; left to right; no case; vowels may be above, below, before or after the consonant; spaces separate clauses, not words.
- 1930s: Maha Sila Viravong added Pali/Sanskrit characters, little used, out of use by 1975. 1960s: Lao People's Revolutionary Party simplified spelling toward phonemic and dropped Pali-Sanskrit letters (see section A.9). 2019: extended (Pali) characters added in Unicode 12.

### A.2 Consonants: counts and classes
- "27 consonants" in three tone classes (high, middle, low), each with an acrophonic name. ອ is the null consonant / vowel carrier. The article says there are 21 distinct consonant sounds [relayed; verify].
- Class counts from the chart (my tally of the table below): High 6 (ຂ ສ ຖ ຜ ຝ ຫ); Middle 8 (ກ ຈ ດ ຕ ບ ປ ຢ ອ); Low 13 (ຄ ງ ຊ ຍ ທ ນ ພ ຟ ມ ຣ ລ ວ ຮ). Total 27.
- The article's 27 includes ຣ (see A.4). The 27 do NOT include the ligatures/digraphs, nor the Pali/Sanskrit extended letters.

### A.3 Consonant chart (order as in the article, which is the traditional alphabetical order)
Columns: letter | code point (from compart/Unicode list in section C) | Unicode name (as shown on article) | Lao name word and gloss | class | initial IPA | final IPA | romanization (BGN/PCGN as relayed; LC and RTGS columns were not recoverable from the fetch).

| # | Letter | CP | Unicode name (article) | Name word, gloss | Class | Initial | Final | Romanization (BGN/PCGN, as relayed) |
|---|---|---|---|---|---|---|---|---|
| 1 | ກ | U+0E81 | KO | ໄກ່ chicken | Middle | /k/ | /k/ (unreleased [k̚]) | k / k |
| 2 | ຂ | U+0E82 | KHO SUNG | ໄຂ່ egg | High | /kʰ/, /x/ | none | kh |
| 3 | ຄ | U+0E84 | KHO TAM | ຄວາຍ water buffalo | Low | /kʰ/, /x/ | none | kh |
| 4 | ງ | U+0E87 | NGO | ງົວ ox or ງູ snake | Low | /ŋ/ | /ŋ/ | ng / ng |
| 5 | ຈ | U+0E88 | CO | ຈອກ glass or ຈົວ Buddhist novice | Middle | /tɕ/ | none | ch |
| 6 | ສ | U+0EAA | SO SUNG | ເສືອ tiger | High | /s/ | none | s |
| 7 | ຊ | U+0E8A | SO TAM | ຊ້າງ elephant | Low | /s/ | none | x (BGN/PCGN), s (LC) |
| 8 | ຍ | U+0E8D | NYO | ຍຸງ mosquito | Low | /ɲ/ | /j/ | gn, ny, y (initial); y, i (final) |
| 9 | ດ | U+0E94 | DO | ເດັກ child | Middle | /d/ | /t/ ([t̚]) | d / t |
| 10 | ຕ | U+0E95 | TO | ຕາ eye | Middle | /t/ | none | t |
| 11 | ຖ | U+0E96 | THO SUNG | ຖົງ stocking/bag | High | /tʰ/ | none | th |
| 12 | ທ | U+0E97 | THO TAM | ທຸງ flag | Low | /tʰ/ | none | th |
| 13 | ນ | U+0E99 | NO | ນົກ bird | Low | /n/ | /n/ | n / n |
| 14 | ບ | U+0E9A | BO | ແບ້ goat | Middle | /b/ | /p/ ([p̚]) | b / p |
| 15 | ປ | U+0E9B | PO | ປາ fish | Middle | /p/ | none | p |
| 16 | ຜ | U+0E9C | PHO SUNG | ເຜິ້ງ bee | High | /pʰ/ | none | ph |
| 17 | ຝ | U+0E9D | "FO TAM" (see note) | ຝົນ rain | High | /f/ | none | f |
| 18 | ພ | U+0E9E | PHO TAM | ພູ mountain | Low | /pʰ/ | none | ph |
| 19 | ຟ | U+0E9F | "FO SUNG" (see note) | ໄຟ fire | Low | /f/ | none | f |
| 20 | ມ | U+0EA1 | MO | ແມວ cat | Low | /m/ | /m/ | m / m |
| 21 | ຢ | U+0EA2 | YO | ຢາ medicine | Middle | /j/ | none | y |
| 22 | ຣ | U+0EA3 | "LO LING" (see note) | ຣົຖ car or ຣະຄັງ bell (the first fetch showed ລົດ for car; second showed ຣົຖ) | Low | /r/, /l/ | /n/ | r (initial); n (final) |
| 23 | ລ | U+0EA5 | "LO LOOT" (see note) | ລີງ monkey | Low | /l/ | none | l |
| 24 | ວ | U+0EA7 | WO | ວີ fan | Low | /w/ (phonetic chart also gives [ʋ], dialect dependent) | /w/ | v, w (initial); w, o (final) |
| 25 | ຫ | U+0EAB | HO SUNG | ຫ່ານ goose | High | /h/ | none | h |
| 26 | ອ | U+0EAD | O | ໂອ bowl or ອື່ງ frog | Middle | /ʔ/ | none | (none) |
| 27 | ຮ | U+0EAE | HO TAM | ເຮືອນ house or ເຮືອ boat | Low | /h/ | none | h |

Notes on the chart:
- Meaning of the Lao names: the article gives only the example word for each letter (acrophonic), not a separate "meaning of the name". The Unicode names (KO, KHO SUNG...) come from the letter name; SUNG = high, TAM = low (this SUNG/TAM meaning is from the search-result description of a Unicode WG2 doc, not from Wikipedia; unverified by me).
- Unicode name reversal (stated in the article): the Unicode names of ຝ/ຟ (U+0E9D named FO TAM, U+0E9F named FO SUNG) and ຣ/ລ (U+0EA3 named LO LING, U+0EA5 named LO LOOT) are swapped relative to the Lao names; cannot be fixed because Unicode character names are immutable. Compart confirms the Unicode names as listed: 0E9D = Fo Tam, 0E9F = Fo Sung, 0EA3 = Lo Ling, 0EA5 = Lo Loot. Article's class: ຝ is High, ຟ is Low (so "FO TAM" = high letter is the inversion).
- Name words for ຣ: [UNCERTAIN] first fetch printed ລົດ, second ຣົຖ.
- IPA final: the "Phonetic" final-consonant chart lists finals as: nasals ມ [m], ນ and ຣ [n], ງ [ŋ]; unreleased plosives ບ [p̚], ດ [t̚], ກ [k̚]; approximants ຍ [j], ວ [w]. Glottal stop finals are not in the chart but see A.6/B.
- Phonetic chart, initials: nasals ມ m, ນ n, ຍ ɲ, ງ ŋ; voiced plosives ບ b, ດ d; voiceless plosives ປ p, ຕ t, ກ k, ອ ʔ; aspirated ຜ ພ pʰ, ຖ ທ tʰ, ຂ ຄ kʰ; fricatives ຝ ຟ f, ສ ຊ s, ຂ ຄ x, ຫ ຮ h (ຮ marked as Luang Prabang dialect); affricate ຈ tɕ; trill ຣ r; approximants ວ ʋ or w (dialect-dependent), ລ l, ຢ j.
- ຣ history: dropped in a language reform since most speakers said /l/, ambiguous status for decades; now taught in schools, largely for foreign names. Cited sources include Davis 2015 "The story of Lao r" (section F).
- ຽ: in old documents sometimes replaced final ຍ; also appears as a vowel-related symbol named ວິລາມ, and in the medial form ◌ຽ◌ of /ia/.

### A.4 Consonantal digraphs and ligatures (article table; all high class, initial position)
Silent ຫ (hò hīn) + a low sonorant turns it high class. "ງ, ຍ, ນ, ມ, ລ, ວ are originally low consonants" but become high after ຫ. Some pairs have optional ligature forms.

| Written | IPA | Romanization | Example (gloss) |
|---|---|---|---|
| ຫງ | /ŋ/ | ng | ເຫງົາ lonely |
| ຫຍ | /ɲ/ | ny | ຫຍ້າ grass |
| ໜ or ຫນ | /n/ | n | ໜູ rat |
| ໝ or ຫມ | /m/ | m | ໝາ dog |
| ຫຼ or ຫລ | /l/ | l | ຫຼັງ back |
| ຫວ | /w/ | w (BGN/PCGN v) | ແຫວນ ring |

- Counting: the lead says "7 consonantal ligatures" but the table has 6 entries, and the article doesn't explain the difference [CONTRADICTION/UNCERTAIN]. Possible 7th (my speculation, not stated by source): none identified. The ligature codepoints are ໜ U+0EDC (LAO HO NO) and ໝ U+0EDD (LAO HO MO); ຫຼ is ຫ + U+0EBC (LAO SEMIVOWEL SIGN LO) with no single code point; ຫຍ and ຫງ, ຫວ are sequences.
- Letters vs. digraphs: the article counts 27 consonants (A.2) excluding these. Unicode encodes only ໜ and ໝ as separate characters (U+0EDC, U+0EDD).
- Which letters take ຫ before: Lao language article (7.1.1) lists ງ ຍ ຣ ວ and the ligatures for /l/, /n/, /m/ (note: it lists ຣ; the Lao script article's digraph table does not list ຫຣ).
- Older spelling (script article): special forms for ຜ+ຍ (ໃ the article text says ພ+ຍ in one extraction and ຜ+ຍ in another [UNCERTAIN]), ສ+ນ, ມ+ລ; clusters with ຣ or ລ used a subscript ◌ຼ, dropped in reforms, surviving only in the ຫຼ ligature.

### A.5 Vowels
Article: 33 vowels in the lead. Table has 12 short + 12 long = 24 in "Short and long vowels", plus 3 "Special vowels" = 27 rows; the article's 33 is not reconciled with the table [UNCERTAIN; count of 33 may include variant forms]. Do not state a vowel count without verifying.

Prose: Lao was a full abugida with inherent vowel; the 1975 reform made the main vowels explicit; many Lao speakers in and outside Laos still use the older spelling. Vowels cannot stand alone or begin a syllable: silent ອ is the base. The article marks the consonant slot with a dotted circle (◌); standard Lao uses a small x. Most vowel signs are named "sala" + sign; a few special names: "rolled stem", "unwound stem", "straight stem", "ear stem". Some vowels change shape between final and medial position. Column headers in article: Letter (Final / Medial), IPA, BGN/PCGN, LC, RTGS, Unicode (last = a short Latin transliteration for Unicode-style use). "Final" form = appears with no final consonant (open syllable); "Medial" = appears with a final consonant (closed syllable). Where only one form is given, it is the same in both.

Short vowels (open form / closed form where different):
| # | Pattern | IPA | BGN/PCGN | LC | RTGS | Unicode-col |
|---|---|---|---|---|---|---|
| 1 | ◌ະ / closed ◌ັ◌ | /aʔ/, /a/ | a | a | a | a |
| 2 | ◌ິ | /i/ | i | i | i | i |
| 3 | ◌ຶ | /ɯ/ | u | ư | ue | y |
| 4 | ◌ຸ | /u/ | ou | u | u | u |
| 5 | ເ◌ະ / closed ເ◌ັ◌ | /eʔ/, /e/ | é | e | e | |
| 6 | ແ◌ະ / closed ແ◌ັ◌ | /ɛʔ/, /ɛ/ | è | æ | ae | |
| 7 | ໂ◌ະ / closed ◌ົ◌ | /oʔ/, /o/ | ô | o | o | |
| 8 | ເ◌າະ / closed ◌ັອ◌ | /ɔʔ/, /ɔ/ | o | ǫ | o | |
| 9 | ເ◌ິ | /ɤʔ/ (the article gives only this) | eu | œ | oe | |
| 10 | ເ◌ັຍ (no closed form shown) | /iaʔ/ | ia | ia | ia | |
| 11 | ເ◌ຶອ (no closed form shown) | /ɯaʔ/ | ua | ưa | uea | |
| 12 | ◌ົວະ (no closed form shown) | /uaʔ/ | oua | ua | ua | |

Long vowels:
| # | Pattern (open / closed) | IPA | BGN/PCGN | LC | RTGS | Unicode-col |
|---|---|---|---|---|---|---|
| 1 | ◌າ | /aː/ | a | ā | a | aa |
| 2 | ◌ີ | /iː/ | i | ī | i | ii |
| 3 | ◌ື | /ɯː/ | u | ư̄ | ue | yy |
| 4 | ◌ູ | /uː/ | ou | ū | u | uu |
| 5 | ເ◌ | /eː/ | é | ē | e | e |
| 6 | ແ◌ | /ɛː/ | è | ǣ | ae | ei |
| 7 | ໂ◌ | /oː/ | ô | ō | o | o |
| 8 | ◌ໍ / closed ◌ອ◌ | /ɔː/ | o | ǭ | o | o |
| 9 | ເ◌ີ | /ɤː/ | eu | œ̄ | oe | |
| 10 | ເ◌ຍ / closed ◌ຽ◌ | /ia/ | ia | īa | ia | |
| 11 | ເ◌ືອ (no closed form shown) | /ɯa/ | ua | ư̄a | uea | |
| 12 | ◌ົວ / closed ◌ວ◌ | /ua/ | oua | ūa | ua | |

Table caveats: the fetch tool flagged unclear column alignment; for rows 1-2 of short vowels the LC/RTGS cells were merged (a/a/a, i/i/i). The "Unicode" column values (y, yy, ei etc.) are the article's transliteration; the real Unicode names are in section C (e.g. U+0EB6 LAO VOWEL SIGN Y, U+0EB7 ... YY, U+0EC1 ... EI). Short ◌ັ is U+0EB1 MAI KAN; ◌ົ is U+0EBB MAI KON. The closed form of long ເ◌ີ and ເ◌ືອ and of the three short diphthongs is not given [gap].

Special vowels:
| Pattern | IPA | BGN/PCGN | Unicode-style | Old alternative |
|---|---|---|---|---|
| ໄ◌ and ໃ◌ | /aj/ | ai | ai or ay | ◌ັຍ |
| ເ◌ົາ | /aw/ | ao | | ◌ັວ |
| ◌ໍາ | /am/ | am | | ◌ັມ |
Footnote: Luang Prabang ໃ◌ is [aɰ]; Houaphanh (Northeastern) ໃ◌ is /ɯ/. Prose: "As in the neighboring Thai script, ◌ະ is used to represent a glottal stop after a vowel."

### A.6 Tone marks and other symbols
- Article lead: 4 tone marks (ວັນນະຍຸດ). Tone is set by consonant class, tone marks, and vowel length (stated in the Consonants intro). THE LAO SCRIPT ARTICLE HAS NO TONE-RULE SECTION, no live/dead definition, and no tone matrix. Tone content is only: class column in chart, digraph ຫ explanation.
- Unicode names for the four marks (compart): U+0EC8 MAI EK, U+0EC9 MAI THO, U+0ECA MAI TI, U+0ECB MAI CATAWA. Lao language article 7.1.1: besides the low mark ່ (mai ek) and falling mark ້ (mai tho), "the rare high tone mark ໊ and rising tone mark ໋ also exist" (mai ti, mai catawa). Mai ek is called "low", mai tho "falling" in that article.
- ໆ U+0EC6 (LAO KO LA): repetition mark for the preceding word.
- ຯ U+0EAF (LAO ELLIPSIS): Lao ellipsis; also marks omitted words. Article also mentions ฯ (Thai-block character) as shortened-form symbol, more or less obsolete, and ฯລฯ = "et cetera".
- ◌໌ U+0ECC (LAO CANCELLATION MARK): obsolete mark for silenced consonants.
- ໍ U+0ECD (LAO NIGGAHITA; article name ນິກຄະຫິດ): forms the vowel /ɔː/ (open ◌ໍ, closed ◌ອ◌); also part of ◌ໍາ /am/ (U+0EB3).
- ◌ຼ U+0EBC (SEMIVOWEL SIGN LO) survives in ຫຼ. ◌ຽ U+0EBD (SEMIVOWEL SIGN NYO) used in /ia/ forms.
- ະ U+0EB0 marks a glottal stop after a vowel (short vowels).
- Punctuation: traditionally no spaces between words, spaces mark clause/sentence ends, no periods; modern writing borrows French-style marks: ! ? () « » (also "" common), hyphens, ellipses.
- Numerals: ໐ 0 ສູນ sun; ໑ 1 ໜຶ່ງ nueng; ໒ 2 ສອງ song; ໓ 3 ສາມ sam; ໔ 4 ສີ່ si; ໕ 5 ຫ້າ ha; ໖ 6 ຫົກ hok; ໗ 7 ເຈັດ chet; ໘ 8 ແປດ paet; ໙ 9 ເກົ້າ kao; ໑໐ 10 ສິບ sip; ໒໐ 20 ຊາວ sao (RTGS). Larger numbers not covered.

### A.7 Pali / extended letters (not modern Lao spelling)
Extended letters added in Unicode 12 (2019), with Thai equivalents: ຆ PALI GHA, ຉ CHA, ຌ JHA, ຎ NYA, ຏ TTA, ຐ TTHA, ຑ DDA, ຒ DDHA, ຓ NNA, ຘ DHA, ຠ BHA, ຨ SANSKRIT SHA, ຩ SANSKRIT SSA, ຬ PALI LLA. Modern alphabet can't transcribe Pali because of reforms. Designed by Maha Sila Viravong. (Also ◌຺ U+0EBA PALI VIRAMA.)

### A.8 Unicode section (article)
Block U+0E80-U+0EFF, introduced Unicode 1.0; digits at start of row U+0ED0; grey cells match Thai positions; ສ is out of alphabetical order because it sits at the Thai ส position. Naming errors as above.

### A.9 Spelling reform (as stated in the two articles)
- Script article: 1960s simplification toward phonemic spelling and dropping Pali-Sanskrit letters; 1975 reform made main vowels explicit; older speakers/diaspora still use older spelling; ຣ dropped then re-added for foreign names (taught in schools); subscript clusters removed.
- Language article, Orthography: French period (1893-1953) moved toward phonetic spelling, with semi-etymological spelling kept for Pali, Sanskrit and French loanwords; after 1975 semi-etymological spelling abolished, silent letters and Indic-loan letters removed. By 1960 simplified to near phonemic (so fewer letters than Thai). The language article has no dedicated spelling-reform section, and no 1993 reform is mentioned in either article [GAP: the project's "1993+" reforms (silent ຣ etc.) are not documented in these sources].

---
## B. Lao language article

### B.1 Tones (5.3) as extracted
Prose: "Lao has six lexical tones" but Vientiane and Luang Prabang dialects are described as having five (cites Erickson 2001; Brown 1965; Osatananda 1997, 2015). In smooth syllables (ending in a vowel or sonorant m n ŋ w j) six tones; in checked syllables (ending in /p t k/ or glottal stop) four.

Smooth syllables (generic names; table cols: name, Lao, phonemic, phonetic, gloss). Phonetic column was cut off by the tool; phonemic column:
| Name | Lao | Phonemic | Gloss |
|---|---|---|---|
| Rising | ຂາ | /kʰǎː/ | leg |
| High | ຄາ | /kʰáː/ | stuck |
| Falling | ຄ້າ | /kʰâː/ | trade |
| Mid | ຂ່າ, ຄ່າ | /kʰāː/ | galangal, value |
| Low | ກາ | /kàː/ | crow |
| Mid-fall | ຂ້າ | /kʰaᴴ̃ː/ or /kʰə̌ː/ [as relayed, garbled] | kill, servant |

Checked syllables (four tones):
| Name | Lao | Phonemic | Phonetic | Gloss |
|---|---|---|---|---|
| High | ຫັກ | /hák/ | [häk̚ˊˌ˥] or [häk̚˥] | break |
| Low | ຮັກ | /hàk/ | [häk̚˨˩] or [häk̚˩] | love |
| Mid-fall | ຫາກ | /ha᷆ːk/ or /hȁːk/ | [häːk̚˧˩] | if, inevitably |
| Falling | ຮາກ | /hâːk/ | [häːk̚˦˩] or [häk̚˥˨] | vomit, root |

Dialect tone-letter tables (smooth syllables; names and numbers verbatim as relayed):
Vientiane (Osatananda 1997, p. 40) - FIVE tones:
| Name | Numbers / letters | Examples |
|---|---|---|
| low | 1(3) or ˩(˧) | ຂາ "leg"; ກາ "crow" |
| high | 35 or ˧˥ | ຄາ "stuck" |
| mid level | 33 or ˧˧ | ຂ່າ "galangal"; ຄ່າ "value" |
| mid-fall | 31 or ˧˩ | ຂ້າ "kill" |
| high-fall | 52 or ˥˨ | ຄ້າ "trade" |
Note 1: Vientiane low tone is 13 (˩˧) in citation form or before a pause and 11 (˩˩) elsewhere; example ຫາປາ "look for fish" (Osatananda 1997 p. 119). One fetch relayed alternate notation "1̩" and for mid level "33 or 22"; mid-fall "31 or 21"; high-fall "52 or 42" [UNCERTAIN, conflicting renderings]. Note the Vientiane table has 5 tones but the generic smooth list has 6 (the Mid-fall /Mid distinction); generic "Rising/High/Falling/Mid/Low/Mid-fall" names do not map one-to-one onto the Osatananda Vientiane names, and the article does not state a mapping [UNCERTAIN].
Also: in Vientiane, the mid-falling tone becomes low level (22) in checked syllables with a short vowel (relayed in one fetch; in the verbatim-note fetch, this note belonged to Luang Prabang [CONTRADICTION in relays]; the second, more detailed fetch assigns 22 to LP mid-falling note 2).
Luang Prabang (Osatananda 2015, p. 122) - FIVE tones: high-falling-to-mid-level 533 (˥˧˧) ຂາ leg; low rising 12 (˩˨) ຄາ stuck, ກາ crow; mid-falling 32 (˧˨) ຂ່າ galangal, ຄ່າ "trade" [likely a typo for "value"]; high level-falling 552 (˥˥˨) ຂ້າ kill; mid-rising 34 (˧˦) ຄ້າ trade. Checked-syllable variants: mid-falling -> low level 22 (short vowel; ຄັບ "tight"); high level-falling -> mid level-falling 332 (long vowel; ຂາບ "prostrate"); mid-rising -> low rising 23 (long vowel; ຄາບ "dead skin of a reptile"). Another relay gave different LP numbers (533 or 544; 32 or 21; 552 or 553; 34 or 45) [UNCERTAIN].
Note the numeric notation is a 1-5 scale (Chao-like, 5 = highest) given as "digits or tone letters"; the article does not call it "Chao" explicitly.

### B.2 Tone rule tables in the Lao language article
(a) Section 7.1.1 "Indication of tones" (no ref attached). Prose: "Experts disagree on the number and nature of tones in the various dialects of Lao." Most Lao and Isan dialects six tones, Luang Prabang five. Header: Tones | Long vowel, or vowel plus voiced consonant | Long vowel plus unvoiced consonant | Short vowel, or short vowel plus unvoiced consonant | Mai ek ◌່ (U+0EC8) | Mai tho ◌້ (U+0EC9).
| Class | Col 2 | Col 3 | Col 4 | Mai ek | Mai tho |
|---|---|---|---|---|---|
| High consonants | rising | low falling | high | mid | low falling |
| Mid consonants | low rising | low falling | high | mid | high falling |
| Low consonants | high | high falling | mid | mid | high falling |
(Note: table's first-cell labels say "Tones" and does not define "voiced/unvoiced consonant" as live/dead; "unvoiced" finals = /p t k/ presumably. The article does not use the words "live" or "dead" in this section.)

(b) Section 3.1 "Vientiane Dialect Six-Tone Distribution" (caption has ref: Hartmann, J. 2002 "Vientiane Tones", Center for Southeast Asian Studies, Northern Illinois University, DeKalb; archived 2020-08-11; "based on Crisfield-Hartmann 2002/Enfield 2000, Brown 1965, and Chittavoravong (1980, unpublished)"). Header: Tone Class | Inherent Tone | Mai ek | Mai tho | Long Vowel | Short Vowel.
| Class | Inherent | Mai ek | Mai tho | Long Vowel | Short Vowel |
|---|---|---|---|---|---|
| High | Low-Rising | Middle | Low-Falling (glottalized) | Low-Falling | Mid-Rising |
| Middle | Low-Rising | Middle | High-Falling (glottalized) | High-Falling | Mid-Rising |
| Low | High-Rising | Middle | High-Falling | High-Falling | Middle (high) |
Fetch tool's own caveat: row grouping/"glottalized" placement partly inferred; a later fetch said the "(glottalized)" qualifiers are in the Mai tho cells of High and Middle rows (an earlier relay put it in Mai ek) [UNCERTAIN]. No example words are given. "Long Vowel / Short Vowel" columns presumably refer to dead syllables (checked) with long vs short vowels, but the article does not label them [UNCERTAIN].

### B.3 Disagreements between tables (all within Wikipedia)
- 7.1.1 table vs Hartmann table: High-class inherent (live, unmarked) "rising" vs "Low-Rising" (consistent); Middle "low rising" vs "Low-Rising" (consistent); Low "high" vs "High-Rising" (naming differs). Mai ek: "mid" in both. Mai tho: High "low falling" vs "Low-Falling (glottalized)" OK; Mid/Low "high falling" both. Dead long vowel: High "low falling" both; Mid "low falling" (7.1.1) vs "High-Falling" (Hartmann) CONTRADICTION; Low "high falling" both. Dead short vowel: High "high" (7.1.1) vs "Mid-Rising" (Hartmann) CONTRADICTION; Mid "high" vs "Mid-Rising" CONTRADICTION; Low "mid" vs "Middle (high)" roughly consistent. Because of these contradictions and uncertain table extraction, do NOT build the tone-rule module from these tables alone; cross-check an independent reference (Enfield 2007, Kerr 1972, Hartmann 2002 original, Osatananda 1997).
- Number of tones: Lao language intro "six lexical tones" yet Vientiane "five" (Osatananda, p. 40) yet Hartmann table titled "Six-Tone Distribution". The Vientiane table in 7.1.1 notes six for "most Lao and Isan dialects".
- The Lao script article gives NO tone rules; the matrix with live/dead is not in either article. Definition of live vs dead syllable and "which finals count as stops": Lao language article defines SMOOTH = ending in vowel or sonorant (m n ŋ w j), CHECKED = ending in a stop /p t k/ or glottal stop (also glottal stop for short open vowels). Coda inventory: /p t k ʔ m n ŋ w j/. Syllable (C)V(C); only initial clusters /kw/ and /kʰw/. The articles use "smooth/checked", not "live/dead".
- Tone-naming conventions seen: (1) generic labels Rising/High/Falling/Mid/Low/Mid-fall; (2) Osatananda descriptive names (low, high, mid level, mid-fall, high-fall; LP: high-falling-to-mid-level, etc.); (3) Hartmann names (Low-Rising, High-Rising, Middle, Low-Falling, High-Falling, Mid-Rising); (4) 7.1.1 names (rising, low rising, low falling, high falling, high, mid). Tone marks named mai ek / mai tho (and mai ti / mai catawa for the rare ones).

---
## C. Unicode Lao block (source: compart.com/en/unicode/block/U+0E80)
Block U+0E80 to U+0EFF, BMP. Compart reports 82 assigned characters (Unicode version not shown). Names (title-case as shown; official are upper case):
0E81 Ko; 0E82 Kho Sung; 0E84 Kho Tam; 0E86 Pali Gha; 0E87 Ngo; 0E88 Co; 0E89 Pali Cha; 0E8A So Tam; 0E8C Pali Jha; 0E8D Nyo; 0E8E Pali Nya; 0E8F Pali Tta; 0E90 Pali Ttha; 0E91 Pali Dda; 0E92 Pali Ddha; 0E93 Pali Nna; 0E94 Do; 0E95 To; 0E96 Tho Sung; 0E97 Tho Tam; 0E98 Pali Dha; 0E99 No; 0E9A Bo; 0E9B Po; 0E9C Pho Sung; 0E9D Fo Tam; 0E9E Pho Tam; 0E9F Fo Sung; 0EA0 Pali Bha; 0EA1 Mo; 0EA2 Yo; 0EA3 Lo Ling; 0EA5 Lo Loot; 0EA7 Wo; 0EA8 Sanskrit Sha; 0EA9 Sanskrit Ssa; 0EAA So Sung; 0EAB Ho Sung; 0EAC Pali Lla; 0EAD O; 0EAE Ho Tam (all above prefixed "Lao Letter").
0EAF Lao Ellipsis; 0EB0 Vowel Sign A; 0EB1 Vowel Sign Mai Kan; 0EB2 Vowel Sign Aa; 0EB3 Vowel Sign Am; 0EB4 Vowel Sign I; 0EB5 Vowel Sign Ii; 0EB6 Vowel Sign Y; 0EB7 Vowel Sign Yy; 0EB8 Vowel Sign U; 0EB9 Vowel Sign Uu; 0EBA Lao Sign Pali Virama; 0EBB Vowel Sign Mai Kon; 0EBC Semivowel Sign Lo; 0EBD Semivowel Sign Nyo; 0EC0 Vowel Sign E; 0EC1 Vowel Sign Ei; 0EC2 Vowel Sign O; 0EC3 Vowel Sign Ay; 0EC4 Vowel Sign Ai; 0EC6 Lao Ko La; 0EC8 Tone Mai Ek; 0EC9 Tone Mai Tho; 0ECA Tone Mai Ti; 0ECB Tone Mai Catawa; 0ECC Cancellation Mark; 0ECD Niggahita; 0ED0-0ED9 Digit Zero..Nine; 0EDC Ho No; 0EDD Ho Mo; 0EDE Letter Khmu Go; 0EDF Letter Khmu Nyo.
Not assigned (gaps): 0E80, 0E83, 0E85, 0E8B, 0EA4, 0EA6, 0EBE-0EBF, 0EC5, 0EC7, 0ECF (as inferred from the list; also 0EE0-0EFF and 0ECE per compart).
DISCREPANCY: Wikipedia "Lao (Unicode block)" lists 83 assigned, including U+0ECE LAO YAMAKKAN (added Unicode 15.0, 2022); compart's list (82) omits it, so compart appears one version behind. History per Wikipedia: 1.0 (1991) 70; 1.0.1 (1992) 65; 6.1 (2012) +2 (U+0EDE, 0EDF); 12.0 (2019) +15 Pali letters; 15.0 (2022) +1 U+0ECE. Note: the Wikipedia 12.0 row's "+15" count vs. 65+2=67, 67+15=82 consistent. The precomposed Wikipedia script article calls the two ligature code points HO NO / HO MO.
Notes: Unicode name vs. Lao-letter-name inversions as above (0E9D, 0E9F, 0EA3, 0EA5). Unicode block is parallel to Thai block positions; ສ at U+0EAA.

---
## D. Citation details to trace
- Enfield, N. J. (2007). A Grammar of Lao. Berlin & New York: Mouton de Gruyter. ISBN 3-11-018588-1. (Also "Enfield 2000" is cited inside Hartmann's table source note.)
- Kerr, Allen (1994). Lao-English Dictionary. White Lotus. ISBN 974-8495-69-8 (listed in Lao language "Further reading"). In the script article's refs: Kerr, Allen, with Sing Bourommavong et al. (1972), Lao-English Dictionary, Catholic University Press, reprinted 1992 White Lotus Co., Bangkok.
- Brown, J. Marvin (1965). From Ancient Thai to Modern Dialects. Bangkok: Social Science Association Press.
- Hartmann, J. (2002). "Vientiane Tones." Center for Southeast Asian Studies, Northern Illinois University (SEASITE). Hartmann, J. (1971). "A model for the alignment of dialects in southwestern Tai." Journal of the Siam Society 65(2): 72-87.
- Osatananda, Varisa (1997). Tone in Vientiane Lao (thesis), ProQuest 304347191 (pp. 40, 119). Osatananda (Aug 2015). "Lao Khrang and Luang Phrabang Lao: A comparison of tonal systems and foreign-accent rating by Luang Phrabang judges." The Journal of Lao Studies, Special Issue 2: 110-143 (p. 122).
- Erickson, Blaine (2001). "On the Origins of Labialized Consonants in Lao" (analysis based on Hoshino & Marcus 1981/1989, Lao for Beginners, Tuttle, ISBN 0-8048-1629-8; accessed 2009-12-19).
- Script-article refs: Daniels & Bright (eds., 1996) The World's Writing Systems pp. 460-461, OUP; Davis, Garry W. (2015) "The story of Lao r: Filling in the gaps," Journal of Lao Studies 2, pp. 97-109; Lew, Sigrid (2014) "A linguistic analysis of the Lao writing system and its suitability for minority language orthographies," Writing Systems Research 6(1): 25-40, doi:10.1080/17586801.2013.846843 (further-reading lists it as 2013); Kangpajanpeng et al. (1999) English-Lao Lao-English Dictionary; Konnyvong (2005) Dictionary of the Lao Language; Ministry of Education and Sports (2007) Lao Language, level 1 (Vientiane); Ministry of Education and Sports & RIES (2019) Lao primary textbook Grade 1 vol. 1; Patterson & Severino (1995) Lao-English Dictionary, Dunwoody; Ivarsson (2008) Creating Laos, NIAS; Rajan, Mitchell, Jansche, Brawer (2017) Revised Proposal to Encode Lao Characters for Pali; Unicode Standard 12.0 "Lao" p. 635; Jenny (2021) "Writing systems of MSEA" in Sidwell & Jenny eds, De Gruyter Mouton, pp. 879-906; Simmala & Becker (2003) Lao for Beginners, Paiboon, ISBN 1-887521-28-3.
- Not found in extracted text: any Chazée citation.

---
## Open questions / gaps
1. Live/dead definition, and a full class x syllable x vowel-length x mark -> tone matrix with Chao numbers and example words for each cell: NOT present in the Lao script article; the Lao language article gives only the two partial tables in B.2, which conflict.
2. Vowel count 33 vs 24+3 listed; ligature count 7 vs 6 listed.
3. Phonology consonant and vowel tables in Lao language (5.1, 5.2) not extracted. Smooth-syllable phonetic column not extracted. LC and RTGS consonant romanizations not recoverable.
4. Closed-syllable forms of ເ◌ີ, ເ◌ືອ, ເ◌ັຍ, ◌ົວະ not shown.
5. No 1993+ reform info (e.g., silent ຣ rule) in these sources; the "7 ligatures" claim unexplained.
6. Mapping between generic six tone names and Osatananda/Hartmann names not stated.
7. Unicode: compart omits U+0ECE (82 vs 83); Unicode version not stated on compart.

## Reliability notes
- All table data passed through a summarizing model; several relays of the same table disagreed (tone numbers, glottalization placement, ຣ name word). Verify against the live page.
- The Wikipedia tone tables disagree with each other (B.3) and may include extraction artefacts; Wikipedia is a secondary source; primary traces are Hartmann 2002, Osatananda 1997/2015, Enfield 2007, Kerr.
- Wikipedia marks the LP example "ຄ່າ trade" which looks like an error (ຄ່າ elsewhere = value).
- A search-result summary (from unicode.org material) mentioned name errata in the Lao block; I did not fetch unicode.org and have not used it.
- No instructions embedded in fetched content were encountered.

# Vientiane Lao tone-rule matrix: third-source search (Wiktionary guidelines + Module:lo-pron, FSI, Kerr, Wikipedia re-check)

Read date: 2026-10-09. Task: find an authoritative, openly readable THIRD source for the full Vientiane tone matrix, and reconcile it with the two earlier notes:
- `_agent/research/lao-tones-seasite.md` (abbrev. SEAsite)
- `_agent/research/lao-script-wikipedia-unicode.md` (abbrev. WP-notes)

## 0. BOTTOM LINE (read first)
- No candidate gave a fully independent, cleanly readable, citable matrix. What I got:
  1. Wiktionary "Lao entry guidelines" tone table (Chao tone letters + names). It states it is built from the SEAsite/NIU charts, so it is NOT independent of SEAsite. [Sec 1]
  2. Wiktionary `Module:lo-pron` (Lua source): a machine-readable Vientiane tone table with Chao tone letters whose values match the Osatananda 1997 numbers quoted on Wikipedia (13/11, 35, 33, 31, 52). It cites no source. It is an implementation, not a scholarly statement. [Sec 2]
  3. Wikipedia "Lao language" wikitext re-pulled cell by cell for sec 3.1 (Hartmann 2002 table), 5.3 (tone tables) and 7.1.1. [Sec 4]
  4. FSI Lao Basic Course Vol 1: gives six tones in a transcription-based course; no class/live-dead rules at all. [Sec 5]
  5. FSI Reading Lao (1974): has the rule charts, but the OCR of every chart is garbled; only a few frame answers legible. [Sec 5]
  6. Kerr (1972/1992) Lao-English Dictionary: front matter has a six-tone Table III but no readable rule statement. [Sec 6]
- Weight of evidence for the main matrix: SEAsite tonechart, Wiktionary guidelines table, Wiktionary module and Wikipedia 7.1.1 all give the SAME category for all 15 cells (only naming/numeric precision differs). Outliers: Wikipedia sec 3.1 (Hartmann caption) on three cells, and Wikipedia sec 5.3.2 example ຮັກ on one cell. See Sec 7.
- The only truly independent-looking dissent is Wikipedia 5.3.2's example ຮັກ /hàk/ low [˨˩] (Low class + short vowel + k). Unresolved.

## 1. Wiktionary, "Wiktionary:Lao entry guidelines" (section "Tones")
- URLs: https://en.wiktionary.org/wiki/Wiktionary:Lao_entry_guidelines ; `Wiktionary:About_Lao` is only a redirect to it (wikitext `#REDIRECT [[Wiktionary:Lao entry guidelines]]`). Raw wikitext fetched via https://en.wiktionary.org/w/index.php?title=Wiktionary:Lao_entry_guidelines&action=raw . Only one heading: "==Tones==". Author/date not given on page. (`Appendix:Lao_pronunciation` returned HTTP 404.)
- Prose (as relayed; the fetch tool quotes only short fragments; items 30-35 are quoted line by line from wikitext):
  - "It is usually said that the 'standard' dialect of Lao is based on the language of the capital, Vientiane."
  - It relies on the NIU Center for Southeast Asian Studies charts "which usefully summarise studies by different phonologists into Vientiane tones"; "The system used on Wiktionary follows their amalgam based on these studies, and matches the chart here."
  - "This is a five-tone system." "Many books follow Levy 1982 in describing standard Lao as having six tones" (a "high level" vs "rising" split, merged here into "high-rising"). Levy 1982 full citation not given.
  - Links cited on the page: seasite Vientianetones.htm and IntroAlphabet/tonemarks/tonechart.htm (i.e., the same SEAsite pages already studied).
- Live/dead definition on the page: column header only: `"Live" syllable (ends in vowel or sonorant), unmarked`; dead headers: `"Dead"/"checked" syllable with long vowel`, `"Dead"/Checked syllable with short vowel`. No prose definition, no stop list, no mention of the glottal stop.
- Table (wikitext cells; tone letters verbatim; the digit column is MY mechanical conversion of the letters, not in the source):

| Class | Live, unmarked | Mai ek | Mai tho | Dead, long vowel | Dead, short vowel |
|---|---|---|---|---|---|
| High consonants ຂ ສ ຖ ຜ ຝ ຫ | ˩˧ ("often described as 'rising'; here specifically low-rising") [13] | ˧˧ (mid) [33] | ˨˩ (low-falling) [21] | ˨˩ (low-falling) [21] | ˦˥ ("often described as 'high'; here specifically high-rising") [45] |
| Mid consonants ກ ຈ ດ ຕ ບ ປ ຢ ອ | ˩˧ (low rising) [13] | ˧˧ (mid) [33] | ˥˧ (high-falling) [53] | ˨˩ (low-falling) [21] | ˦˥ (same "high-rising" wording) [45] |
| Low consonants ຄ ຊ ທ ພ ຟ ຮ ງ ຍ ນ ມ ລ ວ | ˦˥ (high-rising) [45] | ˧˧ (mid) [33] | ˥˧ (high-falling) [53] | ˥˧ (high-falling) [53] | ˧˧ (mid) [33] |

- Notes: the Low list on this page omits ຣ (12 letters). No footnotes, no example words, no sources inside the table. The first fetch of this page (rendered, not wikitext) also arrived in the same layout, so the column mapping is confirmed by the wikitext header order.
- Search-engine summary also mentioned the page; consistent.

## 2. Wiktionary `Module:lo-pron` (Lua; https://en.wiktionary.org/wiki/Module:lo-pron , raw via action=raw; page says protected, last edited 13 Dec 2025 as relayed)
Code is the only "source" here: it has no citations, only labels `-- Vientiane`, `-- Luang Prabang`, `-- M,L,H`. Lines as relayed (numbered by the fetch tool; verbatim):
```
-- Vientiane
local vt_unmarked_tones = { -- M,L,H
  live       = { "˩(˧)", "˧˥", "˩(˧)" },
  dead_short = { "˧˥", "˧", "˧˥" },
  dead_long  = { "˧˩", "˥˨", "˧˩" },
local vt_marked_tones = { -- M,L,H
  ["່"] = { "˧", "˧", "˧" },
  ["້"] = { "˥˨", "˥˨", "˧˩" },
  ["໊"] = { "˧˥", "˧˥", "˧˥" },
  ["໋"] = { "˩˧", "˩˧", "˩˧" },
```
(Luang Prabang tables exist in the same module; values are in the fetch transcript only, not needed here: live {˩˨, ˩˨, ˥˧˧}; dead_short {˩˨, ˧˨, ˩˨}; dead_long {˥˥˨, ˧˦, ˥˥˨}; ່ ˧˨; ້ {˧˦, ˧˦, ˥˥˨}; ໊ ˧˦; ໋ ˩˨.)
Logic lines:
- `if t ~= "" then tm = marked_tones[t]` ... else `tm = unmarked_tones[(dead and (long and "dead_long" or "dead_short") or "live")]`. So a tone mark OVERRIDES live/dead/length.
- `dead = (find(f, "%+?[ກດບ]") or find(vowels[v], "ʔ$"))` : dead if the final is ກ ດ ບ (also with a forced "+" prefix) OR the vowel's IPA ends in ʔ (the short open vowels).
- `long = find(vowels[v], "ː")`: long iff the vowel's IPA has the length mark.
- Finals map: ກ -> k̚, ດ -> t̚, ບ -> p̚ (plus "+ກ/+ດ/+ບ" forced finals).
- `if f == "" and (v == "ິ" or v == "ຶ" or v == "ຸ" or v == "ເິ" or v == "ເຶອ") then v = v .. "*" -- added ʔ`: these short open vowels get a glottal stop added, hence count as dead.
- Class: `if find(i, "^[ກຈດຕບປຢອ]ວ?$") then -- middle class`; low class is `^[ຄຊທພຟຮງຍນມຣລວ]ວ?$` (includes ຣ); everything else = high (so ຫ-digraph initials are handled as high; a "faux hng" substitution `{ "ຫງ", "໠" }` is used for ຫງ).
- Reading the table in category terms (my mapping via the Osatananda numbers on WP: 13/11 "low", 35 "high", 33 "mid level", 31 "mid-fall", 52 "high-fall"): High and Mid live = low (rising); Low live = high (35); ek = mid for all three; tho = high-fall for Mid/Low and mid-fall for High; dead long: Mid mid-fall, Low high-fall, High mid-fall; dead short: Mid high, Low mid, High high. This reproduces the SEAsite chart cell for cell (Sec 7).
- Not covered by what I retrieved: how the module treats ໄ ໃ ເົາ ຳ (SEAsite treats Mid + these as live, low rising), and whether a short vowel + sonorant ever counts as long (it does not: only the vowel's ː matters, and only if dead). Treat live syllables as depending on class only (consistent with SEAsite tonechart, against SEAsite Middle rule 4).
- Mai tri ໊ = ˧˥ and mai chattawa ໋ = ˩˧ for all classes in this module: the only machine-readable assignment seen for the rare marks (SEAsite gave none). It is code, uncited; Kerr says these two marks are "rare" and "normally used only with middle-group consonants" (Sec 6). Do not teach as established rule without a better source.

## 3. Chao numbers / tone names in the Vientiane sources, side by side (verbatim letters; digits where the source gave digits)
- Wikipedia (Osatananda 1997 p. 40, smooth syllables, FIVE tones): low `1(3)` or ˩(˧) ຂາ "leg", ກາ "crow"; high `35` ˧˥ ຄາ "stuck"; mid level `33` ˧˧ ຂ່າ "galangal", ຄ່າ "value"; mid-fall `31` ˧˩ ຂ້າ "kill"; high-fall `52` ˥˨ ຄ້າ "trade". Note: low is 13 in citation form/before pause and 11 elsewhere (from WP-notes; example ຫາປາ).
- Wiktionary guidelines: ˩˧, ˧˧, ˨˩, ˥˧, ˦˥ (five tones; no numbers).
- Wikipedia generic (non-dialect) smooth table phonetic column (verbatim as pulled this session): Rising ຂາ [kʰäː˨˦] or [kʰäː˨˩˦]; High ຄາ [˥] or [˦˥]; Falling ຄ້າ [˦˩] or [˥˨]; Mid ຂ່າ/ຄ່າ [˧]; Low ກາ [˩] or [˨˩]; Mid-fall ຂ້າ [˧˩]. (Earlier WP-notes said the phonetic column was cut off; it was available this time.)
- SEAsite uses names + digits 1-4 and # (1 high falling, 2 high rising, 3 low falling, 4 low rising, # high-mid); no Chao numbers in text (contours are GIFs).
- Mapping SEAsite name -> Osatananda/WP Chao -> Wiktionary letters (my inference by matching which cells share which value across the sources): low rising (4) = low 13/11 = ˩˧ ; high rising (2) = high 35 = ˦˥ ; high-mid (#) = mid level 33 = ˧˧ ; high falling (1) = high-fall 52 = ˥˧ ; low falling (3) = mid-fall 31 = ˨˩. Numerics do not agree exactly (21 vs 31 for low falling; 45 vs 35 for high rising; 53 vs 52 for high falling): unresolved precision difference.

## 4. Wikipedia "Lao language" wikitext re-pulled this session (cell by cell)
Section indices: 3.1 = index 11, 5.3 Tones = index 25, 7.1.1 = index 33. URL pattern: https://en.wikipedia.org/w/api.php?action=parse&page=Lao_language&prop=wikitext&section=N&format=json

### 4a. Sec 3.1 "Vientiane Lao dialect": "Vientiane Dialect Six-Tone Distribution"
Caption ref (wikitext): "Hartmann, J. (2002). Vientiane Tones ... Center for Southeast Asian Studies. DeKalb: University of Northern Illinois. Based on Crisfield-Hartmann 2002/Enfield 2000, Brown 1965, and Chittavoravong (1980) (unpublished)." (archived 2020-08-11.) Columns: Tone Class | Inherent Tone | Mai ek | Mai tho | Long Vowel | Short Vowel.
| Class | Inherent | Mai ek | Mai tho | Long Vowel | Short Vowel |
|---|---|---|---|---|---|
| High | Low-Rising | Middle | Low-Falling (glottalized) | Low-Falling | Mid-Rising |
| Middle | Low-Rising | Middle | High-Falling (glottalized) | High-Falling | Mid-Rising |
| Low | High-Rising | Middle | High-Falling | High-Falling | Middle (high) |
(Confirms the wikitext matches the WP-notes B.2(b) extraction. "(glottalized)" sits in the Mai tho cells of High and Middle.) The title says "Six-Tone" but the table uses only: Low-Rising, High-Rising, Middle, Low-Falling, High-Falling, Mid-Rising = six names. So Hartmann/this table distinguishes "Mid-Rising" (dead short, High/Mid) from "High-Rising" (Low live).

### 4b. Sec 7.1.1 "Indication of tones" (no ref attached)
Prose: "Experts disagree on the number and nature of tones in the various dialects of Lao." "According to some, most dialects of Lao and Isan have six tones, those of Luang Prabang have five." Headers: Tones | Long vowel, or vowel plus voiced consonant | Long vowel plus unvoiced consonant | Short vowel, or short vowel plus unvoiced consonant | Mai ek | Mai tho.
| Class | Col 2 | Col 3 | Col 4 | Mai ek | Mai tho |
|---|---|---|---|---|---|
| High consonants | rising | low falling | high | mid | low falling |
| Mid consonants | low rising | low falling | high | mid | high falling |
| Low consonants | high | high falling | mid | mid | high falling |
Matches WP-notes B.2(a) exactly. Read as live / dead-long / dead-short (header wording "vowel plus voiced consonant" = live; "unvoiced consonant" = stops); this reading is the only one under which the table agrees with the SEAsite chart. Note it says "Long vowel, or vowel plus voiced consonant" for live, i.e., it implies short vowel + voiced (sonorant) final is LIVE; this supports the tonechart (class only) and contradicts SEAsite Middle rule 4.

### 4c. Sec 5.3 "Tones"
Prose: "Lao has six lexical tones. However, the Vientiane and the Luang Prabang dialects have five tones." "There are six tones in smooth syllables, that is, in syllables ending in a vowel or other sonorant sound." "The number of contrastive tones is reduced to four in checked syllables, that is, in syllables ending in an obstruent sound."
Smooth syllables (generic, not dialect-specific): Rising ຂາ /kʰǎː/ [kʰäː˨˦] or [˨˩˦] "leg"; High ຄາ /kʰáː/ [˥] or [˦˥] "stuck"; Falling ຄ້າ /kʰâː/ [˦˩] or [˥˨] "trade"; Mid ຂ່າ, ຄ່າ /kʰāː/ [˧] "galangal, value"; Low ກາ /kàː/ [˩] or [˨˩] "crow"; Mid-fall ຂ້າ /kʰaᶆː/ or /kʰə̂ː/ [˧˩] "kill, servant".
Checked syllables (generic): High ຫັກ /hák/ [häk̚˦˥] or [˥] "break"; Low ຮັກ /hàk/ [˨˩] or [˩] "love"; Mid-fall ຫາກ /haᶆːk/ or /hə̂ːk/ [˧˩] "if, inevitably"; Falling ຮາກ /hâːk/ [˦˩] or [˥˨] "vomit, root". (Row names there are "High / Low / Mid-fall / Falling".)
Dialect table: Vientiane (Osatananda 1997 p. 40) and Luang Prabang (Osatananda 2015 p. 122) as in Sec 3 above and WP-notes B.1. Tone letters given as digits "or" letters.
Reading of the checked examples in class terms (ຫ = High class, ຮ = Low class; ັ = short, າ = long): ຫັກ = High + short + stop -> "High"; ຮັກ = Low + short + stop -> "Low"; ຫາກ = High + long + stop -> "Mid-fall"; ຮາກ = Low + long + stop -> "Falling". Three of the four agree with the matrix; ຮັກ does not (Sec 7, flag D3).

## 5. FSI (public domain; archive.org)
### 5a. FSI Lao Basic Course, Student Text Vol 1 (Yates & Sayasithsena 1970)
- URL: https://archive.org/details/fsi-lao-basic-course-student-text-volume-1 ; OCR text fetched at https://archive.org/stream/fsi-lao-basic-course-student-text-volume-1/FSI%20Lao%20Basic%20Course%20Student%20Text%20Volume%201_djvu.txt (403,206 characters; only chars 0-100,000 read; front matter fully inside).
- Front matter outline: Preface (iii); Contents (iv-xv); Introduction (xvi); Notes to Students (xviii); Explanation of the Special Transcription (xx); Tones in Lao (xxi-xxii); Notes to the Teacher (xxiii-xxiv, in Lao script, garbled).
- Statements retrieved (verbatim fragments): "There are six tones in Lao. The pitch contours, names, and symbols for them are illustrated below:" ; example syllables as OCR'd "khaa kën khaa khÉa kháaw khaw"; names line OCR'd "LOW MID HIGH LOW HIGH LOW" with "FALLING RISING FALLING" (mapping lost; the contour diagrams are images). "The pitch contour on a syllable is indicated by a symbol above the vowel." "Vowel length is indicated by doubling the vowel symbol."
- It teaches a romanization (special transcription), NOT the Lao script, so it contains no class/live-dead/mark rules and no Chao numbers. Six tones (FSI) vs five (SEAsite, Wiktionary, Osatananda).
- Verdict: unusable for the matrix. Unread: chars 100,000-403,206 (cycles; not expected to hold rules).

### 5b. FSI Reading Lao (Yates & Sayasithsena, programmed text, 1974)
- URL: https://archive.org/details/fsi-reading-lao ; OCR text fetched at https://archive.org/stream/fsi-reading-lao/FSI%20Reading%20Lao_djvu.txt (276,718 characters; all three 100k chunks read via the tool). (The /download/ URL redirects to a dnNNNNN.ca.archive.org storage host; I did not follow it.)
- Uses OPEN/CLOSED, not live/dead or smooth/checked. Terms: HIGH / MID / LOW class (HC/MC/LC), "PC" = pitch contour. A short vowel makes the syllable closed "since the short vowel is usually followed by a glottal stop" (frame 338, OCR as relayed). Closed = "sound is stopped".
- Legible rule fragments (frame answers; OCR noisy; frame/page numbers approximate; relayed by the fetch tool):
  - frame 9 (p. 243): LC + V -> Mid PC. frame 10 (p. 243): LC + VV -> High PC. frame 13: LC + open syllable -> High PC.
  - frame 14 (p. 244): MC + open syllable -> Low PC. frame 54 (p. 256): LC + V(V) + [ending] -> High PC; MC + V(V) + [ending] -> Low PC.
  - frame 52 (p. 256): "LC + Closed -> Mid level PC".
- Tone charts at printed pp. ~406, 419, 436 ("Ans.565"), 474 ("SPECIAL TONE CHART" for marked syllables) are headed "TONE CHART / UNMARKED SYLLABLES / MARKED SYLLABLES / CLOSED / INITIAL" with cell labels "Low PC", "High PC", "Mid PC", "falling PC" etc., but the cell-to-column mapping is GARBLED in the OCR: I could not read the chart and I have not reconstructed it. A rule "Rule 1: The PC of the first syllable is determined by the class of [the first consonant]" appears at p. 445 (polysyllables; matches SEAsite Add_body).
- The legible fragments are consistent with the matrix for Low live long (high), Low + short/closed (mid level), Mid live long (low), but they are fragments the summarizer pulled out; treat as weak corroboration only.
- Tone-mark names and the mai ek / mai tho rules were not legible.

## 6. Kerr, Lao-English Dictionary (1972 CUA Press; 1992 White Lotus 2nd printing)
- Readable full text: archive.org item `ZDLJ_lao-english-dictionary-by-allen-d.-kerr-assisted-by-sing-bourommavong-houmpheng-` (White Lotus, Bangkok; CC0 per the item page; OCR djvu.txt 914,046 characters in the tool; only chars 0-100,000 read, which covers the front matter and start of the K entries). The other two archive.org Kerr items (`laoenglishdictio01kerr`, `laoenglishdictio0001alle`) are access-restricted/lending: their stream URLs returned only a page shell. A fetch of the ia600605.us.archive.org storage URL for `laoenglishdictio01kerr` was DENIED by the permission system and not retried.
- Front matter outline (pp. as in the contents list): Preface; Introduction (vii); Table I consonant symbols (viii); Table II vowel symbols + reduplication symbol (ix); Table III tone symbols (x); Organization of the Entries (xi); Acknowledgments; Sources (xii); Classifiers (xiii); Abbreviations (xiv). The Preface and Introduction prose were NOT present in the OCR (heading only).
- Table III "Alphabetical Order of the Tone Symbols" (p. x), as OCR'd (partly garbled): "1. No symbol used." "2. Symbol may ek." "3. Symbol may tho." "4. Symbol may tri, normally used only with middle-group consonants." "5. Symbol may cattawa, normally used only with middle-group consonants." Note 1: symbols four and five are "rare; their use is confined almost entirely to interjections and onomatopoeic words" (partly garbled). Note 2 (garbled): "...The tone of the syllable is further determined by the ... initial ... [garbled]". Closing: "The following chart illustrates the pitch contours and the romanizations of the six Lao tones." Romanization row as OCR'd: "ka: kh-a: kha: kha: kha:v khav"; tone names row as OCR'd "HIGH Low LOW TOW MID Vr ING RISING HIGH FALLING" (garbled). Contours are images.
- Kerr states SIX tones, uses "middle-group consonants" (his term for Mid class), and does not state class/live-dead rules in the readable OCR. Table II distinguishes "In Open Syllables / In Closed Syllables" vowel forms (spelling, not tone). No matrix. Verdict: not usable for the matrix; useful only for (a) six-tone count and (b) rare marks being restricted to Mid class and to interjections/onomatopoeia.

## 7. Cell-by-cell reconciliation (15 matrix cells)
Legend: names as each source gives them. "SEA" = SEAsite tonechart.htm (corrected for the digest's column inference; matches all its lesson rules). "WG" = Wiktionary guidelines table (Sec 1). "WM" = Wiktionary Module:lo-pron Vientiane (Sec 2), written with the module's letters and its category by the Osatananda numbers. "WP7" = Wikipedia 7.1.1. "WP3" = Wikipedia 3.1 (Hartmann caption). "WP5" = Wikipedia 5.3 generic examples (Sec 4c) and Osatananda numbers. Examples are from SEAsite lessons or WP5 as marked.

| # | Cell | SEA | WG | WM | WP7 | WP3 (Hartmann) | WP5 / Osatananda | Agree? | Example words |
|---|---|---|---|---|---|---|---|---|---|
| 1 | High, live, no mark | LOW RISING (4) | ˩˧ low-rising | ˩(˧) | rising | Low-Rising | "Rising" ຂາ [˨˦]; Osat. low 13 | yes (category) | ຂາ kha4a, ສໍ, ເຂີ, ຜົມ, ຝົນ (SEA) ; ຂາ "leg" (WP) |
| 2 | Mid, live, no mark | LOW RISING (4) | ˩˧ low rising | ˩(˧) | low rising | Low-Rising | "Low" ກາ [˩]/[˨˩]; Osat. low 1(3) | yes | ກາ, ປາ, ຕາ, ກິນ(?), ໄປ (SEA) ; ກາ "crow" (WP) |
| 3 | Low, live, no mark | HIGH RISING (2) | ˦˥ high-rising | ˧˥ | high | High-Rising | "High" ຄາ [˥]/[˦˥]; Osat. high 35 | yes (category; numerics 45 vs 35) | ມາ maá, ລາວ, ເຮືອນ, ນົມ, ຄົນ (SEA) ; ຄາ "stuck" (WP) |
| 4 | High, mai ek | HIGH-MID (#) | ˧˧ mid | ˧ | mid | Middle | Osat. mid level 33 ຂ່າ | yes (SEA calls it "high-mid", others "mid") | ຂ່າ, ສູ່, ຜ່ານ, ຫົ່ງ (SEA) |
| 5 | Mid, mai ek | HIGH-MID (#) | ˧˧ mid | ˧ | mid | Middle | (no Mid example) | yes | ກ່າ, ບໍ່, ຢູ່, ແຕ່ (SEA) |
| 6 | Low, mai ek | HIGH-MID (#) | ˧˧ mid | ˧ | mid | Middle | ຄ່າ mid level 33 | yes | ແມ່ນ, ຊື່, ທີ່, ນັ່ງ (SEA) ; ຄ່າ "value" (WP) |
| 7 | High, mai tho | LOW FALLING (3) | ˨˩ low-falling | ˧˩ | low falling | Low-Falling (glottalized) | Osat. mid-fall 31 ຂ້າ; WP5 "Mid-fall" [˧˩] | yes (category; numerics 21 vs 31) | ຂ້ອຍ khO3Oy, ຜູ້ phu3u (SEA) ; ຂ້າ "kill" (WP) |
| 8 | Mid, mai tho | HIGH FALLING (1) | ˥˧ high-falling | ˥˨ | high falling | High-Falling (glottalized) | (no Mid example) | yes (53 vs 52) | ກ້າ, ໄດ້, ເຈົ້າ, ບ້ານ, ຕົ້ນ (SEA) |
| 9 | Low, mai tho | HIGH FALLING (1) | ˥˧ high-falling | ˥˨ | high falling | High-Falling | Osat. high-fall 52 ຄ້າ; WP5 "Falling" [˦˩]/[˥˨] | yes | ນັ້ນ, ຮ້ອນ, ທ້າຍ, ແລ້ວ (SEA) ; ຄ້າ "trade" (WP) |
| 10 | High, dead, long vowel | LOW FALLING (3) | ˨˩ low-falling | ˧˩ | low falling | Low-Falling | ຫາກ "Mid-fall" [˧˩] | yes | ສູບ, ຫາກ (SEA, answers hidden; rule stated for "High + long vowel + stop"); ຫາກ "if" (WP) |
| 11 | Mid, dead, long vowel | LOW FALLING (3) | ˨˩ low-falling | ˧˩ | low falling | **High-Falling** | (no example) | **NO: WP3 dissents** (4 of 5 say low falling) | ກາບ kaâp, ດາບ, ຈາດ, ຢາກ, ປາກ (SEA) |
| 12 | Low, dead, long vowel | HIGH FALLING (1) | ˥˧ high-falling | ˥˨ | high falling | High-Falling | ຮາກ "Falling" | yes | ໂພດ, ພວກ, ທູດ (SEA) ; ຮາກ "vomit, root" (WP) |
| 13 | High, dead, short vowel | HIGH RISING (2) | ˦˥ high-rising | ˧˥ | high | **Mid-Rising** | ຫັກ "High" /hák/ [˦˥]/[˥] | category yes; WP3 name differs | ຫົກ, ສິບ, ເຜັດ, ຝົດ, ຖັກ, ຂຸ (SEA) ; ຫັກ "break" (WP) |
| 14 | Mid, dead, short vowel | HIGH RISING (2) | ˦˥ high-rising | ˧˥ | high | **Mid-Rising** | (no example) | as 13 | ຈຶກ, ດົດ (SEA); short open ຈະ ແຕະ ເປາະ ໂຕະ listed (SEA) |
| 15 | Low, dead, short vowel | HIGH-MID (#) | ˧˧ mid | ˧ | mid | Middle (high) | ຮັກ "Low" /hàk/ [˨˩]/[˩] (**DISSENT**) | **NO: WP5 example dissents** | ລັດ, ຣົດ, ເຮັດ, ພັກ (SEA) ; "no# / pha#" short open (SEA rule 7) |

### Disagreements, each with which source this note's evidence supports
- D1 (cell 11, Mid + dead long): WP3 (Hartmann caption table) says High-Falling; SEAsite tonechart, SEAsite Middle "Rule 3" lesson (kaaN + long vowel + stop = low falling, examples kaâp/paâk), Wiktionary guidelines, Wiktionary module, WP7 all say low falling (module: mid-fall 31). Supported: LOW FALLING. WP3 is likely an editing/transcription error on Wikipedia, but unproven since the original Hartmann table is an image. The Wikipedia caption cites the same SEAsite page, whose own tonechart says low falling, so the Wikipedia cell contradicts its own cited source.
- D2 (cells 13-14, High/Mid + dead short): WP3 "Mid-Rising" vs everyone else "high"/"high rising" (SEAsite 2; Wiktionary ˦˥; module ˧˥; WP7 high; WP5 ຫັກ high). Likely a naming difference, but note Vientianetones.htm contains distinct GIFs named "rising1.gif" and "highrising1.gif" (alt text only; contour not viewable, see Sec 8), so Hartmann may genuinely draw dead-short as a lower/different rise than Low-live "high rising". Whether the dead-short rise differs in height from Low-live rise: UNRESOLVED. The category (a rise ending high) is not in dispute.
- D3 (cell 15, Low + dead short): SEAsite tonechart + lessons (ລັດ, ເຮັດ, ພັກ "pha#k"), Wiktionary guidelines, module, WP7, WP3 "Middle (high)" all say mid (SEAsite "high-mid"); WP5.3.2 gives ຮັກ as "Low" /hàk/ [˨˩]/[˩]. Direct clash on structurally identical words (ພັກ vs ຮັກ: both Low initial + short ັ + ກ). Supported: MID (5-6 sources). The WP5 table is generic "Lao" (six tones), not labeled Vientiane, so it may describe another dialect or be a loose illustration. UNRESOLVED without Osatananda 1997 / Enfield 2007 / the original Hartmann table.
- D4 (names): SEAsite "HIGH-MID (#)" = Wiktionary/Wikipedia "mid" (33). SEAsite "LOW FALLING (3)" = Wikipedia/Osatananda "mid-fall" (31) = Wiktionary "low-falling" ˨˩ (21). Treat as the same tone category; numeric values unresolved (21 vs 31).
- D5 (numerics): high rising ˦˥ 45 (Wiktionary guidelines) vs 35 (Osatananda, module); high falling ˥˧ 53 vs ˥˨ 52; low rising ˩˧ 13 vs ˩(˧) 13/11. Unresolved: pick one scheme and cite it.
- D6 (tone count): five (SEAsite lessons, Wiktionary, Osatananda) vs six (Kerr, FSI, Levy 1982, Hoshino & Marcus 1973, WP "six-tone distribution" title, WP "most dialects six"). Difference is whether Low-live high rising (35) and dead-short rise are one tone. Matches Wiktionary's explanation ("high level" vs "rising" merged).
- D7 (SEAsite internal, now settled): Middle live "Rule 2" saying low FALLING for Mid + sonorant is a typo/digest error: tonechart, examples, closing note, Wiktionary guidelines, module (live = class only) and WP7 all give LOW RISING. Middle "Rule 4" (short vowel + sonorant = "high rising") is contradicted by the same set (live ignores vowel length): supported: LOW RISING for all live Mid syllables regardless of vowel length. (Wiktionary guidelines derive from the SEAsite chart, so this is partly circular; the module and WP7 are separate encodings and agree.)
- D8 (WP-notes earlier worry "7.1.1 vs Hartmann contradictions"): after the re-pull, 7.1.1 equals the SEAsite chart exactly; only WP3 differs (D1, D2). WP-notes B.3 listed Low dead-short and High/Mid dead-short as roughly consistent; D2/D3 above refine this.

## 8. Live/dead (smooth/checked) definition, consolidated
- SEAsite (suung_body + tonechart): smooth/live = ends in a long vowel or final -m, -n, -ng, -l, -r, -y, -w; checked/dead = ends in -p, -t, -k or a glottal stop. A short vowel with no final is a closed syllable (glottal stop) and takes the dead short-vowel tone.
- Wiktionary guidelines: "Live" = ends in vowel or sonorant (header only; no stops list).
- Wiktionary module (operational): dead = final ກ/ດ/ບ or a vowel whose IPA ends in ʔ (short open vowels; short ິ ຶ ຸ ເິ ເຶອ with no final are given an added ʔ). Long = vowel IPA contains ː. Live never splits by vowel length.
- Wikipedia 5.3: smooth = ends in vowel or "other sonorant sound"; checked = ends in an obstruent. WP-notes: coda inventory /p t k ʔ m n ŋ w j/.
- FSI Reading Lao: OPEN/CLOSED; short vowels count as closed (glottal stop). Not live/dead terminology.

## Open questions / gaps
- No scholarly primary text (Enfield 2007, Hartmann 2002 original, Osatananda 1997) was openly readable on allowed domains. Hartmann's original lives in SEAsite Vientianetones.htm as GIF contour images only. I fetched two of the GIFs (images/rising1.gif and images/highrising1.gif); the fetch tool saved them outside the working folder, where the Read tool was blocked by a guardrail, so I did not view them (and did not try to bypass it). Request: if wanted, have the user place those GIFs under the project to view; the page's image list is: lowfalling2, lowrising1, mid1, highfalling1, rising1, highrising1 (Crisfield-Hartmann table) and high1, mid1, low1 etc. for other analyses.
- Hoshino & Marcus "Lao for Beginners" (archive.org ids `laoforbeginnersi0000hosh`, `laoforbeginnerss0000buas`) are lending-only; their full-text URLs returned a page shell. Not readable.
- FSI Reading Lao charts: OCR garbled; reading them needs a view of the page images (PDF `FSI Reading Lao.pdf` on archive.org, printed pp. ~406, 419, 436, 474; also the "Special Tone Chart" for marked syllables). Not reconstructed.
- Kerr: Preface and Introduction prose absent from OCR; Table III note 2 garbled; contours are images. Only chars 0-100,000 of 914,046 were read (no need beyond front matter).
- Unresolved: D2 (is dead-short rise equal in height to Low-live rise?), D3 (Low + dead short: mid vs low), D5 (exact Chao values).
- Not retrieved: treatment of ໄ ໃ ເົາ ຳ in the module; mai tri/chattawa rules from any scholarly source; behavior of the polysyllable rule beyond SEAsite's "first consonant decides"; whether live syllables with short vowel + sonorant ever differ (all current sources say no).
- Wikipedia 5.3 generic phonemic names and Osatananda names have no stated mapping.

## Reliability notes
- All fetches go through a summarizing model that refuses long verbatim reproduction (about a 125-character quote cap) and sometimes reorders table columns; this is why Sec 1 relies on the raw wikitext fetch (cell order explicit) and Sec 4 on wikitext (also explicit). Anything marked "as relayed" should be spot-checked in a browser.
- Wiktionary guidelines are written by an editor who states reliance on SEAsite; not independent. Wiktionary module is uncited code; values equal Osatananda numbers (via Wikipedia), but the module authors' source is not stated. Module was last edited Dec 2025 and may change.
- Wikipedia tables carry no cell-level citations (7.1.1 has none; 3.1 has the Hartmann ref); 3.1 contradicts its own cited source on at least one cell (D1).
- SEAsite is a 2002/2003 teaching site (Last Modified 11/05/2003 on Vientianetones.htm); spellings are pre-reform in places.
- FSI materials date from 1970-1974 and use a six-tone analysis and different terminology (open/closed, PC). Kerr dates from 1972.
- Naming caution: "mid" vs "high-mid" vs "middle" vs "mid level" all appear for the 33 tone; "low falling" (SEAsite) is Osatananda's "mid-fall".
- No instructions embedded in fetched content were encountered.

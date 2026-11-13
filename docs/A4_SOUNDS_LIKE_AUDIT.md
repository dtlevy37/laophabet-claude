# A4 audit: English "sounds like" hints

Research only. Nothing in `data/`, the DB or any migration was changed. Written 2026-11-12.

Scope covered:
- **Units:** all 23 rows of `data/units.csv`, i.e. the `teach_en` card text (lessons 1 to 10).
- **Sources:** the `pron_tip` rows in `data/letters.csv` and `data/vowels.csv` for those units. The app shows them under "More" (`teach_card.js` line 180).
- **Words:** the `pron_tip` of all 29 words in `data/lesson_items.csv` (lessons 1 to 11, bonus words included). The app shows them under "More" on the word card (line 222).
- **Not yet taught:** letters and vowels, in section B (lower priority).

Verdicts:
- **ok:** works for General American (GA), Southern British (SSB/RP) and General Australian (AusE).
- **ok (wording):** the sound is right, but the text uses a technical word ("aspirated", "unreleased") that the brief says to avoid.
- **misleading:** fine for some accents, or roughly right, but points learners towards a neighbouring Lao sound.
- **wrong:** points to the wrong vowel for all three accents.
- **?** after a verdict: uncertain; a native speaker should confirm.

## Counts (taught material, 74 hints)

| | wrong | misleading | ok | ok (wording) |
|---|---|---|---|---|
| Unit cards (`units.csv`, 23) | 1 | 3 | 19 | 0 |
| Source tips for those units (`letters.csv`/`vowels.csv`, 22) | 1 | 3 | 13 | 5 |
| Word tips (`words.csv`, 29) | 2 | 9 | 14 | 4 |
| **Total** | **4** | **15** | **46** | **9** |

All the wrong and misleading hints come from one of four problems:
1. **ແ = "a in 'cat'"** (V15 and the words ແລ້ວ, ແນ່, ແກ້ວ).
2. **◌ໍ / ◌ອ◌ = "aw in 'law'"** (V21, V22 and the words ບໍ່, ຂໍ, ຂ້ອຍ, ນອນ, ນ້ອຍ).
3. **Short ◌ິ = "i in 'bit'/'bin'/'din'"** (V04, ກິນ, ດິນ).
4. **English-looking respellings that English readers say with the wrong vowel** ("dam" for ດຳ).

---

## A. Taught material: summary table

### A1. Unit cards (`data/units.csv`, `teach_en`)

| id | Lao | IPA | verdict | proposed text (card) |
|---|---|---|---|---|
| C01 | ກ | k | ok | Keep: "Like the k in 'sky': a k with no puff of air." Optional addition: "To English ears it can sound close to g." |
| C13 | ນ | n | ok | Keep. |
| C13f | ◌ນ | n | ok | Keep. |
| V04 | ◌ິ | i | misleading ? | "A short, tight 'i': between the i in 'bit' and the ee in 'see', said quickly. Written above the consonant, but said after it." |
| C02 | ຂ | kʰ | ok | "A k with a puff of air, as in the word 'kite'. Not like ກ, which has no puff." |
| T2 | ◌້ | (tone) | ok | Keep (not a sound comparison). |
| V35 | ເ◌ົາ | aw | ok | Keep ("now"; "cow" also works). Minor: the AusE 'now' starts nearer [æ], but that is close enough. |
| C23 | ລ | l | ok | Keep. |
| C24f | ◌ວ | w | ok | Keep. |
| V03 | ◌າ | aː | ok | Keep. Optional: "Like the a in 'father' or 'spa'." |
| V36 | ◌ຳ | am | ok | Keep. |
| V15 | ແ◌ | ɛː | **wrong** | "Between the e in 'bed' and the a in 'cat', held long: open your mouth a little wider than for 'bed'. Keep it steady: not the 'ay' in 'say', which is a different vowel. Written before the consonant; it looks like two ເ side by side." |
| C14 | ບ | b | ok | Keep. Optional: "Like the b in 'boy', a full, buzzing b." The "not ປ" warning goes on the ປ card when ປ is taught. |
| T1 | ◌່ | (tone) | ok | Keep. |
| V21 | ◌ໍ | ɔː | misleading | "A long, open 'aw': say 'ah', then round your lips without closing your mouth. Not 'oh'. Just a small circle above the consonant, with no stroke after it." |
| C09 | ດ | d | ok | Keep. The "not ຕ" warning goes on the ຕ card. |
| V05 | ◌ີ | iː | ok | "Like the ee in 'see', held long and steady. It sits above the consonant and looks like ◌ິ from lesson 1 with one more stroke." The optional length clause "◌ິ is the same sound, said short" conflicts with the "no length wording on the card front" review decision: owner to choose. |
| C06 | ສ | s | ok | Keep. |
| C08f | ◌ຍ | j | ok | Keep. |
| V01 | ◌ະ | aʔ | ok | Keep. |
| C05 | ຈ | tɕ | ok | Keep. |
| C25 | ຫ | h | ok | Keep. |
| V22 | ◌ອ◌ | ɔː | misleading | "A long, open 'aw' (say 'ah', then round your lips; not 'oh'). The same sound as the little circle vowel in ບໍ່, but written around the consonant, with a letter after it." |

R01 (cut-off card) and R02 (recap) only repeat the V01/V03/V35/V36 cues, which are all ok. Nothing to change there.

### A2. Source tips for the same units (`letters.csv` / `vowels.csv` `pron_tip`, shown under "More")

| id | Lao | IPA | verdict | proposed text |
|---|---|---|---|---|
| C01 | ກ | k / k̚ | ok (wording) | "A k with no puff of air, like the k in 'sky', so English ears often hear it as g (as in 'gas'). At the end of a syllable, stop the sound without letting the k pop out, like the k in 'backpack' said fast." |
| C02 | ຂ | kʰ | ok (wording) | "A k with a puff of air, as in 'kite'. Same sound as ຄ; the class letter only changes the tone. Not ກ (no puff)." |
| C05 | ຈ | tɕ | ok | Keep. |
| C06 | ສ | s | ok | Keep. |
| C08 | ຍ | ɲ / j | ok | Keep. Optional: add "like the ny in 'canyon', but at the start of a word". |
| C09 | ດ | d / t̚ | ok (wording) | "d as in 'deck'. At the end of a syllable it is a t that stops without a puff, like the t in 'hot dog' said fast." |
| C13 | ນ | n | ok | Keep. |
| C14 | ບ | b / p̚ | ok (wording) | "b as in 'boy'. At the end of a syllable it is a p that stops with the lips closed and no puff, like the p in 'top man' said fast." |
| C23 | ລ | l | ok | Keep. |
| C24 | ວ | ʋ~w / w | ok | Keep. |
| C25 | ຫ | h | ok | Keep. |
| T1, T2 | ◌່ ◌້ | (tone) | ok | Keep. These are not sound comparisons. |
| V01 | ◌ະ | aʔ | ok | Keep. |
| V03 | ◌າ | aː | ok | Keep. |
| V04 | ◌ິ | i | misleading ? | "Short 'i', tighter than the i in 'bit', nearer a quick 'ee'." (The current text, "as in 'bit' but tenser", already says this; leading with 'bit' is the problem.) |
| V05 | ◌ີ | iː | ok | "Long 'ee' as in 'see', held steady." |
| V15 | ແ◌ | ɛː | **wrong** | "Long, open 'e': between the e in 'bed' and the a in 'cat', held steady. Not the 'ay' in 'say' (that is ເ◌)." |
| V21 | ◌ໍ | ɔː | misleading | "Long, open 'aw': say 'ah' and round your lips. Close to American 'saw' said with rounded lips, or the o in British/Australian 'hot' held long. Not 'oh' (that is ໂ◌), and not British/Australian 'law', which is too close to 'oh'." |
| V22 | ◌ອ◌ | ɔː | misleading | Same as V21, plus "before a final consonant". |
| V35 | ເ◌ົາ | aw | ok | Keep. |
| V36 | ◌ຳ | am | ok | Keep. |

(For the counts, T1 and T2 are one row each; the table groups them.)

### A3. Word tips (`words.csv`, `pron_tip`, shown under "More")

Tone wording is left as it is. Only the "sounds like" part is judged.

| id | Lao | IPA | verdict | proposed text |
|---|---|---|---|---|
| W000001 | ສະບາຍດີ | sa.baːj.diː | ok | Keep. |
| W000002 | ດີ | diː | ok | Keep. |
| W000003 | ບໍ່ | bɔː | misleading | "'baw': b + a long, open 'aw' (mouth open, lips rounded; not 'boh'), said flat and level. The same word ends yes/no questions: ດີບໍ່? 'Is it good?'" |
| W000005 | ເຈົ້າ | tɕaw | ok | Keep. |
| W000006 | ຂ້ອຍ | kʰɔːj | misleading | "Close to 'coy', with a puff of air on the k and the 'aw' held long and open; falling from mid to low." |
| W000009 | ຂໍ | kʰɔː | misleading | "k with a puff of air + a long, open 'aw' (not 'oh'), starting low and rising." |
| W000011 | ນ້ຳ | nam | ok | Keep ("'num' as in 'number'"). |
| W000016 | ນີ້ | niː | ok | Keep. |
| W000018 | ກິນ | kin | misleading ? | "k with no puff of air (it can sound like g) + a short, tight 'i' + n: between 'gin' and 'keen', said short." |
| W000019 | ເຂົ້າ | kʰaw | ok (wording) | "k with a puff of air + 'ow' as in 'now', falling. ກິນເຂົ້າ = eat (a meal)." |
| W000020 | ແລ້ວ | lɛːw | **wrong** | "'laew': l + a long, open 'e' (between 'bed' and 'cat') + a w glide, like 'leh-oo' run together; high and falling. Not 'lay-oo'." |
| W000031 | ລາວ | law | ok | Keep (the short-vowel reading matches Wiktionary; already in QUESTIONS). |
| W000033 | ນອນ | nɔːn | misleading | "'nawn': a long, open 'aw' (not 'oh') between two n's, rising to high. Not English 'known'." |
| W000049 | ບ້ານ | baːn | ok | Keep. |
| W000058 | ລາວ | laːw | ok | Keep. |
| W000072 | ຫິວ | hiw | ok | Optional clarification: "'hiw': h + a short 'ee' + a w glide, like 'hee-oo' run together quickly; low-rising." |
| W000082 | ຫ້າ | haː | ok | Keep. |
| W000084 | ຂາຍ | kʰaːj | ok (wording) | "k with a puff of air + 'aai' (rhymes with 'bye', held longer), low-rising." |
| W000090 | ນ້ອຍ | nɔːj | misleading | "Close to 'noy', with the 'aw' held long and open; high and falling." |
| W000218 | ແກ້ວ | kɛːw | misleading | "k with no puff of air (can sound like g) + a long, open 'e' (between 'bed' and 'cat') + a w glide; high and falling. Not 'gay-oo'." |
| W000389 | ຂາ | kʰaː | ok (wording) | "k with a puff of air + a long 'a' as in 'father', low-rising." |
| W000512 | ສະບາຍ | sa.baːj | ok | Keep. |
| W000536 | ສີ | siː | ok | Keep. |
| W000538 | ຂາວ | kʰaːw | ok (wording) | "k with a puff of air + 'aao' (a long 'a' as in 'father', then a w glide), low-rising." |
| W000539 | ດຳ | dam | misleading | "Sounds like 'dum' (the vowel of 'hum'), low-rising. Not English 'dam'." |
| W000546 | ດາວ | daːw | ok | Keep. |
| W000550 | ດິນ | din | misleading ? | "Short 'din' with a tight 'i' (between 'din' and 'deen'), low-rising." |
| W000629 | ຈານ | tɕaːn | ok | Keep. |
| W001426 | ແນ່ | nɛː | **wrong** | "'nae': n + a long, open 'e' (between 'bed' and 'cat'), level. Not 'nay'. It sits at the end of a request to soften it." |

---

## Notes

### 1. ແ◌ /ɛː/: why "a in 'cat'" is wrong
Lao ແ is an open-mid front vowel [ɛː] (Wikipedia, Lao alphabet; Wiktionary ແລ້ວ [lɛːw˥˨]). English 'cat' misses it in all three accents:
- **SSB/RP:** 'cat' is now [a] (fully open). Learners who follow the hint drift toward ◌າ.
- **GA:** 'cat' is [æ], and before nasals it often glides as [eə] (Help:IPA/English note on /æ/). Too open, and it can glide.
- **AusE:** 'cat' is [æ], and for younger speakers [a] (Wikipedia, Australian English phonology). Too open.
- **'bed' alone does not work either:** it is [ɛ] in GA and SSB (near-perfect quality, but short), while AusE 'bed' is close-mid [e], which is the Lao ເ vowel.

**"Between 'bed' and 'cat'"** lands on [ɛ] in every accent, and saying it is held long covers the length. The owner hears it as "eh" or as the "ay in lay". That fits [ɛː], and if the owner's accent starts FACE low (AusE 'lay' is [læɪ] to [laɪ]), the start of their 'lay' really is close to ແ. To other accents "ay" means [eɪ], which is ເ◌, so the hint must not use 'say'/'lay' as the anchor. It should only use them as the "not" warning.

The proposed pair uses 'bed' as the pivot:
- **ແ:** wider than 'bed', toward 'cat'.
- **ເ:** tighter than 'bed', toward 'ay' but steady.

### 2. ◌ໍ / ◌ອ◌ /ɔː/: why "aw in 'law'" depends on accent
- **SSB and AusE:** THOUGHT ('law') is [oː] (AusE phonology: "near-close back rounded [oː]"). That is the Lao ໂ◌ vowel, not ◌ໍ, so a British or Australian learner told 'law' will say ບໍ່ like "boh".
- **GA:** speakers with the cot–caught merger (most of the West and Canada, many others) say 'law' as [ɑ]. That is close to ◌າ, so ບໍ່ drifts toward "bah".
- Only GA speakers without the merger get roughly [ɔ].

No single English word works for all three, so the proposed card gives an instruction instead ("say 'ah', then round your lips without closing your mouth; not 'oh'"). The accent-specific anchors (American 'saw' with rounded lips; British/Australian 'hot' held long) go in the "More" tip.

The same problem will hit ເ◌າະ / ◌ັອ◌ (short ɔ) later. The respelling "aw" itself (baw, kaw, nawn) is read [oː] by British and Australian readers. The Standard-style romanizations in QUESTIONS ("bor", "khor") are worse for Americans, who read 'bor' as 'bore' with an r.

### 3. Short ◌ິ /i/: 'bit' versus tighter
- **Sources:** Wikipedia and Wiktionary give /i/ for both lengths, and Lao short vowels differ from long ones mainly in length. SEAsite (Pronunciation Note 17) compares the short vowel to 'fit', and the short u to 'put'.
- **Why it is still marked misleading:** English 'bit'/'bin'/'din' [ɪ] is lower and more central in GA and SSB, so ກິນ said as English "gin" is a slightly different vowel.
- **AusE:** KIT is already close to [i], so 'bit' works.

The verdict is marked "?": the source the project cites uses the lax English vowel too. The proposal keeps 'bit' but adds "tighter, nearer a quick 'ee'". That is what the vowels.csv tip already says.

### 4. Respellings English readers say with the wrong vowel
These affect the "sounds like" cell, not just the tips:
- **ດຳ "dam":** a GA reader says [dæm] or [deəm]. The vowel is the short [a] of ນ້ຳ "nam", so the tip should say "dum".
- **ນ້ຳ:** fine, because its tip says "num". ດຳ needs the same treatment.

Future hazards in the respelling scheme, outside this audit's text changes:

| Respelling | Lao | An English reader says | Effect |
|---|---|---|---|
| **ee** | ເ◌ | [iː] as in 'see' | Collides with ◌ີ "ii" in the reader's mind. |
| **oo** | ໂ◌ | [uː] as in 'food' | Collides with ◌ູ "uu". |
| **ae** | ແ◌ | no fixed English value | Read variously as 'ay', 'ee' or 'a'. |
| **oe** | ເ◌ີ | no fixed English value | Unclear. |

The ee/oo problem gets serious once ເ◌ and ໂ◌ are taught. A scheme change (for example ເ◌ "ay", ແ◌ "aeh" or "eh", ໂ◌ "oh") needs an owner decision. It is not part of this audit.

### 5. Aspiration wording
The cards already use "puff of air". The word tips (ຂ×5, ກ×2) and letters.csv still say "aspirated/unaspirated" and "unreleased", so the table rewrites those. The C01 card was changed on 2026-11-09 from 'a hard g' to 'sky' on purpose; 'sky' is phonetically correct in all accents, so it stays. "Can sound close to g" is an optional addition.

### 6. ບ / ດ
- Lao ບ and ດ are fully voiced [b], [d].
- English initial b/d is often only partly voiced [b̥ d̥].
- Lao ປ and ຕ (plain [p], [t]) sound to English ears like b/d (SEAsite: ປ 'spy', ຕ 'stay').
- **The real confusion therefore comes when ປ and ຕ are taught.** The "not like X" warnings belong on the ປ and ຕ cards (section B), not on ບ/ດ now.

### 7. Smaller accent points (kept as ok)
- **'see':** AusE FLEECE is a glide ([ɪi], [əi]); adding "held steady" helps.
- **'now':** AusE MOUTH is [æo], close enough.
- **'father':** GA and SSB [ɑː] is back, AusE [ɐː] is central, and Lao [aː] sits between them. Fine.
- **'hum' / 'uh':** GA [ʌ], SSB/AusE [ɐ]. Fine for Lao short a.

---

## B. Not yet taught: proposed hints (lower priority)

### B1. Vowels (`vowels.csv`)

| id | Lao | IPA | current | verdict | proposed |
|---|---|---|---|---|---|
| V02 | ◌ັ◌ | a | 'u' in 'hut' | ok | Keep. |
| V06 | ◌ຶ | ɯ | 'oo' without rounding | ok | "No English sound: say 'ee', then pull your tongue back while keeping your lips spread (a slight smile). Short." |
| V07 | ◌ື | ɯː | long unrounded 'oo' | ok | Same as V06, "held long". |
| V08 | ◌ຸ | u | 'oo' in 'book' | misleading ? | "A short, tight 'oo' with rounded lips, like a quick 'oo' in 'food' (tighter than 'book')." SEAsite uses 'put'; check. |
| V09 | ◌ູ | uː | 'oo' in 'food' | ok | "Long 'oo' as in 'food', with lips well rounded and pushed forward." (SSB/AusE 'food' is fronted [ʉː].) |
| V10 | ເ◌ະ | eʔ | "Short 'e', cut off" | ok (vague) | "A short, tight 'e', like the start of 'ay' with no slide, cut off. Not ແ◌ະ (wider)." |
| V11 | ເ◌ັ◌ | e | 'e' in 'pet' | misleading | "Short 'e' as in 'pet', but tighter (toward 'ay'). Not ແ◌ັ◌ (wider)." In GA/SSB 'pet' [ɛ] is the ແ vowel. |
| V12 | ເ◌ | eː | 'ay' in 'they', no glide | misleading (AusE) | "Long, steady 'e': like 'ay' in 'say' without sliding to 'ee' (Australian speakers: the e of 'bed', held long). Not ແ◌, which is wider." |
| V13 | ແ◌ະ | ɛʔ | 'a' in 'cat', cut off | **wrong** | "Short 'e' as in 'bed', with the mouth a little wider (toward 'cat'), cut off. Not ເ◌ະ." |
| V14 | ແ◌ັ◌ | ɛ | 'a' in 'cat' | **wrong** | Same as V13, "before a final consonant". |
| V16 | ໂ◌ະ | oʔ | "Short 'o', cut off" | ok (vague) | "A short, tight 'oh' with rounded lips, cut off." |
| V17 | ◌ົ◌ | o | "Short 'o'" | ok (vague) | "A short, tight 'oh', like 'o' in 'boat' said very short. Not the o of 'hot' (that is ◌ອ◌/ເ◌າະ)." |
| V18 | ໂ◌ | oː | 'o' in 'go', no glide | misleading (SSB/AusE) | "A pure 'oh' with tight rounded lips, held steady (no slide to 'oo'). British and Australian 'law' is very close. Not ◌ໍ (more open)." SSB 'go' [əʊ] and AusE [æʉ] are far off. |
| V19 | ເ◌າະ | ɔʔ | "Short 'aw', cut off" | misleading | "Short, open 'aw' (say 'ah' and round your lips), cut off; close to the o in British 'hot'. Not 'oh'." |
| V20 | ◌ັອ◌ | ɔ | "Short 'aw'" | misleading | Same as V19, before a final consonant. |
| V23 | ເ◌ິ | ɤ | 'uh', lips spread | ok | Keep. |
| V24 | ເ◌ີ | ɤː | 'ur' in 'fur' without r | ok | "Like 'uh' held long with lips spread, close to British 'er' in 'her'. No r, no lip rounding." (GA 'fur' is r-coloured; AusE NURSE is slightly rounded.) |
| V25 | ເ◌ັຍ | iaʔ | short 'ia' | ok | Keep. |
| V26, V27 | ເ◌ຍ, ◌ຽ◌ | ia | 'ee-a' as in 'Mia' | ok | Keep. |
| V28, V29 | ເ◌ຶອ, ເ◌ືອ | ɯa | unrounded 'oo' to 'a' | ok | "Start with the ◌ື sound (lips spread) and glide to 'a'." |
| V30–V32 | ◌ົວະ ◌ົວ ◌ວ◌ | ua | 'oo-a' as in 'Kahlua' | ok | Keep. Optional: "'oo-uh' run together". |
| V33, V34 | ໄ◌, ໃ◌ | aj | 'ai' as in 'Thai' | ok | Keep (or "'eye'"). |

### B2. Consonants (`letters.csv`)

| id | Lao | IPA | current | verdict | proposed |
|---|---|---|---|---|---|
| C03 | ຄ | kʰ | aspirated k, 'kite' | ok (wording) | "k with a puff of air, as in 'kite'. Same sound as ຂ. Not ກ." |
| C04 | ງ | ŋ | 'ng' of 'singer' | ok | Keep. Optional practice: "say 'sing-ah', then drop the 'si'". |
| C07 | ຊ | s | 'saw' | ok | Keep. |
| C08 (initial) | ຍ | ɲ | 'ny', Spanish ñ | ok | "Like the ny in 'canyon', but at the start of a word." |
| C10 | ຕ | t | t in 'stay' | ok | "Like the t in 'stay': no puff of air, so it can sound like d to English ears. Not ດ (a full d) and not ທ/ຖ (t with a puff)." |
| C11, C12 | ຖ, ທ | tʰ | aspirated t, 'top' | ok (wording) | "t with a puff of air, as in 'top' (not the 'th' of 'think'). Not ຕ." |
| C15 | ປ | p | p in 'spy' | ok | "Like the p in 'spy': no puff of air, so it can sound like b to English ears. Not ບ (a full b) and not ພ/ຜ (p with a puff)." |
| C16, C18 | ຜ, ພ | pʰ | aspirated p, 'pie' | ok (wording) | "p with a puff of air, as in 'pie' (not an f). Not ປ." |
| C17, C19 | ຝ, ຟ | f | 'finch' | ok | Keep. |
| C20 | ມ | m | 'man' | ok | Keep. |
| C21 | ຢ | j | 'young' | ok | Keep. |
| C22 | ຣ | r→l | like ລ | ok | Keep. |
| C24 (initial) | ວ | ʋ~w | between w and v | ok | Keep. |
| C26 | ອ | ʔ | silent carrier / 'uh-oh' | ok | Keep. |
| C27 | ຮ | h | 'hang' | ok | Keep. |
| C28–C33 | ຫງ ຫຍ ໜ ໝ ຫຼ ຫວ | as base | "same sound as …" | ok | Keep. |
| Finals | ◌ກ ◌ດ ◌ບ | k̚ t̚ p̚ | "unreleased" | ok (wording) | See C01/C09/C14 in A2 ('backpack', 'hot dog', 'top man' said fast). |
| Finals | ◌ງ ◌ມ | ŋ m | 'sing', 'man' | ok | Keep. |

The voiced/plain/puff three-way contrast is ບ/ປ/ພ and ດ/ຕ/ທ. It is the hardest one for English speakers, and the "not X" warnings above are its main defence. If one recap card for the trio is planned, it should repeat them.

---

## Sources
- Wikipedia, "Lao alphabet": vowel and consonant IPA table, ແ◌ = /ɛː/, ◌ໍ = /ɔː/, ວ [ʋ]~[w]. https://en.wikipedia.org/wiki/Lao_alphabet
- Wikipedia, "Lao language": phonology (aspirated/plain/voiced stops; /ʋ/~/w/; Vientiane notes). https://en.wikipedia.org/wiki/Lao_language
- Wikipedia, "Help:IPA/English": accent notes for TRAP, THOUGHT, LOT and the mergers. https://en.wikipedia.org/wiki/Help:IPA/English
- Wikipedia, "Australian English phonology": TRAP [æ]~[a], DRESS [e], FACE [æɪ], THOUGHT [oː], SQUARE [eː], FLEECE [ɪi]. https://en.wikipedia.org/wiki/Australian_English_phonology
- Wiktionary ແລ້ວ: Vientiane [lɛːw˥˨]. https://en.wiktionary.org/wiki/ແລ້ວ
- Wiktionary ລາວ: pronoun [law˧˥] short; noun [laːw˧˥]. https://en.wiktionary.org/wiki/ລາວ
- SEAsite (NIU):
  - Lao for Tourists pronunciation: consonant anchors 'gas', 'stay', 'spy', 'saw', 'law', 'nyet', and 'cow' for ເ◌ົາ. https://seasite.niu.edu/lao/LaoLanguage/Lao_for_Tourist/LaoForTourist_pronunciation.htm
  - Pronunciation Note 17: ii like 'feet', short i like 'fit', short u like 'put'. https://seasite.niu.edu/Lao/LaoLanguage/pronunciation_notes/pronunciation_note17.htm
  - Search snippets only, not opened: Note 5 (no r in "ee") and a note warning that Lao "oo" (ໂ) is not English "oh".
  - The SEAsite vowel-sounds page gives sample words only, no English comparisons. https://seasite.niu.edu/lao/LaoLanguage/LaoAlphabet/LaoVowelSounds.htm
- Accent descriptions (GA/SSB vowel qualities) are standard phonetics, partly from the agent's own knowledge: **unverified** beyond the pages above.

## Questions for the native speaker (for docs/QUESTIONS.md)
1. **ແ vs ເ:** in ແລ້ວ (laew, "already"), ແນ່ (nae, request softener) and ແກ້ວ (gaew, "glass"), is the vowel closer to English "bed" said long, or to "cat"? Please say a ແ◌ word and a ເ◌ word side by side so the owner can hear the gap. (The existing lesson 5 question about ແລ້ວ and 'cat' can be merged into this one.)
2. **◌ໍ / ◌ອ◌:** in ບໍ່ (baw, "not"), ຂໍ (kaw, "may I have") and ນອນ (nawn, "sleep"), is the vowel nearer an open "ah" with rounded lips, or nearer "oh"? Does it sound like ບໍ່ when the owner says "baw" in their own accent?
3. **Short ◌ິ:** in ກິນ (gin, "eat") and ດິນ (din, "earth"), does English "gin"/"din" sound right, or does the vowel need to be tighter (nearer "keen"/"deen" but short)?
4. **ດຳ (dam, "black"):** is the vowel the same as in ນ້ຳ (nam, "water"), i.e. the "u" of "hum", not English "dam"?
5. **ບ/ປ and ດ/ຕ:** when the owner says English "boy" and "deck", do they sound like ບ/ດ or like ປ/ຕ to her? (This decides whether the ບ/ດ cards need "a full, buzzing b/d".)
6. **Short ◌ຸ** (for later): is it like the "u" in "put", or tighter?
7. **For the owner:** which English accent do you speak (US, UK, Australian, other)? Your hearing ແ as "ay in lay" suggests an accent whose 'lay' starts low, which would make some anchors work differently for you.

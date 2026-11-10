# Requests for the human

<!-- Agent adds: scripts to approve (path + purpose), domains/URLs to allow, decisions needed. Human clears handled items. -->

## Decisions (resolved in chat 2026-10-09)
- Respelling: English-friendly scheme, written in SCHEMA.md. The chat preview wrote ຂ as "kh"; the scheme uses "k", as in the option's description.
- Rare items (ຣ, ເ◌ັຍ ເ◌ຶອ ◌ົວະ, ແ◌ັ◌ ◌ັອ◌): reading-only.

## To resolve later
- **ບໍ່ vs ບໍ** (question marker). Wiktionary has only ບໍ່, with both the "no" and the question senses. Tatoeba often writes the question marker without the tone mark (ບໍ). Batch 1 uses ບໍ່ for both (user, 2026-10-09: "resolve the correct spelling later").
- **Deferred, low priority:** ອັນ (thing / general classifier; only found inside ອັນນີ້ and ອັນໃດ) and ແດ່ (softening "please"; no sourced gloss).
- **Noun classifiers:** none are given on the Wiktionary pages for the batch-1 nouns. A classifier source is still needed.

## Phase 5 (words 601–1000) review items, 2026-10-10
- **Spellings settled from Wiktionary:** ໄມ້ຖູ່ chopsticks (replaces the draft ຕະເກຍບ), ປ້ຳນ້ຳມັນ gas station, ວັນທີ່ date (translation table; ວັນທີ without the mark has no entry), ຫໍພິພິດຕະພັນ museum and ເວັບໄຊຕ໌ website (translation tables only; single source).
- **Unsourced spellings (agent knowledge):** ກະຕິບ sticky-rice basket (all variants 404), ໂມໂຫ, ຫ້ອງນັ່ງຫຼິ້ນ, ວິນຫົວ, ບັນໄດ, ປະຕິທິນ, ໄວຟາຍ, ບາສີ.
- **Loanword tones** derived from the spelling and possibly different in speech: ຕຸກຕຸກ, ແທັກຊີ, ຄລີນິກ, ເວັບໄຊຕ໌. Add confirmed irregular tones to data/tone_exceptions.csv.
- **kw-cluster IPA:** Wiktionary keeps writing ກວ/ຄວ as -uːə̯- (ກວາດ, ຄວາມຮູ້ສຶກ, ຂໍ້ຄວາມ). The project otherwise uses kw-/kʰw-. Tones are unaffected; the IPA style is inconsistent until this is decided.
- **Classifiers** in the new batch are mostly agent assumptions (noted per row). ຄູ່ (pair, the classifier for ໄມ້ຖູ່) is not a word yet. ມືຖື has none (ໜ່ວຍ or ເຄື່ອງ?).

## Classifiers (2026-10-10)
- 453 of 534 noun classifier assignments are agent knowledge (`classifier_confidence=unverified`); only 10 were confirmed on Wiktionary.
- Doubtful assignments:
  - ຕຽງ: ອັນ or ຫຼັງ?
  - ຕູ້ເຢັນ: ອັນ or ຫຼັງ?
  - ແວ່ນຕາ: ອັນ or ຄູ່?
  - ມີດ: Wiktionary says ດວງ; is ດ້າມ more usual?
  - ວຽກ: self, or not counted?
  - ແຂ້ວ: self?
  - ເລກ: ໂຕ?
  - ກະແຈ: ດອກ?
  - Paired body parts (ຕາ ມື ຕີນ ຫູ ຂາ ແຂນ ບ່າ ເຂົ່າ): ຂ້າງ?
- Changed: ໝອນ from ອັນ to ໃບ.
- The 10 missing classifier words were added as W0991–W1000 (resolved 2026-10-10). Five have no Wiktionary entry (ຜືນ ກ້ອນ ດວງ ດ້າມ ສະບັບ), so their IPA is by the agent.
- ມີດ (knife): the classifier is ດວງ per Wiktionary's ມີດ page. Wiktionary's ເຫຼັ້ມ page says "pointed objects", and ດ້າມ is also plausible. Which is usual in Vientiane?

## Test batch t1 (hobbies, W001001–W001015)
- ງານອະດິເລກ "hobby": spelling modelled on Thai งานอดิเรก; not on Wiktionary.
- ກີຕາ vs ກີຕ້າ (guitar): the mark changes the tone. Also the loanword tone of ເກມ (game).
- ໜັງ "movie" and ເລື່ອງ as the classifier for films and novels are agent knowledge (Wiktionary gives skin / story).
- Sentences t1 S029/S031 use ເປັນ for "know how to".

## For the native speaker (lessons 1–3, 2026-11-09)
- ເຂົາ (W000160): the owner has only heard it as "they/them", with ລາວ as the everyday "he/she". The gloss was changed
  from Wiktionary's "he; she; they" to "they; (more formal) he; she". Is that right for Vientiane speech?
- Composed lesson sentences to confirm: ກິນເຂົ້າ "to eat (a meal)" (S000002870), ລາວກິນເຂົ້າ "He eats. / She eats."
  (lesson 3), ເຂົາກິນເຂົ້າ "They eat." (S000002871, held for a later lesson).
- ລາວ "he, she" (W000031) is recorded with a short vowel (law, "lao") and ລາວ "Lao" (W000058) with a long one
  (laːw, "laao"), per Wiktionary. Is the pronoun really shorter in normal speech? The lesson 3 card shows one
  respelling ("lao") for both, and the ◌າ card avoids the word "long" because of this.
- Tone of ເຂົ້າ (low-falling) and ເກົ້າ (high-falling) as stored: do they match Vientiane speech?

## Awaiting approval
- `_agent/proposed-scripts/tone_derive.py`: derives tones per syllable and cross-checks against recorded tones and IPA. Run with `--selftest` first.

## Source disagreements on tone rules (2026-10-09)
Details: `_agent/research/lao-tones-wiktionary-fsi-kerr.md` §7. The matrix in SCHEMA.md follows the majority.
- **D1, cell 11 (mid class, dead, long vowel):** low-falling per SEAsite, Wiktionary (table and module) and Wikipedia 7.1.1. The Hartmann 2002 table as transcribed on Wikipedia 3.1 says high-falling, which contradicts its own cited SEAsite chart. Majority used: low-falling. Affects e.g. ຢາກ, ປາກ.
- **D3, cell 15 (low class, dead, short vowel):** mid per SEAsite (ພັກ, ເຮັດ), Wiktionary and Wikipedia 3.1/7.1.1. Wikipedia 5.3 (generic Lao, not labelled Vientiane) gives ຮັກ "love" as low. Majority used: mid. A native speaker's check of ຮັກ would settle it.
- **D2, cells 13–14:** Hartmann calls these "mid-rising" where everyone else says high(-rising). Probably the rise starts lower; same category. Possibly worth a pron_tip note.
- **D5/D6:** exact Chao values differ slightly between sources (e.g. 31 vs 21), and some sources count 6 tones instead of 5 (Kerr, FSI, Levy 1982). Five were chosen, per Wiktionary/Osatananda.

## Batch c1 (restaurants, W001016–W001071): doubtful items
- Agent-guessed spellings (not on Wiktionary): ເສີບ / ພະນັກງານເສີບ "serve, waiter"; ມັງສະວິລັດ "vegetarian" (modelled on Thai).
- Meanings or IPA by agent: ນົວ "savoury"; ລະ "each, per"; ຊີ້ນດາດ; ເຂົ້າຊອຍ; ກອບ "crispy"; ຄົວ "kitchen"; ໃສ່ "add (to food)" sense; ຜັກຫອມ "coriander, herbs".
- Word order ໄກ່ປີ້ງ vs ປີ້ງໄກ່; the sentence ຂ້ອຍກິນມັງສະວິລັດ may be unnatural.

## Batch c2 (clothes, W001072–W001132): doubtful items
- Spellings not on Wiktionary: ຜ້າບ່ຽງ "shoulder sash"; ຕ່ຳ "weave"; ໂສ້ງຢີນ "jeans"; ຊິບ "zip"; ສ້ອຍຄໍ, ສ້ອຍແຂນ "necklace, bracelet"; ວົງ (classifier for rings); ຜົງຊັກຟອກ.
- Senses by agent: ຕີນສິ້ນ "woven hem"; ເບີ "size"; ຄັບ "tight"; ເງິນ "silver".
- ສາຍແອວ: Wiktionary IPA garbled, IPA copied from ແອວ.
- ຖົງເທົ້າ (Wiktionary) vs ຖົງຕີນ for "socks": which is commoner in Vientiane?
- New homograph ຄຳ "gold" (W001099) beside ຄຳ "word" (W000565).

## Batch c3 (gardening, W001133–W001193): doubtful items
- New homograph ບານ "to bloom" (agent knowledge; Wiktionary has only "ball").
- Spellings not on Wiktionary: ຫ່ຽວ "wilted"; ກະຖາງ "flowerpot" (maybe Thai); ຈົກ "hoe"; ສຽມ "spade".
- Senses by agent: ຝຸ່ນ "fertiliser"; ຫົດ "to water" used without ນ້ຳ.
- Component lists are inconsistent for compounds whose parts have other meanings (ດຳນາ, ຄັນນາ, ຊາວສວນ, ເມັດພັນ list only the matching part; older ຊາວນາ lists ຊາວ "twenty"). Decide one rule. From c4 on, drafters list every part whose spelling is a known word.

## Batch c4 (fruits + vegetables, W001194–W001271): doubtful items
- Only 13 of 78 words on Wiktionary; 65 have agent IPA.
- Spellings by agent: ໂຫລະພາ "basil"; ໝາກຂີ້ຫູດ "kaffir lime"; ເຫັດເຟືອງ; ເຫັດປວກ; ກະລຳປີ "cabbage"; ໝາກໄຟ.
- Senses by agent: ຫ່າມ "half-ripe"; ຝານ "slice thinly"; ຂີດ "100 g"; ຫົວຜັກກາດ "radish"; ສາລີ alone for "corn"; ຜັກຊີ "dill".
- Classifiers ດອກ for mushrooms, ຝັກ for corn and tamarind: guesses.

## Batch c5 (meat + animals, W001272–W001350): doubtful items
- New homographs: ເຂົາ "horn" (Wiktionary) and ມັນ "fat, grease" (agent knowledge only; ມັນໝູ "lard" builds on it).
- Agent spellings or IPA: ສັດຕະວະແພດ "vet"; ປາດຸກ; ແມງງອດ (IPA); ກັດ "bite" (404, surprising); ຂັນ "crow"; ກ້ອຍ; ເລົ້າ "coop"; ນົກຍູງ "peacock"; ປາວານ "whale"; ແຫ "cast net".
- ໂຕຜູ້ / ໂຕແມ່ drafted as nouns; mostly modifiers. Note: ຜູ້ is not yet a word in the data.
- Body-part classifiers (ປີກ, ເຂົາ, ຂົນ, ຫາງ, ເລັບ, ເກັດ) are guesses.

## Batch c6 (transport + directions, W001351–W001424): doubtful items
- Agent spellings or senses: ເພ "broken down" (vs ເສຍ); ລົດເກັງ "sedan"; ຄິວລົດ "terminal"; ລ່າຊ້າ "delayed" (maybe Thai); ຮ່ອມ "lane"; ຈະລາຈອນ (IPA); ຫ້າງ "mall"; ຟາກ, ເຮືອຂ້າມຟາກ; ຢາງ "tyre"; ກາງ "middle" (noun).
- ແຫ່ງ classifiers on ທາງມ້າລາຍ, ສາມແຍກ, ວົງວຽນ, ປ້າຍລົດເມ are guesses.
- ຜູ້ now exists; older compounds (ຜູ້ຊາຍ, ຜູ້ຍິງ, ຜູ້ຈັດການ, ໄກ່ຜູ້, ໂຕຜູ້) don't list it as a component yet.

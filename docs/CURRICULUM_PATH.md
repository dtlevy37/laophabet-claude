# Curriculum path, lessons 1–20 and beyond (agreed by the user, 2026-11-10)

This is the lesson order to build. The rules behind it are LESSON_RULES decisions 20–25. Lao sentences here were
composed by the agent; those used in lessons 1–12 were recorded as natural by the native speaker (verified
2026-11-17), later ones are unverified until she records them. Romanization is informal (the
user's spellings), tones not shown; it is for the owner's reading only and never goes into teach texts.

## Principles (from this conversation)
1. **Letters → words → sentences → conversations and stories.** Sentences reinforce words and letters; words
   reinforce letters. Each stretch of lessons builds up to a conversation.
2. **Work backwards from natural sentences.** Pick the next thing a person would really say, then add the letters
   it needs. No forced sentences just because the words are readable.
3. **Core words and bonus words.**
   - Core: used in sentences, the focus of the lesson.
   - Bonus: readable with the letters known, shown in the lesson under a "bonus" label, one or two per lesson,
     common words only. Never used in sentences. They also feed the practice section (flashcards, extra reading)
     alongside core words.
   - A bonus word becomes core the first time a lesson uses it in a sentence. This happens as we go, whenever
     a lesson has room. A lesson with no new letters (lesson 11) does it for several words at once: it reviews
     letters and still brings new content.
4. **Real spoken Lao, even when slightly irregular**, if the sentence is natural and useful (example: the softener
   *nae* in lesson 6).
5. **Conversations are canned content:** a fixed, ordered set of lines. After a conversation the learner gets
   fill in the blank (one logical answer) on its lines, so the lines must work as fill-in-the-blank sentences in
   the context of the conversation.

## Target conversation (complete in lesson 10)

| | Lao | Sounds like | English |
|---|---|---|---|
| A | ສະບາຍດີ | sabaidee | Hello |
| B | ສະບາຍດີ | sabaidee | Hello! |
| A | ເຈົ້າສະບາຍດີບໍ່? | jao sabaidee bor? | How are you? |
| B | ຂ້ອຍສະບາຍດີ | khoy sabaidee | I'm well. |
| A | ເຈົ້າຫິວເຂົ້າບໍ່? | jao hiu khao bor? | Are you hungry? |
| B | ຫິວ. ເຈົ້າຫິວເຂົ້າບໍ່? | hiu. jao hiu khao bor? | Yes, hungry. Are you hungry? |
| A | ບໍ່ຫິວ. ຂ້ອຍກິນເຂົ້າແລ້ວ | bor hiu. khoy kin khao leo | No. I've eaten already. |

Lao answers "yes" by repeating the verb, so no separate word for "yes" is needed.

## Sections and checkpoints (owner, 2026-11-14)
- A section is a run of lessons that ends at a natural topic boundary with a few sentences of dialogue or story. The
  loose size is about 15 lessons; the hard cap is 25-30. Plan new lessons so a section lands near 15.
- Its checkpoint (`sections` table, `#/checkpoint/<id>`) asks the hardest form of the section's items with no hints.
  It is never a gate: 70% or more marks the section done, less lists what to look at again.
- S01 = lessons 1-10 (ends with the conversation in lesson 10). Lesson 11 starts the next section. A section's
  boundaries are set in a hand-written migration until a CSV for sections exists.

## Lessons 1–4 (already built)

| Lesson | Letters | Core words | Sentences |
|---|---|---|---|
| 1 | ກ (k), ◌ິ (i), ນ (n) | ກິນ *kin* "eat; drink" | none |
| 2 | ຂ (kh), ເ◌ົາ (ao), ◌້ (tone mark) | ເຂົ້າ *khao* "rice" | ກິນເຂົ້າ *kin khao* "eat (a meal)" |
| 3 | ລ (l), ◌າ (aa), final ວ (w) | ລາວ *lao* "he; she; Lao" | ລາວກິນເຂົ້າ *lao kin khao* "He eats" |
| 4 | ◌ຳ (am) | ນ້ຳ *nam* "water" | ກິນນ້ຳ *kin nam* "drink water"; ລາວກິນນ້ຳ *lao kin nam* "She drinks water" |

**Changes to lesson 4** (lessons 1–3 stay as they are):
- Remove the sentence ລາວຂາວ *lao khao* "He is fair-skinned".
- ຂາ *khaa* "leg" stays, as the lesson's bonus word.
- ຂາວ *khao* "white" is a second bonus word (owner, 2026-11-12) and becomes core in lesson 11 (colours).

## Lessons 5–10 (new)

### Lesson 5: "already"
- **New letter:** ແ◌ (the "eh" vowel)
- **Core word:** ແລ້ວ *leo* "already"
- **Sentences:**
  - ກິນແລ້ວ *kin leo* "(I've) eaten already"
  - ລາວກິນເຂົ້າແລ້ວ *lao kin khao leo* "He has eaten already"
  - ລາວກິນນ້ຳແລ້ວ *lao kin nam leo* "She has had a drink already"
- **Bonus:** ແກ້ວ *kaeo* "glass"

### Lesson 6: "not", questions, asking for something
- **New letters:** ບ (b), ◌ໍ (the "or" vowel), ◌່ (a second tone mark)
- **Core words:** ບໍ່ *bor* "not; question word", ຂໍ *khor* "may I have", ແນ່ *nae* (softens a request)
- **Sentences:**
  - ລາວບໍ່ກິນເຂົ້າ *lao bor kin khao* "He doesn't eat"
  - ກິນເຂົ້າແລ້ວບໍ່? *kin khao leo bor?* "Have you eaten yet?" — ກິນແລ້ວ *kin leo* "Eaten already"
  - ຂໍນ້ຳແນ່ *khor nam nae* "Could I have some water?"
  - ຂໍເຂົ້າແນ່ *khor khao nae* "Could I have some rice?"
- **Bonus:** ບ້ານ *baan* "home; village"
- **Note:** three new letters and three words: the fullest lesson so far. The user will play-test it. If it
  runs long, the *khor … nae* half becomes its own lesson 7 and everything after shifts by one.

### Lesson 7: "good", "this"
- **New letters:** ດ (d), ◌ີ (the "ee" vowel)
- **Core words:** ດີ *dee* "good", ນີ້ *nee* "this"
- **Sentences:**
  - ດີແລ້ວ *dee leo* "That's fine / good"
  - ບໍ່ດີ *bor dee* "Not good"
  - ນ້ຳນີ້ດີ *nam nee dee* "This water is good"
  - ຂໍນ້ຳນີ້ແນ່ *khor nam nee nae* "Could I have this water?"
- **Bonus:** ດາວ *dao* "star", ດິນ *din* "soil; land"

### Lesson 8: hello
- **New letters:** ສ (s), ◌ະ (short "a"), final ຍ (the "i" ending)
- **Short explanation card:** a short syllable like ສະ *sa* is cut off sharply (one line, no rule to memorise)
- **Core words:** ສະບາຍ *sabai* "well; comfortable", ສະບາຍດີ *sabaidee* "hello"
- **First mini-conversation:**
  - ສະບາຍດີ *sabaidee* "Hello" — ສະບາຍດີ *sabaidee* "Hello"
  - ສະບາຍດີບໍ່? *sabaidee bor?* "How are you?" — ສະບາຍດີ *sabaidee* "I'm well"
- **Bonus:** ຂາຍ *khaai* "sell" (turns core soon: ລາວຂາຍເຂົ້າ *lao khaai khao* "She sells rice")

### Lesson 9: "hungry", "you"
- **New letters:** ຫ (h), ຈ (j)
- **Core words:** ຫິວ *hiu* "hungry" (ຫິວເຂົ້າ *hiu khao* "hungry", ຫິວນ້ຳ *hiu nam* "thirsty"), ເຈົ້າ *jao* "you"
- **Sentences:**
  - ລາວຫິວເຂົ້າ *lao hiu khao* "He is hungry"
  - ເຈົ້າຫິວເຂົ້າບໍ່? *jao hiu khao bor?* "Are you hungry?" — ບໍ່ຫິວ *bor hiu* "Not hungry"
  - ເຈົ້າຫິວນ້ຳບໍ່? *jao hiu nam bor?* "Are you thirsty?" — ຫິວ *hiu* "Yes"
  - ເຈົ້າສະບາຍດີບໍ່? *jao sabaidee bor?* "How are you?"
- **Bonus:** ຫ້າ *haa* "five", ຈານ *jaan* "plate"

### Lesson 10: "I", and the conversation
- **New letter:** ◌ອ◌ (the "aw" vowel)
- **Core words:** ຂ້ອຍ *khoy* "I; me", ນອນ *non* "sleep"
- **Sentences:**
  - ຂ້ອຍຫິວເຂົ້າ *khoy hiu khao* "I'm hungry"
  - ຂ້ອຍກິນເຂົ້າແລ້ວ *khoy kin khao leo* "I've eaten already"
  - ຂ້ອຍສະບາຍດີ *khoy sabaidee* "I'm well"
  - ລາວນອນແລ້ວ *lao non leo* "He has gone to bed"
- **The full target conversation** (above)
- **Bonus:** ນ້ອຍ *noy* "small"
- Lessons 9 and 10 may swap (the user has no preference between "you" first and "I" first).

### Lesson 11: no new letters; bonus words become core
- **New letters:** none
- **Core words:** ສີ *see* "colour", ຂາວ *khao* "white" (ສີຂາວ *see khao*), ດຳ *dam* "black" (ສີດຳ *see dam*),
  ຂາຍ *khaai* "sell", ນ້ອຍ *noy* "small"
- **Sentences** (to be composed when the lesson is built; candidates):
  - ລາວຂາຍເຂົ້າ *lao khaai khao* "She sells rice"
  - ຂໍແກ້ວນ້ອຍແນ່ *khor kaeo noy nae* "Could I have a small glass?"
  - ສີນີ້ດີ *see nee dee* "This colour is good"
- Five words is over the usual budget; split in two if it plays long.

## Lesson 13: tone (owner 2026-11-18)
No new letters. New words ເຂົ່າ *kao* "knee" and ມ້າ *maa* "horse", each paired with a known word that differs only
by tone (ເຂົ້າ "rice", ມາ "come"). Built as L0013 "Same sounds, different melody". Lessons 14–19 follow below; consonant classes come after them.

## Lessons 14–19: going out to eat (owner 2026-11-19; built as L0014–L0019)
Builds to the second conversation (D0003, lesson 18), which with the hospital lesson closes section S02 (lessons 11–19; owner 2026-11-19). All the words are in
`words.csv` (verified except ເອົາ). The sentences are the agent's own until Na records them.

| Lesson | New letters | Core words | Sentences (candidates) | Bonus |
|---|---|---|---|---|
| 14 | ອ (silent first letter), ຮ (h) | ອາຫານ *aahaan* "food", ຮ້ານອາຫານ *haan aahaan* "restaurant", ເອົາ *ao* "take; I'll have" | ມີອາຫານບໍ່? "Is there food?"; ອາຫານລາວ "Lao food"; ມີຮ້ານອາຫານບໍ່? "Is there a restaurant?"; ເອົານ້ຳ "I'll have water" | ອ້າຍ *aai* "older brother", ຮ້ອນ *hon* "hot" |
| 15 | ປ (p), ໄ◌ (ai) | ໄປ *pai* "go", ບ້ານ *baan* "home" (bonus in L6, now core) | ໄປບ້ານ "go home"; ໄປກິນເຂົ້າ "go and eat"; ໄປຮ້ານອາຫານ "go to a restaurant"; ໄປນອນ "go to bed"; ລາວໄປແລ້ວ "He's gone" | ປາ *paa* "fish", ໄກ *kai* "far" |
| 16 | ໃ◌ (same sound as ໄ◌, one card), final ບ (dead syllable, R01) | ໃສ *sai* "where", ຂອບໃຈ *khop jai* "thank you" | ເຈົ້າໄປໃສ? "Where are you going?" (an everyday greeting); ໄປໃສມາ? "Where have you been?"; ຂອບໃຈ | ໃກ້ *kai* "near" (pairs with ໄກ), ໃຫ້ *hai* "give" |
| 17 | ຢ (y), ◌ູ (uu) | ຢູ່ *yuu* "be at; live" | ເຈົ້າຢູ່ໃສ? "Where are you? / Where do you live?"; ຂ້ອຍຢູ່ບ້ານ "I'm at home"; ຢູ່ນີ້ "(It's) here" | |
| 18 | ງ (start and end together, one card like ນ and ມ) | ຫ້ອງ *hawng* "room" (on its own first, owner 2026-11-19), ຫ້ອງນ້ຳ *hawng nam* "bathroom", ຫ້ອງນອນ *hawng non* "bedroom" | ຫ້ອງນີ້ດີ "This room is good"; ຫ້ອງນ້ຳຢູ່ໃສ? "Where's the bathroom?"; ຫ້ອງນອນຢູ່ນີ້ "The bedroom is here"; the conversation below | ງາມ *ngaam* "beautiful", ສອງ *sawng* "two" |
| 19 | ໝ (m), ໂ◌ (oo) (owner 2026-11-19) | ໝໍ *mor* "doctor", ໂຮງໝໍ *hoong mor* "hospital" (ໂຮງ is "building", not ຫ້ອງ "room"; explained in a word note, not taught alone) | ລາວແມ່ນໝໍ "She's a doctor"; ໄປໂຮງໝໍ "I'm going to the hospital"; ໂຮງໝໍຢູ່ໃສ? "Where is the hospital?"; ລາວຢູ່ໂຮງໝໍ "She is in the hospital" | ໝາ *maa* "dog", ໂມງ *moong* "hour" |
| 20 (next) | final ກ | ຢາກ *yaak* "want to" | ຂ້ອຍຢາກໄປຫ້ອງນ້ຳ "I want to go to the bathroom"; ຂ້ອຍຢາກກິນອາຫານລາວ "I want to eat Lao food" | |

Lesson 14 is the first with two h letters (ຫ and ຮ). Show them as "another h" with each word's melody, as in
lesson 13; the class rule waits for the classes lesson.

### Target conversation (complete in lesson 18)

| | Lao | Sounds like | English |
|---|---|---|---|
| A | ສະບາຍດີ! ເຈົ້າໄປໃສ? | sabaidee! jao pai sai? | Hi! Where are you going? |
| B | ໄປຮ້ານອາຫານ. ເຈົ້າຫິວເຂົ້າບໍ່? | pai haan aahaan. jao hiu khao bor? | To a restaurant. Are you hungry? |
| A | ຫິວ. | hiu | Yes (hungry). |
| B | ມີອາຫານລາວບໍ່? | mee aahaan lao bor? | (at the restaurant) Do you have Lao food? |
| C | ມີ. | mee | We do. |
| A | ຫ້ອງນ້ຳຢູ່ໃສ? | hawng nam yuu sai? | Where's the bathroom? |
| C | ຢູ່ນີ້. | yuu nee | Over here. |
| A | ຂອບໃຈ. | khop jai | Thanks. |


## After the outing conversation (order not fixed yet)
- **Consonant classes** (owner 2026-11-19: after this run, not before): ຄ, ◌ົ◌ (short "o"), ຄົນ *khon* "person",
  the "three k letters" card (ກ ຂ ຄ), the ເຂົ້າ / ເຂົ່າ / ເຂົາ / ເຄົາ "rice / knee / they / beard" set;
  ຄົນລາວ "Lao person", ຄົນນີ້ "this person"; bonus ລາຄາ *laakhaa* "price".
- **Ordering food** (the next conversation): ◌ັ◌ (short "a" inside a syllable) and ຫຍ (ny) open ມັກ *muk* "like",
  ຫຍັງ *nyang* "what", ກັນ *kan* "together", ຢູ່ຫັ້ນ "over there"; ຂ້ອຍມັກອາຫານລາວ "I like Lao food";
  ເອົາຫຍັງ? "What will you have?"; ໃຫຍ່ *yai* "big" (ໃ◌ + ຫຍ, paired with ນ້ອຍ *noy* "small").

## Work this plan still needs
Conversations are `dialogue` lesson items (D0001 in lesson 8, D0002 in lesson 10; DESIGN "Conversations").

Budget flags the path needs on `lesson_tool.py check` / `merge` (to be confirmed when each lesson is built):
lesson 6 and lesson 8 `--max-units 3`; lesson 8 also carries the cut-off card (R01), so `--max-weight` rises;
lesson 11 `--max-words 5`.

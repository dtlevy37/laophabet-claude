# Curriculum path, lessons 1–33 and beyond (agreed by the user, 2026-11-10)

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


## Lessons 20–33: getting by (section S03; owner 2026-11-19)
Decided with the owner after an Opus review of the path (2026-11-19). **Lessons 1–19 stay as built**; the path is
re-planned from lesson 20. Ideas behind it:
- **Utility words earlier, symbols slower:** 10 new symbols over 14 lessons, about half the lessons word-only (W: no
  new symbol). Reading a new word made of known letters is letter practice, so word lessons space the letters.
  Several word-only lessons in a row are fine when the words are ripe (owner); each needs a clear payoff sentence.
- **Each new symbol is chosen by the phrases it unlocks** (sorry, how much, prices, delicious).
- **Bonus words** follow LESSON_RULES decision 21 (numbers as soon as readable; no bonus for a word that turns core
  within about 4 lessons). Already shown as bonus in 1–19: numbers ເກົ້າ 9 (L2), ສີ່ 4 (L8), ຫ້າ 5 (L9), ສາມ 3 (L12),
  ຮ້ອຍ 100 (L14), ສິບ 10 (L16), ສອງ 2 (L18); also ຈ່າຍ pay (L10), ແມວ cat (L13), ອີ່ມ full and ອ້າຍ (L14), ປາ, ໄກ
  (L15), ໃກ້ (L16), ຈານ (L9).
- **Final ກ has no card of its own** (owner): it is the same k, cut off. The first word card with it (ຢາກ) says so
  and points to R01. Final ດ keeps a card (it changes: d at the start, t at the end).
- **Look-alikes get planned contrasts** (decision 15): ສີ່ four / ສີ colour, ນ້ອງ younger sibling / ນ້ອຍ small,
  ແມ່ mother / ແມ່ນ is, ໄກ far / ໃກ້ near / ໄກ່ chicken, ເກົ້າ nine / ເຂົ້າ rice. Keep ໝູ pork out while ໝູ່ friend
  is new.
- **Family:** immediate family first (owner): ແມ່, ອ້າຍ, ນ້ອງ, ລູກ, then ພໍ່. Aunt and uncle words wait.

| L | New symbols | New core words | Bonus | Sentences (ids are data/sentences.csv; "new" = to draft) | Conversation |
|---|---|---|---|---|---|
| 20 W | none | ເຂົ້າໃຈ *khao jai* "understand" (word note: ເຂົ້າ as in rice, ໃຈ as in ຂອບໃຈ), ຮູ້ *huu* "know" | ອ່ານ *aan* "read" | S000000051 ຂ້ອຍບໍ່ເຂົ້າໃຈ "I don't understand" (or the verified S000000050 ບໍ່ເຂົ້າໃຈ); S000000052 ເຈົ້າເຂົ້າໃຈບໍ່? "Do you understand?"; S000000091 ຂ້ອຍບໍ່ຮູ້ "I don't know"; S000000092 ເຈົ້າຮູ້ບໍ່? "Do you know?" | |
| 21 | final ກ (no card) | ຢາກ *yaak* "want to", ອີກ *iik* "more; again" | ລູກ *luuk* "child" | S000000028 ຂ້ອຍຢາກກິນ "I want to eat"; S000002017 ເຈົ້າຢາກໄປໃສ? "Where do you want to go?"; new ຂ້ອຍຢາກໄປຫ້ອງນ້ຳ "I want to go to the bathroom"; S000000494 ເອົາອີກ "(I'll take) more" | |
| 22 W | none | ອີ່ມ *im* "full", ຈ່າຍ *jaai* "pay" (both bonus → core), ໄດ້ *dai* "can; OK" (card: ໄດ້ after the verb, ບໍ່ before ໄດ້) | | S000000116 ຂ້ອຍອີ່ມແລ້ວ "I'm full"; S000000420 ຂ້ອຍຈ່າຍ "I'll pay"; S000000198 ຂ້ອຍໄປບໍ່ໄດ້ "I can't go" | D0004 "After the meal" |
| 23 W | none | ແມ່ *mae* "mother", ອ້າຍ *aai* "older brother" (bonus → core), ນ້ອງ *nawng* "younger sibling"; card: "my mother" = mother + I | | S000000063 ແມ່ຂ້ອຍສະບາຍດີ "My mother is well"; S000000062 ແມ່ເຈົ້າຢູ່ໃສ? "Where is your mother?"; S000000275 ເຈົ້າມີອ້າຍບໍ່? "Do you have an older brother?"; new ນີ້ແມ່ນແມ່ຂ້ອຍ "This is my mother" | |
| 24 | ◌ຽ◌ (ia) | ຮຽນ *hian* "study", ໂຮງຮຽນ *hoong hian* "school" (ໂຮງ as in ໂຮງໝໍ), ດຽວນີ້ *dieo nee* "now", ອ່ານ (→ core) | | S000000278 ນ້ອງຂ້ອຍຮຽນຢູ່ໂຮງຮຽນ "My younger sibling studies at school"; S000000098 ດຽວນີ້ເຈົ້າຢູ່ໃສ? "Where are you now?"; new ດຽວນີ້ຂ້ອຍອ່ານໄດ້ "Now I can read" (?) | |
| 25 W | none | ໝູ່ *muu* "friend", ເຮົາ *hao* "we", ລູກ (→ core) | | S000000066 ລາວແມ່ນໝູ່ຂ້ອຍ "She's my friend"; S000000048 ເຮົາໄປຮ້ານອາຫານ "Let's go to the restaurant"; S000000065 ເຈົ້າມີລູກບໍ່? "Do you have children?" | |
| 26 W | none | ໄກ *kai* "far", ໃກ້ *kai* "near" (both → core): one comparison card in the L13 style | ໄກ່ *kai* "chicken" (on the same card: the sounds of ໄກ, another melody) | S000000081 ໄກບໍ່? "Is it far?"; S000000080 ບ້ານຂ້ອຍຢູ່ໄກ "My home is far"; S000000078 ຮ້ານອາຫານຢູ່ໃກ້ "The restaurant is near"; S000000079 ຫ້ອງນ້ຳຢູ່ໃກ້ບໍ່? "Is the bathroom near?" | D0005 "Visiting a friend" |
| 27 | ຄ, ◌ົ◌ (short o) | ຄົນ *khon* "person", ນົມ *nom* "milk", ແມວ *maew* "cat" (bonus → core); class card ("two letters, one sound": ຂ / ຄ) | ລາຄາ *laakhaa* "price", ຫົກ *hok* "six" | S000000058 ຄົນນີ້ດີ "This person is good"; new ຄົນລາວ "Lao people"; new ແມວກິນນົມ "The cat drinks milk" (owner) | |
| 28 W | none | ສອງ, ສາມ, ສີ່, ຫ້າ (2–5, bonus → core); card: number + ຄົນ after the noun | | S000000131 ເຮົາມີຫ້າຄົນ "There are five of us"; S000000279 ຂ້ອຍມີນ້ອງສອງຄົນ "I have two younger siblings"; S000000094 ໝູ່ຂ້ອຍສາມຄົນມາແລ້ວ "Three of my friends have come" | |
| 29 | ທ, final ດ (card) | ຂໍໂທດ *khor thot* "sorry; excuse me", ເທົ່າໃດ *thao dai* "how much", ລາຄາ (→ core) | ທ່ານໝໍ *than mor* "doctor" (the owner's word; to draft), ແປດ *paet* "eight" | S000000011 ຂໍໂທດ "Excuse me"; S000000014 ຂໍໂທດ ຫ້ອງນ້ຳຢູ່ໃສ? "Excuse me, where's the bathroom?"; S000000206 ລາຄາເທົ່າໃດ? "What's the price?"; S000000421 ຈ່າຍເທົ່າໃດ? "How much do I pay?" | |
| 30 | ◌ັ◌ (short a), ຫຍ (ny) | ມັກ *mak* "like", ຫຍັງ *nyang* "what" | ກັນ *kan* "together" | S000000109 ຂ້ອຍມັກອາຫານລາວ "I like Lao food"; S000000036 ນີ້ແມ່ນຫຍັງ? "What is this?"; new ເອົາຫຍັງ? "What will you have?" | |
| 31 W | none | ໃຫຍ່ *nyai* "big" (contrast card with ນ້ອຍ "small"), ປາ "fish", ຈານ "plate" (both → core) | | new ຂໍຈານໃຫຍ່ແນ່ "Could I have a big plate?" (?); new ເອົາປາ "I'll have the fish" (?); new ປານີ້ໃຫຍ່ "This fish is big" | |
| 32 | ພ | ພໍ່ *phor* "father", ພັນ *phan* "thousand", ກີບ *kiip* "kip", ສິບ (→ core) | ແພງ *phaeng* "expensive" | S000000064 ພໍ່ຂ້ອຍບໍ່ຢູ່ "My father isn't here"; S000000361 ລາຄາສອງພັນກີບ "It's 2,000 kip"; new ສິບພັນກີບ "10,000 kip" | |
| 33 | ຊ | ແຊບ *saep* "delicious", ຊາວ *saao* "twenty" (card: ຊ sounds like ສ, as ຄ like ຂ) | ຊ້າ *saa* "slow" | S000000118 ອາຫານນີ້ແຊບ "This food is delicious"; S000000120 ປານີ້ແຊບ "This fish is delicious"; S000000294 ລາຄາຊາວພັນກີບ "It's 20,000 kip" | D0006 "Eating out"; S03 checkpoint |

Budget: lessons 23, 24, 28 and 32 carry 4 new core words (`--max-words 4`; owner agreed 2026-11-19). Sentences marked
(?) or "new" are the agent's and wait for Na's recordings. The L0026 comparison card reuses the L13 rule-card format.

**Conversations** (every line is a sentence item of its lesson or an earlier one):
- D0004 "After the meal" (L22): ກິນອີກບໍ່? "Will you have more?" (?) · ຂ້ອຍອີ່ມແລ້ວ. ຂອບໃຈ. "I'm full. Thanks." ·
  ຂ້ອຍຈ່າຍ. "I'll pay." · ບໍ່ໄດ້! ຂ້ອຍຈ່າຍ. "No way, I'll pay." (?) · ໄດ້. ຂອບໃຈ. "OK. Thank you."
- D0005 "Visiting a friend" (L26): ສະບາຍດີ! ເຈົ້າໄປໃສ? · ໄປບ້ານໝູ່. "To a friend's house." (?) · ໄກບໍ່? "Is it far?" ·
  ບໍ່ໄກ. ຢູ່ໃກ້ໂຮງຮຽນ. "Not far. It's near the school." (?) · ເຈົ້າຢາກໄປບໍ່? "Do you want to come?" · ຢາກ! "Yes!"
- D0006 "Eating out" (L33): ສະບາຍດີ. ເອົາຫຍັງ? "Hello. What will you have?" · ມີອາຫານລາວບໍ່? (S000002913) · ມີ. ·
  ເອົາປາ. ເອົານ້ຳ. "The fish. And water." (?) · ອາຫານນີ້ແຊບ! "This food is delicious!" · ຂໍໂທດ, ລາຄາເທົ່າໃດ?
  "Excuse me, how much is it?" · ຊາວພັນກີບ. "20,000 kip." · ຂອບໃຈ.
- Word lessons may also bring back D0002 or D0003 as `recycle` items for repetition in context.

**Build:** draft the missing rows first (`draft-content`: ທ່ານໝໍ, the "new" sentences, word notes for ເຂົ້າໃຈ, ໂຮງຮຽນ,
ນ້ອງ/ນ້ອຍ, ແມ່/ແມ່ນ), then build one lesson at a time with `build-lesson`. After lesson 33, a hand-written `sections`
migration for S03 (lessons 20–33).

## After S03 (by phrase payoff, about 1 symbol per lesson)
- "Please speak slowly" first: ວ at the start of a syllable and ໆ (the repeat mark) give ເວົ້າ *wao* "speak" and
  ຊ້າໆ *saa saa* "slowly" (ເວົ້າຊ້າໆແນ່). It needs ຊ, so it cannot come before lesson 33.
- ຫຼ: ຫຼາຍ *laai* "very" (ຂອບໃຈຫຼາຍ "thanks a lot"). ເ◌ັ: ເປັນ *pen* "be", ເຈັດ *jet* "seven". ເ◌ິ: ເງິນ *ngern*
  "money". ໜ and ◌ຶ: ໜຶ່ງ *nueng* "one". ຜ and ◌ົວ: ຜົວ *phua* "husband". The ເຂົ້າ / ເຂົ່າ / ເຂົາ / ເຄົາ "rice /
  knee / they / beard" set once ຄ is in. Later topics: vehicles (ລົດ *lot* "car", ຂີ່ *khii* "ride"), directions
  (ໂຮງແຮມ "hotel"), extended family (ນ້າ, ອາ).
- Word-only lessons whenever three high-utility words are ripe.

## Work this plan still needs
Conversations are `dialogue` lesson items (D0001 in lesson 8, D0002 in lesson 10; DESIGN "Conversations").

Budget flags the path needs on `lesson_tool.py check` / `merge` (to be confirmed when each lesson is built):
lesson 6 and lesson 8 `--max-units 3`; lesson 8 also carries the cut-off card (R01), so `--max-weight` rises;
lesson 11 `--max-words 5`.

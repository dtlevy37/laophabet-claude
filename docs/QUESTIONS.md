# Questions

Open doubts only a person can settle. The agent appends, and the agent deletes a question in the same commit that
applies its answer (to the data, PLAN, DESIGN or LESSON_RULES; online ones are also retired in
`data/open_questions.csv`). Parked word-list items: `_shelf/docs/NEEDS_HUMAN.md`.

## How to ask the native speaker (owner, 2026-11-17)
The first round (Q0001–Q0016) went badly: some questions were the owner's to answer, and some were too confusing to
answer. Before a question goes to a native, online or here:
1. **Ask the owner first.** Many questions (spelling choices, which form to teach, politeness) the owner already knows.
   Only what the owner cannot settle goes to the native. When the owner answers a question that is also online,
   retire it (`retire:Qnnnn` in `data/open_questions.csv`).
2. **Her recordings answer "is it natural?".** Recording a text (not "I'd say it differently") means she would say it.
   Do not also ask it as a question.
3. **No English-sound comparisons.** "Like *bed* or like *cat*?" means nothing to her (she read "cat" as the animal).
   She records the word; the owner, whose ear is English, listens and judges (see "For the owner").
4. **No linguistics words:** tone names, short/long vowels, register, classifier, particle. She does not know tone
   names. Tones come from the spelling rules (`tone_derive.py`) and from her recordings, never from a question.
5. **One thing per question**, in plain words: show the Lao, say what we think it means, then ask a direct question:
   "Would you say this?", "What does this mean?", "What would you say instead?", "Is this word also a name?".
6. **Options must cover the real answers**, plus free text. If the answer is a meaning, ask for it in free text.
7. **How a letter is written** (owner, 2026-11-19): never in words. Prompt "how do you write this letter?" and give
   her the writing pad, recording her strokes (PLAN N7). Until N7 exists, do not ask.

## For the native speaker
**Asked online, round 3** (Q0037–Q0043, from the November app review; answers feed PLAN A19 and N5): ລາວມາແລ້ວ (laao maa laew) here or on the way; ກິນນ້ຳ (kin nam) to anyone or
only family; hands together for ສະບາຍດີ with a friend; how to ask back after ຂ້ອຍສະບາຍດີ (khoy sa-baai-dii); ທຳມະດາ
or ກັນເອງ as the casual label; ເຈົ້າ (jao) or ທ່ານ (than) in the app; bare ຫິວ (hiw) for "hungry?". Apply the
answers, then delete this paragraph.

**Record and listen** (her take settles it; nothing to answer)
- Lessons 14–19 (composed, unverified): ເອົານ້ຳ (ao nam, "I'll have water", S000002915), ມີ. (mii, "We do.", S000002914), ໄປໃສມາ? (pai sai maa, "Where have you been?", S000002921), ຢູ່ນີ້ (yuu nii, "Over here.", S000002924; she may say ຢູ່ຫັ້ນ instead: then ask the owner whether to swap it in D0003 line 7), ລາວຢູ່ໂຮງໝໍ (S000000310), and the rest of S000002911–S000002926. If she says one differently, fix the sentence before the lessons are pushed.
- ເຕ້ຍ (tia, "short in height", W001427) and ລາວເຕ້ຍ (S000002899), ພໍ່ເຕ້ຍ (S000002900): record when they come up.

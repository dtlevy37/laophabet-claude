# Questions

Doubts only a person can settle. The agent appends; the owner clears what is handled (answers go into the data,
PLAN or DESIGN, then the question is deleted). Parked word-list items: `_shelf/docs/NEEDS_HUMAN.md`.

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

## For the owner
- A4: read the changed-rows list (last section of `docs/A4_SOUNDS_LIKE_AUDIT.md`).
- L1b: confirm the activity mix (fewer builds in lessons, more in practice).
- ◌ິ bug: device, browser, Settings → Lao font, and where it showed.
- ຂາວ / ລາວ as the first tone pair: in the tone lesson (L3) or a recap card? (ລາວ is now confirmed long, so the pair
  works.)
- **Listen and judge** (her takes are in the app: `#/words`, tap a word, ▶). For each, which English sound is closest
  for a Midwest ear? The answer fixes the "sounds like" hints.
  - ແ in ແລ້ວ (laew, already), ແກ້ວ (gaew, glass): "bed" held long, or "cat"? She said only that it is long.
  - ◌ໍ in ບໍ່ (bor, not), ຂໍ (khor, ask for): she said "between" open "ah" with round lips and "oh".
  - ດຳ (dam, black) vs ນ້ຳ (nam, water): same vowel?
  - ຈ in ເຈົ້າ (jao, you): "j" in "jaw", "ch" in "chew", or between?
  - Final ຍ in ສະບາຍດີ (sabaidee, hello): like the end of "bye"?
  - ສະ (sa) in ສະບາຍດີ: a short catch (stop) after the "a", as card R01 says?
- **Politeness** (answer yourself if you know; otherwise ask her as written below): is ເຈົ້າ (jao, you) polite to an
  older stranger, and ຂ້ອຍ (khoy, I) when speaking to one? If not, what is used?
- **Word-order rule cards** (A2, English text about Lao; check it, ask her only about a specific example you doubt):
  (1) a describing word comes after the thing (ນ້ຳນີ້ nam nee, "this water"; ແກ້ວນ້ອຍ gaew noy, "small glass"); (2) ບໍ່
  "not" goes before the word it negates; (3) question ບໍ່ at the very end; (4) ແນ່ at the end of a request; (5) ແລ້ວ
  usually after the word it belongs to.

## For the native speaker
Ready to ask as written. Romanization in brackets for the owner; sentence ids for the agent.

**Meanings**
- ລາວນອນແລ້ວ (laao non laew, S000002891). What does it mean? (a) He is asleep now. (b) He has gone to bed. (c) Either.
- ຂໍແກ້ວນ້ອຍແນ່ (khor gaew noy nae, S000002897). What is being asked for? (a) A small glass. (b) A little of something
  in a glass. (c) Something else.
- ສີເຂົ້າ (sii khao). Does it mean "to mill rice"? Yes / no / what does it mean?
- ດຳນ້ຳ (dam nam). Does it mean "to dive (go under water)"? Yes / no / what does it mean?
- ສີ (sii, colour). Does it have a rude or embarrassing meaning we should avoid? Yes (which?) / no.
- ເຂົ້າ (khao). We teach it as "rice, and also a meal". Food in general is ອາຫານ (aahaan). Right?
- ຂ້ອຍ (khoy, I) and ເຈົ້າ (jao, you): only if the owner cannot answer the politeness item above.

**What would you say?**
- Someone asks you ສະບາຍດີບໍ່? (sabaidee bor?, "how are you?"). What do you usually answer? Write it in Lao.
- Someone points at a shirt and asks what colour it is. Do you answer ສີຂາວ (sii khao) or just ຂາວ (khao)?
- Someone asks ເຈົ້າຫິວນ້ຳບໍ່? (jao hiw nam bor?, "are you thirsty?"). Can you answer just ຫິວ (hiw)? Yes / no.
- Is ສະບາຍດີ (sabaidee) also said when leaving (goodbye), or only when meeting? Meeting only / both / mostly
  meeting.

**Names**
- Which of these words are also people's names or nicknames? ນ້ຳ (nam), ແກ້ວ (gaew), ດາວ (dao), ນ້ອຍ (noy), ດຳ (dam),
  ຂາວ (khao), ບ້ານ (baan), ມີ (mee), ດີ (dee), ສີ (sii). (She can also tick "could be a name" when recording.)

**Fill-in-the-blank check**
- The app shows ___ແລ້ວ (... laew, "... already") with the choices ນ້ຳ (nam, water), ຂາ (khaa, leg), ແກ້ວ (gaew,
  glass). Does any of these three make a sentence that makes sense? Which?

**Record and listen** (her take settles it; nothing to answer)
- ເຕ້ຍ (tia, "short in height", W001427) and ລາວເຕ້ຍ (S000002899), ພໍ່ເຕ້ຍ (S000002900): record when they come up.

**Letter writing (`#/write`)**, on screen, letter by letter. One question at a time:
1. Does each letter start where you start it when you write by hand (ກ bottom left, ມ top left, ອ at the curl)?
2. Do you write each consonant without lifting the pen?
3. ພ ຟ ຜ ຝ: is the middle point drawn up and back down the same line?
4. Do ກ and ຖ look like normal school handwriting?

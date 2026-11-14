# Questions

Doubts only a person can settle. The agent appends; the owner clears what is handled (answers go into the data,
PLAN or DESIGN, then the question is deleted). Parked word-list items: `_shelf/docs/NEEDS_HUMAN.md`.

## For the owner
- A6 proposal (`docs/A6_UX_REVIEW.md` §4): agree it as a whole? Brand colour (deep blue + warm red)? Phone bottom bar
  with 4 tabs, Practice opening Review until S8b?
- A7 step plan (`docs/A7_PLAN.md`): agree it?
- A4: read the changed-rows list (last section of `docs/A4_SOUNDS_LIKE_AUDIT.md`).
- L1b: confirm the activity mix (fewer builds in lessons, more in practice).
- ◌ິ bug: device, browser, Settings → Lao font, and where it showed.
- S10r: what exactly felt split into two paths in the wife's session?
- ຂາວ / ລາວ as the first tone pair: in the tone lesson (L3) or a recap card? (Depends on ລາວ being long.)

## For the native speaker
Several of these are now also asked online as Q-ids (`data/open_questions.csv`, screen `#/questions`; answers are read in the DB view `open_question_consensus`). Lines stay here until the owner clears them after applying the answers.
Romanization in brackets; sentence ids for the agent. All composed sentences are the agent's own and unverified.

**Sounds and spelling**
- ລາວ "he, she" (W000031): short (law) as Wiktionary has it, or long "laao" like ລາວ "Lao" (W000058) and ຂາວ (khaao,
  white)? The owner leans long. If long: `python tmp/laao_change.py --write` (word + 166 sentences), then drop the
  short/long wording on the lesson 3 card.
- Question marker: ບໍ່ (with tone mark, as the data has it) or ບໍ? Is it said differently from ບໍ່ (bor) "not"?
- Softener: ແນ່ (nae, W001426) or ແດ່ (dae, W000308): which is everyday Vientiane speech?
- Vowels, say each aloud for the owner: (1) ແ in ແລ້ວ (laew), ແນ່ (nae), ແກ້ວ (gaew): closer to "bed" held long, or
  "cat"? Say a ແ word next to a ເ word. (2) ◌ໍ / ◌ອ◌ in ບໍ່ (bor), ຂໍ (khor), ນອນ (non): open "ah" with rounded lips,
  or nearer "oh"? (3) Short ◌ິ in ກິນ (gin), ດິນ (din): like "gin", or tighter, a short "ee"? (4) ດຳ (dam, black):
  same vowel as ນ້ຳ (nam, water)? (5) Short ◌ຸ (later): "u" in "put", or tighter?
- Consonants: do English "boy" / "deck" sound like ບ/ດ or like ປ/ຕ to her? Is ຈ (jor) between "j" in "jaw" and "ch"
  in "chew"? Does final ຍ in ບາຍ (baai) / ຂາຍ (khaai) sound like the end of "bye"? Is there a catch at the end of ສະ
  (sa) in ສະບາຍດີ, as card R01 says?
- Tones and lengths as stored: ເຂົ້າ (khao, rice) low-falling, ເກົ້າ (gao, nine) high-falling, ດີ (dee) low-rising;
  ດິນ (din) short, ດາວ (dao) long. Right for Vientiane?
- ເຕ້ຍ (tia, W001427) "short (in height)": high-falling? Sentences ລາວເຕ້ຍ S000002899, ພໍ່ເຕ້ຍ S000002900.

**Meaning and register**
- ເຂົາ (kao, W000160): gloss now "they; (more formal) he; she". Right for Vientiane?
- ເຈົ້າ (jao, you) and ຂ້ອຍ (khoy, I): polite enough with strangers and elders, or ທ່ານ / ຂ້າພະເຈົ້າ / kin terms?
- ຫິວນ້ຳ (hiw nam) or ຢາກນ້ຳ (yaak nam) for "thirsty"? Can bare ຫິວ (hiw) answer "are you thirsty?"
- Would anyone say ລາວຫິວກິນ (lao hiw gin)? Is ກິນນ້ອຍ (gin noy) ever said, or only ກິນໜ້ອຍ (gin noy, eat a little)?
- ສີ (sii, colour): any rude sense to avoid? Verb senses tagged: ສີເຂົ້າ (mill rice), ດຳນ້ຳ (dam nam, dive). Right?
- Common names or nicknames among pool words? Treated as names: ນ້ຳ Nam, ແກ້ວ Kaew, ດາວ Dao, ນ້ອຍ Noy, ດຳ Dam, ຂາວ
  Khao. Others (ບ້ານ ...)?
- Usage notes (A5): ສະບາຍດີ (sabaidee) "be well", hello and goodbye, said with the ນົບ (nop): used for goodbye as
  much as hello? ເຂົ້າ (khao) "rice, and by extension a meal; food in general is ອາຫານ (aahaan)": right?
- Do bare ຂໍນ້ຳ (khor nam, S000000012) and ສະບາຍດີບໍ່? (sabaidee bor?) sound abrupt without ແນ່ / ເຈົ້າ? When is a
  pronoun dropped, and when does dropping it sound odd?

**Composed sentences: natural?**
- L3–4: ກິນເຂົ້າ (S000002870), ລາວກິນເຂົ້າ, ເຂົາກິນເຂົ້າ (S000002871), ກິນນ້ຳ vs ດື່ມນ້ຳ for "drink water",
  ລາວກິນນ້ຳ, ລາວຂາວ "fair-skinned", ເຂົ້າຂາວ vs ເຂົ້າຈ້າວ for white rice (S000002875).
- L5: ລາວກິນເຂົ້າແລ້ວ (S000002877), ລາວກິນນ້ຳແລ້ວ (S000002878), bare reply ກິນແລ້ວ (S000000024).
- L6: ລາວບໍ່ກິນເຂົ້າ (S000002879): "doesn't eat", "isn't eating" or "hasn't eaten"? ຂໍນ້ຳແນ່ (S000002880),
  ຂໍເຂົ້າແນ່ (S000002881).
- L7: ດີແລ້ວ (S000002882) "That's fine" or "good enough, stop"? ນ້ຳນີ້ດີ (S000002883) or ນ້ຳນີ້ແຊບ / ສະອາດ?
  ຂໍນ້ຳນີ້ແນ່ (S000002884) or with a classifier (ຂໍນ້ຳແກ້ວນີ້ແນ່)? Bare ບໍ່ດີ (S000000004).
- L8: is the bare ສະບາຍດີ the normal answer to ສະບາຍດີບໍ່?, or ສະບາຍດີ ຂອບໃຈ (khop jai)? Are ດີ or ສະບາຍ sensible
  one-word replies?
- L9–10: ລາວຫິວເຂົ້າ (S000002886), ເຈົ້າຫິວເຂົ້າບໍ່? (S000002887), replies ບໍ່ຫິວ (S000002888) and ຫິວ (S000002892):
  fine in context, or ຫິວເຂົ້າ / ບໍ່ຫິວເທື່ອ? ເຈົ້າຫິວນ້ຳບໍ່? (S000001170). ຂ້ອຍກິນເຂົ້າແລ້ວ (S000002890) after ບໍ່ຫິວ,
  or just ກິນແລ້ວ? ລາວນອນແລ້ວ (S000002891) "asleep already" or "gone to bed" (ເຂົ້ານອນແລ້ວ)? ຂ້ອຍຫິວເຂົ້າ
  (S000000113), ຂ້ອຍສະບາຍດີ (S000000008).
- L9–10, after "bare ຂ້ອຍຫິວ is incomplete" (2026-11-13): as a reply to ເຈົ້າຫິວເຂົ້າບໍ່? (jao hiw kao baw?, "are
  you hungry?"), is bare ຫິວ (hiw, S000002892) or ບໍ່ຫິວ (baw hiw, S000002888) fine, since the question already says
  ເຂົ້າ? Or should the replies be ຫິວເຂົ້າ (hiw kao) / ບໍ່ຫິວເຂົ້າ (baw hiw kao)? Lesson 9's new card "Pronouns are
  often left out" uses ບໍ່ຫິວ as its example. (Pool sentences ເດັກນ້ອຍຫິວ, ຍັງບໍ່ ຂ້ອຍຫິວ, ຂ້ອຍກິນຫຼາຍເພາະຫິວ now
  end in ເຂົ້າ.)
- Feedback note (L1d c): when a learner builds ລາວຫິວ (lao hiw) for ລາວຫິວເຂົ້າ (lao hiw kao, "he is hungry"), the app
  says "“Hungry” is usually ຫິວເຂົ້າ (hiw kao)". Is "usually" right? ເຈົ້າຫິວບໍ່? (jao hiw baw?, S000000114) and the
  reply ຫິວ (hiw, S000002892) are in the app with bare ຫິວ: when is bare ຫິວ fine?
- L11: ສີນີ້ຂາວ / ດຳ / ດີ (S000002893–5; or ສີນີ້ງາມ "beautiful"?), ລາວຂາຍເຂົ້າ (S000002896), ແກ້ວນີ້ນ້ອຍ (S000002898).
  ຂໍແກ້ວນ້ອຍແນ່ (S000002897): "a small glass" or "a little glassful"? Asked "what colour?", ສີຂາວ or just ຂາວ?
  You said ນີ້ຂາວ (nee khao) fits a wall's colour and ນີ້ມັນສີຂາວ (nee man sii khao) an object in hand: lesson 11
  says ສີນີ້ຂາວ (sii nee khao, "this colour is white"), pointing at a colour, e.g. a colour swatch or a wall. Fine
  that way, and is ສີນີ້ດີ (sii nee dee, "this colour is good") natural?

**Rules the app states**
- Word-order notes (A2): (1) a describing word comes after the thing (ນ້ຳນີ້ nam nee, ແກ້ວນ້ອຍ gaew noy); (2) ບໍ່ "not"
  before the word it negates; (3) question ບໍ່ at the very end; (4) ແນ່ at the end of a request; (5) ແລ້ວ usually
  after the word it belongs to. Right, or misleading? Would ນ້ຳດີນີ້ (nam dee nee) read as "this good water"?
- Fill in the blank: in __ ແລ້ວ, do the wrong options ນ້ຳ, ຂາ, ແກ້ວ ever make a sensible reply?

**Letter writing (`#/write`)**, check on screen letter by letter: (1) does each letter start where a Lao writer
starts it (ກ bottom left, ມ top left, ອ at the curl) and run the right way? (2) is every consonant one stroke?
(3) ພ ຟ ຜ ຝ: is the middle peak drawn up and back down the same line? (4) do ກ (plain Noto) and ຖ (loop top left)
look like normal school handwriting?

**Lesson 12 (agent-composed, unverified)**
- ມີນ້ຳບໍ່? (S000002901) / ບໍ່ມີ (S000000032) / ບໍ່ມີນ້ຳ (S000002902): natural question and answer?
- ຂ້ອຍມີແກ້ວນ້ອຍ (S000002906): natural, or is a classifier or ໜຶ່ງ expected?
- ເຈົ້າມາບໍ່? (S000002904) for "Are you coming?": natural, or another final particle?
- ນີ້ແມ່ນນ້ຳ (S000002905): normal, or would you say ນີ້ນ້ຳ? Is ແມ່ນ also "yes" in daily speech?

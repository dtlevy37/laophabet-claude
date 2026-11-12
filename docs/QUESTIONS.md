# Questions

Doubts only a person can settle. The agent appends; the owner clears what is handled. Older word-list review items
(batches c1–c6, classifiers, tone-source disagreements) are parked in `_shelf/docs/NEEDS_HUMAN.md`.

## For the owner
- (nothing open)

## For the native speaker
- ເຂົາ (W000160): the owner has only heard it as "they/them", with ລາວ as the everyday "he/she". The gloss was changed
  from Wiktionary's "he; she; they" to "they; (more formal) he; she". Is that right for Vientiane speech?
- Composed lesson sentences to confirm: ກິນເຂົ້າ "to eat (a meal)" (S000002870), ລາວກິນເຂົ້າ "He eats. / She eats."
  (lesson 3), ເຂົາກິນເຂົ້າ "They eat." (S000002871, held for a later lesson).
- ລາວ "he, she" (W000031) is recorded with a short vowel (law, "lao") and ລາວ "Lao" (W000058) with a long one
  (laːw, "laao"), per Wiktionary. Is the pronoun really shorter in normal speech? The lesson 3 card shows one
  respelling ("lao") for both, and the ◌າ card avoids the word "long" because of this.
  **Being asked 2026-11-12** (the owner's wife). The owner leans to long "laao" by the spelling rules, which would
  make ຂາວ (kaao, white) / ລາວ (laao, he/she) a pair differing only in first consonant and tone. Ready to apply:
  `python tmp/laao_change.py` (word row + 166 sentences).
- Lesson 4 (composed): is ກິນນ້ຳ the everyday way to say "drink water" (versus ດື່ມນ້ຳ)? Is ລາວຂາວ natural for "he/she is
  fair-skinned"? Would anyone say ເຂົ້າຂາວ for white rice, or only ເຂົ້າຈ້າວ (S000002875, taken out of the lesson)? Is ລາວກິນນ້ຳ natural? Does ◌ຳ in ນ້ຳ sound like the "um" in "hum", and is "nam" a fair spelling of it?
- Lesson 5 (composed): are ລາວກິນເຂົ້າແລ້ວ "He/She has eaten already" (S000002877) and ລາວກິນນ້ຳແລ້ວ "He/She has had some
  water already" (S000002878) natural? Is the bare reply ກິນແລ້ວ "I've eaten (already)" (S000000024) natural? Tags to
  confirm: ແລ້ວ (W000020) as a function word (never blanked), ແກ້ວ (W000218) as an object; in the blank __ ແລ້ວ only
  nouns (ນ້ຳ, ຂາ, ແກ້ວ) are offered as wrong options: does any of them make a sensible reply? Does ແ in ແລ້ວ sound like the
  a in "cat", held long?
- Tone of ເຂົ້າ (low-falling) and ເກົ້າ (high-falling) as stored: do they match Vientiane speech?
- **ບໍ່ vs ບໍ** (question marker): Wiktionary has only ບໍ່ for both "no" and the question sense; other sources often write
  the question marker without the tone mark. The data uses ບໍ່ for both. Which is right?
- Lesson 6 softener: ແນ່ (W001426, nae, newly drafted, IPA by agent) or ແດ່ (W000308, dae): which is everyday Vientiane
  speech for softening a request, and how is each spelled? Is ຂໍນ້ຳແນ່ "Could I have some water?" (S000002880) /
  ຂໍເຂົ້າແນ່ "Could I have some rice?" (S000002881) natural?
- Does bare ຂໍນ້ຳ (khor nam, "water please"; S000000012) sound abrupt without a softener?
- Is ຫິວເຂົ້າ (hiu khao) the normal way to say "hungry"? (needed in lesson 9)
- Lesson 6 question word: in ກິນເຂົ້າແລ້ວບໍ່? "Have you eaten yet?" (S000000023), is the question word written ບໍ່ (with
  the tone mark, as the data has it) or unmarked ບໍ, and is it said differently from ບໍ່ "not"?
- Lesson 6 (composed): is ລາວບໍ່ກິນເຂົ້າ "He/She doesn't eat" (S000002879) natural?
- Lesson 6 tags: ບໍ່ (W000003) and ແນ່ (W001426) as function words; ຂໍ (W000009) as a verb with no verb class; ບ້ານ
  (W000049) as a place.
- Fill in the blank hazard: ນ້ຳ (Nam) and ແກ້ວ (Kaew) are also common personal names, so they can make sense in any
  subject slot (ນ້ຳບໍ່ກິນເຂົ້າ "Nam doesn't eat"). They are now excluded in S000002879, S000000023 and S000000024 slot 1.
  Are there other pool words (ຂາວ, ບ້ານ ...) that are common names or nicknames?
- Lesson 7 (composed): does ດີແລ້ວ (dee leo, S000002882) mean "That's fine. / That's good." (agreeing, or "good enough,
  stop")? Is ນ້ຳນີ້ດີ (nam nee dee, "This water is good", S000002883) natural, or would one say ນ້ຳນີ້ແຊບ / ນ້ຳນີ້ສະອາດ?
  Is ຂໍນ້ຳນີ້ແນ່ (khor nam nee nae, "Could I have this water?", S000002884) natural, or is a classifier needed
  (ຂໍນ້ຳແກ້ວນີ້ແນ່)? ບໍ່ດີ (bor dee, "Not good", S000000004, existing) as a bare reply.
- Lesson 7: is ດາວ (dao, star; W000546) also a common personal name (Dao)? It is excluded from subject slots as one.
  Tags: ດາວ and ດິນ (din, soil; W000550) as objects (ດິນ not place), ນີ້ (nee, this; W000016) as a function word.
- Lesson 7 tones and lengths: ດີ (dee, good) is stored low-rising (diː˩(˧)); is that how it is said in Vientiane?
  ດິນ (din, soil) is short and ດາວ (dao, star) long, per Wiktionary: do they sound that way?
- Lesson 8 conversation: ສະບາຍດີ (sabaidee, "Hello", S000000001) / ສະບາຍດີ / ສະບາຍດີບໍ່? (sabaidee bor?, "How are
  you?", S000000003) / ສະບາຍດີ (sabaidee, "I'm well", S000002885, composed). Is the bare ສະບາຍດີ the normal reply to
  ສະບາຍດີບໍ່?, or is ສະບາຍດີ ຂອບໃຈ (sabaidee khop jai, "I'm well, thank you") more usual? Does answering a hello with
  the same ສະບາຍດີ sound natural? Is ສະບາຍດີບໍ່? natural on its own, or is ເຈົ້າສະບາຍດີບໍ່? (jao sabaidee bor?) expected?
  Is the question marker here ບໍ່ or ບໍ (see the ບໍ່ vs ບໍ items above)?
- Lesson 8 sounds: is there an audible catch (glottal stop) at the end of ສະ (sa) in ສະບາຍດີ, as the cut-off card (R01)
  says, or does it run into the next syllable in normal speech? Does final ຍ in ບາຍ (baai) / ຂາຍ (khaai, sell) sound
  like the y at the end of "bye"?
- Lesson 8 tags: ສະບາຍ (W000512) and ສະບາຍດີ (W000001) as qualities (states), ຂາຍ (W000084) as a verb with no verb
  class. In the one-word blanks for "Hello" / "I'm well", ດີ (dee, good) and ສະບາຍ (sabai, well) are accepted as
  answers: is either a sensible one-word reply to ສະບາຍດີບໍ່?
- **Letter writing (`#/write`)**: the stroke paths come from a font, not from a handwriting model. Please check on the
  screen, letter by letter: (1) does each letter start where a Lao writer starts it (the app starts at the loop;
  ກ gor starts bottom left; ມ mor starts top left; ອ or starts at the curl bottom left) and run in the right
  direction? (2) is every consonant really one stroke without lifting the pen? (3) ພ por, ຟ for, ຜ por, ຝ for: is the
  middle peak drawn up and back down the same line? (4) the shapes are Noto Sans Lao Looped; its ກ gor had two loops,
  so ກ alone was taken from the plain Noto Sans Lao. Do ຖ tor (loop at the top left) and the others look like
  normal school handwriting?

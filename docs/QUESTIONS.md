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
- Tone of ເຂົ້າ (low-falling) and ເກົ້າ (high-falling) as stored: do they match Vientiane speech?
- **ບໍ່ vs ບໍ** (question marker): Wiktionary has only ບໍ່ for both "no" and the question sense; other sources often write
  the question marker without the tone mark. The data uses ບໍ່ for both. Which is right?
- **Letter writing (`#/write`)**: the stroke paths come from a font, not from a handwriting model. Please check on the
  screen, letter by letter: (1) does each letter start where a Lao writer starts it (the app starts at the loop;
  ກ gor starts bottom left; ມ mor starts top left; ອ or starts at the curl bottom left) and run in the right
  direction? (2) is every consonant really one stroke without lifting the pen? (3) ພ por, ຟ for, ຜ por, ຝ for: is the
  middle peak drawn up and back down the same line? (4) the shapes are Noto Sans Lao Looped; its ກ gor had two loops,
  so ກ alone was taken from the plain Noto Sans Lao. Do ຖ tor (loop at the top left) and the others look like
  normal school handwriting?

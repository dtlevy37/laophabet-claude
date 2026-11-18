# 3_bilingual: fluent in English and Lao (translator; phone in desktop-site mode + desktop)

All Lao judgments here are a simulated speaker's view and are **unverified**. They are questions for the owner's
native speaker, not changes. Romanizations below use the app's default Standard style (kin khao), as learners see it.

Most lesson 1–12 sentences are already recorded as natural by the native speaker (`notes` "recorded as natural by a
verified native (Na)"), and many earlier doubts are already asked online (Q0017–Q0034). So this file covers mainly
what she did not check: **the English side** (translations, glosses, teach text), the **romanization shown next to
the Lao**, the **Lao UI strings**, and desktop-site mode.

## Findings

### F1 ຈ card says "SOUNDS LIKE ch" and "The j in 'jaw'" on the same card
- Screen/route: lesson 9 letter card for ຈ, `#/read/L0009/6`; also every word with ຈ (ເຈົ້າ, ຈານ)   - Device(s): all   - Severity: high
- Evidence: `tmp/review/shots/phone/153_read_L0009_6.png` (text "LAO LETTER ຈ SOUNDS LIKE ch The j in 'jaw'. … ເຈົ້າ chao you (polite)"); `app/frontend/js/translit.js:17` (`j: 'ch'` in the Standard swap); `data/units.csv` C05 teach_en "The j in 'jaw'." (owner 2026-11-17: "just the j sound, no mention of ch").
- What happens: in the default Standard style, every ຈ is written **ch**: ເຈົ້າ (chao, "you"), ຈານ (chaan, "plate").
  The card itself says it is the j of "jaw". An English reader says "chao" like "chow", which is the sound the owner
  did not want. The conversation lines (`phone_desksite/085_…all_revealed.png`) all show "chao".
- Suggestion: drop `j: 'ch'` from `STANDARD_INITIAL` so ຈ is **j** in both styles (jao, jaan). "j" is common in Lao
  romanization too, as in the name of the dipping sauce ແຈ່ວ, written "jeow" or "jaew". If the owner wants Standard to
  stay "ch", the card text must name it: "Written ch here, but say it like the j in 'jaw'."
- Why: a hint that contradicts the label next to it teaches the label, not the hint.
- Confidence: high (seen in shots and code)

### F2 Culture notes use the English-style romanization, while the card around them uses Standard
- Screen/route: word card ເຂົ້າ (L2 and every review of it), `#/read/L0002/6`   - Device(s): all   - Severity: med
- Evidence: `tmp/review/shots/phone/145_read_L0002_6.png`: "SOUNDS LIKE khao … ກິນເຂົ້າ (gin kao, "eat rice")"; `data/word_notes.csv` W000019 has the respelling hard-coded.
- What happens: the same card says **khao** in the header and **kao** in the note, and **kin** on the ກິນ card but
  **gin** in the note. In Standard style, "kao" is the spelling of ເກົ້າ (kao, "nine"), so the note teaches the wrong
  word.
- Suggestion: either remove the romanization from usage notes (the Lao is right there, and tapping it gives the
  sound), or mark it in the CSV (`{gin kao}`) and pass it through `respell()` when the note is rendered.
- Why: one card should use one spelling system.
- Confidence: high

### F3 The ຫິວ note says bare ຫິວ "sounds unfinished", then lesson 10 teaches bare ຫິວ as "I'm hungry"
- Screen/route: L9 word card ຫິວ (`phone/149_read_L0009_2.png`), then the L10 sentence card ຫິວ. (`phone/428_L10try_21-48_card_teach.png`) and the L10 conversation line 6   - Device(s): all   - Severity: med
- Evidence: `data/word_notes.csv` W000072: "A native speaker tells us that "I'm hungry" with ຫິວ alone sounds unfinished: hungry for what?"; S000002892 ຫິວ. = "I'm hungry. / Hungry."
- What happens: a learner who read the note on Monday is told on Tuesday that the "unfinished" form is the right answer.
  Both are probably true (a statement ຂ້ອຍຫິວ khawy hiw is incomplete, but a bare ຫິວ as a quick reply is fine), but
  the note does not say so. "A native speaker tells us" also reads oddly in a course.
- Suggestion (rewrite the note): "Lao says what you are hungry for: ຫິວເຂົ້າ (literally "hungry for rice") is
  "hungry", and ຫິວນ້ຳ is "thirsty". On its own, ຂ້ອຍຫິວ ("I'm hungry") sounds unfinished. As a quick answer to
  ເຈົ້າຫິວເຂົ້າບໍ່? ("Are you hungry?"), a plain ຫິວ is fine." Also, that row's `notes` says ຫິວນ້ຳ vs ຢາກນ້ຳ is
  "still asked in QUESTIONS", but Q0010 is retired: that text is stale.
- Why: rules that seem to contradict each other make learners doubt both.
- Confidence: high on the contradiction; the Lao claim is med (Q0027 still asks about bare ຫິວ for "thirsty")

### F4 ບໍ່ມີ is spaced two ways in lesson 12
- Screen/route: L12 cards 6 and 8, `#/read/L0012/6`, `/8`   - Device(s): all   - Severity: med
- Evidence: `phone/171_read_L0012_6.png` "ບໍ່ ມີ. baw mii." vs `phone/173_read_L0012_8.png` "ບໍ່ມີ ນ້ຳ. baw-mii nam."; `data/sentence_words.csv`: S000000032 = W000003 + W000023, S000002902 = W000823 + W000011.
- What happens: with "Show spaces between Lao words" on (the default), the same two words are one word in one
  sentence and two in the next, and the romanization goes from "baw mii" to "baw-mii". A Lao speaker hears ບໍ່ມີ
  (baw mii, "don't have / there isn't") as ບໍ່ + ມີ, exactly like ບໍ່ກິນ (baw kin, "not eat"), which lesson 6 already
  teaches.
- Suggestion: segment ບໍ່ + ມີ in both sentences. Keep W000823 out of lesson segmentation, or show it only as a
  "pattern" note: "ບໍ່ + ມີ = don't have, there isn't (same ບໍ່ as in ລາວບໍ່ກິນເຂົ້າ)".
- Why: segmenting transparently reuses what the learner knows and keeps the spacing honest.
- Confidence: high on the inconsistency; med on "teach as a pattern" (the owner approved ບໍ່ມີ as a word)

### F5 English translations: small fixes for natural, consistent English
- Screen/route: lesson sentence cards and build prompts   - Device(s): all   - Severity: med
- Evidence: `data/sentences.csv` `english` column (the notes say "the English is the agent's"); `desktop/065_L9try_8-42_card_mc_fb.png` (prompt shows "He is hungry. / She is hungry." as two stacked lines)

| Lao | Current English | Proposed | Why |
|---|---|---|---|
| ກິນເຂົ້າ. (kin khao) S000002870 | To eat (a meal). | Have a meal. / Let's eat. | A sentence card should not be an infinitive; said alone, ກິນເຂົ້າ is an invitation or a plain statement (ask the native, see Q1 below) |
| ຂໍນ້ຳແນ່. (khaw nam nae) S000002880 | Could I have some water? | Could I have some water, please? | ຂໍເຂົ້າແນ່ already has "please" (owner L1d); ຂໍນ້ຳນີ້ແນ່ and ຂໍແກ້ວນ້ອຍແນ່ should match. Pick one rule for ແນ່ and apply it to all four |
| ລາວກິນນ້ຳແລ້ວ. (laao kin nam laew) S000002878 | He has had some water already. | He's already had some water. | Natural word order |
| ມີນ້ຳບໍ່? (mii nam baw?) S000002901 | Is there water? | Is there any water? / Do you have water? | In a shop or restaurant this is how you ask "Do you have water?" (Q2) |
| ລາວມາແລ້ວ. (laao maa laew) S000000047 | He/She has arrived. | He's here. / She's here. | Matches the "He … / She …" format of every other sentence; "here" is the everyday sense (Q3) |
| ສີນີ້ຂາວ. / ສີນີ້ດີ. (sii nii khaao / sii nii dii) | This colour is white. / This colour is good. | This one is white. / This colour is nice. | "This colour is white" is not natural English; keep the literal gloss in the info sheet |
| two-gender sentences in **build** prompts | "He is hungry." and "She is hungry." on two lines | "He/She is hungry." on one line in prompts | Two lines read as two sentences to build |

- Why: the Lao is checked; the English is now the weakest part of the sentence cards.
- Confidence: med (English: high; the meaning-based ones depend on Q1–Q3)

### F6 Teach-text wording: four clunky lines
- Screen/route: L2 R03 card, L9 R04 card, the build-sentence hint, the ສະບາຍດີ note   - Device(s): all   - Severity: low
- Evidence: `data/rules.csv` R03, R04; `app/frontend/js/strings.json` `cmp_pair_hiw_kao`; `data/word_notes.csv` W000001; shots `phone/142_read_L0002_3.png`, `phone/161_read_L0009_14.png`, `desktop/065_L9try_8-42_card_mc_fb.png`, `phone/162_read_L0009_15.png`
- Current → proposed:
  - R03: "The next vowel, ເ◌ົາ, starts on the page before its consonant: read past it to the consonant, then say the
    vowel." → "The next vowel, ເ◌ົາ, begins to the left of its consonant. Skip it, say the consonant, then the vowel."
  - R04: "Everyday Lao often leaves out … This is normal everyday Lao." → "Lao often leaves out 'I', 'you' or 'he/she'
    when it is clear who is meant. To ເຈົ້າຫິວນ້ຳບໍ່? ('Are you thirsty?') you can simply answer ຫິວນ້ຳ ('I'm
    thirsty')." (Drop the last sentence: it repeats the first.)
  - `cmp_pair_hiw_kao`: "“Hungry” is usually {pair}, with {next}." → "“Hungry” is {pair}: ຫິວ plus ເຂົ້າ, “hungry for
    rice”." (Or "“Hungry” needs {next} after ຫິວ: {pair}.")
  - W000001 note: "It is said with the palms pressed together at the chest and a slight bow" → "It is often said with
    the palms pressed together and a slight bow, the ນົບ (nop), especially to older people." Among friends and
    young people, a nop with every hello is not usual (Q5). "Both hello and goodbye" is already asked online (Q0028).
  - ກິນ gloss "eat; (colloquial) drink": ກິນນ້ຳ (kin nam) is the normal everyday way to say "drink water", not slang.
    Suggest "eat; drink". The "(colloquial)" label tells learners to avoid it (Q4 to confirm).
- Why: short, plain teaching lines; no wrong signals about register.
- Confidence: med

### F7 Romanization: "awy" is hard to read, and "as on signs" overclaims
- Screen/route: word cards ຂ້ອຍ, ນ້ອຍ; Settings "Sounds in English letters"   - Device(s): all   - Severity: low
- Evidence: `phone/174_read_L0012_9.png` "khawy", `phone/185_read_L0012_20.png` "nawy"; `data/words.csv` pron_tip for W000006 "Close to 'coy'" and W000090 "Close to 'noy'"; `strings.json` `settings_translit_standard_hint`.
- What happens: English readers cannot say "khawy" or "nawy" at sight, and the tips themselves fall back to "coy" and
  "noy". In Laos the usual spellings are "khoy" and "noy" (Noy is a very common nickname). The Standard hint says "As
  on signs, maps and in most books", but signs in Laos write vowels differently (sabaidee, Khammouane, Champasak),
  so only the consonants match.
- Suggestion: respell ◌ອຍ as **oy** (khoy, noy, and the other ◌ອຍ words when they come) and keep "aw" for open ◌ໍ
  and ◌ອ◌ before other finals. Change the hint to "Like the consonants on signs and maps: the h means a puff of air:
  kh, ph, th." This is the owner's call, not the native's.
- Why: the romanization is only a hint, but it should be readable at first sight.
- Confidence: med

### F8 Desktop-site mode on a phone: usable only by pinch-zooming; Lao marks become illegible
- Screen/route: every lesson screen   - Device(s): phone_desksite   - Severity: med
- Evidence: `phone_desksite/009_L1_9-16_choice_what_does_this_word.png`, `026_L2_12-20_build_sentence.png`, `085_L10try_conversation_all_revealed.png`; `app/frontend/styles.css:149` (`.lao` 2rem), `:294` (the lesson frame is 100dvh tall)
- What happens: the page is laid out 980 wide by about 2069 tall and shown at about 37%. The card stays about 700px
  wide, so it fills only about 255 real pixels. Body text (16px) ends up about 6px tall on screen, and Lao at 2rem
  about 12px, so the tone marks ◌່ and ◌້ (1–2px) cannot be told apart: ບໍ່ (baw, "not") looks like ບໍ. The lesson
  frame is one full "screen" tall, so the question sits at the top and the answers and the Check button are far
  below, in the empty space. Answer buttons and word tiles are about 20–26 real pixels, below a comfortable tap size.
  Nothing breaks, but you cannot read Lao without zooming. The "Keys: 1–9 choose …" line in these shots is probably
  an artifact of the capture (`isMobile: false`); on a real touch phone `(pointer: coarse)` should hide it
  (`styles.css:492`). Not confirmed on a real device.
- Suggestion: detect it (`matchMedia('(pointer: coarse)').matches && screen.width < 600 && innerWidth >= 900`) and
  show a one-line, dismissible banner: "Your browser is showing the desktop site. Turn off 'Desktop site' in the
  browser menu for larger Lao text." Optionally, in that state, let the lesson card use the full width and raise
  `.lao` to about 3rem.
- Why: reading Lao depends on seeing the small marks; desktop-site mode hides exactly those.
- Confidence: med (I estimated sizes from the scale; no real-device test)

### F9 Lao UI strings: mixed "you", two spellings of the question word, two sets of register labels
- Screen/route: native screens (record, suggest, confirm, profile)   - Device(s): all   - Severity: med
- Evidence: `app/frontend/js/strings.json` `lo` values
- What happens and suggestions:
  - **"You" switches.** Everything says ທ່ານ (than, polite "you"), but `pause_body` says ເຈົ້າ twice: "ເຈົ້າເຮັດໄດ້
    {n} ອັນແລ້ວ … ເຈົ້າຈະພັກຕອນນີ້ ຫຼື ເຮັດຕໍ່ກໍໄດ້." Use ທ່ານ: "ທ່ານເຮັດໄດ້ {n} ອັນແລ້ວ. ທຸກອັນຊ່ວຍຜູ້ຮຽນໄດ້ຫຼາຍ.
    ທ່ານຈະພັກກ່ອນ ຫຼື ເຮັດຕໍ່ກໍໄດ້." (than het dai {n} an laew …, "You have done {n} …").
  - **Question word spelled two ways:** ບໍ (baw, no mark) in `profile_english`, `comments`, `cf_question`, but ບໍ່
    (with the mark) in `det_name`, `det_other_meaning`, `det_english`. Pick one for the whole UI. ບໍ່ matches the
    lessons.
  - **The same register shown under two names:** `register_casual` ທຳມະດາ (thammada, "ordinary") vs `style_casual`
    ກັນເອງ (kan eng, "among friends"); `register_neutral` ກາງໆ (kaang kaang, "middling") vs `style_neutral` ທົ່ວໄປ
    (thua pai, "general"); `register_formal` ເປັນທາງການ vs `style_formal` ທາງການ (thaang kaan, "formal"). ທຳມະດາ for
    "casual" is also easy to read as "neutral". Use ກັນເອງ / ທົ່ວໄປ / ທາງການ everywhere (Q7).
  - `sg_respelling` "ອອກສຽງແນວໃດ (ດ້ວຍຕົວໜັງສືຂອງທ່ານເອງ)" means "in your own letters". For a Lao speaker, "my own
    letters" are Lao letters. Say: "ຂຽນສຽງເປັນຕົວອັກສອນອັງກິດ, ເຊັ່ນ sabaidee" ("write the sound in English letters,
    e.g. sabaidee"), and the English to match: "How it sounds, in English letters (e.g. sabaidee)".
  - `cf_yes` "ແມ່ນ, ຄົນເວົ້າ" ("yes, people say") is cut short → "ແມ່ນ, ຄົນເວົ້າແບບນີ້" ("yes, people say it like
    this").
  - `feedback_done` "ແລ້ວ" (laew, "already") alone as a button is odd → "ປິດ" (pit, "close") if it closes the sheet.
  - `_note` says all `lo` text is unreviewed. Once the native has read it, change the note: it now warns natives
    away from strings they have checked.
- Why: natives judge the whole app by its Lao. Inconsistent politeness and spelling read as machine-made.
- Confidence: med (my own Lao; unverified)

### F10 Native questions are English-only, behind a Lao interface
- Screen/route: `#/questions` (native)   - Device(s): all   - Severity: med
- Evidence: `app/frontend/js/questions.js:98` renders `q.question` as is; options support `label_lao` (line 49) but `data/open_questions.csv` Q0017–Q0034 have no Lao text; the profile asks "ທ່ານເຂົ້າໃຈພາສາອັງກິດບໍ?" ("Do you understand English?") with a "No" option.
- What happens: a native who picked "No English" opens "Questions for you" (in Lao) and gets English questions such as
  "Does ດຳນ້ຳ mean "to dive" (go under the water)?".
- Suggestion: add `question_lo` and `label_lao` to the CSV and the RPC, and show the Lao first. Until then, offer
  questions only to natives with some English. The Lao versions must be written or checked by the owner's wife.
- Why: the people with the best Lao are often the ones with the least English.
- Confidence: high on the code; untested in the live app

### F11 The ແ hint and the planned ເ hint both point at "say"
- Screen/route: L5 vowel card ແ◌   - Device(s): all   - Severity: low
- Evidence: `data/units.csv` V15 "the e in 'bed', held long, leaning towards the 'a' in 'say'"; `docs/SOUND_HINTS.md` proposed V12 ເ◌ "'ay' in 'say' without sliding"
- What happens: the ແ hint is agreed, and I am not re-asking it. But when ເ◌ is taught, two different vowels, ແລ້ວ
  (laew, "already") and ເລກ (lek, "number"), will both be "towards *say*". Lao speakers hear them as clearly different
  (ແ is the more open one).
- Suggestion: before ເ◌ is taught, write the two hints as a pair and test them together. For example, ແ: "e in
  'bed', held long, mouth opened a little wider"; ເ: "'ay' in 'say' with no slide". Add a "Not ເ◌" / "Not ແ◌"
  warning, as SOUND_HINTS already does for other pairs.
- Why: a contrast hint must separate the pair it contrasts.
- Confidence: med

### F12 Desktop: the "Complete the conversation" heading is clipped under the dry-run pill
- Screen/route: L10 complete-the-conversation feedback   - Device(s): desktop   - Severity: low
- Evidence: `tmp/review/shots/desktop/086_L10try_25-52_choice_complete_the_conversation_fb.png` (only the lower half of the heading shows)
- Suggestion: on feedback, keep the scroll at the top, or keep the heading out of the scrolled area.
- Confidence: med (one shot)

## Conversations (lessons 8 and 10): verdict
- D0001 (ສະບາຍດີ, sa-baai-dii, "hello" ×2 → ສະບາຍດີບໍ່?, "how are you?" → ສະບາຍດີ, "I'm well") is a real
  exchange between two acquaintances.
- D0002 is also realistic: two adults who are polite but not close, since ເຈົ້າ (chao, "you") and ຂ້ອຍ (khawy, "I") is
  the neutral pair. B's ຫິວ. ເຈົ້າຫິວເຂົ້າບໍ່? (hiw. chao hiw khao baw?, "Yes. Are you hungry?") and A's ບໍ່ຫິວ.
  ຂ້ອຍກິນເຂົ້າແລ້ວ. (baw hiw. khawy kin khao laew., "No, I've already eaten.") sound like real speech. Only one thing
  is missing: after ຂ້ອຍສະບາຍດີ (khawy sa-baai-dii, "I'm well"), people almost always ask back "and you?" (see
  Missing features).
- Lao speakers greet each other with ກິນເຂົ້າແລ້ວບໍ່? (kin khao laew baw?, "Have you eaten yet?"), taught in lesson 6,
  more than with "are you hungry". A later conversation could open with it.

## Missing features / sections
- "And you?" line in conversations: after ຂ້ອຍສະບາຍດີ, the reply ແລ້ວເຈົ້າເດ? (laew chao de?, "And you?") is what a
  learner will hear first in Laos (Q6 to confirm the exact form). It needs the vowel ເ◌ (a later unit). Plan it for
  the first lesson after ເ◌. Size S (content only).
- "Have you eaten?" greeting conversation: ກິນເຂົ້າແລ້ວບໍ່? → ກິນແລ້ວ (kin laew, "I have") / ຍັງ (nyang, "not yet").
  The most Lao small talk there is; all but ຍັງ is taught by lesson 6. Size S.
- Lao-language native questions (F10): `question_lo` and `label_lao` columns plus rendering. Size S–M.
- Desktop-site detector banner (F8). Size S.
- A pronouns note for the info sheet: when ເຈົ້າ/ຂ້ອຍ is right, and that older people get kin words such as ລຸງ (lung,
  "uncle") or ປ້າ (paa, "aunt"). Write it once Q0023/Q0024 are answered. Size S.

## Top 5 (most valuable changes, ranked)
1. F1: write ຈ as **j** in both styles (or name the mismatch on the card). Today the card contradicts itself.
2. F3: rewrite the ຫິວ note so it no longer contradicts lesson 10's ຫິວ reply.
3. F5: fix the English side of the sentence cards: consistent "please", no infinitive card, one-line he/she prompts.
4. F9 + F10: one politeness level and one question-word spelling in the Lao UI, and Lao text for the native questions.
5. F2 + F4: one romanization system per card, and ບໍ່ ມີ segmented the same way everywhere.

## Questions for the native speaker
(Meaning or usage only, one thing each. They follow the QUESTIONS.md rules: her recordings already settled
"is it natural?" for these sentences.)
1. Someone says just ກິນເຂົ້າ (kin khao). What do they mean? (My guess: "Come and eat" or "Let's eat", or, as an
   answer, "I'm eating".)
2. In a shop you say ມີນ້ຳບໍ່? (mii nam baw?). Are you asking "Do you have water?", "Is there water?", or either? (My
   guess: either.)
3. Someone says ລາວມາແລ້ວ (laao maa laew). Is that person already here, or still on the way? (My guess: here, or
   just arriving; both are possible.)
4. At home, do you say ກິນນ້ຳ (kin nam) for "drink water"? Is it OK to say to anyone? (My guess: yes, everyday; ດື່ມນ້ຳ
   (deum nam) is more formal.)
5. When you say ສະບາຍດີ (sa-baai-dii, "hello") to a friend your own age, do you also put your hands together
   (ນົບ, nop)? (My guess: usually not, only to older people or at formal events.)
6. After you answer ຂ້ອຍສະບາຍດີ (khawy sa-baai-dii, "I'm well"), what do you say to ask the other person back? Please
   write it in Lao. (My guess: ແລ້ວເຈົ້າເດ? (laew chao de?, "And you?").)
7. In the app, a word you say with friends and family is labelled ທຳມະດາ (thammada) on one screen and ກັນເອງ (kan eng)
   on another. Which label fits better? (My guess: ກັນເອງ.)
8. The app's "keep going?" screen says ເຈົ້າ (chao, "you"), and the other screens say ທ່ານ (than, "you"). Which feels
   right when an app talks to you? (My guess: ທ່ານ.)
9. Someone says ເຈົ້າມາບໍ່? (chao maa baw?). Is it "Are you coming (now)?" or "Will you come (later, to an event)?"
   (My guess: both, depending on the situation.)

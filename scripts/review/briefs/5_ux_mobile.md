# Agent 5: UX doctorate, phones · id `5_ux_mobile` · account N=5

**Who you are:** you hold a doctorate in UX design and specialise in mobile learning apps and interaction
consistency. You review the `phone` shots (the full set) and compare them with `phone_desksite`.

**Review:**
- **Consistency across activity types.** For each question type and its feedback, map where the prompt, the Lao
  text, the speaker button, the answer area, the feedback panel and the primary button sit.
  - Does the eye have to hunt for the same information in different places as the activity changes?
  - Are there duplicate controls (two speaker buttons) or controls in odd places?
  - Make a table: activity × element → position.
  - Include the conversation card (lessons 8 and 10, before and after Reveal) and "Complete the conversation".
- **Control styling and hierarchy.** Buttons vs text links, primary vs secondary actions, tap target sizes,
  thumb reach. Is everything you can tap clearly tappable?
- **Wording of prompts and instructions:** short, parallel and clear across activity types? Quote the strings
  (`app/frontend/js/strings.json`) and propose new ones.
- **Screens outside lessons:** lesson summary, home, settings, the info sheet. Are they consistent with each other
  and with lesson chrome (flag, settings, close)?
- **Font-size sweep.** The team wants to know whether Lao text is too large on phones once sentences get longer.
  - Find the longest sentences and words used in lessons 1–12: grep `data/sentences.csv` and `data/lessons.csv`
    (the lesson tag columns are in `docs/SCHEMA.md`).
  - Shoot the activities that show them at 360×760 and 412×915. Use the live app with your account and a script
    in `tmp/review/scratch/5_ux_mobile/`.
  - Recommend sizes for `.bs-tile .lao`, `.mc-option .lao`, `.bs-answer`, `.glyph` and base `.lao`, with the
    evidence.
- **Dark mode** and the colour themes on a phone.

Also list the features you expected and did not find.

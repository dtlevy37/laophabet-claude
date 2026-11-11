# Brief: "one logical choice" fill in the blank (for an Opus planning session)

Owner: user. Written 2026-11-11 from the S6c browser feedback. Not yet planned. Fits APP_PLAN S7a (sentence
activities); the plan should decide whether S7a is re-cut. Deliverable: a design section in `_agent/APP_DESIGN.md`
(under "Activities") plus any change to the S7a slice and to the data plan, then stop for the user.

## The idea (user's words, paraphrased)
Fill in the blank is "really, really useful" when **exactly one option is logically valid**.
Example: `ລາວ ກິນ __` — the blank must be ນ້ຳ or ເຂົ້າ (both are things you eat or drink), so those two can never both
be options. The wrong options must be clearly wrong: ຂາ "leg", ຂາວ "white". The same idea should work for any blank
in any sentence.

## The hard part: deciding what counts as a valid or invalid option
- A distractor must be **definitely wrong** in that slot, and the right answer must be **the only valid one**. Two
  valid answers in one question is a defect: the learner is marked wrong for a correct reading.
- Needs some form of word-class and compatibility data. Candidates to weigh (the plan should recommend one):
  1. Hand-tagged slot data per sentence: `valid_fillers` (all acceptable) and `bad_fillers` (known wrong), written by
     the content drafter and reviewed. Most accurate, most work, grows with content.
  2. A small semantic-category column on words (food_drink, body_part, colour, person, verb_eat ...), with the rule
     "distractors come from a category that cannot fill the slot". The slot's category can come from the verb
     (ກິນ takes food_drink). Cheap to scale; needs a compatibility table (verb or frame -> allowed categories).
  3. The existing 30 sentence templates and 159 template_fillers (`data/`): templates already say which fillers
     fit a slot. Check how far they get us and whether they can be reused for lessons 1–4 words.
  4. Part of speech only (noun vs adjective): too weak alone (ນ້ຳ and ຂາ are both nouns), so at most a first filter.
- Which words are allowed as distractors: taught words only (readable by this learner), at level >= 1.
- Unusual cases: homographs (ລາວ "Lao" / "he"), words that fit a slot with a stretch of meaning (ກິນ ຂາ?), polarity
  (ບໍ່ before a verb), pronouns. How is "only one logical choice" checked when the tagging is `unverified`? Native
  speakers (expected from about Dec 2026) should review the slot tags, so the tag columns need a confidence mark
  like every other row.
- What if the lesson's words cannot make a good blank yet (lesson 1–2 have too few words)? Rule for skipping.

## Questions to settle in the plan
1. Data model and file (new CSV? columns on sentences or words?), SCHEMA.md changes, and which script writes it
   (`db_sql.py`, `lesson_tool.py` changes would be proposals in `_agent/proposed-scripts/`).
2. How a blank is chosen in a sentence (which word, any word? only content words?), and how many distractors (3?).
3. How the RPC bundle carries it (the client reads content only through RPCs).
4. Activity module shape: `{type, canUse, render}`; ladder level (recognition vs recall); what is logged.
5. Effect on lessons: do drafts get the tags at draft time (new columns in the `draft-content` skill and drafter
   brief)? Does `lesson_tool.py check` verify "at least one blank-able sentence"? Can lessons 1–4 be covered
   additively, without changing merged content?
6. Test plan: how the agent checks that no question has two valid answers (a script over the tag data).

## Context to read (not everything)
APP_DESIGN "Activities" and "Lesson session"; APP_PLAN S7a; SCHEMA.md sentence columns; `js/activities/multiple_choice.js`
(its `build`, `clash`, pool rules are the pattern for distractors); `data/templates*.csv` headers only; lessons 1–4
words and sentences via `lesson_tool.py brief`.

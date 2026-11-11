---
name: activity-module
description: How quiz activities work in the app and how to add one — the module interface, the level ladder, distractors, the answer object, and how the session planner uses activities in lessons and practice sessions. Use when adding an activity, changing the activity interface, or changing the session planner.
---

# Activities

Spec: `_agent/APP_DESIGN.md` (ladder, activity table, "Lesson session", practice sessions, stats). Read it before
changing anything here. Where this skill and APP_DESIGN disagree, APP_DESIGN wins; fix this skill.

## The interface
Each activity is one module in `app/frontend/js/activities/<type>.js`, registered in `activities/index.js`.
`activities/teach_card.js` is the reference.
```js
export default {
  type: 'multiple_choice',
  direction: 'recognition',       // 'show' | 'recognition' | 'recall' (the three record_answers directions)
  itemTypes: ['word', 'unit'],
  minLevel: 1,                    // the item must be at or above this level (APP_DESIGN ladder)
  canUse(item, level, pool) { ... }, // pool = distractor candidates; false if not enough options
  build(item, pool, rng, opts) { ... }, // -> spec {activity: type, ...}: a plain object, no DOM; null if it cannot
  again(spec, rng) { ... },          // question activities: the same question for another try (replay + 1)
  render(root, spec, done, ctx) { ... }, // draws the spec; calls done(answers) once. ctx = {bundle, last}
}
```
- `item` is a card item from `cardItems` (teach_card.js): `detail` plus `shown`, the ids it stands for.
- The runner queues `again(spec)` at the end of the session when an answer has `correct: false` (at most twice).
- The info icon on the tested item appears only after the answer (it would give the answer away before).
- `activities/multiple_choice.js` is the reference for a question activity.
- `build` is pure (given a seeded `rng`), so the planner builds the whole session up front and a spec can be
  rebuilt from the seed (resume, S7b).
- `render` uses `h()` and `t()` (frontend-feature skill), draws its own Next / Continue button, and after an
  answer (right or wrong) shows the correct one with the item's info icon before calling `done`.
  The runner may call `render` again for the same spec (a settings change redraws the screen).
- The same module serves lessons and practice sessions. It never knows which one it is in.

## The answer objects
`done(answers)` takes an array (one card can teach two items; the intro card reports none), each:
```js
{ item_type, item_id, activity: type, direction, correct, first_try, latency_ms,
  lao_word_ids: [...] }   // words the learner had to read in Lao to answer (feeds "words read")
```
The runner (`session.js`) adds a client `answer_id` and sends batches to `record_answers`; failed batches are
resent. Teach cards send `{ item_type, item_id, activity: 'teach_card', direction: 'show' }` (level 0 → 1, no
`correct`). A missed question asked again is sent with `first_try: false`.

## Rules every activity follows
- **Show first, test later:** never test an item below `minLevel`. The check right after a teach card is asked with
  the card gone and counts as recognition. Recall activities for a new item normally start in a later session.
- **Distractors:** the tested item is always taught; wrong options come from the bundle's `distractors`. In lessons
  1–5 they may come from any of lessons 1–5, and from lesson 6 on only from taught items (the RPC already applies
  this). Never two options with the same Lao or the same label. If there are fewer than 3 options, `canUse` returns
  false and the planner skips the question.
- **No demotion:** a wrong answer never lowers a level; it only affects scheduling.
- Words are tested on meaning, never on the English-letter spelling; units on their sound, labelled as on the card.
- Lao is always shown as script; respelling and IPA follow the user's setting.
- No typing Lao (writing is out of scope). Answers are taps.

## The session planner (`session.js`)
Input: the content bundle from `get_lesson` (items, distractor pool, the learner's `levels`). Output: an ordered
list of specs. The rules are the table in APP_DESIGN "Lesson session":
- **Lesson:** walk the items in order. New unit or word: teach card, then one check. New rule: card only. Recycled
  word: one question, no card. Sentences: reading card, then build the sentence (S7a). Then a closing mixed block,
  then every question missed on the first try again until right once.
- **Practice (S8b):** no teach cards and no new items. Due items first, then weak ones, then the oldest seen.
  Favour recall for items at level ≥ 2. Never the same item twice in a row. About 15–20 answers.
- Both end on the summary screen, using only what `complete_lesson` / `complete_practice` returns.

## Adding an activity: checklist
1. Check APP_DESIGN's activity table for its data, level and v1/v2 status; add a row if it is new.
2. Write the module and register it. Strings in strings.json.
3. Teach the planner when to use it (direction, item types, level).
4. Verify with the bundles of lessons 1–4 on paper: can `build` always fill its options at lesson 1? If not,
   `canUse` must say so.
5. Hand-over: which lesson or practice route shows it, and what a right and a wrong answer should look like.

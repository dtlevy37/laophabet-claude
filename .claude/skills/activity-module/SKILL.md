---
name: activity-module
description: How quiz activities work in the app and how to add one — the module interface, the level ladder, distractors, the answer object, and how the session planner uses activities in lessons and practice sessions. Use when adding an activity, changing the activity interface, or changing the session planner.
---

# Activities

Spec: `_agent/APP_DESIGN.md` (ladder, activity table, practice sessions, stats). Read it before changing anything here.
Where this skill and APP_DESIGN disagree, APP_DESIGN wins; fix this skill.

## The interface
Each activity is one module in `app/frontend/js/activities/<type>.js`, registered in `activities/index.js`:
```js
export default {
  type: 'multiple_choice',
  direction: 'recognition',       // 'show' | 'level1' | 'recognition' | 'recall'
  itemTypes: ['word', 'unit'],
  minLevel: 1,                    // the item must be at or above this level (APP_DESIGN ladder)
  canUse(item, level, pool) { ... }, // pool = distractor candidates; false if not enough options
  build(item, pool, rng) { ... },    // -> spec: a plain object (prompt, options, answer); no DOM
  render(root, spec, done) { ... },  // draws the spec; calls done(answer) once
}
```
- `build` is pure (given a seeded `rng`), so the planner can build the whole session up front and a spec can be
  logged or replayed.
- `render` uses `h()` and `t()` (frontend-feature skill), shows the info icon on the tested item, and after a wrong
  answer shows the correct one with its info icon before calling `done`.
- The same module serves lessons and practice sessions. It never knows which one it is in.

## The answer object
`done(answer)` with:
```js
{ item_type, item_id, activity: type, direction, correct, first_try, latency_ms,
  lao_word_ids: [...] }   // words the learner had to read in Lao to answer (feeds "words read")
```
The session runner adds `session_id` and a client answer id, and flushes batches to `record_answers`. Teach cards
send `{ item_type, item_id, activity: 'teach_card', direction: 'show' }` (moves level 0 → 1, no rating).

## Rules every activity follows
- **Show first, test later:** never test an item below `minLevel`. Recall activities for a new item normally start
  in a later session.
- **Distractors:** the tested item is always taught; wrong options come from the bundle's `distractors`. In lessons
  1–5 they may come from any of lessons 1–5, and from lesson 6 on only from taught items (the RPC already applies
  this). Prefer confusable options (same shape or sound) once a confusable-sets table exists. If there are too few,
  `canUse` returns false and the planner picks another activity.
- **No demotion:** a wrong answer never lowers a level; it only affects scheduling.
- Lao is always shown as script; respelling and IPA follow the user's setting.
- No typing Lao (writing is out of scope). Answers are taps.

## The session planner (`session.js`)
Input: mode (`lesson` | `practice`), the content bundle, the learner's item levels (and due dates once FSRS exists).
Output: an ordered list of specs.
- **Lesson:** teach card per new item in lesson order, a level-1 check after each new item or pair, then a mixed
  block of recognition activities over new items (level 1→2) and recycled items (levels 2–3); end with a phrase or
  sentence activity when the lesson has one. About 15–25 answers.
- **Practice:** no teach cards and no new items. Pick due items first, then weak ones (most wrong recently), then
  the oldest seen. Favour recall over recognition for items at level ≥ 2. Mix activity types; never the same item
  twice in a row. Default length 15–20 answers (about 5 minutes).
- Both end on the summary screen, using what `complete_lesson` / `complete_practice` returns (APP_DESIGN "Stats").

## Adding an activity: checklist
1. Check APP_DESIGN's activity table for its data, level and v1/v2 status; add a row if it is new.
2. Write the module and register it. Strings in strings.json.
3. Teach the planner when to use it (direction, item types, level).
4. Verify with the bundle of lesson 1–3 (from `get_lesson`) on paper: can `build` always fill its options at
   lesson 1? If not, `canUse` must say so.
5. Hand-over: which lesson or practice route shows it, and what a right and a wrong answer should look like.

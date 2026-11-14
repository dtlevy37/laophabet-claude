# A8 Letters and sounds, A9 My words, S8b Review (plan 2026-11-14)

Owner (2026-11-14): build the three home sections in this order, reusing existing content. Specs: DESIGN "Practice
sessions", "Stats and encouragement", the ladder; PLAN A8, A9, S8b. Agent decisions below; the owner can change any.

## Shared
- All three read through new RPCs (security definer, `auth.uid()` check, execute revoked from `public, anon`), reusing
  `unit_json` / `word_json` / `sentence_json` (20261111020000) and `word_notes` / `item_audio` where they help.
- "Reached" = the learner has a `learner_items` row at level >= 1 (a teach card was shown). Nothing locked is listed.
- Level names shown to learners: 1 "New", 2 "Recognised", 3 "Recalled", 4 "In use" (strings.json).
- Home tiles go live as each slice lands (`js/home.js` `SOON`), with a status line from the RPC.
- Learner routes: `#/letters`, `#/letters/<unit_id>`, `#/words`, `#/words/<word_id>`, `#/practice`. Not `#/review`:
  natives already use it (app.js). The home tile is still called "Review".

## A8 Letters and sounds
- `learner_units()` -> `[{unit_id, kind, role, lao, intro_lesson_id, intro_lesson_order, detail (unit_json), level,
  n_correct, n_wrong, last_seen_at, examples [{word_id, lao, respelling, gloss_en}]}]` for units the caller reached,
  in teaching order (lesson order, then position). `examples`: up to 6 words the caller reached (level >= 1) that
  contain the unit (`word_units`), most recently introduced last. Plus `{remaining}` = live taught units not reached
  (as a separate field: return `{units, remaining}`).
- Screen `#/letters`: groups Consonants / Vowels / Tone marks; each a tile with the glyph (Lao script main) and its
  sound label (`teach_card.js` `unitSound`, respecting the sound-spelling setting). Tap opens `#/letters/<id>`: the
  unit's teach card content (reuse teach_card rendering / `openInfo`, no quiz), ▶ audio of examples where recorded,
  the example words, the lesson it came from, and "Practise writing" linking into `#/write` for consonants that
  have strokes. Footer "n more to come in later lessons".
- **Done when:** a learner with lessons 1–3 done sees exactly the units those lessons taught, grouped, each opening its
  card with known example words; one with no lesson sees an empty state pointing to lesson 1.

## A9 My words
- `learner_words()` -> `{words: [{word_id, lao, respelling, gloss_en, pos, intro_lesson_id, intro_lesson_order,
  level, n_correct, n_wrong, first_seen_at, last_seen_at, first_try_pct (from review_log, non-show rows, attempt 0
  where present), bonus bool}]}` for words the caller reached. Detail on tap uses `word_json` via a
  `learner_word(p_word_id)` RPC (refuses words the caller has not reached) that adds notes, audio and 2 example
  sentences the caller reached (fall back to none).
- Screen `#/words`: search box (Lao, respelling or English), filter chips All / Needs work (first_try_pct < 70 or
  n_wrong > n_correct) / Newest, list rows (Lao main, respelling, gloss, level badge). `#/words/<id>`: card info,
  ▶, notes, examples, personal stats in plain words ("Right 8 of 10 first tries", "Seen first in lesson 3").
- **Done when:** a learner with lessons 1–3 done sees every word those lessons introduced (bonus words marked), search
  and filters work, and a word's page shows their own stats.

## S8b Review (practice)
- Fixed intervals until S9: an item's box = number of trailing right first tries (non-show `review_log` rows, newest
  first, stop at the first wrong), capped at 5; due at last answer + {0: now, 1: 1d, 2: 3d, 3: 7d, 4: 14d, 5: 30d}.
- `practice_status()` -> `{available bool (lesson 1 done), due int, reached int}` for the home tile.
- `start_practice(p_local_day)` -> `{session_id, bundle}`; bundle has get_lesson's shape (`lesson` = `{kind:
  'practice'}`, `items` with `role 'review'` and `detail`, `distractors` through the caller's furthest completed
  lesson (min 5, as get_lesson), `untaught`, `levels`). Items: words, units and sentences at level >= 1; due first
  (most overdue), then weak (wrong in the last 7 days), then least recently seen; about 8 items for 15–20 answers;
  never rules. `complete_practice(p_session)` -> `session_summary` (counts for the streak like a lesson).
- Client: `planPractice(bundle, levels, seed)` in session.js (or a sibling module): no teach cards; level >= 2 items
  get recall activities, level-1 items recognition; mixed types; never the same item twice in a row; missed
  questions replayed once at the end as in lessons. Stop early = summary of what was answered. Summary reuses
  `summary.js` with "Review again" / "Back home".
- **Done when:** a learner with lesson 1 done sees the Review tile live with a due count, can run a session of 15–20
  answers with no teach cards, and gets the summary; answers move levels like lessons.

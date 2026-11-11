# S7c + S7f script group: hand-over (2026-11-11, builder)

Nothing here has been run. Every script, the SQL and the text are **untested**; they were checked by reading only.
Lesson 4 rebuild not done (waits for approval).

## 1. Files staged
All staged script files were built on the approved versions (the same-named files already in `_agent/proposed-scripts/` were byte-identical to `approved-scripts/`).

| File | What changed |
|---|---|
| `_agent/proposed-scripts/build_order.py` | rev 6: new `role_units()` (shared with lesson_tool) and `word_unit_rows()`; writes `data/word_units.csv` (word_id, syl_index, position, unit_id, source `SRC-AGENT:parse_syllable`, confidence `derived`, notes) for every word; a word that does not parse gets no rows (WARN). |
| `_agent/proposed-scripts/db_sql.py` | rev 2: TABLES gain `word_units`, `word_categories`, `sentence_slots` (pool tables, after learning_order, so the seeds become `10_word_units.sql`, `11_word_categories.sql`, `12_sentence_slots.sql`); FKs, not-null, lesson lock; `word_categories.csv` / `sentence_slots.csv` are optional (missing = empty; refresh skips them); `check` rejects a lesson_items role outside new/recycle/example/bonus; `lesson` carries the lesson's word_units, sentence_slots, and word_categories (+ words rows) of its words and their homographs; `change`: a W id also carries word_units + word_categories, an S id sentence_words + sentence_slots, rows missing from the CSVs are retired; explicit prefixes (`word_categories:W…`, `sentence_slots:S…`, `word_units:W…`). |
| `_agent/proposed-scripts/lesson_tool.py` | rev 2: role `bonus` (rules below); budget = warnings; S7c checks and the blank-option listing in `check`; new `check --merged`; `brief` has a "Bonus words" section, the category list and the activity-data format; `lookup`/`can-read`/`status` say core vs bonus; units via `build_order.role_units`. All old commands and flags kept (`--max-*` move the warning thresholds). |
| `_agent/proposed-scripts/validate_data.py` | rev 5: checks `categories.csv`, `word_categories.csv`, `sentence_slots.csv` (answer at the position fits `accepts`, no `function` in accepts, ids exist), `word_units.csv`. This is how the pipeline validates categories (pipeline.sh itself unchanged). |
| `_agent/proposed-scripts/next_lesson_prompt.md` | runner follows `_agent/CURRICULUM_PATH.md` for the next lesson number (stops with a NEEDS_HUMAN note when there is no entry), core/bonus/sentences/conversation lines as ordinary sentences, budget flags from the path and budget as a guideline, categories and slots at draft time, native-speaker questions to NEEDS_HUMAN. |
| `_agent/proposed-config/.claude/skills/draft-content/SKILL.md` | four draft files (words, sentences, word_categories, sentence_slots), tag-file formats, placeholder replacement, scanning the printed options. |
| `_agent/proposed-config/.claude/agents/drafter.md` | drafter writes the two tag files; authoring rule for `accepts`. |
| `app/backend/supabase/migrations/20261111020000_activity_data_bonus.sql` | NEW: tables `word_units`, `word_categories`, `sentence_slots` (updated_at/retired_at, RLS on, no policies); `lesson_items_role_check` gains `bonus`; helper `word_cats()` (not callable by users); `word_json` + `units`; `sentence_json` + `slots`; `get_lesson` pool words + `cats`, pool includes bonus words; `list_lessons` + `bonus`. Line added to `_agent/PENDING_MIGRATIONS.md`. |

Older copies at `_agent/proposed-config/skills/draft-content/SKILL.md` and `_agent/proposed-config/agents/drafter.md` are stale (identical to the installed ones); the new ones are under `_agent/proposed-config/.claude/`.

## 2. Steps after approval (in order)
1. User: install the five scripts into `approved-scripts/` (build_order.py, db_sql.py, lesson_tool.py, validate_data.py, next_lesson_prompt.md) and the two `.claude/` files, the usual way.
2. User: in `app/backend/supabase/config.toml` `[db.seed] sql_paths`, add after `09_learning_order.sql`:
   `"./seeds/10_word_units.sql",` `"./seeds/11_word_categories.sql",` `"./seeds/12_sentence_slots.sql",`
3. Main session: create `data/categories.csv`, `data/word_categories.csv`, `data/sentence_slots.csv` (section 3), then `bash approved-scripts/pipeline.sh` (build_order writes word_units.csv; validate checks the tags).
4. Main session: `python approved-scripts/lesson_tool.py check --merged`: 0 errors; read the printed options (no second valid answer).
5. Main session: backfill migration (content SQL only from the script):
   `python approved-scripts/db_sql.py change --name s7c_backfill --note "word units, categories, slots for lessons 1-4" W000018 W000019 W001425 W000031 W000058 W000011 W000389 W000538 S000002870 S000002872 S000002873 S000002874 S000002876`
   then `python approved-scripts/db_sql.py seed`.
6. Main session: lesson 4 rebuild (withdraw, re-merge with ຂາ as bonus; the brief's "Then" section). The new L0004 migration will sort after the schema migration.
7. User: `supabase db reset` (from `app/backend`), sign up, then the SQL block below.

```sql
-- 1. ກິນ has units C01, V04, C13f (expect 3 rows: 1 C01 ກ / 2 V04 ◌ິ / 3 C13f ◌ນ)
begin;
select set_config('request.jwt.claims', json_build_object('sub', (select id from auth.users limit 1), 'role', 'authenticated')::text, true);
set local role authenticated;
select jsonb_path_query(public.get_lesson('L0001'), '$.items[*] ? (@.item_type == "word").detail.units[*]');
-- 2. a slot on ກິນເຂົ້າ in lesson 3 (expect [{"position":1,...},{"position":2,"accepts":["food","drink"],"exclude":[]}])
select jsonb_path_query(public.get_lesson('L0003'), '$.items[*] ? (@.item_id == "S000002870").detail.slots');
-- 3. pool word cats: ເຂົ້າ rice gets the union with "enter" (expect ["action","food","motion"]); ນ້ຳ ["drink"]
select jsonb_path_query(public.get_lesson('L0003'), '$.distractors.words[*] ? (@.lao == "ເຂົ້າ" || @.lao == "ນ້ຳ")');
-- 4. after the L4 rebuild: ຂາ is role bonus in the bundle and in the pool (expect "bonus", then one pool row for ຂາ)
select jsonb_path_query(public.get_lesson('L0004'), '$.items[*] ? (@.item_id == "W000389").role');
select jsonb_path_query(public.get_lesson('L0004'), '$.distractors.words[*] ? (@.word_id == "W000389").word_id');
rollback;
-- 5. role check (as postgres): 'bonus' accepted, anything else refused (expect the second insert to fail with lesson_items_role_check)
begin;
insert into public.lesson_items (lesson_id, position, item_type, item_id, role) values ('L0001', 99, 'word', 'W000018', 'bonus');
insert into public.lesson_items (lesson_id, position, item_type, item_id, role) values ('L0001', 98, 'word', 'W000018', 'bogus');
rollback;
-- 6. negative: anonymous call fails (expect permission denied for function get_lesson)
begin; set local role anon; select public.get_lesson('L0001'); rollback;
-- 7. content tables closed to clients (expect permission denied for table word_categories)
begin; set local role authenticated; select * from public.word_categories limit 1; rollback;
```
list_lessons `bonus` shows only for a done lesson: after playing lesson 4, `select jsonb_path_query(public.list_lessons(), '$[3].bonus')` as that user should give `[{"item_type":"word","lao":"ຂາ","en":"leg"}]`.

## 3. Hand-tagged data still to write (all `unverified`, agent tags; for native review)
`data/categories.csv` (header `category,definition,examples`; not a DB table): the APP_DESIGN first set
person, animal, plant, food, drink, body, clothing, object, place, time, number, quality, action, function, plus the
verb classes first needed: `consume` (eat, drink: ກິນ, ດື່ມ) and `motion` (go, come, enter: ໄປ, ມາ, ເຂົ້າ "enter").
A verb class is simply a category that some word lists together with `action` (no extra column).

`data/word_categories.csv` (header `word_id,categories,source,confidence,notes`), proposed for the L1–5 pool:
W000018 ກິນ `action|consume` · W000019 ເຂົ້າ rice `food` · W001425 ເຂົ້າ enter `action|motion` · W000031 ລາວ he/she `person` · W000058 ລາວ Laos/Lao `place|person` · W000011 ນ້ຳ `drink` · W000389 ຂາ `body` · W000538 ຂາວ `quality`.

`data/sentence_slots.csv` (header `sentence_id,position,accepts,exclude_word_ids,source,confidence,notes`). Example for lesson 3's ກິນເຂົ້າ (S000002870: 1 ກິນ W000018, 2 ເຂົ້າ W000019):
```
sentence_id,position,accepts,exclude_word_ids,source,confidence,notes
S000002870,2,food|drink,,,unverified,Tagged by the agent; ກິນ __ : food or drink
S000002870,1,action|person|animal,,,unverified,Tagged by the agent; __ ເຂົ້າ : ລາວເຂົ້າ "he enters" fits (ເຂົ້າ = enter)
```
Expected `check --merged` for L3 (`ກິນ __`): answer ເຂົ້າ; ນ້ຳ excluded (drink); safe: ລາວ, ຂາ (ຂາວ only while the old L4 is merged). Also tag S000002872 (ລາວ ກິນ ເຂົ້າ: 1 `person|animal`, 3 `food|drink`), S000002873 (ກິນ ນ້ຳ: 2 `food|drink`), S000002874 (ລາວ ກິນ ນ້ຳ: 1 `person|animal`, 3 `food|drink`), S000002876 (ລາວ ຂາວ: 2 `quality`; it leaves L4 but stays in the pool). Re-check each against every sense (ນ້ຳເຂົ້າ as a compound for slot 1 of S000002870 is a native-speaker question).

## 4. How a draft marks a bonus word (lesson 4 rebuild)
items.csv line: `2,word,W000389,bonus,'leg'; bonus word (known letters only; not in any sentence)`
Then ຂາ must have a word_categories row, must not appear in any sentence of L4 or later until a lesson lists `W000389` with role `new`.

## 5. Decisions, risks, unfinished
Decisions:
- Bonus rules as the brief; plus: a word may not be both bonus and new/recycle in one lesson; a bonus word can be recycled; bonus words do not count toward the words budget or "introduces something new"; more than 2 bonus words is a warning; promoted (ex-bonus) words count in the words budget and weight.
- Budget over/under is a warning; the fixed lesson 1, readability, show-first, unknown ids, "uses something new" (for non-promoted new words), bonus-in-sentence, and "introduces nothing new" stay errors.
- Bonus words enter the get_lesson distractor pool (and the check's pool) like core words; `new_items` and `covers` still count role `new` only; `list_lessons.bonus` is a separate key, so the current frontend is unaffected.
- Verb safety rule implemented by expanding `cats` (both in `word_cats()` SQL and lesson_tool), so the S7e client only tests disjointness. Verb classes are derived from the data (categories co-occurring with `action`), not from a column; any mistake there only removes distractors.
- Missing categories / slots are errors for every lesson in `check --merged` and for drafts; `check` errors if `data/categories.csv` is missing.
- Tag files are hand-maintained data (written after merge with real ids); merge_words.py and check_drafts.py unchanged.
- `word_units.unit_id` has no FK (units holds only taught units); `word_json.units[].lao` is null for an untaught unit.
- pipeline.sh unchanged (validate_data does the category checks; `check --merged` is a separate step so the pipeline does not fail before tagging).

Risks / untested:
- All of it untested. SQL: `word_cats()` and the constraint name `lesson_items_role_check` (Postgres default naming) are read-checked only.
- Until the frontend part of S7f, a bonus item plays like a new word and its badge string `badge_bonus` is missing from strings.json.
- `check` (draft) needs categories.csv and tags in place, so the L4 rebuild must come after step 3.
- The homograph warning will fire on most early sentences (ລາວ and ເຂົ້າ are homographs): expected noise.
- Not done (out of scope or forbidden here): app/README.md (new tables, contract changes), SCHEMA.md (new files, role bonus, categories.csv), CHANGELOG, PROGRESS, APP_PLAN ticks, config.toml seed lines.

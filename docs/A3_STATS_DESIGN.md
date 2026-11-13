# A3 Stats capture: design note (draft 2026-11-13, NOT agreed, not built)

Written by a planning subagent from the code as of commit 67c877e (before A2). Line numbers may have moved after
A2 (build_word any-order mode, build_sentence Check). Owner answers to section 7 are needed before building.

## 1. Gaps today
- The chosen answer is dropped: multiple choice keeps `st.picked` but sends only `correct`
  (`app/frontend/js/activities/multiple_choice.js:136-150`); same in `fill_blank.js:137-145`; build the sentence
  drops the built order (`build_sentence.js:111-125`) and its tiles carry no word ids (`build_sentence.js:64`).
  No confusion pairs are possible.
- The options shown are dropped (`spec.options` / `spec.tiles` never reach the RPC).
- Build the word records only the step of a slip (`build_word.js:95`), not the tile tapped ("wanted ດ, tapped ບ");
  letters get credit only for tone marks (`build_word.js:111-123`).
- `first_try` mixes two things: false for a replay and also for secondary rows (pair's second id
  `multiple_choice.js:146`, tone mark `build_word.js:120`, fill in the blank's sentence row `fill_blank.js:144`).
  The replay count (`session.js:296`) is not sent; rows of one question cannot be grouped (`session.js:291`).
- No weak-evidence marker when untaught words are the wrong options (`fill_blank.js:69-71`; NOTES idea).
- `n_correct` / `n_wrong` include replays and secondary rows (`20261110120000_played_lesson.sql:155-161`).
- Sessions store only `local_day` (`20261025040000_progress_tables.sql:12`, `session.js:216`): no time zone, app
  version (no version constant exists) or settings snapshot (spaces, transliteration, autoplay change difficulty).
- Teach cards send no time on card or audio plays (`teach_card.js:78`).

## 2. Schema (new migration; append-only stays; own-row RLS and grants cover new columns)
```sql
alter table public.review_log
  add column attempt       smallint check (attempt between 0 and 9),      -- 0 first ask, n = nth replay; null legacy
  add column question_id   uuid,                                          -- groups rows of one done() call
  add column role          text check (role in ('primary','pair','part','context')),
  add column known_options smallint check (known_options between 0 and 20), -- server-computed (section 4)
  add column detail        jsonb check (detail is null or (jsonb_typeof(detail) = 'object'
                                         and octet_length(detail::text) <= 2048));
alter table public.learner_sessions
  add column tz             text check (tz ~ '^[A-Za-z_+\-/0-9]{1,64}$'),
  add column utc_offset_min smallint check (utc_offset_min between -840 and 840),
  add column app_version    text check (app_version ~ '^[0-9A-Za-z.\-]{1,32}$'),
  add column settings       jsonb check (settings is null or octet_length(settings::text) <= 512);
```
Columns for what FSRS / "weakest" filter on, jsonb for the rest. No new index (reads use
`review_log_user_item_idx`). About 20 KB per lesson played. Legacy rows stay null; `first_try` kept.

## 3. Payload per activity (session.js `advance()` adds `question_id` per done() and `attempt = spec.replay || 0`)
| activity | role | detail (all with `v: 1`) |
|---|---|---|
| teach_card | primary | `{audio}`; time on card in `latency_ms` |
| multiple_choice | primary; second id of a pair = `pair` | `{form, options: [ids in display order], chosen, audio, info}` |
| fill_blank | word `primary`, sentence `context` | `{position, options: [word_id], chosen, audio, info}` |
| build_sentence | primary | `{tiles: [word_id], built: [word_id], audio, info}` (tiles must carry ids) |
| build_word | word `primary`, tone marks `part` | `{mode: 'strict'|'any', tiles: [unit_id], pieces: [{u, wrong: [unit_id]}], stray: [unit_id], audio, info}` |
`audio` = manual plays before Continue, `info` = info-card opens. Strict mode: `wrong` = tiles tapped at that step
(gives ດ/ບ confusions); any-order mode: wrong taps have no target, so they go to `stray`.

## 4. RPC contract
- `record_answers(uuid, jsonb)`: same signature (`create or replace`, restate grants). New optional keys `attempt`,
  `question_id`, `role`, `detail` (object ≤ 2 KB; `options`/`tiles`/`built` arrays ≤ 20 ids matching
  `^[A-Za-z0-9_]{1,20}$`, `chosen` same pattern; ids not checked for existence; unknown keys kept).
  `known_options` computed server-side at insert: options other than the answer that the learner has at level ≥ 1
  in `learner_items` (option type: multiple choice = row item_type; fill_blank/build_sentence = word; build_word =
  unit). Levels and counters unchanged in this slice.
- `start_lesson`: drop and recreate as `start_lesson(p_lesson_id text, p_local_day date, p_client jsonb default
  null)` (avoid an ambiguous overload), `p_client = {tz, utc_offset_min, app_version, settings: {translit, spaces,
  autoplay}}`. New `js/version.js` `APP_VERSION`. S8b `start_practice` takes the same.
- Compatibility: the deployed client sends neither; both optional. Deploy order: migration to hosted first, then
  frontend. SQL test: an old-shape batch and a new-shape batch both accepted; malformed `detail` → 22023.

## 5. Queries it enables
Weakest items (first asks of primary rows, weak evidence dropped, recency-weighted):
```sql
with r as (
  select item_type, item_id, correct, latency_ms,
         row_number() over (partition by item_type, item_id order by created_at desc) rn
  from review_log
  where user_id = auth.uid() and direction <> 'show'
    and coalesce(attempt, case when first_try then 0 end) = 0
    and coalesce(role, 'primary') = 'primary' and coalesce(known_options, 1) > 0)
select r.item_type, r.item_id,
       (sum(power(0.7, rn - 1) * (not correct)::int) + 1) / (sum(power(0.7, rn - 1)) + 2) miss_score,
       count(*) n, percentile_cont(0.5) within group (order by latency_ms) median_ms
from r join learner_items li on li.user_id = auth.uid()
     and (li.item_type, li.item_id) = (r.item_type, r.item_id) and li.level >= 1
where rn <= 10 group by 1, 2 order by miss_score desc, n limit 20;
```
Letters: union build_word pieces (`jsonb_array_elements(detail->'pieces')`, unit = `p->>'u'`, correct =
`jsonb_array_length(p->'wrong') = 0`): letter credit derived at read time, no extra rows.
Confusion pairs:
```sql
select least(target, got) a, greatest(target, got) b, count(*) n
from (select item_id target, detail->>'chosen' got from review_log
      where user_id = auth.uid() and correct = false and detail ? 'chosen'
      union all
      select p->>'u', w from review_log, jsonb_array_elements(detail->'pieces') p,
             jsonb_array_elements_text(p->'wrong') w
      where user_id = auth.uid() and activity = 'build_word') x
group by 1, 2 having count(*) >= 2 order by n desc;
```
FSRS (S9): primary rows per (user, item) in time order; `attempt > 0` = same-day; `known_options = 0` reduced or
skipped; latency splits Good/Easy.

## 6. Deliberately not logged
Tap timestamps, drag paths, coordinates, screen size, user agent, IP; distractors as "seen"; derived per-letter
rows (derived at read time); half-answered questions (Q2); letter writing (Q3); no backfill.

## 7. Open questions for the owner
1. Weak-evidence answers (`known_options = 0`): log only (proposed), or also withhold the level rise?
2. Leaving mid-question: log a "left" row as a weakness signal? (proposed: no)
3. Letter writing `#/write`: log strokes/judge results now or later?
4. Letter credit derived from word answers: may it raise a letter's level ("letters known"), or only feed
   weakest/FSRS (proposed)?

**Done when:** this note is agreed (move it into DESIGN); the migration is applied locally; a played lesson 1
produces `detail`, `attempt` and `question_id` on every row type; an old-shape batch is still accepted.

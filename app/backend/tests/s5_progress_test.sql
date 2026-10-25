-- S5 check: paste the whole file into Supabase Studio > SQL Editor (or psql) after the migrations are applied.
-- Creates two throwaway users, runs lesson 1 as user A, tries the negative cases, then deletes the users (all
-- their rows go with them, by cascade). The last result is a table: check | got | expected | pass.
-- Safe to re-run: it removes leftovers from an earlier failed run first.

delete from auth.users where id in ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000a2');
insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at) values
  ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   's5-a@test.local', '{"role": "learner"}', now(), now()),
  ('00000000-0000-4000-8000-0000000000a2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   's5-b@test.local', '{"role": "learner"}', now(), now());

-- ---- user A: lesson 1 -----------------------------------------------------
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-0000000000a1", "role": "authenticated"}', false);
set role authenticated;

select set_config('test.sid', public.start_lesson('L0001', (now() at time zone 'utc')::date) ->> 'session_id', false);

-- 5 teach-card views, then 3 answers: ກ right, ◌ິ wrong, ກິນ right (reads 1 word)
select set_config('test.batch', $j$[
  {"answer_id": "00000000-0000-4000-8000-0000000000b1", "item_type": "unit", "item_id": "C01",  "activity": "teach_card", "direction": "show"},
  {"answer_id": "00000000-0000-4000-8000-0000000000b2", "item_type": "unit", "item_id": "V04",  "activity": "teach_card", "direction": "show"},
  {"answer_id": "00000000-0000-4000-8000-0000000000b3", "item_type": "unit", "item_id": "C13",  "activity": "teach_card", "direction": "show"},
  {"answer_id": "00000000-0000-4000-8000-0000000000b4", "item_type": "unit", "item_id": "C13f", "activity": "teach_card", "direction": "show"},
  {"answer_id": "00000000-0000-4000-8000-0000000000b5", "item_type": "word", "item_id": "W000018", "activity": "teach_card", "direction": "show"},
  {"answer_id": "00000000-0000-4000-8000-0000000000b6", "item_type": "unit", "item_id": "C01",  "activity": "sound_to_letter", "direction": "recognition", "correct": true,  "latency_ms": 2100},
  {"answer_id": "00000000-0000-4000-8000-0000000000b7", "item_type": "unit", "item_id": "V04",  "activity": "sound_to_letter", "direction": "recognition", "correct": false, "latency_ms": 3400},
  {"answer_id": "00000000-0000-4000-8000-0000000000b8", "item_type": "word", "item_id": "W000018", "activity": "word_to_meaning", "direction": "recognition", "correct": true, "latency_ms": 2800, "lao_word_ids": ["W000018"]}
]$j$, false);

select set_config('test.r1', public.record_answers(current_setting('test.sid')::uuid, current_setting('test.batch')::jsonb) ->> 'saved', false);
select set_config('test.r2', public.record_answers(current_setting('test.sid')::uuid, current_setting('test.batch')::jsonb) ->> 'saved', false);
select set_config('test.items', (select string_agg(item_id || '=' || level, ' ' order by item_id) from public.learner_items), false);
select set_config('test.sum', public.complete_lesson(current_setting('test.sid')::uuid)::text, false);
select set_config('test.again', (public.complete_lesson(current_setting('test.sid')::uuid) = current_setting('test.sum')::jsonb)::text, false);
-- replaying the same batch after completion is still a no-op
select set_config('test.r3', public.record_answers(current_setting('test.sid')::uuid, current_setting('test.batch')::jsonb) ->> 'saved', false);
do $$ begin
  insert into public.learner_items (user_id, item_type, item_id, level)
  values ('00000000-0000-4000-8000-0000000000a1', 'unit', 'C02', 4);
  perform set_config('test.a_write', 'no error', false);
exception when others then
  perform set_config('test.a_write', sqlerrm, false);
end $$;

-- ---- user B: sees nothing of A's, cannot use A's session ---------------------
reset role;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-0000000000a2", "role": "authenticated"}', false);
set role authenticated;
select set_config('test.b_rows', (select count(*)::text from public.learner_items) || ' items, '
  || (select count(*)::text from public.review_log) || ' log rows', false);
do $$ begin
  perform public.complete_lesson(current_setting('test.sid')::uuid);
  perform set_config('test.b_steal', 'no error', false);
exception when others then
  perform set_config('test.b_steal', sqlerrm, false);
end $$;

-- ---- anonymous ---------------------------------------------------------------
reset role;
select set_config('request.jwt.claims', '{"role": "anon"}', false);
set role anon;
do $$ begin
  perform public.start_lesson('L0001', (now() at time zone 'utc')::date);
  perform set_config('test.anon', 'no error', false);
exception when others then
  perform set_config('test.anon', sqlerrm, false);
end $$;
do $$ begin
  perform count(*) from public.learner_items;
  perform set_config('test.anon_read', 'no error', false);
exception when others then
  perform set_config('test.anon_read', sqlerrm, false);
end $$;
reset role;
select set_config('request.jwt.claims', '', false);

-- ---- clean up, then the result table -------------------------------------------
delete from auth.users where id in ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000a2');

with s as (select current_setting('test.sum')::jsonb as j)
select check_name, got, expected, got = expected as pass from (values
  ('1 first batch saved',     current_setting('test.r1'),    '8'),
  ('2 replayed batch saved',  current_setting('test.r2'),    '0'),
  ('3 levels',                current_setting('test.items'), 'C01=2 C13=1 C13f=1 V04=1 W000018=2'),
  ('4 summary', (select format('answers %s, correct %s, accuracy %s, words_read %s, new_items %s, level_ups %s, streak %s, completed %s',
                 j->>'answers', j->>'correct', j->>'accuracy', j->>'words_read', j->>'new_items', j->>'level_ups',
                 j->>'streak', j->>'completed') from s),
                'answers 3, correct 2, accuracy 67, words_read 1, new_items 5, level_ups 2, streak 1, completed true'),
  ('5 complete again same',   current_setting('test.again'), 'true'),
  ('6 replay after complete', current_setting('test.r3'),    '0'),
  ('7 A writes table directly', current_setting('test.a_write'), 'permission denied for table learner_items'),
  ('8 user B sees',           current_setting('test.b_rows'), '0 items, 0 log rows'),
  ('9 user B on A session',   current_setting('test.b_steal'), 'Session not found'),
  ('10 anon start_lesson',    current_setting('test.anon'),  'permission denied for function start_lesson'),
  ('11 anon reads table',     current_setting('test.anon_read'), 'permission denied for table learner_items')
) t(check_name, got, expected);

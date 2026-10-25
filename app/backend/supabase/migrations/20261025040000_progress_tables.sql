-- S5: learner progress (APP_PLAN Phase 5, APP_DESIGN ladder + "Stats and encouragement").
-- Tables learner_sessions, lesson_progress, learner_items (level 0-4; FSRS fields come in S9) and the append-only
-- review_log. The client starts a lesson session, sends answers in batches (retries are safe: answer_id is
-- client-generated), and completes the session to get the summary. Learners read only their own rows.

-- ------------------------------------------------------------------ tables
create table public.learner_sessions (
  session_id   uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  kind         text not null check (kind in ('lesson', 'practice')),
  lesson_id    text references public.lessons (lesson_id),
  local_day    date not null,                 -- the learner's calendar day when the session started (streaks)
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  check ((kind = 'lesson') = (lesson_id is not null))
);
create index learner_sessions_user_day_idx on public.learner_sessions (user_id, local_day) where completed_at is not null;

create table public.lesson_progress (
  user_id      uuid not null references auth.users (id) on delete cascade,
  lesson_id    text not null references public.lessons (lesson_id),
  started_at   timestamptz not null default now(),
  completed_at timestamptz,                   -- first completion; redoing a lesson keeps it
  primary key (user_id, lesson_id)
);

create table public.learner_items (
  user_id         uuid not null references auth.users (id) on delete cascade,
  item_type       text not null check (item_type in ('unit', 'rule', 'word', 'sentence')),
  item_id         text not null,
  level           smallint not null default 0 check (level between 0 and 4),  -- APP_DESIGN ladder; never lowered
  first_seen_at   timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  last_correct_at timestamptz,
  n_correct       integer not null default 0,
  n_wrong         integer not null default 0,
  primary key (user_id, item_type, item_id)
);
create index learner_items_user_level_idx on public.learner_items (user_id, item_type, level);

create table public.review_log (
  answer_id    uuid primary key,              -- client-generated, so a replayed batch is a no-op
  session_id   uuid not null references public.learner_sessions (session_id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  item_type    text not null check (item_type in ('unit', 'rule', 'word', 'sentence')),
  item_id      text not null,
  activity     text not null check (activity ~ '^[a-z][a-z_]{1,39}$'),   -- teach_card, sound_to_letter, ...
  direction    text not null check (direction in ('show', 'recognition', 'recall')),
  correct      boolean,                       -- first try; null only for 'show'
  latency_ms   integer check (latency_ms between 0 and 3600000),
  lao_word_ids text[] not null default '{}',  -- Lao words the learner had to read to answer ("words read")
  level_before smallint not null,
  level_after  smallint not null,
  created_at   timestamptz not null default now(),
  check ((direction = 'show') = (correct is null))
);
create index review_log_session_idx on public.review_log (session_id);
create index review_log_user_item_idx on public.review_log (user_id, item_type, item_id, created_at);

-- Own rows readable; every write goes through the RPCs below. review_log is append-only (no update/delete path).
alter table public.learner_sessions enable row level security;
alter table public.lesson_progress  enable row level security;
alter table public.learner_items    enable row level security;
alter table public.review_log       enable row level security;
revoke all on public.learner_sessions, public.lesson_progress, public.learner_items, public.review_log
  from anon, authenticated;
grant select on public.learner_sessions, public.lesson_progress, public.learner_items, public.review_log
  to authenticated;
create policy "learner_sessions select own" on public.learner_sessions for select to authenticated using (user_id = auth.uid());
create policy "lesson_progress select own"  on public.lesson_progress  for select to authenticated using (user_id = auth.uid());
create policy "learner_items select own"    on public.learner_items    for select to authenticated using (user_id = auth.uid());
create policy "review_log select own"       on public.review_log       for select to authenticated using (user_id = auth.uid());

-- ------------------------------------------------------------------ helpers (not callable by app users)
create or replace function public.content_item_exists(p_type text, p_id text)
returns boolean language sql stable set search_path = public as $$
  select case p_type
    when 'unit'     then exists (select 1 from units     where unit_id = p_id     and retired_at is null)
    when 'rule'     then exists (select 1 from rules     where rule_id = p_id     and retired_at is null)
    when 'word'     then exists (select 1 from words     where word_id = p_id     and retired_at is null)
    when 'sentence' then exists (select 1 from sentences where sentence_id = p_id and retired_at is null)
    else false end
$$;
revoke execute on function public.content_item_exists(text, text) from public, anon, authenticated;

-- Session summary (APP_DESIGN "Session summary"): teach-card views ('show') are not answers.
-- streak = consecutive local days with a completed session, ending at this session's day.
create or replace function public.session_summary(p_session uuid)
returns jsonb language sql stable set search_path = public as $$
  with s as (select * from learner_sessions where session_id = p_session),
  a as (select r.* from review_log r join s using (session_id)),
  days as (
    select distinct ls.local_day from learner_sessions ls, s
    where ls.user_id = s.user_id and ls.completed_at is not null and ls.local_day <= s.local_day
  ),
  run as (
    select d.local_day, (select local_day from s) - d.local_day as back,
           row_number() over (order by d.local_day desc) - 1 as rn
    from days d
  )
  select jsonb_build_object(
    'session_id', s.session_id, 'kind', s.kind, 'lesson_id', s.lesson_id, 'local_day', s.local_day,
    'completed', s.completed_at is not null,
    'answers', (select count(*) from a where direction <> 'show'),
    'correct', (select count(*) from a where direction <> 'show' and correct),
    'accuracy', (select case when count(*) > 0 then round(100.0 * count(*) filter (where correct) / count(*))::int end
                 from a where direction <> 'show'),
    'words_read', (select coalesce(sum(cardinality(lao_word_ids)), 0) from a where direction <> 'show'),
    'new_items', (select count(distinct item_type || ':' || item_id) from a where level_before = 0 and level_after >= 1),
    'level_ups', (select count(distinct item_type || ':' || item_id) from a where level_before >= 1 and level_after > level_before),
    'streak', (select count(*) from run where back = rn))
  from s
$$;
revoke execute on function public.session_summary(uuid) from public, anon, authenticated;

-- ------------------------------------------------------------------ RPCs
-- Contract: start_lesson(p_lesson_id text, p_local_day date) -> jsonb {session_id uuid, lesson_id text}
-- p_local_day: the learner's calendar date (must be within 14 h of UTC now; client-supplied, so a learner could
-- shift a streak by about a day, which is accepted). A lesson may be started when it is
-- lesson 1, the previous lesson is completed, or this learner has started it before.
create or replace function public.start_lesson(p_lesson_id text, p_local_day date)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_order integer;
  v_sid   uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  if p_local_day is null
     or p_local_day < ((now() at time zone 'utc') - interval '14 hours')::date
     or p_local_day > ((now() at time zone 'utc') + interval '14 hours')::date then
    raise exception 'p_local_day must be the learner''s current date' using errcode = '22023';
  end if;
  select lesson_order into v_order from lessons where lesson_id = p_lesson_id and retired_at is null;
  if v_order is null then
    raise exception 'Lesson % not found', p_lesson_id using errcode = 'P0002';
  end if;
  if v_order > 1
     and not exists (select 1 from lesson_progress where user_id = v_uid and lesson_id = p_lesson_id)
     and not exists (select 1 from lesson_progress p join lessons l using (lesson_id)
                     where p.user_id = v_uid and p.completed_at is not null and l.lesson_order = v_order - 1) then
    raise exception 'Lesson % is locked', p_lesson_id using errcode = '42501';
  end if;
  insert into learner_sessions (user_id, kind, lesson_id, local_day)
  values (v_uid, 'lesson', p_lesson_id, p_local_day)
  returning session_id into v_sid;
  insert into lesson_progress (user_id, lesson_id) values (v_uid, p_lesson_id)
  on conflict (user_id, lesson_id) do nothing;
  return jsonb_build_object('session_id', v_sid, 'lesson_id', p_lesson_id);
end $$;
revoke execute on function public.start_lesson(text, date) from public, anon;
grant execute on function public.start_lesson(text, date) to authenticated;

-- Contract: record_answers(p_session uuid, p_answers jsonb) -> jsonb {saved int, levels [{item_type, item_id, level}]}
-- p_answers: up to 200 of {answer_id uuid, item_type, item_id, activity, direction show|recognition|recall,
--   correct bool (omit/null for show), latency_ms int?, lao_word_ids [text]?}. Replayed answer_ids are skipped,
--   also after the session is completed (a fully replayed batch then returns saved 0); new answers need an open session.
-- Levels (APP_DESIGN ladder, never lowered): show -> at least 1; recognition right -> 2 (1 if the item was unseen);
-- recall right -> 3 (2 if below 2). Wrong answers keep the level.
create or replace function public.record_answers(p_session uuid, p_answers jsonb)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  v_done   timestamptz;
  v_owner  uuid;
  a        jsonb;
  v_id     uuid;
  v_type   text;
  v_item   text;
  v_dir    text;
  v_ok     boolean;
  v_lat    integer;
  v_words  text[];
  v_before smallint;
  v_after  smallint;
  v_saved  integer := 0;
  v_levels jsonb := '[]'::jsonb;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  select user_id, completed_at into v_owner, v_done from learner_sessions where session_id = p_session;
  if v_owner is null or v_owner <> v_uid then
    raise exception 'Session not found' using errcode = 'P0002';
  end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) > 200 then
    raise exception 'p_answers must be an array of at most 200 answers' using errcode = '22023';
  end if;

  for a in select * from jsonb_array_elements(p_answers) loop
    begin
      v_id := (a->>'answer_id')::uuid;
    exception when invalid_text_representation then
      raise exception 'answer_id must be a uuid' using errcode = '22023';
    end;
    v_type := a->>'item_type';
    v_item := a->>'item_id';
    v_dir  := a->>'direction';
    if jsonb_typeof(a->'correct') not in ('boolean', 'null')
       or jsonb_typeof(a->'latency_ms') not in ('number', 'null')
       or (jsonb_typeof(a->'latency_ms') = 'number'
           and ((a->>'latency_ms')::numeric not between 0 and 3600000 or (a->>'latency_ms')::numeric % 1 <> 0)) then
      raise exception 'Bad answer %: correct must be true/false, latency_ms a whole number of ms', a
        using errcode = '22023';
    end if;
    v_ok  := (a->>'correct')::boolean;
    v_lat := (a->>'latency_ms')::integer;
    if v_id is null or coalesce(v_dir, '') not in ('show', 'recognition', 'recall')
       or (v_dir = 'show') is distinct from (v_ok is null) then
      raise exception 'Bad answer %: needs answer_id, direction, and correct unless direction is show', a
        using errcode = '22023';
    end if;
    if coalesce(a->>'activity', '') !~ '^[a-z][a-z_]{1,39}$' then
      raise exception 'Bad activity name %', a->>'activity' using errcode = '22023';
    end if;
    if not content_item_exists(v_type, v_item) then
      raise exception 'Unknown item % %', v_type, v_item using errcode = '22023';
    end if;
    if jsonb_typeof(coalesce(a->'lao_word_ids', '[]'::jsonb)) <> 'array'
       or jsonb_array_length(coalesce(a->'lao_word_ids', '[]'::jsonb)) > 50 then
      raise exception 'lao_word_ids must be an array of at most 50 ids' using errcode = '22023';
    end if;
    v_words := array(select jsonb_array_elements_text(coalesce(a->'lao_word_ids', '[]'::jsonb)));
    if exists (select 1 from unnest(v_words) w where not content_item_exists('word', w)) then
      raise exception 'Unknown word in lao_word_ids %', v_words using errcode = '22023';
    end if;
    if exists (select 1 from review_log where answer_id = v_id) then
      if not exists (select 1 from review_log where answer_id = v_id and session_id = p_session) then
        raise exception 'answer_id % belongs to another session', v_id using errcode = '22023';
      end if;
      continue;  -- replayed batch
    end if;
    if v_done is not null then
      raise exception 'Session already completed' using errcode = '22023';
    end if;

    -- make sure the row exists, then lock it, so concurrent batches see each other's level
    insert into learner_items (user_id, item_type, item_id) values (v_uid, v_type, v_item)
    on conflict (user_id, item_type, item_id) do nothing;
    select level into v_before from learner_items
    where user_id = v_uid and item_type = v_type and item_id = v_item
    for update;
    v_before := coalesce(v_before, 0);
    v_after := case
      when v_dir = 'show' then greatest(v_before, 1)
      when not v_ok then v_before
      when v_dir = 'recognition' then greatest(v_before, case when v_before >= 1 then 2 else 1 end)
      else greatest(v_before, case when v_before >= 2 then 3 else 2 end)
    end;

    insert into review_log (answer_id, session_id, user_id, item_type, item_id, activity, direction, correct,
                            latency_ms, lao_word_ids, level_before, level_after)
    values (v_id, p_session, v_uid, v_type, v_item, a->>'activity', v_dir, v_ok,
            v_lat, v_words, v_before, v_after)
    on conflict (answer_id) do nothing;
    if not found then
      continue;
    end if;

    update learner_items set
      level = greatest(level, v_after),
      last_seen_at = now(),
      last_correct_at = case when v_ok then now() else last_correct_at end,
      n_correct = n_correct + case when v_ok then 1 else 0 end,
      n_wrong = n_wrong + case when v_ok = false then 1 else 0 end
    where user_id = v_uid and item_type = v_type and item_id = v_item;

    v_saved := v_saved + 1;
    v_levels := v_levels || jsonb_build_object('item_type', v_type, 'item_id', v_item, 'level', v_after);
  end loop;
  return jsonb_build_object('saved', v_saved, 'levels', v_levels);
end $$;
revoke execute on function public.record_answers(uuid, jsonb) from public, anon;
grant execute on function public.record_answers(uuid, jsonb) to authenticated;

-- Contract: complete_lesson(p_session uuid) -> jsonb summary
--   {session_id, kind, lesson_id, local_day, completed, answers, correct, accuracy (0-100 or null), words_read,
--    new_items, level_ups, streak}
-- Idempotent: completing again returns the same summary. Marks the lesson completed (first time only).
create or replace function public.complete_lesson(p_session uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  v_owner  uuid;
  v_kind   text;
  v_lesson text;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  select user_id, kind, lesson_id into v_owner, v_kind, v_lesson from learner_sessions where session_id = p_session;
  if v_owner is null or v_owner <> v_uid then
    raise exception 'Session not found' using errcode = 'P0002';
  end if;
  if v_kind <> 'lesson' then
    raise exception 'Not a lesson session' using errcode = '22023';
  end if;
  update learner_sessions set completed_at = now() where session_id = p_session and completed_at is null;
  update lesson_progress set completed_at = now()
  where user_id = v_uid and lesson_id = v_lesson and completed_at is null;
  return session_summary(p_session);
end $$;
revoke execute on function public.complete_lesson(uuid) from public, anon;
grant execute on function public.complete_lesson(uuid) to authenticated;

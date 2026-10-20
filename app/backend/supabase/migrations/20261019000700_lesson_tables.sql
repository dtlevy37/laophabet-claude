-- Phase 2: the DB becomes the source of truth for course content (_agent/APP_PLAN.md).
--
-- 1. Lesson tables: lessons, units, rules, lesson_items (columns as data/*.csv, see _agent/SCHEMA.md).
-- 2. Every content table gains updated_at (trigger) and retired_at. Rows are retired, never deleted;
--    readers filter on retired_at is null.
-- 3. lesson_locked / is_lesson_locked(): rows a lesson uses. Pool refresh migrations
--    (approved-scripts/db_sql.py refresh) never update or retire them; lesson content changes only
--    through lesson and change migrations.
-- 4. get_lesson(lesson_id): the JSON bundle the client builds a lesson from.
--
-- Content reaches the DB only as migration files written by approved-scripts/db_sql.py
-- (lesson_tool.py merge calls it) and applied by the owner with `supabase db push`.

create table public.lessons (
  lesson_id    text primary key,
  lesson_order integer not null unique,
  title_en     text not null,
  kind         text not null check (kind in ('letters', 'rule', 'words', 'sentences')),
  summary_en   text,
  source       text,
  confidence   text,
  notes        text
);

create table public.units (
  unit_id         text primary key,   -- role-unit: C23, C24f, C10c, V03, T2, S1
  kind            text not null check (kind in ('consonant', 'vowel', 'tone-mark', 'symbol')),
  role            text not null check (role in ('initial', 'final', 'cluster', 'vowel', 'mark')),
  base_id         text not null,      -- letters.letter_id or vowels.vowel_id (soft reference)
  lao             text,
  teach_en        text,
  intro_lesson_id text references public.lessons (lesson_id),
  source          text,
  confidence      text,
  notes           text
);

create table public.rules (
  rule_id         text primary key,   -- R + 2 digits; R01 = dead syllables
  name_en         text,
  teach_en        text,
  intro_lesson_id text references public.lessons (lesson_id),
  source          text,
  confidence      text,
  notes           text
);

create table public.lesson_items (
  lesson_id text not null references public.lessons (lesson_id),
  position  integer not null,         -- teaching order
  item_type text not null check (item_type in ('unit', 'rule', 'word', 'sentence')),
  item_id   text not null,            -- units / rules / words / sentences, checked by trigger
  role      text not null check (role in ('new', 'recycle', 'example')),
  notes     text,
  primary key (lesson_id, position)
);
create index lesson_items_item_idx on public.lesson_items (item_type, item_id);

create or replace function public.check_lesson_item()
returns trigger language plpgsql as $$
begin
  if not case new.item_type
      when 'unit'     then exists (select 1 from public.units where unit_id = new.item_id)
      when 'rule'     then exists (select 1 from public.rules where rule_id = new.item_id)
      when 'word'     then exists (select 1 from public.words where word_id = new.item_id)
      when 'sentence' then exists (select 1 from public.sentences where sentence_id = new.item_id)
      else false end then
    raise exception 'lesson_items %/%: % % does not exist',
      new.lesson_id, new.position, new.item_type, new.item_id;
  end if;
  return new;
end $$;
create trigger lesson_items_check before insert or update on public.lesson_items
  for each row execute function public.check_lesson_item();

-- updated_at + retired_at on every content table; same lock-down as ..0000.
do $$
declare t text;
begin
  foreach t in array array['templates','words','letters','vowels','sentences','sentence_words',
                           'template_fillers','tone_exceptions','learning_order',
                           'lessons','units','rules','lesson_items']
  loop
    execute format('alter table public.%I add column updated_at timestamptz not null default now(), '
                   'add column retired_at timestamptz', t);
    execute format('create trigger %I before update on public.%I '
                   'for each row execute function public.set_updated_at()', t || '_updated_at', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- Rows that a lesson uses (kind, id). Mirrored by locked() in approved-scripts/db_sql.py.
create or replace view public.lesson_locked as
  select 'sentence'::text as kind, li.item_id as id
    from public.lesson_items li where li.item_type = 'sentence'
  union
  select 'word', li.item_id
    from public.lesson_items li where li.item_type = 'word'
  union
  select 'word', sw.word_id
    from public.lesson_items li
    join public.sentence_words sw on sw.sentence_id = li.item_id
   where li.item_type = 'sentence'
  union
  select 'word', s.target_word_id
    from public.lesson_items li
    join public.sentences s on s.sentence_id = li.item_id
   where li.item_type = 'sentence' and s.target_word_id is not null
  union
  select 'template', s.template_id
    from public.lesson_items li
    join public.sentences s on s.sentence_id = li.item_id
   where li.item_type = 'sentence' and s.template_id is not null
  union
  select 'letter', u.base_id from public.units u
  union
  select 'vowel', u.base_id from public.units u;
revoke all on public.lesson_locked from anon, authenticated;

create or replace function public.is_lesson_locked(p_kind text, p_id text)
returns boolean language sql stable set search_path = public as $$
  select exists (select 1 from public.lesson_locked where kind = p_kind and id = p_id)
$$;
revoke all on function public.is_lesson_locked(text, text) from public, anon, authenticated;

-- JSON for one item of each type (used by get_lesson; later by the item viewer). Not callable by app users.
create or replace function public.unit_json(p_id text)
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object(
    'unit_id', u.unit_id, 'kind', u.kind, 'role', u.role, 'base_id', u.base_id, 'lao', u.lao,
    'teach_en', u.teach_en, 'intro_lesson_id', u.intro_lesson_id,
    'letter', case when l.letter_id is null then null else jsonb_build_object(
      'lao', l.lao, 'name_lao', l.name_lao, 'name_gloss_en', l.name_gloss_en,
      'consonant_class', l.consonant_class,
      'ipa', case when u.role = 'final' then l.ipa_final else l.ipa_initial end,
      'respelling', l.respelling, 'pron_tip', l.pron_tip) end,
    'vowel', case when v.vowel_id is null then null else jsonb_build_object(
      'lao_pattern', v.lao_pattern, 'form', v.form, 'length', v.length, 'ipa', v.ipa,
      'respelling', v.respelling, 'pron_tip', v.pron_tip) end)
  from public.units u
  left join public.letters l on l.letter_id = u.base_id and u.kind <> 'vowel' and l.retired_at is null
  left join public.vowels v on v.vowel_id = u.base_id and u.kind = 'vowel' and v.retired_at is null
  where u.unit_id = p_id and u.retired_at is null
$$;

create or replace function public.rule_json(p_id text)
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object('rule_id', r.rule_id, 'name_en', r.name_en, 'teach_en', r.teach_en,
                            'intro_lesson_id', r.intro_lesson_id)
  from public.rules r where r.rule_id = p_id and r.retired_at is null
$$;

create or replace function public.word_json(p_id text)
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object(
    'word_id', w.word_id, 'lao', w.lao, 'gloss_en', w.gloss_en, 'pos', w.pos, 'ipa', w.ipa,
    'respelling', w.respelling,
    'syllables', string_to_array(w.syllables, '|'),
    'tones', string_to_array(w.tone_by_syllable, '|'),
    'pron_tip', w.pron_tip,
    'classifier_type', w.classifier_type, 'classifier_word_id', w.classifier_word_id,
    'classifier_lao', (select c.lao from public.words c
                        where c.word_id = w.classifier_word_id and c.retired_at is null),
    'confidence', w.confidence)
  from public.words w where w.word_id = p_id and w.retired_at is null
$$;

create or replace function public.sentence_json(p_id text)
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object(
    'sentence_id', s.sentence_id, 'lao', s.lao, 'lao_spaced', s.lao_spaced, 'english', s.english,
    'ipa', s.ipa, 'respelling', s.respelling, 'confidence', s.confidence,
    'words', coalesce((
      select jsonb_agg(jsonb_build_object('position', sw.position, 'word_id', sw.word_id,
                                          'lao', w.lao, 'gloss_en', w.gloss_en) order by sw.position)
      from public.sentence_words sw
      join public.words w on w.word_id = sw.word_id
      where sw.sentence_id = s.sentence_id and sw.retired_at is null), '[]'::jsonb))
  from public.sentences s where s.sentence_id = p_id and s.retired_at is null
$$;

revoke all on function public.unit_json(text), public.rule_json(text), public.word_json(text),
                       public.sentence_json(text) from public, anon, authenticated;

-- The lesson bundle: lesson row, items in teaching order with their details, and the distractor pool.
-- Distractors (APP_DESIGN): lessons 1-5 share one pool; from lesson 6 on only items taught so far
-- (including this lesson's new items). The client removes the tested item from the options itself.
create or replace function public.get_lesson(p_lesson_id text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_lesson public.lessons;
  v_pool   integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  select * into v_lesson from lessons where lesson_id = p_lesson_id and retired_at is null;
  if not found then
    return null;
  end if;
  v_pool := greatest(v_lesson.lesson_order, 5);

  return jsonb_build_object(
    'lesson', jsonb_build_object(
      'lesson_id', v_lesson.lesson_id, 'lesson_order', v_lesson.lesson_order,
      'title_en', v_lesson.title_en, 'kind', v_lesson.kind, 'summary_en', v_lesson.summary_en),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
               'position', li.position, 'item_type', li.item_type, 'item_id', li.item_id, 'role', li.role,
               'detail', case li.item_type
                           when 'unit'     then unit_json(li.item_id)
                           when 'rule'     then rule_json(li.item_id)
                           when 'word'     then word_json(li.item_id)
                           when 'sentence' then sentence_json(li.item_id)
                         end)
             order by li.position)
      from lesson_items li
      where li.lesson_id = p_lesson_id and li.retired_at is null), '[]'::jsonb),
    'distractors', jsonb_build_object(
      'through_lesson_order', v_pool,
      'units', coalesce((
        select jsonb_agg(jsonb_build_object('unit_id', u.unit_id, 'kind', u.kind, 'role', u.role,
                                            'lao', u.lao, 'intro_lesson_id', u.intro_lesson_id)
               order by l.lesson_order, u.unit_id)
        from units u join lessons l on l.lesson_id = u.intro_lesson_id
        where l.lesson_order <= v_pool and u.retired_at is null and l.retired_at is null), '[]'::jsonb),
      'words', coalesce((
        select jsonb_agg(jsonb_build_object('word_id', w.word_id, 'lao', w.lao, 'gloss_en', w.gloss_en,
                                            'respelling', w.respelling, 'pos', w.pos,
                                            'intro_lesson_id', x.lesson_id)
               order by x.lesson_order, w.word_id)
        from (select distinct on (li.item_id) li.item_id, l.lesson_id, l.lesson_order
                from lesson_items li join lessons l on l.lesson_id = li.lesson_id
               where li.item_type = 'word' and li.role = 'new' and li.retired_at is null
                 and l.lesson_order <= v_pool and l.retired_at is null
               order by li.item_id, l.lesson_order) x
        join words w on w.word_id = x.item_id and w.retired_at is null), '[]'::jsonb)));
end $$;
revoke execute on function public.get_lesson(text) from public, anon;
grant execute on function public.get_lesson(text) to authenticated;

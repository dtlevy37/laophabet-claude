-- 1. Birthday replaces age range.
alter table public.profiles drop column if exists age_range;
alter table public.profiles add column birth_date date
  check (birth_date is null or (birth_date > date '1900-01-01' and birth_date <= current_date));

-- 2. Answers are optional: drop the "all questions answered" check.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.sentence_reviews'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) like '%has_errors IS NOT NULL%'
  loop
    execute format('alter table public.sentence_reviews drop constraint %I', c.conname);
  end loop;
end $$;

-- 3. New register option 'vulgar' (vulgar / rude).
alter table public.sentence_reviews drop constraint if exists sentence_reviews_register_check;
alter table public.sentence_reviews add constraint sentence_reviews_register_check
  check (register in ('casual','neutral','formal','vulgar'));

-- 4. New questions.
alter table public.sentence_reviews
  add column is_slang          boolean,   -- is this primarily slang?
  add column multiple_meanings boolean,   -- more than one meaning for this exact spelling?
  add column meanings_notes    text;

-- 5. submit_review with the new parameters (replaces the old signature).
drop function if exists public.submit_review(text, boolean, text[], text, text, text, text, text);

create or replace function public.submit_review(
  p_sentence_id          text,
  p_has_errors           boolean,
  p_error_types          text[],
  p_error_notes          text,
  p_suggested_correction text,
  p_naturalness          text,
  p_register             text,
  p_is_slang             boolean,
  p_multiple_meanings    boolean,
  p_meanings_notes       text,
  p_comments             text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_lao  text;
  v_ms   integer;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select lao into v_lao from sentences where sentence_id = p_sentence_id;
  if v_lao is null then
    raise exception 'unknown sentence %', p_sentence_id;
  end if;

  select (extract(epoch from (now() - claimed_at)) * 1000)::integer into v_ms
    from sentence_claims where user_id = v_uid and sentence_id = p_sentence_id;

  insert into sentence_reviews as r (
    sentence_id, reviewer_id, lao_snapshot, skipped, has_errors, error_types,
    error_notes, suggested_correction, naturalness, register,
    is_slang, multiple_meanings, meanings_notes, comments, time_to_submit_ms)
  values (
    p_sentence_id, v_uid, v_lao, false, p_has_errors,
    case when p_has_errors then coalesce(p_error_types, '{}') else '{}' end,
    case when p_has_errors then nullif(trim(p_error_notes), '') end,
    case when p_has_errors then nullif(trim(p_suggested_correction), '') end,
    p_naturalness, p_register,
    p_is_slang, p_multiple_meanings,
    case when p_multiple_meanings then nullif(trim(p_meanings_notes), '') end,
    nullif(trim(p_comments), ''), v_ms)
  on conflict (sentence_id, reviewer_id) do update set
    lao_snapshot = excluded.lao_snapshot,
    skipped = false, skip_reason = null,
    has_errors = excluded.has_errors,
    error_types = excluded.error_types,
    error_notes = excluded.error_notes,
    suggested_correction = excluded.suggested_correction,
    naturalness = excluded.naturalness,
    register = excluded.register,
    is_slang = excluded.is_slang,
    multiple_meanings = excluded.multiple_meanings,
    meanings_notes = excluded.meanings_notes,
    comments = excluded.comments,
    time_to_submit_ms = coalesce(excluded.time_to_submit_ms, r.time_to_submit_ms);

  delete from sentence_claims where user_id = v_uid;
end $$;

revoke execute on function public.submit_review(text, boolean, text[], text, text, text, text, boolean, boolean, text, text) from public, anon;
grant execute on function public.submit_review(text, boolean, text[], text, text, text, text, boolean, boolean, text, text) to authenticated;

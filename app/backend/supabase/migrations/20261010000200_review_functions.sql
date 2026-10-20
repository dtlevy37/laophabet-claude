-- RPCs used by the front end, plus RLS policies and the recordings bucket.
-- All functions are SECURITY DEFINER and derive the user from auth.uid().

-- ---------------------------------------------------------------- claim
-- Returns the user's live claim, or claims the sentence with the fewest
-- (submitted reviews + live claims by others) that this user has not yet
-- reviewed or skipped, until p_target is reached. Returns null when nothing
-- is left. A global advisory lock keeps the counts exact under concurrency.
create or replace function public.claim_next_sentence(p_target integer default 3,
                                                      p_claim_minutes integer default 30)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_sid text;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  perform pg_advisory_xact_lock(hashtext('claim_next_sentence'));

  select sentence_id into v_sid
    from sentence_claims where user_id = v_uid and expires_at > now();

  if v_sid is null then
    delete from sentence_claims where user_id = v_uid;

    select s.sentence_id into v_sid
    from sentences s
    cross join lateral (
      select
        (select count(*) from sentence_reviews r
          where r.sentence_id = s.sentence_id and not r.skipped)
        + (select count(*) from sentence_claims c
          where c.sentence_id = s.sentence_id and c.expires_at > now()) as load
    ) l
    where l.load < p_target
      and not exists (select 1 from sentence_reviews r
                      where r.sentence_id = s.sentence_id and r.reviewer_id = v_uid)
    order by l.load asc, s.sentence_id asc
    limit 1;

    if v_sid is null then
      return null;
    end if;

    insert into sentence_claims (user_id, sentence_id, expires_at)
    values (v_uid, v_sid, now() + make_interval(mins => p_claim_minutes));
  end if;

  return (select jsonb_build_object(
            'sentence_id', s.sentence_id,
            'lao',         s.lao,
            'lao_spaced',  s.lao_spaced,
            'english',     s.english)
          from sentences s where s.sentence_id = v_sid);
end $$;

-- --------------------------------------------------------------- submit
create or replace function public.submit_review(
  p_sentence_id          text,
  p_has_errors           boolean,
  p_error_types          text[],
  p_error_notes          text,
  p_suggested_correction text,
  p_naturalness          text,
  p_register             text,
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
    error_notes, suggested_correction, naturalness, register, comments, time_to_submit_ms)
  values (
    p_sentence_id, v_uid, v_lao, false, p_has_errors,
    case when p_has_errors then coalesce(p_error_types, '{}') else '{}' end,
    case when p_has_errors then nullif(trim(p_error_notes), '') end,
    case when p_has_errors then nullif(trim(p_suggested_correction), '') end,
    p_naturalness, p_register, nullif(trim(p_comments), ''), v_ms)
  on conflict (sentence_id, reviewer_id) do update set
    lao_snapshot = excluded.lao_snapshot,
    skipped = false, skip_reason = null,
    has_errors = excluded.has_errors,
    error_types = excluded.error_types,
    error_notes = excluded.error_notes,
    suggested_correction = excluded.suggested_correction,
    naturalness = excluded.naturalness,
    register = excluded.register,
    comments = excluded.comments,
    time_to_submit_ms = coalesce(excluded.time_to_submit_ms, r.time_to_submit_ms);

  delete from sentence_claims where user_id = v_uid;
end $$;

-- ----------------------------------------------------------------- skip
create or replace function public.skip_sentence(p_sentence_id text,
                                                p_reason text,
                                                p_comments text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_lao text;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select lao into v_lao from sentences where sentence_id = p_sentence_id;
  if v_lao is null then
    raise exception 'unknown sentence %', p_sentence_id;
  end if;

  insert into sentence_reviews (sentence_id, reviewer_id, lao_snapshot, skipped, skip_reason, comments)
  values (p_sentence_id, v_uid, v_lao, true, p_reason, nullif(trim(p_comments), ''))
  on conflict (sentence_id, reviewer_id) do nothing;   -- never overwrite a real review

  delete from sentence_claims where user_id = v_uid;
end $$;

-- Function privileges: authenticated only (Supabase grants to anon by default).
revoke execute on function public.claim_next_sentence(integer, integer) from public, anon;
revoke execute on function public.submit_review(text, boolean, text[], text, text, text, text, text) from public, anon;
revoke execute on function public.skip_sentence(text, text, text) from public, anon;
grant execute on function public.claim_next_sentence(integer, integer) to authenticated;
grant execute on function public.submit_review(text, boolean, text[], text, text, text, text, text) to authenticated;
grant execute on function public.skip_sentence(text, text, text) to authenticated;

-- ------------------------------------------------------------------ RLS
alter table public.profiles            enable row level security;
alter table public.reviewer_trust      enable row level security;
alter table public.sentence_claims     enable row level security;
alter table public.sentence_reviews    enable row level security;
alter table public.sentence_recordings enable row level security;

revoke all on public.reviewer_trust  from anon, authenticated;
revoke all on public.sentence_claims from anon, authenticated;
revoke all on public.profiles, public.sentence_reviews, public.sentence_recordings from anon;

-- profiles: own row only
create policy "profiles select own" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- reviews: read own (writes go through RPCs, which bypass RLS)
create policy "reviews select own" on public.sentence_reviews
  for select to authenticated using (reviewer_id = auth.uid());
revoke insert, update, delete on public.sentence_reviews from authenticated;

-- recordings: insert/read own rows, path must live under the user's folder
create policy "recordings select own" on public.sentence_recordings
  for select to authenticated using (reviewer_id = auth.uid());
create policy "recordings insert own" on public.sentence_recordings
  for insert to authenticated
  with check (reviewer_id = auth.uid() and storage_path like auth.uid()::text || '/%');
revoke update, delete on public.sentence_recordings from authenticated;

-- ------------------------------------------------------- storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recordings', 'recordings', false, 10485760,
        array['audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/wav','audio/x-m4a'])
on conflict (id) do nothing;

create policy "recordings objects insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "recordings objects select own" on storage.objects
  for select to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);

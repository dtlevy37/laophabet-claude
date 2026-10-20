-- Native-speaker accounts, claims, reviews, recordings, and the (private)
-- trust table you will fill in later.

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text,
  is_native_speaker boolean not null default false,  -- self-declared
  region            text,                            -- where they grew up / dialect notes
  onboarded_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Your ranking of reviewers. Not readable or writable by users (RLS, no policies).
-- Edit in the dashboard / with the service role.
create table public.reviewer_trust (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  trust_score numeric,
  notes      text,
  updated_at timestamptz not null default now()
);
create trigger reviewer_trust_updated_at before update on public.reviewer_trust
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------ claims
-- One live claim per user = "the item I'm working on". Expires so abandoned
-- items return to the pool.
create table public.sentence_claims (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  sentence_id text not null references public.sentences (sentence_id) on delete cascade,
  claimed_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index sentence_claims_sentence_idx on public.sentence_claims (sentence_id);

-- ----------------------------------------------------------------- reviews
create table public.sentence_reviews (
  id                   uuid primary key default gen_random_uuid(),
  sentence_id          text not null references public.sentences (sentence_id),
  reviewer_id          uuid not null references auth.users (id) on delete cascade,
  lao_snapshot         text not null,      -- sentence text at review time
  skipped              boolean not null default false,
  skip_reason          text check (skip_reason in ('cannot_read','not_sure','inappropriate','other')),

  has_errors           boolean,
  error_types          text[] not null default '{}'
                       check (error_types <@ array['spelling','grammar','word_choice','word_order','translation_mismatch','other']),
  error_notes          text,
  suggested_correction text,
  naturalness          text check (naturalness in ('natural','awkward','unnatural')),
  register             text check (register in ('casual','neutral','formal')),
  comments             text,

  time_to_submit_ms    integer,            -- server-measured, claim -> submit
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  unique (sentence_id, reviewer_id),
  check (skipped or (has_errors is not null and naturalness is not null and register is not null)),
  check (not skipped or skip_reason is not null)
);
create index sentence_reviews_reviewer_idx on public.sentence_reviews (reviewer_id);
create trigger sentence_reviews_updated_at before update on public.sentence_reviews
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------- recordings
-- Audio lives in the private storage bucket 'recordings'.
-- Path convention: {user_id}/{sentence_id}/{timestamp}.{ext}
create table public.sentence_recordings (
  id           uuid primary key default gen_random_uuid(),
  sentence_id  text not null references public.sentences (sentence_id),
  reviewer_id  uuid not null references auth.users (id) on delete cascade,
  storage_path text not null unique,
  mime_type    text,
  duration_ms  integer,
  created_at   timestamptz not null default now()
);
create index sentence_recordings_sentence_idx on public.sentence_recordings (sentence_id);
create index sentence_recordings_reviewer_idx on public.sentence_recordings (reviewer_id);

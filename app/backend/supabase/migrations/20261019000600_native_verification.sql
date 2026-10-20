-- Native status is self-declared (profiles.role / is_native_speaker), but
-- feedback counts as unverified until the owner confirms the person by hand.
-- Verification lives in reviewer_trust, which app users cannot read or write.
-- Because it is looked up at read time, verifying someone later upgrades all
-- of their earlier feedback too.
--
-- Verify a reviewer (SQL editor / service role):
--   insert into public.reviewer_trust (user_id, native_verified_at, notes)
--   values ('<user uuid>', now(), 'how I checked')
--   on conflict (user_id) do update
--     set native_verified_at = now(), notes = excluded.notes, updated_at = now();
-- Revoke: update public.reviewer_trust set native_verified_at = null where user_id = '<user uuid>';
alter table public.reviewer_trust
  add column native_verified_at timestamptz;

create or replace function public.is_verified_native(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.reviewer_trust
    where user_id = uid and native_verified_at is not null
  )
$$;
revoke all on function public.is_verified_native(uuid) from public, anon, authenticated;

-- Owner's view of sentence feedback with the reviewer's status. Not exposed to app users.
create or replace view public.sentence_feedback as
select
  r.*,
  p.display_name,
  p.role,
  p.is_native_speaker,
  t.native_verified_at,
  (t.native_verified_at is not null) as verified_native
from public.sentence_reviews r
join public.profiles p on p.id = r.reviewer_id
left join public.reviewer_trust t on t.user_id = r.reviewer_id;
revoke all on public.sentence_feedback from anon, authenticated;

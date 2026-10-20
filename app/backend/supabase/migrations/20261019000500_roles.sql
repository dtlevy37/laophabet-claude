-- Roles: every account is a learner or a native reviewer, chosen at sign-up
-- (sent as user metadata) and stored on the profile. Self-declared, like
-- is_native_speaker; anything privileged (admin) gets its own table later,
-- because users can update their own profile row.
alter table public.profiles
  add column role text check (role in ('learner','native'));

-- Everyone who signed up before roles existed came through the review app.
update public.profiles set role = 'native' where role is null;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r text := new.raw_user_meta_data ->> 'role';
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    case when r in ('learner','native') then r end   -- else null: the app asks after login
  )
  on conflict (id) do nothing;
  return new;
end $$;

---
name: sql-migration
description: Conventions and checklist for hand-written Supabase schema and RPC migrations (tables, RLS, security definer functions, grants, test queries). Use whenever writing or changing SQL under app/backend/supabase/migrations/ by hand. Not for content rows, which only db_sql.py and lesson_tool.py write.
---

# Writing a schema or RPC migration

## Before writing
- Read `app/README.md` (Backend) and the migrations your change touches. To find a definition: grep
  `app/backend/supabase/migrations/` for `create table public.<name>` or `function public.<name>`.
- **Content rows** (words, sentences, lessons, units, rules ...) are never inserted or updated by hand. They come only
  from `lesson_tool.py merge` or `db_sql.py lesson|change|refresh`. If a schema change adds a content column, the
  `TABLES` spec in `db_sql.py` must change too (script approval), in the same approval group.
- Never edit a migration that may be applied (anything listed in PENDING_MIGRATIONS.md as ticked, or older than the
  latest applied). Write a new one. Unapplied files written in this same slice may be edited.

## File
- Name: `app/backend/supabase/migrations/<YYYYMMDDhhmmss>_<snake_name>.sql`, with a stamp later than the newest file
  in the folder (check with Glob; content migrations use real UTC time, so yours must sort after them).
- Start with a 2–4 line comment: which slice, what it adds, how the client uses it.
- Add a line to `_agent/PENDING_MIGRATIONS.md`: `- [ ] <file>: <what> (<slice>; written by the agent, not db_sql)`.

## Tables (learner and app data)
- `user_id uuid not null references auth.users(id) on delete cascade` for per-user rows; primary keys that make
  retries safe (e.g. `(user_id, item_type, item_id)`), and `on conflict` in the RPC that writes them.
- `timestamptz` for times, `default now()`. Check constraints for enums (`check (level between 0 and 4)`), matching
  the constants in `lesson_tool.py` / APP_DESIGN where they exist.
- `alter table ... enable row level security;` always. Own-row select policy where the client reads directly:
  `using (user_id = auth.uid())`. Prefer no insert/update/delete policies: writes go through RPCs.
- Append-only logs (`review_log`): no update or delete path at all.
- Index the columns RPCs filter on (`(user_id, due)` and the like).

## RPCs
```sql
-- Contract: record_answers(p_session uuid, p_answers jsonb) -> jsonb {saved int}
-- p_answers: [{item_type, item_id, activity, direction, correct, latency_ms, lao_word_ids}]
create or replace function public.<name>(<args>)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  ...
end $$;
revoke execute on function public.<name>(<arg types>) from public, anon;
grant execute on function public.<name>(<arg types>) to authenticated;
```
- Read-only RPCs: `stable`. Return `jsonb`, and `coalesce(jsonb_agg(...), '[]'::jsonb)` so empty results are `[]`
  rather than null.
- Never trust ids or user ids from arguments for ownership: use `auth.uid()`. Validate argument shapes and ranges
  and raise a clear error.
- Content reads filter `retired_at is null`. Learners only get content of lessons they may see (by lesson order),
  and never `source`, `confidence` or `notes` unless the screen needs them.
- Privileged checks (native verified, admin) use trusted tables (`reviewer_trust`), never the self-declared
  `profiles.role` alone.
- Idempotent where the client may retry (a dropped connection replays a batch): use a client-generated id or
  `on conflict do nothing`.
- Dates for streaks: the learner's local day. Take it as an argument validated against `now()` (within ±14 h of UTC)
  or store the time zone in `profiles`; never use the server's `current_date`.

## Test block for the hand-over
Write SQL the user can paste into the SQL editor or `psql` after `supabase db reset`. Act as a user with:
```sql
select set_config('request.jwt.claims', json_build_object('sub', '<uuid>', 'role', 'authenticated')::text, true);
set local role authenticated;
select public.<name>(...);   -- expect: <result>
```
(inside `begin; ... rollback;`). Include one negative test: anonymous call fails, or another user's rows are invisible.

## After
- Update `app/README.md` (table and RPC sections).
- If the change alters what the client receives, check every JS caller (grep the RPC name in `app/frontend/js/`).

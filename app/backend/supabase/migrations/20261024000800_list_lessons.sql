-- Lesson list for the learner view (APP_PLAN S4). Content tables have RLS on and no read policies, so the
-- client reads lessons only through RPCs: list_lessons() for the list, get_lesson(id) for one lesson.
create or replace function public.list_lessons()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'lesson_id', l.lesson_id, 'lesson_order', l.lesson_order, 'title_en', l.title_en,
             'kind', l.kind, 'summary_en', l.summary_en,
             'new_items', (select count(*) from lesson_items li
                            where li.lesson_id = l.lesson_id and li.role = 'new' and li.retired_at is null))
           order by l.lesson_order)
    from lessons l
    where l.retired_at is null), '[]'::jsonb);
end $$;
revoke execute on function public.list_lessons() from public, anon;
grant execute on function public.list_lessons() to authenticated;

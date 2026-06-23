-- NEW database: run after 02_setup_rls.sql (or standalone — includes is_admin()).

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.action_items enable row level security;
alter table public.committee_meetings enable row level security;
alter table public.committee_meeting_attendees enable row level security;
alter table public.committee_default_attendees enable row level security;
alter table public.volunteer_asks enable row level security;
alter table public.volunteers enable row level security;
alter table public.feature_ids enable row level security;

-- action_items (read: authenticated, write: admin — matches events/people)
create policy action_items_delete_admin on public.action_items for delete to authenticated using (is_admin());
create policy action_items_insert_admin on public.action_items for insert to authenticated with check (is_admin());
create policy action_items_read_auth on public.action_items for select to authenticated using (true);
create policy action_items_update_admin on public.action_items for update to authenticated using (is_admin()) with check (is_admin());

-- committee_meetings
create policy committee_meetings_delete_admin on public.committee_meetings for delete to authenticated using (is_admin());
create policy committee_meetings_insert_admin on public.committee_meetings for insert to authenticated with check (is_admin());
create policy committee_meetings_read_auth on public.committee_meetings for select to authenticated using (true);
create policy committee_meetings_update_admin on public.committee_meetings for update to authenticated using (is_admin()) with check (is_admin());

-- committee_meeting_attendees
create policy committee_meeting_attendees_delete_admin on public.committee_meeting_attendees for delete to authenticated using (is_admin());
create policy committee_meeting_attendees_insert_admin on public.committee_meeting_attendees for insert to authenticated with check (is_admin());
create policy committee_meeting_attendees_read_auth on public.committee_meeting_attendees for select to authenticated using (true);
create policy committee_meeting_attendees_update_admin on public.committee_meeting_attendees for update to authenticated using (is_admin()) with check (is_admin());

-- committee_default_attendees
create policy committee_default_attendees_delete_admin on public.committee_default_attendees for delete to authenticated using (is_admin());
create policy committee_default_attendees_insert_admin on public.committee_default_attendees for insert to authenticated with check (is_admin());
create policy committee_default_attendees_read_auth on public.committee_default_attendees for select to authenticated using (true);
create policy committee_default_attendees_update_admin on public.committee_default_attendees for update to authenticated using (is_admin()) with check (is_admin());

-- volunteer_asks (matches event_volunteers)
create policy volunteer_asks_delete_admin on public.volunteer_asks for delete to authenticated using (is_admin());
create policy volunteer_asks_insert_admin on public.volunteer_asks for insert to authenticated with check (is_admin());
create policy volunteer_asks_read_auth on public.volunteer_asks for select to authenticated using (true);
create policy volunteer_asks_update_admin on public.volunteer_asks for update to authenticated using (is_admin()) with check (is_admin());

-- volunteers
create policy volunteers_delete_admin on public.volunteers for delete to authenticated using (is_admin());
create policy volunteers_insert_admin on public.volunteers for insert to authenticated with check (is_admin());
create policy volunteers_read_auth on public.volunteers for select to authenticated using (true);
create policy volunteers_update_admin on public.volunteers for update to authenticated using (is_admin()) with check (is_admin());

-- feature_ids (feature voting from browser + /api/features/vote)
create policy "Authenticated delete feature_ids" on public.feature_ids for delete to authenticated using (true);
create policy "Authenticated insert feature_ids" on public.feature_ids for insert to authenticated with check (true);
create policy "Authenticated select feature_ids" on public.feature_ids for select to authenticated using (true);
create policy "Authenticated update feature_ids" on public.feature_ids for update to authenticated using (true) with check (true);

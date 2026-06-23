-- TARGET: Run after 02_create_tables.sql

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create unique index businesses_google_place_id_unique
  on public.businesses (google_place_id)
  where google_place_id is not null;

create index qr_codes_created_at_idx on public.qr_codes (created_at desc);

create unique index leaflets_one_active_uidx
  on public.leaflets ((true))
  where status = 'active';

create index leaflets_status_distribution_date_idx
  on public.leaflets (status, distribution_date);

create index task_templates_context_idx
  on public.task_templates (context, event_template_id);

create index tasks_context_idx on public.tasks (context, context_id);

create unique index comm_settings_context_step_uidx
  on public.comm_settings (context, step_key)
  where event_template_id is null;

create unique index comm_settings_event_template_step_uidx
  on public.comm_settings (context, event_template_id, step_key)
  where event_template_id is not null;

create index events_event_template_id_idx on public.events (event_template_id);
create index events_starts_at_idx on public.events (starts_at);

create unique index events_slug_uidx on public.events (slug) where slug is not null;

create unique index deliveries_leaflet_route_uidx
  on public.deliveries (leaflet_id, route_id)
  where leaflet_id is not null;

create index deliveries_leaflet_id_idx on public.deliveries (leaflet_id);
create index deliveries_person_id_idx on public.deliveries (person_id);
create index deliveries_leaflet_skipped_idx on public.deliveries (leaflet_id, is_skipped);

create index sponsorships_leaflet_id_idx on public.sponsorships (leaflet_id);

create index volunteer_asks_event_id_idx on public.volunteer_asks (event_id);
create index volunteers_volunteer_ask_id_idx on public.volunteers (volunteer_ask_id);
create index volunteers_person_id_idx on public.volunteers (person_id);

create index tshirt_preorders_created_at_idx on public.tshirt_preorders (created_at desc);
create index tshirt_preorders_status_idx on public.tshirt_preorders (status);

create index fundraising_donations_created_at_idx on public.fundraising_donations (created_at desc);
create index fundraising_donations_status_idx on public.fundraising_donations (status);

create index committee_meetings_event_id_idx on public.committee_meetings (event_id);
create index committee_meetings_committee_idx on public.committee_meetings (committee);

create index committee_meeting_attendees_meeting_id_idx
  on public.committee_meeting_attendees (meeting_id);

create index action_items_assignee_person_id_idx on public.action_items (assignee_person_id);
create index action_items_committee_meeting_id_idx on public.action_items (committee_meeting_id);
create index action_items_status_idx on public.action_items (status);

create index committee_default_attendees_committee_slug_idx
  on public.committee_default_attendees (committee_slug);

create index committee_default_attendees_person_id_idx
  on public.committee_default_attendees (person_id);

-- Extra indexes from SOURCE inventory
create index idx_memberships_email on public.memberships (customer_email);
create index idx_memberships_stripe_customer_id on public.memberships (stripe_customer_id);
create index idx_memberships_stripe_subscription_id on public.memberships (stripe_subscription_id);

create index idx_people_membership_id on public.people (membership_id);
create index idx_people_name_email on public.people (full_name, email);

create index idx_routes_primary_deliverer_id on public.routes (primary_deliverer_id);
create index idx_routes_primary_deliverer_email on public.routes (primary_deliverer_email);

create index idx_event_participants_event_person on public.event_volunteers (event_id, person_id);

-- ---------------------------------------------------------------------------
-- Auth helper (required by admin RLS policies)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Row level security (matches SOURCE Section 6 inventory)
-- ---------------------------------------------------------------------------

alter table public.business_memberships enable row level security;
alter table public.businesses enable row level security;
alter table public.comm_settings enable row level security;
alter table public.deliveries enable row level security;
alter table public.event_templates enable row level security;
alter table public.event_volunteers enable row level security;
alter table public.events enable row level security;
alter table public.fundraising_donations enable row level security;
alter table public.leaflets enable row level security;
alter table public.memberships enable row level security;
alter table public.payments enable row level security;
alter table public.people enable row level security;
alter table public.qr_codes enable row level security;
alter table public.routes enable row level security;
alter table public.sponsorships enable row level security;
alter table public.task_templates enable row level security;
alter table public.tasks enable row level security;
alter table public.tshirt_preorders enable row level security;
alter table public.user_roles enable row level security;

-- business_memberships
create policy business_memberships_delete_admin on public.business_memberships for delete to authenticated using (is_admin());
create policy business_memberships_insert_admin on public.business_memberships for insert to authenticated with check (is_admin());
create policy business_memberships_read_auth on public.business_memberships for select to authenticated using (true);
create policy business_memberships_update_admin on public.business_memberships for update to authenticated using (is_admin()) with check (is_admin());

-- businesses
create policy businesses_delete_admin on public.businesses for delete to authenticated using (is_admin());
create policy businesses_insert_admin on public.businesses for insert to authenticated with check (is_admin());
create policy businesses_read_auth on public.businesses for select to authenticated using (true);
create policy businesses_update_admin on public.businesses for update to authenticated using (is_admin()) with check (is_admin());

-- comm_settings
create policy "Authenticated delete comm_settings" on public.comm_settings for delete to authenticated using (true);
create policy "Authenticated insert comm_settings" on public.comm_settings for insert to authenticated with check (true);
create policy "Authenticated select comm_settings" on public.comm_settings for select to authenticated using (true);
create policy "Authenticated update comm_settings" on public.comm_settings for update to authenticated using (true) with check (true);

-- deliveries (both policy sets — matches OLD db)
create policy "Authenticated delete deliveries" on public.deliveries for delete to authenticated using (true);
create policy "Authenticated insert deliveries" on public.deliveries for insert to authenticated with check (true);
create policy "Authenticated select deliveries" on public.deliveries for select to authenticated using (true);
create policy "Authenticated update deliveries" on public.deliveries for update to authenticated using (true) with check (true);
create policy deliveries_delete_admin on public.deliveries for delete to authenticated using (is_admin());
create policy deliveries_insert_admin on public.deliveries for insert to authenticated with check (is_admin());
create policy deliveries_read_auth on public.deliveries for select to authenticated using (true);
create policy deliveries_update_admin on public.deliveries for update to authenticated using (is_admin()) with check (is_admin());

-- event_templates
create policy "Authenticated delete event_templates" on public.event_templates for delete to authenticated using (true);
create policy "Authenticated insert event_templates" on public.event_templates for insert to authenticated with check (true);
create policy "Authenticated select event_templates" on public.event_templates for select to authenticated using (true);
create policy "Authenticated update event_templates" on public.event_templates for update to authenticated using (true) with check (true);

-- event_volunteers
create policy event_volunteers_delete_admin on public.event_volunteers for delete to authenticated using (is_admin());
create policy event_volunteers_insert_admin on public.event_volunteers for insert to authenticated with check (is_admin());
create policy event_volunteers_read_auth on public.event_volunteers for select to authenticated using (true);
create policy event_volunteers_update_admin on public.event_volunteers for update to authenticated using (is_admin()) with check (is_admin());

-- events
create policy events_delete_admin on public.events for delete to authenticated using (is_admin());
create policy events_insert_admin on public.events for insert to authenticated with check (is_admin());
create policy events_read_auth on public.events for select to authenticated using (true);
create policy events_update_admin on public.events for update to authenticated using (is_admin()) with check (is_admin());

-- fundraising_donations
create policy "Authenticated read fundraising_donations" on public.fundraising_donations for select to authenticated using (true);

-- leaflets
create policy "Authenticated delete leaflets" on public.leaflets for delete to authenticated using (true);
create policy "Authenticated insert leaflets" on public.leaflets for insert to authenticated with check (true);
create policy "Authenticated select leaflets" on public.leaflets for select to authenticated using (true);
create policy "Authenticated update leaflets" on public.leaflets for update to authenticated using (true) with check (true);

-- memberships
create policy memberships_delete_admin on public.memberships for delete to authenticated using (is_admin());
create policy memberships_insert_admin on public.memberships for insert to authenticated with check (is_admin());
create policy memberships_read_auth on public.memberships for select to authenticated using (true);
create policy memberships_update_admin on public.memberships for update to authenticated using (is_admin()) with check (is_admin());

-- payments
create policy payments_delete_admin on public.payments for delete to authenticated using (is_admin());
create policy payments_insert_admin on public.payments for insert to authenticated with check (is_admin());
create policy payments_read_auth on public.payments for select to authenticated using (true);
create policy payments_update_admin on public.payments for update to authenticated using (is_admin()) with check (is_admin());

-- people
create policy people_delete_admin on public.people for delete to authenticated using (is_admin());
create policy people_insert_admin on public.people for insert to authenticated with check (is_admin());
create policy people_read_auth on public.people for select to authenticated using (true);
create policy people_update_admin on public.people for update to authenticated using (is_admin()) with check (is_admin());

-- qr_codes
create policy "Authenticated delete qr_codes" on public.qr_codes for delete to authenticated using (true);
create policy "Authenticated insert qr_codes" on public.qr_codes for insert to authenticated with check (true);
create policy "Authenticated select qr_codes" on public.qr_codes for select to authenticated using (true);
create policy "Authenticated update qr_codes" on public.qr_codes for update to authenticated using (true) with check (true);

-- routes
create policy routes_delete_admin on public.routes for delete to authenticated using (is_admin());
create policy routes_insert_admin on public.routes for insert to authenticated with check (is_admin());
create policy routes_read_auth on public.routes for select to authenticated using (true);
create policy routes_update_admin on public.routes for update to authenticated using (is_admin()) with check (is_admin());

-- sponsorships
create policy sponsorships_delete_admin on public.sponsorships for delete to authenticated using (is_admin());
create policy sponsorships_insert_admin on public.sponsorships for insert to authenticated with check (is_admin());
create policy sponsorships_read_auth on public.sponsorships for select to authenticated using (true);
create policy sponsorships_update_admin on public.sponsorships for update to authenticated using (is_admin()) with check (is_admin());

-- task_templates
create policy "Authenticated delete task_templates" on public.task_templates for delete to authenticated using (true);
create policy "Authenticated insert task_templates" on public.task_templates for insert to authenticated with check (true);
create policy "Authenticated select task_templates" on public.task_templates for select to authenticated using (true);
create policy "Authenticated update task_templates" on public.task_templates for update to authenticated using (true) with check (true);

-- tasks
create policy "Authenticated delete tasks" on public.tasks for delete to authenticated using (true);
create policy "Authenticated insert tasks" on public.tasks for insert to authenticated with check (true);
create policy "Authenticated select tasks" on public.tasks for select to authenticated using (true);
create policy "Authenticated update tasks" on public.tasks for update to authenticated using (true) with check (true);

-- tshirt_preorders
create policy "Authenticated read tshirt_preorders" on public.tshirt_preorders for select to authenticated using (true);

-- user_roles
create policy user_roles_admin_manage on public.user_roles for all to authenticated using (is_admin()) with check (is_admin());
create policy user_roles_select_own on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- Resend template UUIDs (from repo migration 2026-03-22)
update public.comm_settings
set resend_template_id = '5001e3e2-f803-497a-a2ea-d35cef88bd70', updated_at = now()
where context = 'leaflet' and step_key = 'initial_confirmation';

update public.comm_settings
set resend_template_id = '730c2f7d-61cb-43b4-ac00-1ee15eccf8c1', updated_at = now()
where context = 'leaflet' and step_key = 'pre_distribution_reminder';

update public.comm_settings
set resend_template_id = '88b30acc-256c-4f0c-b2be-8b9dd5007fb6', updated_at = now()
where context = 'leaflet' and step_key = 'distribution_day_pickup';

update public.comm_settings
set resend_template_id = '8588c557-2b03-4e72-9c27-b853068e9310', updated_at = now()
where context = 'leaflet' and step_key = 'delivery_complete_prompt';

update public.comm_settings
set resend_template_id = 'd15e937d-a9b2-417f-bb73-d832212b9d0e', updated_at = now()
where context = 'leaflet' and step_key = 'completion_followup';

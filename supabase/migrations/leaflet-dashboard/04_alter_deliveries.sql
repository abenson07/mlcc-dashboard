-- Deliveries: one row per route per leaflet edition (requires 01_new_tables.sql).

alter table public.deliveries
  add column if not exists leaflet_id uuid references public.leaflets (id) on delete cascade,
  add column if not exists leaflet_count integer,
  add column if not exists is_skipped boolean not null default false,
  add column if not exists response public.delivery_response not null default 'pending',
  add column if not exists responded_at timestamptz,
  add column if not exists leaflets_delivered integer,
  add column if not exists leaflets_leftover integer,
  add column if not exists building_contact_name text,
  add column if not exists building_contact_email text,
  add column if not exists building_contact_phone text,
  add column if not exists building_contact_is_deliverer boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  -- per-route / per-deliverer comm (nullable; edition-wide blasts live on leaflets)
  add column if not exists comm_pre_distribution_reminder_sent_at timestamptz,
  add column if not exists comm_completion_followup_sent_at timestamptz;

comment on table public.deliveries is
  'Per route per leaflet edition: assignee, counts, skip, confirm, completion. Historical when leaflet closes.';
comment on column public.deliveries.leaflet_id is
  'Required for all new rows. Legacy rows may be null.';
comment on column public.deliveries.date_delivered is
  'Date deliverer confirmed route complete (null until then).';
comment on column public.deliveries.comm_pre_distribution_reminder_sent_at is
  'When pre-distribution reminder was sent for this delivery row (nullable).';
comment on column public.deliveries.comm_completion_followup_sent_at is
  'When completion followup was sent for this delivery row (nullable).';

alter table public.deliveries
  alter column person_id drop not null;

alter table public.deliveries
  alter column date_delivered drop not null;

create unique index if not exists deliveries_leaflet_route_uidx
  on public.deliveries (leaflet_id, route_id)
  where leaflet_id is not null;

create index if not exists deliveries_leaflet_id_idx
  on public.deliveries (leaflet_id);

create index if not exists deliveries_person_id_idx
  on public.deliveries (person_id);

create index if not exists deliveries_leaflet_skipped_idx
  on public.deliveries (leaflet_id, is_skipped);

alter table public.deliveries enable row level security;

create policy "Authenticated select deliveries"
  on public.deliveries for select to authenticated using (true);
create policy "Authenticated insert deliveries"
  on public.deliveries for insert to authenticated with check (true);
create policy "Authenticated update deliveries"
  on public.deliveries for update to authenticated using (true) with check (true);
create policy "Authenticated delete deliveries"
  on public.deliveries for delete to authenticated using (true);

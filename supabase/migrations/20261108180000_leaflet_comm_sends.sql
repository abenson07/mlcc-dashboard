-- Per-person log of leaflet emails: one row each time a deliverer is emailed a
-- template (from the full "Email deliverers" send or a one-person send).
-- The edition-wide "Sent" flags on leaflets stay as they are.
-- Run this once in the Supabase SQL editor.

create table if not exists public.leaflet_comm_sends (
  id uuid primary key default gen_random_uuid(),
  leaflet_id uuid not null references public.leaflets (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  step_key text not null,
  sent_at timestamptz not null default now()
);

comment on table public.leaflet_comm_sends is
  'One row per email sent to a deliverer for a leaflet edition and template (step_key).';

create index if not exists leaflet_comm_sends_leaflet_person_idx
  on public.leaflet_comm_sends (leaflet_id, person_id, step_key, sent_at desc);

alter table public.leaflet_comm_sends enable row level security;

create policy "Authenticated select leaflet_comm_sends"
  on public.leaflet_comm_sends for select to authenticated using (true);
create policy "Authenticated insert leaflet_comm_sends"
  on public.leaflet_comm_sends for insert to authenticated with check (true);

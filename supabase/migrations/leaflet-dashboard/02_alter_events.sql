-- Expand events for dashboard-native events (requires 01_new_tables.sql).

alter table public.events
  add column if not exists event_template_id uuid references public.event_templates (id) on delete set null,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists slug text,
  add column if not exists field_data jsonb not null default '{}',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

comment on column public.events.event_template_id is
  'Set when event was spawned from a repeatable event_templates row.';
comment on column public.events.field_data is
  'CMS-like fields (migrated from Webflow over time).';

create index if not exists events_event_template_id_idx
  on public.events (event_template_id);

create index if not exists events_starts_at_idx
  on public.events (starts_at);

create unique index if not exists events_slug_uidx
  on public.events (slug)
  where slug is not null;

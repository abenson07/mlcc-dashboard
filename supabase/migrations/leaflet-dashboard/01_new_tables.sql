-- Leaflet dashboard: enums, new tables, indexes, RLS, seeds.
-- Run first. Requires existing public.qr_codes.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.leaflet_status as enum ('planned', 'active', 'closed');

create type public.delivery_response as enum (
  'pending',
  'confirmed',
  'needs_cover',
  'rejected'
);

create type public.workflow_context as enum (
  'leaflet',
  'event',
  'membership'
);

create type public.comm_trigger as enum (
  'anchor_offset',
  'on_activate'
);

-- ---------------------------------------------------------------------------
-- event_templates (repeatable events, e.g. Summer Social)
-- ---------------------------------------------------------------------------

create table public.event_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  default_field_data jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.event_templates is
  'Templates for repeatable events spawned in the dashboard (replacing Webflow).';

-- ---------------------------------------------------------------------------
-- leaflets
-- ---------------------------------------------------------------------------

create table public.leaflets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  distribution_date date not null,
  status public.leaflet_status not null default 'planned',
  activated_at timestamptz,
  closed_at timestamptz,
  print_cost_cents integer,
  membership_qr_code_id uuid references public.qr_codes (id) on delete set null,
  -- edition-wide comm blasts (sent to all deliverers at once)
  comm_initial_confirmation_sent_at timestamptz,
  comm_distribution_day_pickup_sent_at timestamptz,
  comm_delivery_complete_prompt_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.leaflets is
  'Time-bound leaflet edition (e.g. Summer 2026). One active at a time.';
comment on column public.leaflets.print_cost_cents is
  'Print cost for overview finances; entered in dashboard.';
comment on column public.leaflets.comm_initial_confirmation_sent_at is
  'When initial confirmation blast was sent for this edition.';
comment on column public.leaflets.comm_distribution_day_pickup_sent_at is
  'When distribution-day pickup blast was sent for this edition.';
comment on column public.leaflets.comm_delivery_complete_prompt_sent_at is
  'When delivery-complete prompt blast was sent for this edition.';

-- Only one active leaflet at a time
create unique index leaflets_one_active_uidx
  on public.leaflets ((true))
  where status = 'active';

create index leaflets_status_distribution_date_idx
  on public.leaflets (status, distribution_date);

-- ---------------------------------------------------------------------------
-- task_templates + tasks
-- ---------------------------------------------------------------------------

create table public.task_templates (
  id uuid primary key default gen_random_uuid(),
  context public.workflow_context not null,
  event_template_id uuid references public.event_templates (id) on delete cascade,
  title text not null,
  description text,
  offset_days integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint task_templates_context_check check (
    (context = 'leaflet' and event_template_id is null)
    or context = 'event'
    or (context = 'membership' and event_template_id is null)
  )
);

comment on table public.task_templates is
  'Reusable checklist items; offset_days relative to anchor date (distribution_date, event starts_at, etc.).';

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  context public.workflow_context not null,
  context_id uuid not null,
  template_id uuid references public.task_templates (id) on delete set null,
  title text not null,
  description text,
  offset_days integer not null,
  is_complete boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.tasks is
  'Checklist instances on a leaflet, event, etc. Due date = anchor_date + offset_days (computed in app).';

create index task_templates_context_idx
  on public.task_templates (context, event_template_id);

create index tasks_context_idx
  on public.tasks (context, context_id);

-- ---------------------------------------------------------------------------
-- comm_settings
-- ---------------------------------------------------------------------------

create table public.comm_settings (
  id uuid primary key default gen_random_uuid(),
  context public.workflow_context not null,
  event_template_id uuid references public.event_templates (id) on delete cascade,
  name text not null,
  step_key text not null,
  resend_template_id text not null,
  trigger public.comm_trigger not null default 'anchor_offset',
  offset_days integer,
  offset_time time not null default '09:00',
  requires_response boolean not null default false,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comm_settings_offset_days_check check (
    trigger = 'on_activate'
    or offset_days is not null
  )
);

comment on table public.comm_settings is
  'Timed comm steps (email, drip, volunteer ask, etc.). Bodies live in Resend; timing + template id here.';

create unique index comm_settings_context_step_uidx
  on public.comm_settings (context, step_key)
  where event_template_id is null;

create unique index comm_settings_event_template_step_uidx
  on public.comm_settings (context, event_template_id, step_key)
  where event_template_id is not null;

-- ---------------------------------------------------------------------------
-- RLS (match existing dashboard pattern: authenticated full access)
-- ---------------------------------------------------------------------------

alter table public.event_templates enable row level security;
alter table public.leaflets enable row level security;
alter table public.task_templates enable row level security;
alter table public.tasks enable row level security;
alter table public.comm_settings enable row level security;

create policy "Authenticated select event_templates"
  on public.event_templates for select to authenticated using (true);
create policy "Authenticated insert event_templates"
  on public.event_templates for insert to authenticated with check (true);
create policy "Authenticated update event_templates"
  on public.event_templates for update to authenticated using (true) with check (true);
create policy "Authenticated delete event_templates"
  on public.event_templates for delete to authenticated using (true);

create policy "Authenticated select leaflets"
  on public.leaflets for select to authenticated using (true);
create policy "Authenticated insert leaflets"
  on public.leaflets for insert to authenticated with check (true);
create policy "Authenticated update leaflets"
  on public.leaflets for update to authenticated using (true) with check (true);
create policy "Authenticated delete leaflets"
  on public.leaflets for delete to authenticated using (true);

create policy "Authenticated select task_templates"
  on public.task_templates for select to authenticated using (true);
create policy "Authenticated insert task_templates"
  on public.task_templates for insert to authenticated with check (true);
create policy "Authenticated update task_templates"
  on public.task_templates for update to authenticated using (true) with check (true);
create policy "Authenticated delete task_templates"
  on public.task_templates for delete to authenticated using (true);

create policy "Authenticated select tasks"
  on public.tasks for select to authenticated using (true);
create policy "Authenticated insert tasks"
  on public.tasks for insert to authenticated with check (true);
create policy "Authenticated update tasks"
  on public.tasks for update to authenticated using (true) with check (true);
create policy "Authenticated delete tasks"
  on public.tasks for delete to authenticated using (true);

create policy "Authenticated select comm_settings"
  on public.comm_settings for select to authenticated using (true);
create policy "Authenticated insert comm_settings"
  on public.comm_settings for insert to authenticated with check (true);
create policy "Authenticated update comm_settings"
  on public.comm_settings for update to authenticated using (true) with check (true);
create policy "Authenticated delete comm_settings"
  on public.comm_settings for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Seeds (v1 placeholders)
-- ---------------------------------------------------------------------------

insert into public.task_templates (context, title, description, offset_days) values
  ('leaflet', 'Example task one', 'Placeholder — replace with real checklist item.', -42),
  ('leaflet', 'Example task two', 'Placeholder — replace with real checklist item.', -14),
  ('leaflet', 'Example task three', 'Placeholder — replace with real checklist item.', -7);

insert into public.comm_settings (
  context,
  name,
  step_key,
  resend_template_id,
  trigger,
  offset_days,
  offset_time,
  requires_response
) values
  (
    'leaflet',
    'Initial confirmation',
    'initial_confirmation',
    'placeholder_initial_confirmation',
    'on_activate',
    null,
    '09:00',
    true
  ),
  (
    'leaflet',
    'Pre-distribution reminder',
    'pre_distribution_reminder',
    'placeholder_pre_distribution_reminder',
    'anchor_offset',
    -14,
    '09:00',
    false
  ),
  (
    'leaflet',
    'Distribution day pickup',
    'distribution_day_pickup',
    'placeholder_distribution_day_pickup',
    'anchor_offset',
    0,
    '08:00',
    false
  ),
  (
    'leaflet',
    'Delivery complete prompt',
    'delivery_complete_prompt',
    'placeholder_delivery_complete_prompt',
    'anchor_offset',
    0,
    '10:00',
    true
  ),
  (
    'leaflet',
    'Completion followup',
    'completion_followup',
    'placeholder_completion_followup',
    'anchor_offset',
    7,
    '09:00',
    true
  );

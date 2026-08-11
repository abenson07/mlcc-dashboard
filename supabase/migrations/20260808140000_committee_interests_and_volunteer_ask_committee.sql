-- Committee website interest inbox + volunteer ask committee / auto-accept.

-- ── Interest status ──────────────────────────────────────────────────────────
create type public.committee_interest_status as enum (
  'pending',
  'handled',
  'auto_accepted'
);

create type public.committee_interest_source as enum (
  'join-card',
  'meeting-signup',
  'zoning-workshop',
  'volunteer-opportunity',
  'other'
);

create table public.committee_interests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  committee public.committee_slug not null,
  source public.committee_interest_source not null default 'other',
  opportunity_title text,
  volunteer_ask_id uuid references public.volunteer_asks (id) on delete set null,
  event_id uuid references public.events (id) on delete set null,
  status public.committee_interest_status not null default 'pending',
  responded_at timestamptz,
  responded_by uuid references auth.users (id) on delete set null,
  response_email_id text,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.committee_interests is
  'Website committee / volunteer interest signups (Slack still notified separately).';

create index committee_interests_committee_idx on public.committee_interests (committee);
create index committee_interests_status_idx on public.committee_interests (status);
create index committee_interests_volunteer_ask_id_idx on public.committee_interests (volunteer_ask_id);
create index committee_interests_event_id_idx on public.committee_interests (event_id);
create index committee_interests_created_at_idx on public.committee_interests (created_at desc);

alter table public.committee_interests enable row level security;

create policy committee_interests_select_authenticated
  on public.committee_interests for select
  to authenticated
  using (true);

create policy committee_interests_update_authenticated
  on public.committee_interests for update
  to authenticated
  using (true)
  with check (true);

-- Inserts go through the public API with the service role (no anon insert policy).

-- ── Volunteer asks: committee + auto-accept ──────────────────────────────────
alter table public.volunteer_asks
  add column if not exists committee public.committee_slug,
  add column if not exists auto_accept boolean not null default false,
  add column if not exists auto_response_body text;

-- Backfill committee from linked event field_data, else steering.
update public.volunteer_asks va
set committee = coalesce(
  (
    select
      case e.field_data->>'committee'
        when 'events' then 'events'::public.committee_slug
        when 'outreach' then 'outreach'::public.committee_slug
        when 'hub' then 'hub'::public.committee_slug
        when 'leaflet' then 'leaflet'::public.committee_slug
        when 'communications' then 'communications'::public.committee_slug
        when 'steering' then 'steering'::public.committee_slug
        when 'executive_board' then 'executive_board'::public.committee_slug
        when 'businesses' then 'businesses'::public.committee_slug
        else null
      end
    from public.events e
    where e.id = va.event_id
  ),
  'steering'::public.committee_slug
)
where va.committee is null;

alter table public.volunteer_asks
  alter column committee set not null;

create index if not exists volunteer_asks_committee_idx
  on public.volunteer_asks (committee);

comment on column public.volunteer_asks.committee is
  'Owning committee for this ask; event_id is optional child context.';
comment on column public.volunteer_asks.auto_accept is
  'When true, public signups are accepted and emailed auto_response_body automatically.';
comment on column public.volunteer_asks.auto_response_body is
  'Boilerplate details emailed on auto-accept (where/when to show up, etc.).';

-- ── Volunteers (ask signups): pending vs accepted ────────────────────────────
create type public.volunteer_signup_status as enum ('pending', 'accepted');

alter table public.volunteers
  add column if not exists status public.volunteer_signup_status not null default 'accepted',
  add column if not exists accepted_at timestamptz,
  add column if not exists accepted_by uuid references auth.users (id) on delete set null;

update public.volunteers
set accepted_at = coalesce(accepted_at, created_at)
where status = 'accepted' and accepted_at is null;

comment on column public.volunteers.status is
  'pending = awaiting admin response; accepted = confirmed for the ask.';

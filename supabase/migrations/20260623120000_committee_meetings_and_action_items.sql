-- Committee meetings, attendance, and action items (distinct from event tasks).

create type public.committee_slug as enum (
  'events',
  'outreach',
  'hub',
  'leaflet',
  'communications',
  'steering',
  'executive_board',
  'businesses'
);

create type public.meeting_location_type as enum ('in_person', 'remote', 'hybrid');

create type public.minutes_status as enum ('draft', 'submitted', 'processing', 'ready', 'error');

create type public.action_item_status as enum ('open', 'done');

create type public.action_item_source as enum ('ai', 'manual', 'bulk');

alter table public.people
  add column if not exists is_executive_board boolean not null default false;

comment on column public.people.is_executive_board is
  'Default attendee for executive board committee meetings.';

create table public.committee_meetings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events (id) on delete cascade,
  committee public.committee_slug not null,
  location_type public.meeting_location_type not null default 'in_person',
  location text,
  google_calendar_url text,
  agenda_json jsonb,
  raw_transcript text,
  structured_minutes jsonb,
  minutes_status public.minutes_status not null default 'draft',
  minutes_error text,
  submitted_at timestamptz,
  submitted_by uuid,
  website_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.committee_meetings is
  'Committee meeting metadata linked 1:1 to an events row (field_data.kind = committee_meeting).';

create index committee_meetings_event_id_idx on public.committee_meetings (event_id);
create index committee_meetings_committee_idx on public.committee_meetings (committee);

create table public.committee_meeting_attendees (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.committee_meetings (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (meeting_id, person_id)
);

comment on table public.committee_meeting_attendees is
  'People in attendance at a committee meeting.';

create index committee_meeting_attendees_meeting_id_idx
  on public.committee_meeting_attendees (meeting_id);

create table public.action_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assignee_person_id uuid references public.people (id) on delete set null,
  committee_meeting_id uuid references public.committee_meetings (id) on delete cascade,
  status public.action_item_status not null default 'open',
  due_at date,
  source public.action_item_source not null default 'manual',
  sort_order integer not null default 0,
  completed_at timestamptz,
  completed_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.action_items is
  'Person-assigned follow-ups from meetings or bulk import — not event/leaflet checklist tasks.';

create index action_items_assignee_person_id_idx on public.action_items (assignee_person_id);
create index action_items_committee_meeting_id_idx on public.action_items (committee_meeting_id);
create index action_items_status_idx on public.action_items (status);

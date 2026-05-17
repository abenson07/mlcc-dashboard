-- Volunteer opportunities (asks) and signups (people ↔ ask).

create type public.volunteer_commitment_type as enum ('one_off', 'ongoing');
create type public.volunteer_commitment_unit as enum ('minutes', 'hours');

create table public.volunteer_asks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  commitment_type public.volunteer_commitment_type not null,
  commitment_unit public.volunteer_commitment_unit not null,
  commitment_quantity numeric(10, 2) not null check (commitment_quantity > 0),
  quantity integer not null check (quantity > 0),
  event_id uuid references public.events (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.volunteer_asks is 'Volunteer opportunities: time commitment and headcount needed.';
comment on column public.volunteer_asks.quantity is 'Number of volunteer slots needed for this ask.';
comment on column public.volunteer_asks.commitment_quantity is 'Time per volunteer; ongoing asks are interpreted as per month.';

create index volunteer_asks_event_id_idx on public.volunteer_asks (event_id);

create table public.volunteers (
  id uuid primary key default gen_random_uuid(),
  volunteer_ask_id uuid not null references public.volunteer_asks (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (volunteer_ask_id, person_id)
);

comment on table public.volunteers is 'Signups: person assigned to a volunteer ask.';

create index volunteers_volunteer_ask_id_idx on public.volunteers (volunteer_ask_id);
create index volunteers_person_id_idx on public.volunteers (person_id);

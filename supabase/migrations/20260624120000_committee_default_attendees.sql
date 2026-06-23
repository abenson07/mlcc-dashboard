-- Default attendees per committee type (Settings → Committee settings).
-- Run this entire file in the Supabase SQL editor (not individual lines).

drop table if exists public.committee_default_attendees;

create table public.committee_default_attendees (
  id uuid primary key default gen_random_uuid(),
  committee_slug public.committee_slug not null,
  person_id uuid not null references public.people (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint committee_default_attendees_committee_person_unique unique (committee_slug, person_id)
);

comment on table public.committee_default_attendees is
  'Default attendance list per committee; applied when a committee meeting is created.';

create index committee_default_attendees_committee_slug_idx
  on public.committee_default_attendees (committee_slug);

create index committee_default_attendees_person_id_idx
  on public.committee_default_attendees (person_id);

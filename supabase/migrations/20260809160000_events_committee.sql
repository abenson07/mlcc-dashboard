-- Attach dashboard events to a committee (replaces the mock Category dropdown).

alter table public.events
  add column if not exists committee public.committee_slug;

comment on column public.events.committee is
  'Owning committee for this event (admin-migrate). Used by committee Public events lists.';

create index if not exists events_committee_idx
  on public.events (committee);

-- Prefer the typed column when field_data still has a legacy committee slug.
update public.events
set committee = (field_data->>'committee')::public.committee_slug
where committee is null
  and field_data->>'committee' in (
    'events',
    'outreach',
    'hub',
    'leaflet',
    'communications',
    'steering',
    'executive_board',
    'businesses'
  );

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'committee_profiles'
  ) and not exists (
    select 1
    from pg_constraint
    where conname = 'events_committee_fkey'
  ) then
    alter table public.events
      add constraint events_committee_fkey
      foreign key (committee)
      references public.committee_profiles (committee)
      on delete set null;
  end if;
end $$;

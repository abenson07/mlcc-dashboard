-- Sponsorships: primary key + leaflet edition fields (requires 01_new_tables.sql).
-- App copies leaflet sponsorships from prior edition with status reset to pledged (open slot).

alter table public.sponsorships
  add column if not exists id uuid default gen_random_uuid();

update public.sponsorships
set id = gen_random_uuid()
where id is null;

alter table public.sponsorships
  alter column id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sponsorships_pkey'
      and conrelid = 'public.sponsorships'::regclass
  ) then
    alter table public.sponsorships
      add constraint sponsorships_pkey primary key (id);
  end if;
end $$;

alter table public.sponsorships
  add column if not exists leaflet_id uuid references public.leaflets (id) on delete cascade,
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists quantity integer not null default 1;

comment on column public.sponsorships.leaflet_id is
  'Set for leaflet sponsorship slots. event_id used for event sponsorships.';
comment on column public.sponsorships.quantity is
  'Slot quantity (e.g. number of sponsor placements).';

create index if not exists sponsorships_leaflet_id_idx
  on public.sponsorships (leaflet_id);

-- Leaflet vs event sponsorship: at most one parent per row
alter table public.sponsorships
  drop constraint if exists sponsorships_one_parent_check;

alter table public.sponsorships
  add constraint sponsorships_one_parent_check check (
    not (leaflet_id is not null and event_id is not null)
  );

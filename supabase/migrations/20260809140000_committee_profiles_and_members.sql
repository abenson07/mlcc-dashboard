-- Committee profiles (settings) + membership roster.

create type public.committee_publish_status as enum ('draft', 'published');

create type public.committee_member_title as enum ('chair', 'co_chair', 'member');

create table if not exists public.committee_profiles (
  committee public.committee_slug primary key,
  name text not null,
  description text,
  cadence text,
  meeting_day text,
  location text,
  website_slug text,
  publish_status public.committee_publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.committee_profiles is
  'Editable committee settings / website fields for admin-migrate.';

alter table public.committee_profiles enable row level security;

create policy committee_profiles_select_authenticated
  on public.committee_profiles for select
  to authenticated
  using (true);

create policy committee_profiles_insert_authenticated
  on public.committee_profiles for insert
  to authenticated
  with check (true);

create policy committee_profiles_update_authenticated
  on public.committee_profiles for update
  to authenticated
  using (true)
  with check (true);

create table if not exists public.committee_members (
  id uuid primary key default gen_random_uuid(),
  committee public.committee_slug not null,
  person_id uuid not null references public.people (id) on delete cascade,
  title public.committee_member_title not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (committee, person_id)
);

comment on table public.committee_members is
  'People who serve on a committee, with a display title (chair / co-chair / member).';

create index if not exists committee_members_committee_idx
  on public.committee_members (committee);

create index if not exists committee_members_person_id_idx
  on public.committee_members (person_id);

alter table public.committee_members enable row level security;

create policy committee_members_select_authenticated
  on public.committee_members for select
  to authenticated
  using (true);

create policy committee_members_insert_authenticated
  on public.committee_members for insert
  to authenticated
  with check (true);

create policy committee_members_update_authenticated
  on public.committee_members for update
  to authenticated
  using (true)
  with check (true);

create policy committee_members_delete_authenticated
  on public.committee_members for delete
  to authenticated
  using (true);

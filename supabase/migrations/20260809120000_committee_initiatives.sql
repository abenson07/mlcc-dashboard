-- Committee initiatives + link action items to an initiative.

create table if not exists public.committee_initiatives (
  id uuid primary key default gen_random_uuid(),
  committee public.committee_slug not null,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.committee_initiatives is
  'Standing committee initiatives / projects with optional linked action-item tasks.';

create index if not exists committee_initiatives_committee_idx
  on public.committee_initiatives (committee);

alter table public.committee_initiatives enable row level security;

create policy committee_initiatives_select_authenticated
  on public.committee_initiatives for select
  to authenticated
  using (true);

create policy committee_initiatives_insert_authenticated
  on public.committee_initiatives for insert
  to authenticated
  with check (true);

create policy committee_initiatives_update_authenticated
  on public.committee_initiatives for update
  to authenticated
  using (true)
  with check (true);

create policy committee_initiatives_delete_authenticated
  on public.committee_initiatives for delete
  to authenticated
  using (true);

alter table public.action_items
  add column if not exists initiative_id uuid references public.committee_initiatives (id) on delete set null;

create index if not exists action_items_initiative_id_idx
  on public.action_items (initiative_id);

comment on column public.action_items.initiative_id is
  'Optional link to a committee initiative (tasks outside a meeting context).';

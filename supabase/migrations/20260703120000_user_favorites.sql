-- Per-user page favorites for the shell navigation.
-- Run this entire file in the Supabase SQL editor (not individual lines).

create table public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  route text not null,
  created_at timestamptz not null default now(),
  constraint user_favorites_user_route_unique unique (user_id, route)
);

comment on table public.user_favorites is
  'User-scoped page favorites (name + route) for shell nav and breadcrumb star.';

create index user_favorites_user_id_idx on public.user_favorites (user_id);

alter table public.user_favorites enable row level security;

create policy user_favorites_select_own on public.user_favorites
  for select to authenticated using (auth.uid() = user_id);

create policy user_favorites_insert_own on public.user_favorites
  for insert to authenticated with check (auth.uid() = user_id);

create policy user_favorites_delete_own on public.user_favorites
  for delete to authenticated using (auth.uid() = user_id);

create policy user_favorites_update_own on public.user_favorites
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- One stack-rank ballot per authenticated dashboard user for surplus spending.
-- Run this entire file in the Supabase SQL editor (not individual lines).

create table public.surplus_vote_ballots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  ranked_item_ids text[] not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.surplus_vote_ballots is
  'Per-user stack-rank of surplus spend ideas. ranked_item_ids[1] is first place.';

comment on column public.surplus_vote_ballots.ranked_item_ids is
  'Ordered option ids; index 0 (Postgres [1]) is the top rank.';

create index surplus_vote_ballots_updated_at_idx
  on public.surplus_vote_ballots (updated_at desc);

alter table public.surplus_vote_ballots enable row level security;

create policy surplus_vote_ballots_select_authenticated
  on public.surplus_vote_ballots
  for select
  to authenticated
  using (true);

create policy surplus_vote_ballots_insert_own
  on public.surplus_vote_ballots
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy surplus_vote_ballots_update_own
  on public.surplus_vote_ballots
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

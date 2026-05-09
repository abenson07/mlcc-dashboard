-- Dashboard: omit rows where hidden = true (see hooks/useBusinesses default filter).

alter table public.businesses
  add column if not exists hidden boolean not null default false;

comment on column public.businesses.hidden is
  'When true, row is hidden from default business lists in the app.';

-- Remove prior experiment if it exists (safe no-op otherwise).
drop table if exists public.business_place_blocks;

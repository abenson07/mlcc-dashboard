-- Google Places seed + outreach columns for public.businesses
-- Run via Supabase SQL editor or `supabase db push` if you use the Supabase CLI.

alter table public.businesses
  add column if not exists website text;

alter table public.businesses
  add column if not exists google_place_id text;

alter table public.businesses
  add column if not exists contacted boolean not null default false;

comment on column public.businesses.google_place_id is 'Stable Place id from Google Places API (New); used to dedupe imports.';
comment on column public.businesses.contacted is 'Whether outreach has been attempted for this lead.';

create unique index if not exists businesses_google_place_id_unique
  on public.businesses (google_place_id)
  where google_place_id is not null;

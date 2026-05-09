-- --- Hide businesses from default dashboard lists ---------------------------------
-- The app reads `hidden`; rows stay in the DB (Places import still skips duplicate google_place_id).

-- Run once if you do not use migration files:
alter table public.businesses
  add column if not exists hidden boolean not null default false;

-- Uncomment exactly one line at a time; replace the UUID from Table Editor → businesses.

-- update public.businesses set hidden = true where id = '...'::uuid;

-- update public.businesses set hidden = false where id = '...'::uuid;

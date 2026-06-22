-- Routes: building contacts; remove edition-scoped skip + secondary deliverer.

alter table public.routes
  add column if not exists building_contact_name text,
  add column if not exists building_contact_email text,
  add column if not exists building_contact_phone text,
  add column if not exists building_contact_is_deliverer boolean not null default false;

comment on column public.routes.building_contact_is_deliverer is
  'When true, building contact receives deliverer comms instead of primary_deliverer.';

-- Promote secondary to primary where needed before dropping secondary.
update public.routes
set primary_deliverer_id = secondary_deliverer_id
where primary_deliverer_id is null
  and secondary_deliverer_id is not null;

alter table public.routes
  drop constraint if exists routes_secondary_deliverer_id_fkey;

alter table public.routes
  drop column if exists secondary_deliverer_id;

-- Skip is per leaflet edition on deliveries, not on master routes.
alter table public.routes
  drop column if exists is_skipped;

comment on table public.routes is
  'Permanent delivery routes. Edition state (skip, confirm, counts) lives on deliveries.';

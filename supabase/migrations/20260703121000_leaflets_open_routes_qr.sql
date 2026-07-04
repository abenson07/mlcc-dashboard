-- Leaflet open-routes QR code FK + backfill for existing Test edition.

alter table public.leaflets
  add column if not exists open_routes_qr_code_id uuid references public.qr_codes (id) on delete set null;

comment on column public.leaflets.open_routes_qr_code_id is
  'QR linking volunteers to claim open delivery routes for this edition.';

-- Fix Test edition membership QR URL (was /join without UTM params).
update public.qr_codes
set
  url = 'https://mapleleafcommunity.org/membership?utm_source=leaflet&utm_campaign=test',
  updated_at = now()
where id = (
  select membership_qr_code_id
  from public.leaflets
  where title = 'Test'
  limit 1
);

-- Create open-routes QR for Test edition when missing.
do $$
declare
  test_leaflet_id uuid;
  open_routes_qr_id uuid;
begin
  select id into test_leaflet_id
  from public.leaflets
  where title = 'Test'
  limit 1;

  if test_leaflet_id is null then
    return;
  end if;

  if exists (
    select 1
    from public.leaflets
    where id = test_leaflet_id
      and open_routes_qr_code_id is not null
  ) then
    return;
  end if;

  insert into public.qr_codes (name, url)
  values (
    'Test open routes QR',
    'https://mapleleafcommunity.org/leaflet/open-routes'
  )
  returning id into open_routes_qr_id;

  update public.leaflets
  set open_routes_qr_code_id = open_routes_qr_id, updated_at = now()
  where id = test_leaflet_id;
end $$;

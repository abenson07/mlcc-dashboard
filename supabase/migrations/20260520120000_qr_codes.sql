-- QR codes for Communications (admin-managed destination URLs).

create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  name text,
  url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.qr_codes is 'Admin-managed QR code destinations (PNG generated client-side).';
comment on column public.qr_codes.name is 'Optional label for the dashboard table.';

create index qr_codes_created_at_idx on public.qr_codes (created_at desc);

alter table public.qr_codes enable row level security;

create policy "Authenticated select qr_codes"
  on public.qr_codes
  for select
  to authenticated
  using (true);

create policy "Authenticated insert qr_codes"
  on public.qr_codes
  for insert
  to authenticated
  with check (true);

create policy "Authenticated update qr_codes"
  on public.qr_codes
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated delete qr_codes"
  on public.qr_codes
  for delete
  to authenticated
  using (true);

-- New leaflet-associated dates for the redesigned schedule flow.
alter table public.leaflets
  add column if not exists sponsorship_due_date date,
  add column if not exists delivery_date date;

comment on column public.leaflets.sponsorship_due_date is
  'Deadline for sponsors to commit for this edition; editable, prefilled relative to distribution_date.';
comment on column public.leaflets.delivery_date is
  'Date deliveries are expected to be completed by; editable, prefilled relative to distribution_date.';

-- Live already has these columns; IF NOT EXISTS keeps local/dev in step.

alter table public.business_memberships
  add column if not exists tier text,
  add column if not exists annual_dues numeric;

comment on column public.business_memberships.tier is
  'Always "Business membership" — one product, not Gold/Silver/Bronze (those are sponsorship levels).';
comment on column public.business_memberships.annual_dues is
  'Annual membership dues in dollars. Public product is $200/year.';

alter table public.businesses
  add column if not exists category text;

comment on column public.businesses.category is
  'Business category (e.g. restaurant, retail, service) — shown on the Businesses list.';

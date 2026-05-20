-- Commerce landings: t-shirt preorders and fundraising donations (Stripe Checkout webhook).

create table public.tshirt_preorders (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  customer_name text not null,
  customer_email text not null,
  shipping_address jsonb,
  line_items jsonb not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.tshirt_preorders is 'Summer social t-shirt preorders from public landing (Stripe Checkout).';
comment on column public.tshirt_preorders.line_items is 'Array of { category, size, quantity }.';

create index tshirt_preorders_created_at_idx on public.tshirt_preorders (created_at desc);
create index tshirt_preorders_status_idx on public.tshirt_preorders (status);

create table public.fundraising_donations (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  donation_tier text not null
    check (donation_tier in ('individual', 'household', 'champ', 'custom')),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  customer_email text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.fundraising_donations is 'Summer recovery fundraiser donations from public landing.';

create index fundraising_donations_created_at_idx on public.fundraising_donations (created_at desc);
create index fundraising_donations_status_idx on public.fundraising_donations (status);

alter table public.tshirt_preorders enable row level security;
alter table public.fundraising_donations enable row level security;

create policy "Authenticated read tshirt_preorders"
  on public.tshirt_preorders
  for select
  to authenticated
  using (true);

create policy "Authenticated read fundraising_donations"
  on public.fundraising_donations
  for select
  to authenticated
  using (true);

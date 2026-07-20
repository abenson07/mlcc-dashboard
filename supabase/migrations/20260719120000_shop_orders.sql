-- Merch shop orders (Stripe Checkout webhook).

create table public.shop_orders (
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

comment on table public.shop_orders is 'Merch shop orders from the public shop (Stripe Checkout).';
comment on column public.shop_orders.line_items is 'Array of { product_slug, product_name, variant, quantity, unit_amount_cents, fulfillment }.';

create index shop_orders_created_at_idx on public.shop_orders (created_at desc);
create index shop_orders_status_idx on public.shop_orders (status);

alter table public.shop_orders enable row level security;

create policy "Authenticated read shop_orders"
  on public.shop_orders
  for select
  to authenticated
  using (true);

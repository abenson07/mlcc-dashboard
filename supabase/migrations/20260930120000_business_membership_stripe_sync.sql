-- Link business memberships to Stripe so business payments sync automatically
-- (webhook + nightly reconcile). Mirrors the stripe columns on public.memberships.
-- Additive and idempotent: safe to run more than once, changes no existing rows.

alter table public.business_memberships
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists customer_email text,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists current_period_end date,
  add column if not exists canceled_at timestamptz;

create unique index if not exists business_memberships_stripe_subscription_id_key
  on public.business_memberships (stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists business_memberships_stripe_customer_id_idx
  on public.business_memberships (stripe_customer_id)
  where stripe_customer_id is not null;

comment on column public.business_memberships.stripe_subscription_id is
  'Stripe subscription backing this membership. Set by the Stripe sync; null for manually-managed members.';

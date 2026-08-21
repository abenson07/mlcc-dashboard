-- Membership cancellation + refund tracking.
--
-- Until now nothing in the app could cancel a Stripe subscription: admins could
-- only edit `memberships.status`, which is a label and never touched Stripe.
-- These columns let the app record what Stripe actually did, so a membership can
-- be cancelled at period end (still Active, just not renewing) or immediately
-- with a full refund.

alter table public.memberships
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists current_period_end date,
  add column if not exists canceled_at timestamptz;

comment on column public.memberships.cancel_at_period_end is 'Mirrors Stripe subscription.cancel_at_period_end — membership stays Active until current_period_end, then stops.';
comment on column public.memberships.current_period_end is 'Mirrors Stripe subscription.current_period_end — the date the paid period runs out.';
comment on column public.memberships.canceled_at is 'When an admin (or Stripe) cancelled the subscription. Set for both at-period-end and immediate cancellation.';

-- `payments` has no status column at all, so there was nowhere to record a refund.
alter table public.payments
  add column if not exists refunded_at timestamptz,
  add column if not exists refund_amount numeric,
  add column if not exists stripe_refund_id text;

comment on column public.payments.refunded_at is 'When this payment was refunded, if it was.';
comment on column public.payments.refund_amount is 'Amount refunded, in dollars. Equals `amount` for a full refund.';
comment on column public.payments.stripe_refund_id is 'Stripe refund id (re_...), for reconciliation.';

-- Webhook handlers look payments up by refund target; keep that lookup cheap.
create index if not exists idx_payments_stripe_transaction_id
  on public.payments (stripe_transaction_id);

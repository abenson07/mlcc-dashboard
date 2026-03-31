-- Membership thank-you email tracking table
-- Run in Supabase SQL editor before enabling the scheduled endpoint.

create table if not exists public.membership_thank_you_email_logs (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  renewal_date date not null,
  email text not null,
  receipt_period_start date not null,
  receipt_period_end date not null,
  receipt_total numeric(10, 2) not null default 0,
  receipt_line_items jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  provider_message_id text,
  sent_at timestamptz,
  error text,
  attempt_count integer not null default 0,
  run_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists membership_thank_you_email_logs_membership_renewal_key
  on public.membership_thank_you_email_logs (membership_id, renewal_date);

create index if not exists membership_thank_you_email_logs_status_idx
  on public.membership_thank_you_email_logs (status);

-- Example scheduled invocation payload:
-- POST /api/memberships/thank-you-reminders
-- Headers:
--   x-cron-secret: <MEMBERSHIP_THANK_YOU_CRON_SECRET>
-- JSON body:
--   { "dryRun": false, "limit": 50 }

-- Who edited the public website from admin → Edit website.
-- Written and read with the service role only (no RLS policies on purpose).
create table if not exists public.website_edit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  user_email text,
  doc_id text not null,
  doc_type text,
  action text not null check (action in ('save', 'publish', 'discard', 'upload')),
  fields text[]
);

create index if not exists website_edit_log_doc_idx on public.website_edit_log (doc_id, created_at desc);

alter table public.website_edit_log enable row level security;

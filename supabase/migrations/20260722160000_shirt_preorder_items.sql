-- Per-shirt preorder line items linked to people.
-- One checkout with qty 3 of Adult XL → three rows.
-- Status lifecycle: pending → paid → picked_up (plus refunded/failed).

create table public.shirt_preorder_items (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete restrict,
  product_slug text not null,
  product_name text not null,
  variant text not null,
  unit_amount_cents integer not null check (unit_amount_cents >= 0),
  stripe_checkout_session_id text not null,
  stripe_payment_intent_id text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'picked_up', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.shirt_preorder_items is
  'Individual shirt units from shop preorders. One row per shirt; person_id links to people.';

comment on column public.shirt_preorder_items.variant is
  'Size label, e.g. Adult XL or Kids M.';

comment on column public.shirt_preorder_items.status is
  'pending = checkout started or unpaid; paid = Stripe paid, awaiting pickup; picked_up = handed off.';

create index shirt_preorder_items_person_id_idx
  on public.shirt_preorder_items (person_id);

create index shirt_preorder_items_session_idx
  on public.shirt_preorder_items (stripe_checkout_session_id);

create index shirt_preorder_items_status_idx
  on public.shirt_preorder_items (status);

create index shirt_preorder_items_created_at_idx
  on public.shirt_preorder_items (created_at desc);

alter table public.shirt_preorder_items enable row level security;

create policy "Authenticated read shirt_preorder_items"
  on public.shirt_preorder_items
  for select
  to authenticated
  using (true);

create policy "Authenticated update shirt_preorder_items"
  on public.shirt_preorder_items
  for update
  to authenticated
  using (true)
  with check (true);

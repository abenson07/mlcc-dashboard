# Leaflet Management Dashboard — Implementation Plan

> **Status:** Ready to implement (designs in `integrated-dashboard.pen`)  
> **Scope:** Dashboard + Supabase. Events are **moving off Webflow now** — `event_templates` + expanded `events` are in scope alongside leaflet work.

This plan captures decisions from product Q&A and maps them to schema, APIs, routes, and build phases. Screen designs are specified in **`integrated-dashboard.pen`** (Pencil node IDs below) and will be implemented at **`/admin/leaflet/*`** behind the existing admin login.

---

## 1. Product summary

A **leaflet** is a time-bound edition (e.g. “Summer 2026”) with a **distribution date** and **status**. Routes are permanent geographic areas; each leaflet run gets **one `deliveries` row per route** copied from the master `routes` table.

| Layer | Role |
|-------|------|
| `routes` | Master source of truth: route name, type, default leaflet count, primary deliverer, building contact fields |
| `deliveries` | Per-edition snapshot + live state during an active leaflet: deliverer (`person_id`), count, skipped, confirmations, completion counts; frozen as history when leaflet closes |
| `leaflets` | Edition metadata, lifecycle (`planned` → `active` → `closed`), finances, QR link |

**Key rules**

- Only **one active leaflet** at a time.
- Creating a leaflet while another is active → new row stays `planned` until the current one is **manually closed**.
- On close → activate the next `planned` leaflet (nearest `distribution_date`) and send the **initial confirmation** email for that edition.
- **Skip** is delivery-scoped only; closing a leaflet freezes delivery rows; the next leaflet copies fresh from `routes`.
- **Reject / remove routes** updates **both** `routes` and the active delivery row(s).
- **Count updates:** while leaflet is `active`, changing count updates `routes.leaflet_count` **and** the active delivery row. After close, count changes update `routes` only.
- **Change since last time:** compare current delivery `leaflet_count` vs previous closed leaflet’s delivery for the same `route_id`.
- Deliverer comms via **Resend**; **global** `comm_settings` (timing + Resend template id) for leaflets, events, membership drips, volunteer asks, etc.
- Confirmations & delivery completion via **public token URLs** (not manual dashboard toggles).
- **No separate substitutions table** — derived view from `deliveries` where `is_skipped = true`; **original deliverer** from `routes.primary_deliverer_id`; **covering deliverer** from `deliveries.person_id` when reassigned.
- **Stories:** postponed v1.
- **Close-out:** soft report + celebration image modal per designs; banner surfaces **14 days after `distribution_date`**.
- **Navigation:** leaflet UI lives under `/admin/leaflet` with its own integrated-dashboard shell (topbar + leaflet sidebar). Global admin sidebar may be hidden on these routes. Upper-right topbar actions and non-leaflet mode tabs are **non-functional in v1** (see §4.5).

---

## 2. Data model

### 2.1 New enums

```sql
create type public.leaflet_status as enum ('planned', 'active', 'closed');

create type public.delivery_response as enum (
  'pending',
  'confirmed',
  'needs_cover',
  'rejected'
);

-- What domain a template / task / send log row belongs to
create type public.workflow_context as enum (
  'leaflet',
  'event',
  'membership'
);

-- How a comm step is triggered (email, drip, volunteer ask, etc.)
create type public.comm_trigger as enum (
  'anchor_offset',   -- send on anchor_date + offset_days (+ offset_time)
  'on_activate'      -- e.g. leaflet initial confirmation when edition becomes active
);
```

### 2.2 `leaflets`

```sql
create table public.leaflets (
  id uuid primary key default gen_random_uuid(),
  title text not null,                    -- e.g. "Summer 2026"
  distribution_date date not null,
  status public.leaflet_status not null default 'planned',
  activated_at timestamptz,
  closed_at timestamptz,
  print_cost_cents integer,               -- overview finances; editable in dashboard
  membership_qr_code_id uuid references public.qr_codes (id) on delete set null,
  -- edition-wide comm blasts (sent to all deliverers at once)
  comm_initial_confirmation_sent_at timestamptz,
  comm_distribution_day_pickup_sent_at timestamptz,
  comm_delivery_complete_prompt_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Constraints / indexes**

- Partial unique index: only one row with `status = 'active'`.
- Index on `(status, distribution_date)` for “next planned” lookup.

### 2.3 `deliveries` (extend existing table)

**Use the existing `deliveries` table** — this was always the intent: one row per route per leaflet edition. The table exists today with `person_id`, `route_id`, and `date_delivered` but has not been wired into the app yet. We extend it rather than creating a parallel table.

**Today (production):**

```sql
-- deliveries: id, person_id NOT NULL, route_id NOT NULL, date_delivered NOT NULL
```

**After migration:**

```sql
alter table public.deliveries
  add column if not exists leaflet_id uuid references public.leaflets (id) on delete cascade,
  add column if not exists leaflet_count integer,
  add column if not exists is_skipped boolean not null default false,
  add column if not exists response public.delivery_response not null default 'pending',
  add column if not exists responded_at timestamptz,
  add column if not exists leaflets_delivered integer,
  add column if not exists leaflets_leftover integer,
  add column if not exists building_contact_name text,
  add column if not exists building_contact_email text,
  add column if not exists building_contact_phone text,
  add column if not exists building_contact_is_deliverer boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  -- per-route comm (nullable); edition-wide blasts on leaflets
  add column if not exists comm_pre_distribution_reminder_sent_at timestamptz,
  add column if not exists comm_completion_followup_sent_at timestamptz;

-- person_id: nullable when route is open/skipped (was NOT NULL)
alter table public.deliveries alter column person_id drop not null;

-- date_delivered: set when deliverer confirms completion (was NOT NULL)
alter table public.deliveries alter column date_delivered drop not null;

-- one delivery row per route per leaflet edition
create unique index if not exists deliveries_leaflet_route_uidx
  on public.deliveries (leaflet_id, route_id)
  where leaflet_id is not null;

create index if not exists deliveries_leaflet_id_idx on public.deliveries (leaflet_id);
create index if not exists deliveries_person_id_idx on public.deliveries (person_id);
create index if not exists deliveries_leaflet_skipped_idx on public.deliveries (leaflet_id, is_skipped);
```

**Column semantics**

| Column | Meaning |
|--------|---------|
| `leaflet_id` | Which edition this row belongs to. Required for all new rows. |
| `route_id` | Permanent route (unchanged). |
| `person_id` | Assigned deliverer for this edition. Null when open or skipped. |
| `leaflet_count` | Leaflets printed / planned for this route in this edition. |
| `date_delivered` | Date deliverer confirmed completion (null until done). Distinct from `leaflets.distribution_date`. |
| `is_skipped` | Route skipped for this edition only. |
| `response` | Confirmation workflow state from public URL. |
| `leaflets_delivered` / `leaflets_leftover` | Self-reported counts on completion. |
| `building_contact_*` | Snapshot copied from `routes` at edition create time. |
| `comm_pre_distribution_reminder_sent_at` | Per delivery row; nullable. |
| `comm_completion_followup_sent_at` | Per delivery row; nullable. |

**Comm send tracking (no separate log table)**

- Resend keeps full send history if needed.
- **Edition-wide blasts** → stamp `leaflets.comm_*_sent_at` (`initial_confirmation`, `distribution_day_pickup`, `delivery_complete_prompt`).
- **Per-deliverer / per-route** → stamp `deliveries.comm_pre_distribution_reminder_sent_at` and `comm_completion_followup_sent_at` when sent.

**Legacy rows:** Any pre-migration `deliveries` rows without `leaflet_id` remain as historical import data. New leaflet workflow always sets `leaflet_id`. Optional follow-up: attach legacy rows to a synthetic closed `leaflets` row if you want them in reports.

### 2.4 `routes` alterations

Add building contact fields; **drop `secondary_deliverer_id` and `is_skipped`** on routes (skip lives on `deliveries` only). Single `primary_deliverer_id` on master routes.

```sql
alter table public.routes
  add column if not exists building_contact_name text,
  add column if not exists building_contact_email text,
  add column if not exists building_contact_phone text,
  add column if not exists building_contact_is_deliverer boolean not null default false;

-- After app migration: secondary_deliverer_id and is_skipped dropped (see 03_alter_routes.sql)
```

**Copy logic when creating delivery rows (on new leaflet)**

| Field | Source |
|-------|--------|
| `person_id` | `routes.primary_deliverer_id` |
| `leaflet_count` | `routes.leaflet_count` |
| `building_contact_*` | copied from route |
| `is_skipped` | `false` |
| `response` | `'pending'` |
| `date_delivered` | `null` |

### 2.5 `sponsorships` alterations

Current table has no `id` PK in production DDL — add one and link to leaflets.

```sql
alter table public.sponsorships
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists leaflet_id uuid references public.leaflets (id) on delete cascade,
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists quantity integer default 1;

-- Backfill ids, then:
-- alter table public.sponsorships add primary key (id);
```

- Leaflet sponsorships: `leaflet_id` set, `event_id` null.
- Event sponsorships unchanged: `event_id` set, `leaflet_id` null.
- **On new leaflet:** copy sponsorship rows from previous closed leaflet; reset **`status` to `pledged`** (open slot).

**Stripe invoices:** extend `invoiceDashboardMetadata` with `leaflet_id` and `sponsorship_id`; require `leaflet_id` when `category = leaflet`.

### 2.6 Stories — **postponed (v1)**

Defer stories DB/CMS. Revisit as a general `stories` table or CMS in v2.

### 2.7 `event_templates` + expand `events`

Events are moving off Webflow **now**. Repeatable events (e.g. “Summer Social”) spawn from templates.

```sql
create table public.event_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,                    -- e.g. "Summer Social"
  slug text not null unique,
  description text,
  default_field_data jsonb not null default '{}',  -- default CMS-like fields when spawning an event
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Expand existing minimal events table (parallel track to Webflow cutover)
alter table public.events
  add column if not exists event_template_id uuid references public.event_templates (id) on delete set null,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists slug text,
  add column if not exists field_data jsonb not null default '{}',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();
```

**Spawn rules**

| Action | Result |
|--------|--------|
| New **blank** event | `events` row; `event_template_id` null |
| New event **from template** | `events` row; copy `default_field_data` → `field_data`; `event_template_id` set |
| New **leaflet** | unrelated to `event_templates` |

Full Webflow field parity migrates incrementally into `field_data` / typed columns.

### 2.8 Tasks — `task_templates` + `tasks`

**Yes — two tables.** Templates are the master checklist; instances are copied (and ad-hoc tasks can be added later).

**Timing model** (same idea as `comm_settings`): each task has `offset_days` relative to an **anchor date**. Each domain resolves its own anchor:

| Context | Anchor date |
|---------|-------------|
| `leaflet` | `leaflets.distribution_date` |
| `event` | `events.starts_at` (or `events.date`) |

**Due date** (computed in app, not stored): `anchor_date + offset_days`  
**Sort order** (computed): order by due date ascending.

```sql
create table public.task_templates (
  id uuid primary key default gen_random_uuid(),
  context public.workflow_context not null,
  event_template_id uuid references public.event_templates (id) on delete cascade,
  title text not null,
  description text,
  offset_days integer not null,          -- e.g. -42 = 42 days before anchor
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint task_templates_context_check check (
    context = 'leaflet' and event_template_id is null
    or context = 'event'
    or context = 'membership' and event_template_id is null
  )
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  context public.workflow_context not null,
  context_id uuid not null,              -- leaflets.id, events.id, …
  template_id uuid references public.task_templates (id) on delete set null,
  title text not null,
  description text,
  offset_days integer not null,          -- copied from template; editable for ad-hoc tasks
  is_complete boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index task_templates_context_idx on public.task_templates (context, event_template_id);
create index tasks_context_idx on public.tasks (context, context_id);
```

**Spawn rules**

| Created | Copy from `task_templates` where… |
|---------|-----------------------------------|
| New leaflet | `context = 'leaflet'` and `event_template_id is null` |
| New blank event | `context = 'event'` and `event_template_id is null` |
| New event from “Summer Social” template | `context = 'event'` and `event_template_id = <summer social id>` |

**Ad-hoc tasks:** `INSERT` into `tasks` with `template_id null` and a chosen `offset_days`.

**v1 seed (leaflet only — clearly labeled placeholders):**

```sql
insert into public.task_templates (context, title, description, offset_days) values
  ('leaflet', 'Example task one', 'Placeholder — replace with real checklist item.', -42),
  ('leaflet', 'Example task two', 'Placeholder — replace with real checklist item.', -14),
  ('leaflet', 'Example task three', 'Placeholder — replace with real checklist item.', -7);
```

### 2.9 Comm settings — global `comm_settings` (no send log table)

**Not called “notifications”** — this covers email outreaches, membership drips, volunteer asks, and similar. Bodies live in Resend; dashboard stores name, template id, timing, and which domain it applies to.

```sql
create table public.comm_settings (
  id uuid primary key default gen_random_uuid(),
  context public.workflow_context not null,
  event_template_id uuid references public.event_templates (id) on delete cascade,
  name text not null,                    -- display label in settings UI
  step_key text not null,                -- stable id for code + deliveries column mapping
  resend_template_id text not null,
  trigger public.comm_trigger not null default 'anchor_offset',
  offset_days integer,                   -- when trigger = anchor_offset; negative = before anchor
  offset_time time not null default '09:00',
  requires_response boolean not null default false,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (context, event_template_id, step_key)
);
```

**Anchor dates** (same as tasks): leaflet → `distribution_date`; event → `starts_at`; membership → TBD.

**Example leaflet seeds** (`context = 'leaflet'`):

| name | step_key | trigger | offset_days | Send timestamp lives on |
|------|----------|---------|-------------|-------------------------|
| Initial confirmation | `initial_confirmation` | `on_activate` | — | `leaflets.comm_initial_confirmation_sent_at` |
| Pre-distribution reminder | `pre_distribution_reminder` | `anchor_offset` | -14 | `deliveries.comm_pre_distribution_reminder_sent_at` |
| Distribution day pickup | `distribution_day_pickup` | `anchor_offset` | 0 | `leaflets.comm_distribution_day_pickup_sent_at` |
| Delivery complete prompt | `delivery_complete_prompt` | `anchor_offset` | 0 | `leaflets.comm_delivery_complete_prompt_sent_at` |
| Completion followup | `completion_followup` | `anchor_offset` | +7 | `deliveries.comm_completion_followup_sent_at` |

Each runner (leaflet job, event job, membership drip, etc.) reads `comm_settings` for its `context`, sends via Resend, then stamps the appropriate column on the target row(s). **No `comm_send_log` table** — Resend is the audit trail if you need full history.

### 2.10 Public deliverer responses — **no token table**

**Decision:** No `leaflet_response_tokens` table. Public API routes update `deliveries` directly.

Email links use **signed query params** (HMAC/JWT), e.g.:

```
/api/public/leaflet/respond?leaflet_id=…&person_id=…&delivery_id=…&action=confirm&sig=…
```

Server verifies signature + expiry, then updates the matching `deliveries` row (`response`, `is_skipped`, `person_id`, `date_delivered`, etc.). No DB row per link — same security model as a token table, less storage.

### 2.11 QR code — **FK on `leaflets` only**

**Decision:** `leaflets.membership_qr_code_id → qr_codes.id`. Do **not** add `leaflet_id` on `qr_codes` (most QR codes are not leaflets).

On leaflet create: create `qr_codes` row → set `leaflets.membership_qr_code_id`.

### 2.12 Membership attribution — **deferred**

**Decision:** No `memberships.source_leaflet_id`. QR signup can append a URL param; store a free-text **source** at signup time (e.g. `people.source` — already exists) if you want to tag later via query. No structured FK for now.

---

## 3. SQL migrations

Runnable files in **`supabase/migrations/leaflet-dashboard/`** (run in order; see README there):

1. `01_new_tables.sql`
2. `02_alter_events.sql`
3. `03_alter_routes.sql`
4. `04_alter_deliveries.sql`
5. `05_alter_sponsorships.sql`

**No data backfill required for v1** unless you want a bootstrap “Edition 0” closed leaflet from current route state.

---

## 4. Application architecture

### 4.1 New hooks (Supabase)

| Hook | Responsibility |
|------|----------------|
| `useLeaflets` | CRUD, activate, close, list planned/active/closed |
| `useDeliveries` | Query by leaflet, open/skipped filters, update person/skip/response/completion (extend or replace stub) |
| `useLeafletSponsorships` | Per-leaflet sponsors, copy-from-previous |
| `useTasks` | Checklist; due date = anchor + `offset_days`; order by due date |
| `useCommSettings` | Global comm step settings (timing + Resend id), any context |

Extend `useRoutes` for building contact fields and count sync rules.

### 4.2 API routes

| Route | Purpose |
|-------|---------|
| `POST /api/leaflets` | Create + copy routes → deliveries + tasks + sponsorships + QR |
| `POST /api/leaflets/[id]/activate` | Set active (guard: no other active) |
| `POST /api/leaflets/[id]/close` | Close, activate next, soft report (no story export in v1) |
| `POST /api/leaflets/[id]/comm/[stepKey]/send` | Blast send → stamp `leaflets` or `deliveries` comm column per step |
| `POST /api/leaflets/[id]/comm/resend` | Individual remind → stamp that person’s delivery rows |
| `POST /api/leaflets/[id]/open-routes/email` | Email past deliverers for selected open routes |
| `GET/POST /api/public/leaflet/respond` | Signed-params deliverer self-service → updates `deliveries` |
| `GET /api/leaflets/[id]/close-out` | Close-out metrics JSON (review modal) |
| `GET /api/leaflets/[id]/close-out/image` | Celebration image PNG/SVG for download |

**Count sync helper** (server-side):

```ts
async function updateLeafletCount(routeId: string, count: number) {
  await updateRoute(routeId, { leaflet_count: count });
  const active = await getActiveLeaflet();
  if (active) {
    await updateDelivery(active.id, routeId, { leaflet_count: count });
  }
}
```

### 4.3 Resend integration

Reuse `src/lib/resend.ts` + Resend-hosted templates. App supplies merge data: `{{deliverer_name}}`, `{{leaflet_title}}`, `{{distribution_date}}`, `{{confirm_url}}`, `{{routes_list}}`. `confirm_url` is a signed link, not a DB token.

Individual resend available after `initial_confirmation` send; uses step-specific template variant.

### 4.4 Routes & layout

All leaflet screens live under **`/admin/leaflet`** inside the existing `(admin)` route group (Supabase auth redirect to `/login` when unauthenticated).

| Route | Screen | Design node |
|-------|--------|-------------|
| `/admin/leaflet` | Overview (or No Active Leaflet empty state) | `M9769e` / `VDYgD` |
| `/admin/leaflet/deliverers` | Deliverers | `KslI4` |
| `/admin/leaflet/routes` | Routes (master list + detail panel) | `j6q2x` |
| `/admin/leaflet/open-routes` | Open Routes | `a1qNG3` |
| `/admin/leaflet/substitutions` | Substitutions | `vMlvE` |
| `/admin/leaflet/sponsorships` | Sponsorships | `xSpNP` |

**Layout:** `src/app/(admin)/leaflet/layout.tsx` — integrated-dashboard shell from designs:

- **Topbar** (`Topbar` frame): mode switcher left, utility controls right.
- **Leaflet selector** (`wCygQ`) at top of sidebar column.
- **Leaflet sidebar** (`Leaflet Sidebar`, 220px): section nav (Overview, Delivery group, Support group).
- **Canvas** (rounded card, `#FBFBFB` or white per screen): page content.

Use a `[leafletId]` segment or query param (`?leaflet=`) for the selected edition; default to the single `active` leaflet, else nearest `planned`, else empty state.

### 4.5 Shell behavior (v1 scope)

**Functional in v1**

- Topbar **Leaflets** mode tab (highlighted when on `/admin/leaflet/*`).
- Leaflet sidebar links (Overview, Deliverers, Routes, Open Routes, Substitutions, Sponsorships).
- Leaflet selector dropdown (see §4.6).
- Close-out banner + modals when eligible.

**Non-functional in v1 (render only)**

- Topbar mode tabs: **Site**, **People**, **Events**, **Stories** — visible per design but no navigation; migrate other domains later.
- Topbar right controls: **Revenue Dashboard**, **Promotion Menu**, **New Event** — styled placeholders only.
- Sidebar **To-do / Schedule** — link visible; route can 404 or show “coming soon” until tasks UI ships.

### 4.6 Leaflet selector dropdown (`wCygQ`)

Closed state: current leaflet title + `chevrons-up-down` icon.

Open menu (combobox pattern):

1. **Current leaflet** (selected, at top).
2. **Other active leaflets** — any additional `status = 'active'` rows (normally zero per business rule; still list if data edge case).
3. **Divider**
4. **All other leaflets** — every remaining edition (`planned` + `closed`), **searchable** via filter input at top of this section.

Selecting an item updates URL context and reloads page data. Closed (and optionally planned) leaflets open in **read-only** mode where edits are disabled.

### 4.7 Screen specifications (from `integrated-dashboard.pen`)

Design file: **`integrated-dashboard.pen`** at repo root.

#### Overview — `M9769e`

**Hero:** `leaflets.title`, countdown to `distribution_date` (“N days until distribution”), distribution date chip.

**Main column**

| Widget | Data / behavior |
|--------|-----------------|
| **To-Do Card** | `tasks` for leaflet context; group by due-date buckets; “N open tasks”; checkbox complete → `tasks.is_complete`; “See all tasks” → To-do / Schedule (when built) |
| **Open Routes Card** | Deliveries where `person_id is null OR is_skipped`; deliverer name + route count preview; “View All Routes” → `/admin/leaflet/open-routes` |
| **Budget Card** | `sponsorships` aggregated (goal / raised / pledged); sponsorship level breakdown; “Sponsors” → `/admin/leaflet/sponsorships` |
| **Stories / Marketing Card** | **Deferred** — show empty state or hide until stories v2; design shows placeholder marketing schedule |

**Right details panel (300px)**

| Widget | Data |
|--------|------|
| **Distribution Info** | `distribution_date`, sum of `deliveries.leaflet_count` |
| **Distribution progress** | Timeline: Deliverers Notified → Deliverers Confirmed → Delivery Complete (counts from `deliveries.response` + `date_delivered`) |
| **Delivery stats** | Open routes, phone drops, skips (`is_skipped`), ejections (`response = 'rejected'`) |

**Close-out banner** (`NEDuW` / `pOmre`): see §4.8 — renders above canvas when eligible.

#### No Active Leaflet — `VDYgD`

Shown on `/admin/leaflet` when no `active` or `planned` leaflet exists.

- Empty card: “No leaflet currently planned” + **Schedule new leaflet** CTA → create flow.
- **Past leaflets** list: closed editions, read-only; click opens that leaflet in read-only overview.

#### Deliverers — `KslI4`

- Page title + description; search across deliverer names.
- **Deliverer cards** grouped by `person_id` from `deliveries` for selected leaflet; each card lists assigned routes (route name, households, status).
- Per-card **resend** affordance (individual comm).
- **Right panel — Communication** (`w2qrh`): stages from `comm_settings` (leaflet context):
  - Completed stage: sent date, response breakdown (Yes / Unresponsive / No from `deliveries.response`).
  - Active stage: description + **Send confirmation request** button.
  - Upcoming stages: reminder, final reminder (disabled until prior step sent).

**Send confirmation modal** — `O9Y1lf`:

- Title: “Send confirmation request?”
- Body: count of deliverers not yet confirmed.
- **Type `confirm` to proceed** input.
- Cancel / **Send** → `POST /api/leaflets/[id]/comm/initial_confirmation/send` (or step key from `comm_settings`).

#### Routes — `j6q2x`

Master-detail layout: scrollable table + 300px detail panel.

**Table columns:** Route name, Deliverer, Type, Count, Change (vs previous closed edition), Status.

**Filters:** search, route type, delivery status.

**Export** button (CSV of visible rows).

**Detail panel** (selected row):

- **Who is delivering** — person name, email, address (from `people` / delivery).
- **Route details** — name, type, count, change since last delivery.
- **Delivery history** — prior closed `deliveries` for same `route_id`.

Row selection highlights table row (`#EBEBEC`).

#### Open Routes — `a1qNG3`

Same table pattern as Routes, filtered to `person_id is null OR is_skipped`.

**Detail panel** (320px):

- Route details card.
- **Deliverer** card: empty state + **Assign** button; **Past deliverers** list from historical `deliveries` for this `route_id` with per-person **email** action → `POST /api/leaflets/[id]/open-routes/email`.
- **Building contact** card — `building_contact_*` from delivery snapshot.

#### Substitutions — `vMlvE`

**No new table.** Query:

```sql
-- conceptual: deliveries d JOIN routes r ON d.route_id = r.id
WHERE d.leaflet_id = :leaflet
  AND d.is_skipped = true
```

| Column | Source |
|--------|--------|
| Route | `routes.name` via `deliveries.route_id` |
| Covering | `deliveries.person_id` → `people` (null if not yet covered) |
| For | `routes.primary_deliverer_id` → `people` (original deliverer) |
| Date | `deliveries.responded_at` or skip timestamp |
| Status | derived from `deliveries.response` / whether cover assigned |

**Add substitution** — manual assign cover deliverer to a skipped delivery (updates `person_id`, may clear skip when covered).

Detail panel: **Covering** person fields + **Originally for** route/person summary.

#### Sponsorships — `xSpNP`

- **Budget & sponsorships** summary card: goal, raised, pledged, progress bar.
- **Sponsors table** with tabs: All / Paid / Pledged / Previous; columns per design.
- **Invoices table** with tabs: All / Paid / Sent / Overdue / Draft; Stripe invoice metadata (`leaflet_id`, `sponsorship_id`).
- Right panel: sponsorship tier breakdown (Platinum / Gold / Silver / Bronze).

Reuse patterns from existing `SponsorshipHubContent` where possible; scope data to `leaflet_id`.

### 4.8 Close-out flow

**Banner eligibility** (`NEDuW`): show when selected leaflet is `active` **and** `today >= distribution_date + 14 days`. Copy: “{title} delivery complete!” + “Review results and close out this leaflet when ready.” **Review results** opens close modal.

**Review modal** — `QC3D7` (`OMqKp`):

| Metric | Source |
|--------|--------|
| Deliverers confirmed | `response = 'confirmed'` / total deliveries |
| Leaflets delivered | sum `leaflets_delivered` |
| Change vs last run | aggregate count delta vs previous closed leaflet |
| Reroutes captured | count `is_skipped` or substitution rows |

- **Type `confirm` to close** input.
- Cancel / **Close leaflet** → `POST /api/leaflets/[id]/close`.

**Confirmed modal** — `Qaphk` (`BTPkA`):

- Success copy + **celebration image preview** (generated stats graphic: title, deliverer count, leaflets, reroutes).
- **Download celebration image** + **Done**.
- On close: activate next `planned` leaflet per lifecycle (§5.4).

### 4.9 UI surfaces (summary)

| Surface | Route | Design | Primary data |
|---------|-------|--------|--------------|
| Overview | `/admin/leaflet` | `M9769e` | leaflet, tasks, deliveries stats, sponsorships rollup |
| No active | `/admin/leaflet` (empty) | `VDYgD` | leaflets list |
| Deliverers | `/admin/leaflet/deliverers` | `KslI4`, `O9Y1lf` | deliveries by person, comm_settings |
| Routes | `/admin/leaflet/routes` | `j6q2x` | routes + deliveries + history |
| Open routes | `/admin/leaflet/open-routes` | `a1qNG3` | open/skipped deliveries |
| Substitutions | `/admin/leaflet/substitutions` | `vMlvE` | skipped deliveries + routes.primary_deliverer |
| Sponsorships | `/admin/leaflet/sponsorships` | `xSpNP` | sponsorships + Stripe invoices |
| Leaflet switcher | shell | `wCygQ` | leaflets |
| Close-out | banner + modals | `NEDuW`, `QC3D7`, `Qaphk` | close-out API + image export |
| Settings | deferred | — | `comm_settings`, `task_templates` |

Existing `/routes/*` hub remains until leaflet routes are proven; no migration required in v1.

---

## 5. Lifecycle flows

### 5.1 Create leaflet

```
User schedules "Fall 2026" + distribution_date
  → INSERT leaflets (status=planned)
  → COPY all routes → deliveries (one row per route, leaflet_id set)
  → COPY sponsorships from previous closed leaflet (if any)
  → INSERT tasks from task_templates (context = leaflet); each task gets offset_days copied
  → CREATE qr_codes row → link membership_qr_code_id
  → IF no active leaflet: optionally prompt to activate now
```

### 5.2 Activate

```
Guard: no other status=active
  → UPDATE leaflets SET status=active, activated_at=now()
  → SEND comm_settings step initial_confirmation (trigger = on_activate)
  → STAMP leaflets.comm_initial_confirmation_sent_at
```

### 5.3 Deliverer responds (public URL)

```
confirm → response=confirmed, responded_at=now()
needs_cover → is_skipped=true, person_id=null, response=needs_cover
reject (selected routes) → remove deliverer from route + delivery row; response=rejected
completion → date_delivered=now(), leaflets_delivered, leaflets_leftover
```

### 5.4 Close leaflet

```
Guard: banner eligible (distribution_date + 14 days) OR manual close from admin
  → User opens Review modal (QC3D7), types confirm
  → POST /api/leaflets/[id]/close
  → Generate close-out metrics + celebration image
  → Show Confirmed modal (Qaphk)
  → UPDATE leaflets SET status=closed, closed_at=now()
  → FIND next planned (min distribution_date where status=planned)
  → ACTIVATE next → send initial_confirmation
```

---

## 6. Build phases

| Phase | Deliverable | Depends on |
|-------|-------------|------------|
| **A** | Migration + `schemas/*.ts` + RLS | — |
| **B** | Leaflet CRUD, selector dropdown, activate/close APIs | A |
| **C** | `/admin/leaflet` layout shell (topbar, sidebar, selector) from designs | B |
| **D** | Overview + No Active empty state (`M9769e`, `VDYgD`) | B, C |
| **E** | Routes + Open Routes master-detail (`j6q2x`, `a1qNG3`) | B, C |
| **F** | Deliverers + send-confirmation modal (`KslI4`, `O9Y1lf`) | B, C, D |
| **G** | Substitutions view (`vMlvE`) | B, C, E |
| **H** | Sponsorships (`xSpNP`) + Stripe metadata | B, C |
| **I** | Resend comm workflow + `comm_settings` | B, F |
| **J** | Public respond URLs | B |
| **K** | Close-out banner + review/confirmed modals (`NEDuW`, `QC3D7`, `Qaphk`) + celebration image | B, D, F |
| **L** | Open-route email blast | E, J |
| **M** | Membership QR download on leaflet | B |

**Suggested order:** A → B → C → D → E → F → G → H → I → J → K → L → M.

UI phases follow design file node IDs; implement shared shell once in **C**, then page phases in parallel where possible.

### 6.1 Suggested component tree

```
src/app/(admin)/leaflet/
  layout.tsx                    # LeafletDashboardShell
  page.tsx                      # Overview | NoActiveLeaflet
  deliverers/page.tsx
  routes/page.tsx
  open-routes/page.tsx
  substitutions/page.tsx
  sponsorships/page.tsx

src/components/leaflet/
  LeafletDashboardShell.tsx     # topbar + sidebar + outlet
  LeafletTopbar.tsx             # mode tabs (mostly inert) + right controls (inert)
  LeafletSidebar.tsx
  LeafletSelector.tsx           # wCygQ dropdown
  CloseOutBanner.tsx
  CloseOutReviewModal.tsx
  CloseOutConfirmedModal.tsx
  SendConfirmationModal.tsx
  overview/ ...
  deliverers/ ...
  routes/ ...
  open-routes/ ...
  substitutions/ ...
  sponsorships/ ...
```

---

## 7. Open items (need your input later)

| Item | Decision |
|------|----------|
| **Print cost** | `leaflets.print_cost_cents`; edited in dashboard |
| **Task template titles** | v1 seeds: Example task one / two / three |
| **Story HTML** | Deferred (v2) |
| **Sponsorship copy** | Reset `status` to `pledged` on new leaflet |
| **Secondary deliverer** | Dropped from `routes` |
| **Automated comm scheduling** | Not a schema concern — v1 manual “Send now”; optional cron later |
| **Close-out metrics** | Confirmed count, delivered total, count delta vs last edition, skips/reroutes — shown in review modal |
| **Close-out banner timing** | Appears **14 days after `distribution_date`** while leaflet still `active` |
| **Celebration image** | Generated on close; download from confirmed modal (`Qaphk`) |
| **Topbar / mode tabs** | Non-functional except Leaflets in v1 |
| **Stories card on overview** | Hidden or empty until stories v2 |

---

## 8. TypeScript schema files to add/update

- `schemas/leaflets.ts`
- Update `schemas/deliveries.ts` (major expansion)
- `schemas/event_templates.ts`
- Update `schemas/events.ts`
- `schemas/tasks.ts`
- `schemas/comm_settings.ts`
- Update `schemas/routes.ts`, `schemas/sponsorships.ts`

---

## 9. What we are explicitly not doing in v1

- Migrating Site / People / Events / Stories into integrated-dashboard topbar (leaflet only)
- Wiring topbar right controls (Revenue Dashboard, Promotion Menu, New Event)
- To-do / Schedule page (sidebar link may be visible; full page deferred)
- Live website publish for stories (stories postponed)
- Sanity / general stories CMS (v2)
- `notification_*` / `comm_send_log` tables (timestamps on `leaflets` + `deliveries`)
- `qr_codes.leaflet_id` / `memberships.source_leaflet_id`
- Webflow coupling
- Auto-close leaflets on distribution date (close is manual after banner appears)
- Separate substitutions table
- New `leaflet_route_distributions` table (use `deliveries` instead)

---

## 10. Next step

**Designs:** `integrated-dashboard.pen` — screen node reference:

| Screen | Node ID |
|--------|---------|
| Overview | `M9769e` |
| Deliverers | `KslI4` |
| Send confirmation modal | `O9Y1lf` |
| Routes | `j6q2x` |
| No Active Leaflet | `VDYgD` |
| Open Routes | `a1qNG3` |
| Substitutions | `vMlvE` |
| Sponsorships | `xSpNP` |
| Close-out banner | `NEDuW` |
| Leaflet selector | `wCygQ` |
| Close review modal | `QC3D7` |
| Close confirmed modal | `Qaphk` |

**Implementation:** start with migration **A**, then **B** + **C** (shell at `/admin/leaflet`), then page phases per §6.

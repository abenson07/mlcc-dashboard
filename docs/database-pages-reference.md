# Database & data sources by admin page

This document summarizes **what data each area of the dashboard uses**, with **tables/fields inferred from repo TypeScript schemas** (`schemas/*.ts`), **Supabase hooks** (`hooks/usePeople`, `hooks/useRoutes`, `hooks/useBusinesses`), and **API integrations** (Stripe, Webflow). If your actual Postgres DDL differs (extra columns, FK names, enums), treat this as **the app’s canonical view** and reconcile with Supabase Dashboard → Table Editor.

---

## Entity overview (PostgreSQL via Supabase)


| Table                  | Purpose                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `people`               | Neighbors, deliverers (`routes` FKs), optional `event_volunteers` FK               |
| `memberships`          | Neighbor memberships (tier, Stripe ids, status) linked from `people.membership_id` |
| `routes`               | Delivery routes + primary/secondary deliverer FKs → `people`                       |
| `deliveries`           | Historic deliveries: `person_id` + `route_id` (**not surfaced in UI hooks today**) |
| `businesses`           | Business contacts; optional `business_memberships` FK                              |
| `business_memberships` | Paid membership-ish record for businesses                                          |
| `sponsorships`         | Pledge/sponsor rows per business and optionally linked `events`                    |
| `events`               | Minimal event rows (**calendar UI uses Webflow**, not this table)                  |
| `event_volunteers`     | Links `people` ↔ `events` (**no dedicated admin page in repo**)                    |
| `payments`             | Payments tied to `people` / `memberships` (**not wired to the listed pages**)      |


---

## Joins / shapes the app already builds

### Neighbors pipeline

- `**people`** → `**memberships**` via `people.membership_id` = `memberships.id` (`PersonWithMembership` in `hooks/usePeople.ts`).

### Routes pipeline

- `**routes`** → **`people`** (two optional FKs):
  - `routes.primary_deliverer_id` → `people.id` → hydrated as `primary_deliverer`
  - `routes.secondary_deliverer_id` → `people.id` → hydrated as `secondary_deliverer`
  (`RouteWithDeliverer` in `hooks/useRoutes.ts`.)

### Businesses pipeline

- `**businesses`** → `**business_memberships**` via `businesses.membership_id` = `business_memberships.id`
- `**businesses**` → `**sponsorships**` (1:N): `sponsorships.business_id` = `businesses.id`
- `**sponsorships**` may reference `**events**`: `sponsorships.event_id` → `events.id`

### Volunteers (relational, optional future UI)

- `**event_volunteers**` → `**events**` (`event_id`), `**people**` (`person_id`)

---

# Page-by-page data

## All Neighbors (`/neighbors/all`)

**Source:** Supabase `**people`** (+ joined `**memberships**`).

`**people` fields (schema):**


| Field              | Notes                  |
| ------------------ | ---------------------- |
| `id`               | uuid                   |
| `full_name`        | text, required         |
| `email`            | text, nullable, unique |
| `address`, `phone` | text                   |
| `roles`, `tags`    | text arrays            |
| `source`           | text                   |
| `created_at`       | timestamptz            |
| `membership_id`    | uuid → `memberships`   |


**Joined `memberships` fields:**


| Field                                                                                     | Notes          |
| ----------------------------------------------------------------------------------------- | -------------- |
| `id`, `tier`, `status`, `last_renewal`, `payment_method`, `is_subscription`, `start_date` |                |
| `stripe_customer_id`, `stripe_subscription_id`, `stripe_tier_id`, `customer_email`        | Stripe linkage |
| `created_at`                                                                              |                |


**Filtering in UI:** Search on `full_name`, `email`, `address`; optional filters for membership presence/status where used.

---

## Members (`/neighbors/members`)

**Source:** Same as All Neighbors, but `**usePeople`** restricts to `**hasMembership: true**` and `**membershipStatus: 'active'**` (post-fetch filter on membership row).

---

## Duplicate Members (`/neighbors/duplicate-memberships`)

**Source:** **Stripe API only** (`GET /api/stripe/duplicate-members`) — **not Postgres**.

**Logic:** All **active** subscriptions, grouped by **customer email**; rows where **≥ 2 subscriptions** share the same email.

**Payload shape (API):**

- `duplicateMembers[]`: `{ customerId, name, email, subscriptions[] }`
- `subscriptions[]`: `{ id, status, productName, priceId, currentPeriodStart, currentPeriodEnd }`

**Potential cross-link later:** Match `customer_email` on `memberships` or Stripe customer id columns for DB correlation.

---

## All Routes (`/routes/all`)

**Source:** `**routes`** + `**people**` hydration for assignees.

`**routes` fields:**


| Field                     | Notes                              |
| ------------------------- | ---------------------------------- |
| `id`                      | uuid                               |
| `route_name`              | text, required                     |
| `leaflet_count`           | int                                |
| `created_at`              | timestamptz                        |
| `route_type`              | enum-ish string (`RouteTypesEnum`) |
| `primary_deliverer_id`    | uuid → `people`                    |
| `secondary_deliverer_id`  | uuid → `people`                    |
| `is_skipped`              | bool                               |
| `primary_deliverer_email` | text (denormalized search)         |


**Joins:** As above (`primary_deliverer`, `secondary_deliverer`).

**Further data you could add:** `**deliveries`** filtered by `route_id` (and join `people` for deliverer at time of delivery).

---

## Claimed Routes (`/routes/claimed`)

**Source:** Same `**routes` + people** bundle; `**useRoutes`** filter `**claimedOnly**` — routes where **either** primary **or** secondary deliverer id is non-null (`hooks/useRoutes.ts`).

---

## Deliverers (`/routes/deliverers`)

**Source:** `**useRoutes({ autoFetch: true })`** with **no server filter**, then **client-side grouping**:

- Routes are grouped under each `**people`** who appears as **primary** (non-skipped routes) or **secondary** deliverer.

**No separate “deliverers” table** — deliverers **are `people`** referenced from `routes`.

---

## Open Routes (`/routes/open`)

**Source:** Same hook with `**openOnly`** filter (complex `.or`): “no primary and no secondary” **or** “skipped” pattern with partial assignment (`hooks/useRoutes.ts`).

---

## All Businesses (`/businesses/all`)

**Source:** `**businesses`** + `**sponsorships**` (+ `**business_memberships**`).

`**businesses` fields:**


| Field                                                                 | Notes                         |
| --------------------------------------------------------------------- | ----------------------------- |
| `id`                                                                  | uuid                          |
| `business_name`, `contact_name`, `email`, `phone`, `address`, `notes` |                               |
| `membership_id`                                                       | uuid → `business_memberships` |


**Joined `business_memberships`:**


| Field                                                               | Notes |
| ------------------------------------------------------------------- | ----- |
| `id`, `status`, `last_renewal`, `payment_method`, `is_subscription` |       |


**Joined `sponsorships[]` (per business):**


| Field                                                              | Notes                                                                         |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `business_id`, `event_id`, `amount`, `status`, `memo`, `paid_date` | `status`: `pledged` | `invoiced` | `paid`; `event_id` → `**events`** when set |


**Status filters in hook:** Derived “active”, “past”, “yet-to-support” from memberships + sponsorship paid state (`hooks/useBusinesses.ts`).

---

## Business Members (`/businesses/members`)

**Source:** `**businesses`** + `**business_memberships**` (+ `**sponsorships**` as loaded by `**useBusinesses**`). Presentation filters may differ per table component; data layer is `**BusinessWithDetails**`.

---

## Sponsors (`/businesses/sponsors`)

**Repo status:** Page is placeholder (“Coming Soon”).

**Intended relational data:** Same as `**sponsorships`** on `**businesses**`; `**event_id**` can tie a sponsorship to `**events**` (Supabase) for event-specific sponsorship context.

---

## Invoices (`/billing/invoices` and detail routes)

**Source:** **Stripe Invoice API**, not Postgres.

**List (`GET /api/stripe/invoices`):** Expanded customer + line items + price details; filtered by `**STRIPE_INVOICE_EXCLUDE_PRODUCT_IDS`** / `**STRIPE_INVOICE_INCLUDE_PRODUCT_IDS**` (`src/lib/stripe/invoiceProductFilter.ts`).

**Row shape exposed to UI** (from `src/app/api/stripe/invoices/route.ts`):

- `id`, `number`, `status`, `customer_email`, `amount_due`, `due_date`, `created`, `hosted_invoice_url`, `catalog_product_ids[]`

**Related reads:** Stripe **Customer**, **Subscriptions** (duplicate-members page), `**memberships.stripe_*`** columns for Postgres correlation.

---

## Events (calendar `/calendar`, editors under `/events/*`)

**Source:** **Webflow CMS** collection `**WEBFLOW_EVENTS_COLLECTION_ID`** via `**GET` / `POST`  `/api/events/webflow**`.

Each item:

- `id`, `isArchived`, `isDraft`, `fieldData` (`Record<string, unknown>` dynamic CMS fields).

**Slug map (conceptual CMS fields)** — defaults in `src/lib/webflow/event-field-slugs.ts`:

- Schedule: `**starts-at`**, `**ends-at**` (overridable by env)
- `**name**`, `**slug**`, `**short-description**`, `**body**`, `**featured-image**`
- Location: `**location-name**`, `**location-place-id**`, `**location-address**`, `**location-url**`
- `**committee**` (reference to committees collection item id)
- External event: `**is-external**`, `**external-event-url**`, `**external-org-name**`, `**external-org-url**`

**Supabase `events` / `event_volunteers`:** Exist for relational modeling; **the live calendar UX is Webflow-driven**. You could sync or cross-reference CMS item id ↔ `events.id` if you introduce a bridge column later.

---

## Committees (referenced from Events UI)

**Source:** **Webflow** committees collection `**WEBFLOW_COMMITTEES_COLLECTION_ID`** via `**GET /api/webflow/committee-items**` — returns `{ items: [{ id, name, slug }] }` (derived from CMS title + slug fields).

Used to populate committee Reference on `**EventCmsForm**`.

---

## Volunteers

**Relational schema in repo:**

`**event_volunteers`:** `id`, `event_id` → `events`, `person_id` → `people`, `created_at`

`**events` (Postgres minimal):** `id`, `name`, `date`

**UI:** No dedicated Volunteers admin route in this repo; joining `**people`** (name, email) and `**events**` would power a roster per event.

---

## Related tables you may wire up later


| Table        | Relationships                             | Idea                                |
| ------------ | ----------------------------------------- | ----------------------------------- |
| `deliveries` | `person_id`, `route_id`, `date_delivered` | Delivery history per route / person |
| `payments`   | `person_id`, `membership_id`, Stripe id   | Ledger next to memberships          |


---

### Maintenance

After changing Postgres, regenerate or hand-update `**schemas/*.ts**` and hooks so this doc stays truthful. For Webflow, field slugs drift with Designer changes — `**event-field-slugs.ts**` plus env overrides are the source of truth for Events.
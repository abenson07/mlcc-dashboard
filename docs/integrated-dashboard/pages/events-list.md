# Events List — Data Wiring Plan

> **Route:** `/events-hub`  
> **Component:** `src/components/integrated/events/EventsListPageContent.tsx`  
> **Design node:** `CpRNE`  
> **Status:** Mock events; **`useEvents` exists but minimal**

---

## 1. Purpose

Chronological list of events grouped by month + calendar widget on the right. “Manage” navigates to event detail shell.

---

## 2. Current UI (mock)

| Element | Mock |
|---------|------|
| Event cards | `MOCK_EVENTS` |
| Month groups | Derived from mock |
| Search | Client filter on title |
| Calendar | Static August 2026 grid; day selection local state |
| “Manage” link | `/events-hub/[id]/overview` |

---

## 3. Database: `events`

Post-migration columns (`02_alter_events.sql`):

| Column | UI mapping |
|--------|------------|
| `id` | Route param `[eventId]` |
| `name` | Card title |
| `starts_at` | Primary date (prefer over legacy `date`) |
| `ends_at` | Duration / status |
| `slug` | Future public URL |
| `event_template_id` | Template badge (optional) |
| `field_data` | Location, status label, event type |
| `created_at`, `updated_at` | Sorting |

### 3.1 `field_data` conventions (define in code)

Store CMS-like fields not worth first-class columns:

```json
{
  "location": "Mooreland Park · Community Event",
  "status": "upcoming",
  "capacity": 500,
  "image_url": "https://...",
  "description": "..."
}
```

Document per `event_templates.default_field_data` when spawning.

---

## 4. Existing hook: `useEvents`

`hooks/useEvents.ts` — only selects `id, name, date`. **Insufficient for integrated UI.**

### 4.1 Extend to `useEventsList`

```ts
type EventListItem = {
  id: string;
  title: string;
  startsAt: string | null;
  day: number;
  month: string;       // "AUG"
  monthLabel: string;  // "August 2026"
  status: string;      // from field_data.status
  location: string;      // from field_data.location
};

// Query
supabase.from('events')
  .select('id, name, starts_at, ends_at, field_data, event_template_id')
  .order('starts_at', { ascending: true, nullsFirst: false });
```

Add client-side grouping by `monthLabel` (same as mock `groupByMonth`).

---

## 5. Calendar widget

| UI | Data wiring |
|----|-------------|
| Month header | `calendarMonth` state; prev/next buttons shift month |
| Highlighted day | Days with events on `starts_at` get dot or bold |
| Selected day | Filter list to events on that date (optional) |

Query for calendar markers:

```ts
const eventsInMonth = events.filter(e => 
  sameMonth(e.startsAt, calendarMonth)
);
```

No separate table — pure derivation from `events.starts_at`.

---

## 6. Create event flow

Design topbar: **“+ New event”**.

### 6.1 API: `POST /api/events`

Body:

```json
{
  "name": "Summer Block Party 2026",
  "starts_at": "2026-08-31T16:00:00Z",
  "ends_at": "2026-08-31T20:00:00Z",
  "event_template_id": "uuid",
  "field_data": { }
}
```

Server actions (mirror `createLeaflet`):

1. `INSERT events`
2. Copy `task_templates` where `context = 'event'` and `event_template_id` matches → `INSERT tasks` with `context_id = event.id`
3. Optionally copy sponsorship tiers from template defaults
4. Return `{ event }`

### 6.2 UI

Modal: name, date, template picker (from `event_templates` where `is_active`).

---

## 7. Status labels

| `field_data.status` | Badge |
|---------------------|-------|
| `upcoming` | Upcoming |
| `planning` | Planning |
| `draft` | Draft |
| `completed` | Completed |

Derive from dates if missing:

- `starts_at > now()` → upcoming
- `ends_at < now()` → completed

---

## 8. Coexistence with Webflow

Legacy `/events` CMS still uses Webflow. During migration:

| Source | Route |
|--------|-------|
| Supabase `events` | `/events-hub` (integrated) |
| Webflow CMS | `/events` legacy |

`ensureSupabaseEventFromWebflow` (`src/lib/volunteers/ensureSupabaseEventFromWebflow.ts`) can backfill rows. Run one-time sync or on-demand when linking volunteer asks.

**Stripe invoice metadata** still uses Webflow `event_id` in some rows — support both IDs during transition (see event-sponsorship plan).

---

## 9. Mutations

| Action | Implementation |
|--------|----------------|
| Search | Debounced filter on `name`, `field_data.location` |
| Filter button | Modal: status, template, date range |
| New event | `POST /api/events` |
| Manage | Navigation only |

---

## 10. Dependencies

- Leaflet migrations applied (`event_templates` table exists).
- [event-overview.md](./event-overview.md) for detail shell.
- Seed at least one `event_templates` row.

---

## 11. Verification checklist

- [ ] List shows rows from `events` table, not mock.
- [ ] Month grouping correct across year boundaries.
- [ ] Calendar highlights days with events.
- [ ] “Manage” opens overview for correct `id`.
- [ ] Create event inserts row + spawns tasks.
- [ ] Legacy `/events` Webflow hub still works (regression).

---

## 12. Files to touch

| File | Change |
|------|--------|
| `hooks/useEvents.ts` | Expand select + mapping |
| `src/lib/events/createEvent.ts` | New (mirror createLeaflet) |
| `src/app/api/events/route.ts` | GET list, POST create |
| `EventsListPageContent.tsx` | Wire hook, create modal |
| `schemas/events.ts` | Document `field_data` shape (optional Zod) |

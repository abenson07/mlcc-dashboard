# Events List + EventProvider — Test Plan

**Scope:** Supabase-backed `/events` list + `/events-hub/[eventId]/*` detail shell with `EventProvider`. Legacy Webflow CMS at `/events/cms` should be unchanged.

**Prerequisites before testing**

- Logged in as an admin user (Supabase session)
- Leaflet migrations applied (`events.starts_at`, `field_data`, `event_template_id`, etc.)
- Optional but recommended: at least one `event_templates` row + matching `task_templates` (`context = 'event'`) for create + task spawn
- Optional: existing `events`, `volunteer_asks`, `sponsorships` rows for richer detail-page checks

---

## 1. Events list (`/events`)

| # | Step | Expected | Done |
|---|------|----------|------|
| 1.1 | Open `/events` | Page loads without errors; no mock titles (e.g. slug IDs like `summer-block-party`) unless those exist in DB | |
| 1.2 | Compare list to Supabase `events` table | Row count, names, and dates match | |
| 1.3 | Search by event name | List filters client-side | |
| 1.4 | Search by location (`field_data.location`) | Matching rows appear | |
| 1.5 | Status filter (Upcoming, Planning, Completed, etc.) | Rows filter by derived status | |
| 1.6 | Month grouping | Events grouped under correct `monthLabel` from `starts_at` | |
| 1.7 | Calendar prev/next | Month header updates; days with events use bold/highlight styling | |
| 1.8 | Click a calendar day with events | List filters to that day; click again clears filter | |
| 1.9 | Click a **council** event row | Navigates to `/events-hub/{uuid}/overview` | |
| 1.10 | Click an **external** event row (`field_data.kind = "external"`) | Stays on `/events?event={id}` with row highlighted | |
| 1.11 | Sidebar — “Overview” | Active on `/events` with no `?event=` | |
| 1.12 | Sidebar — council events | Links to correct overview URLs; active state on detail pages | |
| 1.13 | Empty state (no DB rows) | Dashed box + “Make an event now” button | |
| 1.14 | Empty state (search with no matches) | Box suggests creating event; button prefills modal name from search | |
| 1.15 | Calendar layout | Calendar has comfortable width (~320px); day cells not squished | |

---

## 2. Create event flow

| # | Step | Expected | Done |
|---|------|----------|------|
| 2.1 | Click **New event** on `/events` | Modal opens with name, start/end datetime, template picker (if templates exist) | |
| 2.2 | Submit without name or start | Submit disabled or validation error | |
| 2.3 | Create with name + start only | `POST /api/events` succeeds; new row in `events`; redirects to `/events-hub/{id}/overview` | |
| 2.4 | Create with template selected | `tasks` rows inserted with `context = 'event'` and `context_id = event.id` from matching `task_templates` | |
| 2.5 | Create with end datetime | `ends_at` stored correctly | |
| 2.6 | After create | Event appears on list without refresh; calendar dot on start date | |
| 2.7 | **New event** from detail layout topbar | Same modal + redirect behavior | |
| 2.8 | **Make an event now** from empty state | Modal opens with name prefilled from search (when search was used) | |

---

## 3. EventProvider + navigation (`/events-hub/[eventId]/*`)

| # | Step | Expected | Done |
|---|------|----------|------|
| 3.1 | Open overview for a real UUID | Hero shows DB `name`, countdown/label from `starts_at` | |
| 3.2 | Invalid UUID | “Event not found” + link back to `/events` | |
| 3.3 | Event selector (top of sidebar) | Current event title; can switch to another event while keeping sub-page (e.g. stay on `/schedule`) | |
| 3.4 | Sidebar nav | Overview, Details, Sponsorship, Volunteers, Marketing, Schedule all route correctly | |
| 3.5 | Loading state | Brief “Loading…” on first paint; no flash of mock data | |

---

## 4. Overview (`/events-hub/[id]/overview`)

| # | Step | Expected | Done |
|---|------|----------|------|
| 4.1 | Hero | Title, days-until label, formatted date from DB | |
| 4.2 | To-do preview | Open task count matches incomplete `tasks`; up to 2 preview rows | |
| 4.3 | Toggle a preview task | Persists in Supabase (`is_complete`); count updates | |
| 4.4 | “See all items in checklist” | Goes to schedule; total count matches | |
| 4.5 | Volunteers card | Signup total = sum of `volunteers` for asks on this `event_id` | |
| 4.6 | Budget card | Goal / raised / pledged match `sponsorships` aggregation | |
| 4.7 | Details panel | Location, time, capacity from `field_data` / dates | |
| 4.8 | Completed / past event | `readOnly`: checkboxes disabled; details save disabled on details page | |

---

## 5. Schedule (`/events-hub/[id]/schedule`)

| # | Step | Expected | Done |
|---|------|----------|------|
| 5.1 | Active tasks | Grouped by due bucket (Past due, Week of event, etc.) from `starts_at` anchor | |
| 5.2 | Toggle task complete | Updates DB; moves to completed section when “Show completed” | |
| 5.3 | Open count in header | Matches incomplete tasks | |
| 5.4 | Event with no tasks | “No active tasks” empty state | |

---

## 6. Details (`/events-hub/[id]/details`)

| # | Step | Expected | Done |
|---|------|----------|------|
| 6.1 | Form fields | Pre-filled from `name` + `field_data` | |
| 6.2 | Save name, location, address, capacity, description | `PATCH /api/events/[id]` merges `field_data`; reload shows changes | |
| 6.3 | Date/time fields | Read-only (formatted from `starts_at` / `ends_at`) | |
| 6.4 | Read-only event | Save button hidden/disabled | |

---

## 7. Volunteers (`/events-hub/[id]/volunteers`)

| # | Step | Expected | Done |
|---|------|----------|------|
| 7.1 | Hub cards | One card per `volunteer_asks` row for this `event_id` | |
| 7.2 | Registered / target | Matches signup count vs `quantity` | |
| 7.3 | Signups table | Rows from `volunteers` + `people` join; hub name = ask title | |
| 7.4 | No asks | Empty hubs + “No volunteer signups yet” | |

---

## 8. Sponsorship (`/events-hub/[id]/sponsorship`)

| # | Step | Expected | Done |
|---|------|----------|------|
| 8.1 | Budget block | Goal, raised, pledged, progress % match DB | |
| 8.2 | Sponsorship levels | Tiers derived from sponsorship rows | |
| 8.3 | Sponsors table | Rows from `sponsorships` + `businesses`; tabs filter Paid/Pledged | |
| 8.4 | Invoices table | Stripe invoices where `metadata.event_id` matches Supabase UUID **or** `field_data.webflow_item_id` | |
| 8.5 | No sponsorships | Empty states, no mock sponsors | |

---

## 9. Marketing (`/events-hub/[id]/marketing`)

| # | Step | Expected | Done |
|---|------|----------|------|
| 9.1 | Page load | Empty state: “No campaigns linked to this event yet” (v1 placeholder) | |

---

## 10. API smoke (optional)

| Endpoint | Check | Done |
|----------|--------|------|
| `GET /api/events` | 401 when logged out; 200 + `events[]` when logged in | |
| `POST /api/events` | Creates row; 400 without `name`/`starts_at` | |
| `GET /api/events/[id]` | 404 for bad id; 200 with full row | |
| `PATCH /api/events/[id]` | Merges `field_data` without wiping other keys | |

---

## 11. Regression

| # | Area | Expected | Done |
|---|------|----------|------|
| 11.1 | `/events/cms` (Webflow hub) | Still loads Webflow events; create/edit unchanged | |
| 11.2 | `/leaflet` | Selector, tasks, deliveries still work (`useTasks` leaflet path) | |
| 11.3 | `/volunteers` admin | Global volunteer asks still load (unchanged hook) | |

---

## 12. Suggested end-to-end path (~5 min)

1. `/events` → confirm live list  
2. **New event** → land on overview  
3. Overview → toggle a task → open Schedule → confirm persistence  
4. Details → edit location → save → reload → confirm  
5. Volunteers + Sponsorship → confirm real or empty states (not mocks)  
6. `/events/cms` → quick sanity check  
7. `/leaflet` → open an edition, toggle a task  

---

## Known v1 gaps (not failures)

- Marketing card hidden on overview; marketing page is placeholder only  
- QR download button present only when `field_data.qr_code_id` exists; download may not be fully wired  
- Image upload on details/overview is UI-only until upload API is added  
- Volunteer “New opportunity” / “Add volunteer” buttons are not wired to CRUD yet  

---

## Related docs

- [Integrated dashboard README](./README.md)
- [Events list wiring plan](./pages/events-list.md)
- [Event overview wiring plan](./pages/event-overview.md)

# Phase E — Routes + Open Routes

**Goal:** Master-detail tables for all routes and open/skipped routes for the selected leaflet.

**Depends on:** Phases B, C.

**Design nodes:** `j6q2x` (Routes), `a1qNG3` (Open Routes).

---

## YOUR TASKS

| # | Task | When |
|---|------|------|
| E.1 | None during implementation | — |
| E.2 | Batch **3** — click a route row, confirm detail panel updates | After agent done |
| E.3 | If you have building contacts in mind, add via SQL or future route edit — optional | Anytime |

```sql
-- Optional: seed one building contact for UI testing
UPDATE routes
SET building_contact_name = 'Janet Morales',
    building_contact_email = 'janet@example.com',
    building_contact_phone = '(206) 555-0100'
WHERE route_name ILIKE '%maple%'
LIMIT 1;
```

---

## AGENT TASKS

### Shared table infrastructure

1. **`LeafletRoutesTable.tsx`** — columns: Route name, Deliverer, Type, Count, Change, Status.
2. **Change column** — `deliveries.leaflet_count` minus same `route_id` on previous closed leaflet.
3. **Status column** — derived from `deliveries.response`, `is_skipped`, `person_id`, `date_delivered`.
4. Search + type + status filters; row selection highlight.
5. **Export CSV** button.

### Detail panel (reuse pattern from `RouteDetailSidebar` where possible)

| Card | Routes page | Open Routes page |
|------|-------------|------------------|
| Who is delivering | Assigned person | Empty + Assign + past deliverers |
| Route details | name, type, count, delta | same |
| Delivery history | prior editions | same |
| Building contact | from delivery snapshot | same |

### Open Routes specific

6. Filter: `person_id IS NULL OR is_skipped = true`.
7. **Assign** button → set `deliveries.person_id` (PATCH API).
8. **Past deliverers** list from historical `deliveries` for `route_id`.
9. **Email past deliverers** UI stub (wired in Phase L).

### APIs

10. `PATCH /api/leaflets/[id]/deliveries/[deliveryId]` — assign person, update count, skip.
11. `GET /api/leaflets/[id]/deliveries` — list with route + person joins.

### Pages

12. `routes/page.tsx`, `open-routes/page.tsx`.

---

## VERIFICATION

| Check | Who |
|-------|-----|
| Row select ↔ detail panel | You (E.2) |
| Change column shows delta vs last closed edition | Agent |
| Open routes excludes fully assigned confirmed rows | Agent |

---

## HANDOFF → Phase F (parallel: G can start after E)

Routes are the hub for edition editing. Deliverers view next.

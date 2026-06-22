# Leaflet Routes — Data Wiring Plan

> **Route:** `/leaflet/routes`  
> **Component:** `src/components/leaflet/routes/RoutesPageContent.tsx`  
> **Design node:** `j6q2x`  
> **Status:** ✅ **Wired to live data**

---

## 1. Purpose

Master-detail: all routes for selected leaflet edition with filters, export, and 300px detail panel (deliverer, route info, delivery history).

---

## 2. Data flow

```
LeafletContext.deliveries  → API GET /api/leaflets/[id]/deliveries
LeafletContext.deliveryHistoryForRoute(routeId)
LeafletContext.countChangeByRouteId(routeId, count)
updateDelivery(deliveryId, patch) → PATCH API
```

Each row = `deliveries` joined to `routes` + `people`.

---

## 3. Column mapping

| Table column | UI column |
|--------------|-----------|
| `routes.route_name` | Route name |
| `people.full_name` | Deliverer |
| `routes.route_type` | Type |
| `deliveries.leaflet_count` | Count |
| computed vs previous edition | Change |
| `deliveries.response`, `is_skipped`, `date_delivered` | Status |

**Change column:** `countChangeByRouteId` compares to `useLeafletHistory` previous closed leaflet deliveries.

---

## 4. Detail panel

| Section | Data |
|---------|------|
| Who is delivering | `people` from delivery |
| Route details | `routes` + delivery counts |
| Delivery history | Prior `deliveries` for same `route_id` from closed leaflets |

---

## 5. Mutations

| Action | PATCH fields |
|--------|--------------|
| Change deliverer | `person_id` |
| Update count | `leaflet_count` (+ `routes.leaflet_count` if active) |
| Skip route | `is_skipped` |
| Building contact | `building_contact_*` |

Guard: `readOnly` when leaflet closed.

---

## 6. Export

Client CSV from filtered visible rows (no extra API).

---

## 7. Gaps / enhancements

| Item | Notes |
|------|-------|
| Reject flow | Public URL sets `response=rejected` — may need admin override UI |
| Route master edits | Changing `routes` primary deliverer — ensure syncs to active delivery |

---

## 8. Verification checklist

- [ ] Row count = deliveries for leaflet.
- [ ] Selection highlights row and fills panel.
- [ ] History shows prior editions.
- [ ] Count change matches manual diff vs last closed leaflet.
- [ ] PATCH persists and refetches.

---

## 9. Files (reference)

| File | Role |
|------|------|
| `routes/RoutesPageContent.tsx` | UI |
| `routes/DeliveryDetailPanel.tsx` | Detail |
| `hooks/useDeliveries.ts` | Fetch/update |
| `hooks/useLeafletHistory.ts` | Prior editions |

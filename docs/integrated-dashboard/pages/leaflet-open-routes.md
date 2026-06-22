# Leaflet Open Routes — Data Wiring Plan

> **Route:** `/leaflet/open-routes`  
> **Component:** `src/components/leaflet/open-routes/OpenRoutesPageContent.tsx`  
> **Design node:** `a1qNG3`  
> **Status:** ✅ **Wired to live data**

---

## 1. Purpose

Same master-detail as Routes, filtered to **open** deliveries: `person_id IS NULL OR is_skipped = true`. Detail panel supports assign deliverer, email past deliverers, building contact.

---

## 2. Data flow

```
useDeliveries(leafletId, { openOnly: true })
  → GET /api/leaflets/[id]/deliveries?open=true
```

Server filter in deliveries route applies open/skipped logic.

---

## 3. Detail panel sections

| Section | Data |
|---------|------|
| Route details | `routes` via delivery |
| Deliverer (empty) | `person_id` null → show Assign |
| Past deliverers | `LeafletContext.pastDeliverersForRoute(routeId)` from historical `deliveries` |
| Building contact | `deliveries.building_contact_*` snapshot |

---

## 4. Mutations

| Action | Implementation |
|--------|----------------|
| Assign deliverer | `PATCH` delivery `person_id`, may clear `is_skipped` |
| Email past deliverer | `POST /api/leaflets/[id]/open-routes/email` with `personId`, `routeId` |
| Edit building contact | `PATCH` `building_contact_*` fields |

---

## 5. Tables

| Table | Role |
|-------|------|
| `deliveries` | Edition state |
| `routes` | Route metadata |
| `people` | Assignee + past deliverers |

---

## 6. Gaps / enhancements

| Item | Notes |
|------|-------|
| Bulk assign | Not in design |
| Email template | Uses `buildOpenRouteEmailHtml` + Resend |

---

## 7. Verification checklist

- [ ] List excludes fully assigned non-skipped routes.
- [ ] Assign updates row and removes from open list.
- [ ] Past deliverers list matches historical deliveries.
- [ ] Email action sends via API (test mode).

---

## 8. Files (reference)

| File | Role |
|------|------|
| `open-routes/OpenRoutesPageContent.tsx` | UI |
| `api/leaflets/[id]/open-routes/email/route.ts` | Email blast |
| `lib/leaflets/sendOpenRouteEmail.ts` | HTML + send |

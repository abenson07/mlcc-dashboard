# Leaflet Substitutions — Data Wiring Plan

> **Route:** `/leaflet/substitutions`  
> **Component:** `src/components/leaflet/substitutions/SubstitutionsPageContent.tsx`  
> **Design node:** `vMlvE`  
> **Status:** ✅ **Wired to live data** (derived view, no substitutions table)

---

## 1. Purpose

Shows routes where current edition delivery is **skipped** and tracks covering deliverer vs original primary deliverer.

---

## 2. Data model (derived)

**No `substitutions` table.** Query concept:

```sql
select d.*, r.name, r.primary_deliverer_id
from deliveries d
join routes r on r.id = d.route_id
where d.leaflet_id = :leafletId
  and d.is_skipped = true;
```

Built client-side: `buildSubstitutions(deliveries)` in `leafletData.ts`.

---

## 3. Column mapping

| UI column | Source |
|-----------|--------|
| Route | `routes.route_name` |
| Covering | `deliveries.person_id` → `people` (null if uncovered) |
| For (original) | `routes.primary_deliverer_id` → `people` |
| Date | `deliveries.responded_at` or `updated_at` |
| Status | Derived from `response` + whether cover assigned |

---

## 4. Mutations

| Action | PATCH |
|--------|-------|
| Add substitution / assign cover | Set `person_id`, optionally `is_skipped=false` when covered |
| Manual skip | `is_skipped=true`, `person_id=null` |

---

## 5. Detail panel

| Field | Source |
|-------|--------|
| Covering person | Assigned `people` row |
| Originally for | `routes.primary_deliverer_id` person + route summary |

---

## 6. Gaps / enhancements

| Item | Notes |
|------|-------|
| Public `needs_cover` flow | Sets skip via respond URL — dashboard shows result |
| Search | Client-side on route/deliverer names |

---

## 7. Verification checklist

- [ ] Only skipped deliveries appear.
- [ ] “For” shows route’s primary deliverer from `routes`, not delivery snapshot.
- [ ] Assign cover updates covering column.
- [ ] Aligns with public respond `needs_cover` workflow.

---

## 8. Files (reference)

| File | Role |
|------|------|
| `substitutions/SubstitutionsPageContent.tsx` | UI |
| `leafletData.ts` | `buildSubstitutions` |

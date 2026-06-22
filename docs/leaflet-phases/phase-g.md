# Phase G — Substitutions

**Goal:** Table of skipped routes with covering vs original deliverer; detail panel.

**Depends on:** Phases B, C, E.

**Design node:** `vMlvE`.

---

## YOUR TASKS

| # | Task | When |
|---|------|------|
| G.1 | To see data: mark a delivery skipped (via deliverer public flow Phase J, or manual SQL for testing) | Before testing |

```sql
-- Quick test row (replace UUIDs)
UPDATE deliveries
SET is_skipped = true, response = 'needs_cover', person_id = NULL
WHERE leaflet_id = '<leaflet>' AND route_id = '<route>';
```

| G.2 | Batch **3** — Substitutions page shows row with **For** = `routes.primary_deliverer` | After agent done |

---

## AGENT TASKS

### Query (no new table)

```ts
// deliveries where leaflet_id = X and is_skipped = true
// join routes for name + primary_deliverer_id → people (For)
// join person_id → people (Covering)
```

### Components

1. **`SubstitutionsPage`** — header, description, filters, table.
2. **Columns:** Route, Covering, For, Date (`responded_at`), Status.
3. **Add substitution** — assign cover deliverer to skipped delivery.
4. **Detail panel** — Covering section + Originally for section (per design).
5. **Search** + route/status filters.

### Page

6. `substitutions/page.tsx`.

---

## VERIFICATION

| Check | Who |
|-------|-----|
| Only `is_skipped = true` rows appear | Agent |
| **For** shows route's primary deliverer, not delivery.person_id | You (G.2) |

---

## HANDOFF → Phase H

Substitutions complete. Sponsorships can run in parallel with G if needed.

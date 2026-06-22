# Leaflet Overview — Data Wiring Plan

> **Route:** `/leaflet`  
> **Components:** `OverviewContent.tsx`, `NoActiveLeaflet.tsx`  
> **Design nodes:** `M9769e`, `VDYgD`  
> **Status:** ✅ **Wired to live data** via `LeafletContext`

---

## 1. Purpose

Edition dashboard when a leaflet is active/planned: hero, tasks preview, open routes, budget, distribution timeline, stats. Empty state when no edition exists.

---

## 2. Data flow (current)

```
LeafletProvider
  → useLeaflets()           → leaflets table
  → useDeliveries()         → deliveries + routes + people
  → useTasks()              → tasks (context=leaflet)
  → useLeafletSponsorships()→ sponsorships + businesses
  → useCommSettings()       → comm_settings
  → Stripe invoices API     → invoices filtered by leaflet_id
  → leafletData transformers  → UI shapes
```

---

## 3. Widget → table mapping

| Widget | Tables / APIs | Transformer |
|--------|---------------|-------------|
| Hero | `leaflets.title`, `distribution_date` | direct |
| Tasks card | `tasks` | `mapTasksForUi` |
| Open routes card | `deliveries` (null person or skipped) | `buildOpenRoutePreviews` |
| Budget card | `sponsorships`, `leaflets.print_cost_cents` | `buildBudget`, `buildBudgetLineItems` |
| Distribution info | `deliveries.leaflet_count` sum | computed in OverviewContent |
| Timeline | `deliveries.response`, comm timestamps | `buildTimeline` |
| Delivery stats | `deliveries` | `buildDeliveryStats` |
| Membership QR | `leaflets.membership_qr_code_id` → `qr_codes` | `MembershipQrDownload` |
| **Stories / Marketing card** | **Empty array** | `stories: []` in context |

---

## 4. Remaining gaps

| Gap | Plan |
|-----|------|
| Stories card | Deferred v2 — hide card or keep empty (product decision) |
| Marketing schedule | Wire to Buffer/Resend when stories/marketing ships |
| `print_cost_cents` edit | UI may be read-only — add inline edit → `PATCH /api/leaflets/[id]` |
| Activate on create | `POST /api/leaflets/[id]/activate` exists — ensure create flow prompts |

---

## 5. No Active Leaflet state

| UI | Data |
|----|------|
| Empty message | No row with `status IN ('active','planned')` |
| Past leaflets list | `leaflets` where `status = 'closed'` |
| Schedule CTA | `POST /api/leaflets` via `CreateLeafletModal` |

---

## 6. URL context

`?leaflet=<uuid>` selects edition. Default: active leaflet, else nearest planned.

Read-only when `status = 'closed'`.

---

## 7. Verification checklist

- [ ] Widget numbers match manual SQL counts for test leaflet.
- [ ] Task checkbox updates `tasks.is_complete`.
- [ ] Open routes link lands on filtered open-routes page.
- [ ] Budget matches sponsorships page.
- [ ] Closed leaflet opens read-only (no edits).
- [ ] QR download works when `membership_qr_code_id` set.

---

## 8. Files (reference — mostly done)

| File | Role |
|------|------|
| `LeafletContext.tsx` | Aggregator |
| `hooks/useLeaflets.ts` | CRUD |
| `overview/OverviewContent.tsx` | UI |
| `overview/NoActiveLeaflet.tsx` | Empty state |

No implementation required unless closing gaps in §4.

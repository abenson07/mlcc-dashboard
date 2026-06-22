# Leaflet Deliverers — Data Wiring Plan

> **Route:** `/leaflet/deliverers`  
> **Component:** `src/components/leaflet/deliverers/DeliverersPageContent.tsx`  
> **Design nodes:** `KslI4`, `O9Y1lf` (send modal)  
> **Status:** ✅ **Wired to live data**

---

## 1. Purpose

Deliverer-centric view: cards grouped by person, routes per card, communication panel with staged email workflow.

---

## 2. Data flow

```
LeafletContext
  → useDeliveries(leafletId)
  → buildDelivererCards(deliveries)
  → useCommSettings('leaflet')
  → buildCommStages(settings, leaflet, deliveries)
  → sendComm / resendComm → API routes
```

---

## 3. Tables

| Table | Usage |
|-------|-------|
| `deliveries` | One row per route; `person_id` = deliverer |
| `routes` | Route name, type via join |
| `people` | Deliverer name, email |
| `comm_settings` | Step definitions |
| `leaflets` | Edition-wide send timestamps (`comm_*_sent_at`) |
| `deliveries` | Per-route send timestamps (`comm_pre_distribution_*`) |

---

## 4. Deliverer card mapping

| UI field | Source |
|----------|--------|
| Name | `people.full_name` via `deliveries.person_id` |
| Routes table | Filter deliveries by `person_id` |
| Route status | `deliveries.response`, `is_skipped` |
| Resend button | `resendComm(personId, stepKey)` |

`buildDelivererCards` groups `deliveries` by `person_id`.

---

## 5. Communication panel

| Stage state | Logic |
|-------------|-------|
| Completed | `leaflets.comm_*_sent_at` or delivery comm timestamp set |
| Active | First incomplete enabled step |
| Upcoming | Later steps disabled |

Send confirmation modal → `POST /api/leaflets/[id]/comm/initial_confirmation/send` (or step key).

Response breakdown: count `deliveries.response` per value for edition.

---

## 6. Gaps / enhancements

| Item | Notes |
|------|-------|
| Search | Client filter on deliverer name — works |
| Individual resend | Wired via `resendComm` |
| Automated scheduling | Manual send only v1 |

---

## 7. Verification checklist

- [ ] Cards match deliveries grouped by person.
- [ ] Comm panel stages reflect DB timestamps.
- [ ] Send modal requires typing “confirm”.
- [ ] Send updates `comm_initial_confirmation_sent_at`.
- [ ] Resend reaches single deliverer.

---

## 8. Files (reference)

| File | Role |
|------|------|
| `deliverers/DeliverersPageContent.tsx` | UI |
| `deliverers/CommunicationPanel.tsx` | Stages |
| `deliverers/SendConfirmationModal.tsx` | Blast confirm |
| `src/lib/leaflets/comm/sendLeafletComm.ts` | Server send |

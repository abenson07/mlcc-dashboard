# Phase F — Deliverers + send confirmation modal

**Goal:** Deliverer-centric view with per-person route tables and comm workflow panel.

**Depends on:** Phases B, C, D (overview comm patterns).

**Design nodes:** `KslI4` (Deliverers), `O9Y1lf` (confirmation modal).

---

## YOUR TASKS

| # | Task | When |
|---|------|------|
| F.1 | None until Phase I | — |
| F.2 | Batch **3** — Deliverers page loads cards grouped by person | After agent done |

Send modal will not actually email until **Phase I** + Batch **2.1** (Resend template IDs).

---

## AGENT TASKS

### Components (`src/components/leaflet/deliverers/`)

1. **`DeliverersPage`** — header, search, card list.
2. **`DelivererCard`** — person header, routes sub-table (Route, Households, Status).
3. **`CommunicationPanel`** — stages from `comm_settings` (leaflet):
   - Completed: sent date + Yes / Unresponsive / No counts
   - Active: description + **Send confirmation request**
   - Upcoming: reminder stages (disabled)
4. **`SendConfirmationModal`** (`O9Y1lf`):
   - Copy: “email N deliverers who have not yet confirmed”
   - Type `confirm` to enable Send
   - Cancel / Send → calls comm API (stub OK until Phase I; UI must work)

### Hooks

5. Group `useDeliveries` by `person_id` for selected leaflet.
6. **`useCommSettings.ts`** — read leaflet comm steps (for panel).

### API (stub or full)

7. `POST /api/leaflets/[id]/comm/[stepKey]/send` — implement handler shell; real Resend in Phase I.

### Page

8. `deliverers/page.tsx`.

---

## VERIFICATION

| Check | Who |
|-------|-----|
| Cards match deliverers with ≥1 route | Agent |
| Modal blocks Send until `confirm` typed | You (F.2) |
| Response breakdown numbers match DB | Agent |

---

## HANDOFF → Phase I

UI for comm is ready; Resend wiring comes in I after you paste template IDs.

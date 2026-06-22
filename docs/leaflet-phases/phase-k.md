# Phase K — Close-out banner + modals + celebration image

**Goal:** Prompt admin to close edition 14 days after distribution; review stats; confirm close; download celebration graphic.

**Depends on:** Phases B, D, F.

**Design nodes:** `NEDuW` (banner), `QC3D7` (review modal), `Qaphk` (confirmed modal).

---

## YOUR TASKS

| # | Task | When |
|---|------|------|
| K.1 | To test banner without waiting 14 days, temporarily set `distribution_date` in the past | Testing only |

```sql
UPDATE leaflets
SET distribution_date = current_date - 15
WHERE id = '<leaflet id>';
```

| K.2 | Walk through: banner → Review results → type confirm → Close → celebration modal | After agent done |
| K.3 | Confirm next `planned` leaflet auto-activates if you have one scheduled | Optional |

Revert test date after QA if needed.

---

## AGENT TASKS

### Eligibility

1. **`useCloseOutEligible(leaflet)`** — `status = active` AND `today >= distribution_date + 14 days`.

### Components

2. **`CloseOutBanner.tsx`** — green banner above canvas; **Review results** opens modal.
3. **`CloseOutReviewModal.tsx`** (`QC3D7`):
   - Metrics: deliverers confirmed, leaflets delivered, change vs last run, reroutes
   - Type `confirm` to enable **Close leaflet**
4. **`CloseOutConfirmedModal.tsx`** (`Qaphk`):
   - Celebration preview + **Download celebration image** + Done

### API

5. **`GET /api/leaflets/[id]/close-out`** — metrics JSON for review modal.
6. **`GET /api/leaflets/[id]/close-out/image`** — PNG/SVG (canvas or `@vercel/og` / sharp).
7. Wire **Close leaflet** to `POST /api/leaflets/[id]/close` (Phase B) + show confirmed modal.

### Integration

8. Mount banner in `LeafletDashboardShell` when eligible (all leaflet pages).

---

## VERIFICATION

| Check | Who |
|-------|-----|
| Banner hidden before day 14 | Agent |
| Banner visible after day 14 | You (K.1, K.2) |
| Close sets `status = closed`, freezes deliveries | Agent |
| Image downloads with sane stats | You (K.2) |

---

## HANDOFF → Phase L

Edition lifecycle complete in UI. Open-route blast next.

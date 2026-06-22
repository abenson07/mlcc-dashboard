# Phase D — Overview + No Active Leaflet

**Goal:** `/admin/leaflet` shows edition dashboard or empty state.

**Depends on:** Phases B, C.

**Design nodes:** `M9769e` (Overview), `VDYgD` (No Active).

---

## YOUR TASKS

| # | Task | When |
|---|------|------|
| D.1 | Batch **1.5** optional — replace example task template titles | Anytime before demo |
| D.2 | Batch **2.2** if not done — need a leaflet to see Overview | Before testing |
| D.3 | Batch **3** — verify Overview widgets load real numbers | After agent done |

---

## AGENT TASKS

### Data hooks

1. **`useTasks.ts`** — tasks for `context = 'leaflet'`, `context_id = leafletId`; compute due date = `distribution_date + offset_days`.
2. Overview data aggregator (counts for stats, open routes preview, sponsorship rollup).

### Components (`src/components/leaflet/overview/`)

| Component | Behavior |
|-----------|----------|
| `OverviewHero` | Title, days until distribution, date chip |
| `TodoCard` | Grouped tasks, open count, checkbox → PATCH task complete |
| `OpenRoutesCard` | Top open/skipped deliveries; link to open-routes |
| `BudgetCard` | Sponsorship goal/raised/pledged; link to sponsorships |
| `DistributionInfoWidget` | Date + total leaflets to produce |
| `DistributionTimelineWidget` | Notified / confirmed / complete counts |
| `DeliveryStatsWidget` | Open routes, skips, ejections |
| `NoActiveLeaflet` | Empty state + **Schedule new leaflet** modal/form |
| `PastLeafletsList` | Closed editions, read-only drill-in |

### Pages

3. **`page.tsx`** — branch: no active/planned → `NoActiveLeaflet`; else `OverviewPage`.
4. **Create leaflet modal** — title + `distribution_date` → `POST /api/leaflets`.

### Deferred

5. **Stories / Marketing card** — hidden or empty state (v2).

---

## VERIFICATION

| Check | Who |
|-------|-----|
| Empty DB → No Active state + Schedule button works | Agent |
| With leaflet → hero + widgets populate | You (D.3) |
| Task checkbox persists after refresh | You |

---

## HANDOFF → Phase E

Overview proves leaflet context + data plumbing. Routes pages next.

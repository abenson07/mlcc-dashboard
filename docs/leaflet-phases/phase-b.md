# Phase B — Leaflet CRUD, hooks, activate/close APIs

**Goal:** Create/list/activate/close leaflets; copy routes → deliveries on create; React Query hooks the UI will use.

**Depends on:** Phase A complete.

---

## YOUR TASKS

| # | Task | When |
|---|------|------|
| B.1 | None during implementation | — |
| B.2 | After agent finishes: run Batch **2.2** — create first leaflet + verify delivery count | [00-human-checklist.md](./00-human-checklist.md) |
| B.3 | Optional: Batch **2.3** activate leaflet when you want to test active-only UI | Before Phase D smoke test |

---

## AGENT TASKS

### Hooks (`hooks/`)

1. **`useLeaflets.ts`** — list by status, get active, create, activate, close, refetch.
2. **`useDeliveries.ts`** — by `leaflet_id`, filters: open (`person_id` null or `is_skipped`), skipped, by `person_id`.
3. Export from `hooks/index.ts`.

### Fix existing hook (breaking schema change)

4. **`useRoutes.ts`** — remove `secondary_deliverer_id` / `is_skipped` filters; add building contact fields; update `openOnly` / `claimedOnly` to match new model (open = no `primary_deliverer_id` on route master, edition skip on deliveries).

### Server lib

5. **`src/lib/leaflets/createLeaflet.ts`** (or similar):
   - INSERT `leaflets`
   - COPY all `routes` → `deliveries` (one row per route, `leaflet_id` set)
   - COPY `task_templates` (context = leaflet) → `tasks`
   - COPY sponsorships from previous closed leaflet (`status` → `pledged`)
   - CREATE `qr_codes` row → set `membership_qr_code_id`
6. **`src/lib/leaflets/activateLeaflet.ts`** — guard one active; set `activated_at`.
7. **`src/lib/leaflets/closeLeaflet.ts`** — set closed; find next planned; optional auto-activate next (per plan §5.4).
8. **`src/lib/leaflets/syncLeafletCount.ts`** — update `routes.leaflet_count` + active delivery row when edition is active.

### API routes

| Route | Method |
|-------|--------|
| `/api/leaflets` | GET (list), POST (create) |
| `/api/leaflets/[id]` | GET, PATCH (title, date, print_cost_cents) |
| `/api/leaflets/[id]/activate` | POST |
| `/api/leaflets/[id]/close` | POST |

Use Supabase service role or authenticated server client per existing API patterns.

### Schemas usage

9. Wire all handlers to Phase A types.

---

## VERIFICATION

| Check | Who |
|-------|-----|
| `POST /api/leaflets` creates row + N delivery rows (N = route count) | Agent (script or test) |
| Only one `status = 'active'` enforced | Agent |
| You: SQL count check in B.2 | You |

---

## HANDOFF → Phase C

Leaflet can be created and selected by ID. Shell UI comes next.

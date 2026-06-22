# Phase C — `/admin/leaflet` layout shell

**Goal:** Integrated-dashboard chrome (topbar, leaflet sidebar, selector) wrapping all leaflet pages. No full page content yet beyond placeholders.

**Depends on:** Phase B (`useLeaflets` for selector).

**Design:** `integrated-dashboard.pen` — shared frames on every screen; selector `wCygQ`.

---

## YOUR TASKS

| # | Task | When |
|---|------|------|
| C.1 | None during implementation | — |
| C.2 | After agent finishes: visit `http://localhost:3000/admin/leaflet` logged in | Batch 3 (quick) |

---

## AGENT TASKS

### Routes

```
src/app/(admin)/leaflet/
  layout.tsx
  page.tsx              # placeholder "Overview" until Phase D
  deliverers/page.tsx   # placeholder until F
  routes/page.tsx       # placeholder until E
  open-routes/page.tsx
  substitutions/page.tsx
  sponsorships/page.tsx
```

### Components (`src/components/leaflet/`)

1. **`LeafletDashboardShell.tsx`** — full-height layout; hide or minimize global `AppSidebar` on leaflet routes if needed to match design.
2. **`LeafletTopbar.tsx`** — mode tabs (Site, People, Events, **Leaflets**, Stories); only Leaflets tab is active; right controls (Revenue, Promotion, New Event) **inert** (`cursor-default`, no `href`).
3. **`LeafletSidebar.tsx`** — nav links per design:
   - Overview, Deliverers, Routes, Open Routes, Substitutions, Sponsorships
   - To-do / Schedule → `/admin/leaflet/todo` or "coming soon" toast
4. **`LeafletSelector.tsx`** — dropdown `wCygQ`:
   - Current leaflet
   - Other active
   - Divider
   - Searchable list of all others
   - Updates `?leaflet=<id>` query param
5. **`LeafletContext`** or URL helper — selected `leafletId`, read-only flag for closed editions.

### Styling

6. Match design tokens: `#F3F3F4` page bg, 220px sidebar, rounded canvas card, Inter weights.

---

## VERIFICATION

| Check | Who |
|-------|-----|
| All sidebar links navigate without 404 | You (C.2) |
| Selector lists leaflets from `useLeaflets` | Agent |
| Topbar non-leaflet tabs don't navigate away | You |

---

## HANDOFF → Phase D

Shell is stable; build real page content starting with Overview.

# Leaflet Schedule (To-do) — Data Wiring Plan

> **Route:** `/leaflet/todo`  
> **Component:** `src/components/leaflet/schedule/SchedulePageContent.tsx`  
> **Design node:** Schedule section in pen (leaflet + event share pattern)  
> **Status:** ✅ **Wired to live data**

---

## 1. Purpose

Full checklist for selected leaflet edition: active tasks grouped by due buckets + collapsible completed section.

---

## 2. Data flow

```
LeafletContext
  → useTasks(leafletId, distribution_date)
  → tasks table (context='leaflet', context_id=leafletId)
  → groupScheduleTasks() in leafletData.ts
```

Due date: `distribution_date + offset_days`.

Toggle: `toggleTask(id)` → updates `is_complete`, `completed_at`.

---

## 3. Task spawn

On `POST /api/leaflets` (create), server copies `task_templates` where `context = 'leaflet'` into `tasks` rows.

Seeds in `01_new_tables.sql` (example tasks).

---

## 4. UI → DB

| UI | Column |
|----|--------|
| Checkbox | `is_complete` |
| Title | `title` |
| Due label | computed from `offset_days` + `distribution_date` |
| Overdue styling | `dueDate < today` |

Read-only when `LeafletContext.readOnly`.

---

## 5. Gaps / enhancements

| Item | Notes |
|------|-------|
| Add task UI | Design shows “+ Add task” — not implemented; needs `INSERT tasks` |
| Delete task | Not in UI |
| Edit offset/title | Not in UI |
| `useTasks` generalization | Will share with event schedule — keep leaflet path working |

---

## 6. Verification checklist

- [ ] Groups match due date buckets.
- [ ] Toggle persists after refresh.
- [ ] Read-only on closed leaflet.
- [ ] Open count in header matches overview card.

---

## 7. Files (reference)

| File | Role |
|------|------|
| `schedule/SchedulePageContent.tsx` | UI |
| `hooks/useTasks.ts` | Query + mutation |
| `leafletData.ts` | `groupScheduleTasks` |

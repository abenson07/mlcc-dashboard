# Event Schedule — Data Wiring Plan

> **Route:** `/events-hub/[eventId]/schedule`  
> **Component:** `src/components/integrated/events/EventSchedulePageContent.tsx`  
> **Design node:** `v399X3`  
> **Status:** Mock tasks with **local React state only** (changes lost on refresh)

---

## 1. Purpose

Full event checklist grouped by due-date buckets (Overdue, 45 days out, …, Completed). Same UX as leaflet `/leaflet/todo` but anchored on `events.starts_at`.

---

## 2. Reference implementation

**Copy from:**

- `src/components/leaflet/schedule/SchedulePageContent.tsx`
- `hooks/useTasks.ts` (leaflet-only today)
- `src/components/leaflet/leafletData.ts` → `groupScheduleTasks`

---

## 3. Database: `tasks`

| Column | Value for events |
|--------|------------------|
| `context` | `'event'` |
| `context_id` | `events.id` |
| `template_id` | FK to `task_templates` (nullable after spawn) |
| `title` | Task title |
| `description` | Subtitle / notes |
| `offset_days` | Days relative to **event start date** |
| `is_complete` | Checkbox state |
| `completed_at` | Set when checked |

### Due date formula

```ts
dueDate = startOfDay(events.starts_at) + offset_days
```

Use same `taskDueDate()` from `hooks/useTasks.ts` with `anchorDate = events.starts_at.slice(0,10)`.

### Grouping buckets

Reuse `groupScheduleTasks(tasks, anchorDate)`:

| Label | Condition |
|-------|-----------|
| Overdue | `dueDate < today && !is_complete` |
| N days out | Bucket by offset ranges (match leaflet grouping logic) |
| Completed | `is_complete === true` |

---

## 4. Generalize `useTasks`

Current signature:

```ts
useTasks(leafletId, distributionDate)
```

Target:

```ts
useTasks({
  context: 'leaflet' | 'event',
  contextId: string | null,
  anchorDate: string | null,
})
```

Query:

```ts
.from('tasks')
.select('*')
.eq('context', context)
.eq('context_id', contextId)
```

Toggle mutation: update `is_complete`, `completed_at` (already implemented).

---

## 5. Task spawn on event create

When `POST /api/events` runs, copy templates:

```sql
insert into tasks (context, context_id, template_id, title, description, offset_days)
select 'event', :eventId, id, title, description, offset_days
from task_templates
where context = 'event'
  and event_template_id = :templateId
  and is_active = true;
```

Seed templates in migration or admin UI.

---

## 6. Add task (UI)

Design shows “+ Add task” per group.

```ts
insert into tasks (context, context_id, title, offset_days, is_complete)
values ('event', :eventId, :title, :offsetDays, false);
```

Modal: title, due offset (or absolute date → compute offset from anchor).

### API

`POST /api/events/[id]/tasks`  
`PATCH /api/events/[id]/tasks/[taskId]`  
`DELETE /api/events/[id]/tasks/[taskId]` (optional)

Or use Supabase client directly from hook (match leaflet toggle pattern).

---

## 7. Wire `EventSchedulePageContent`

1. Remove `useState` mock tasks.
2. Load `event` for `starts_at` (from `EventContext` or `useEvent(eventId)`).
3. `const { tasks, toggleComplete, openCount } = useTasks({ context: 'event', ... })`.
4. `groupScheduleTasks(tasks, event.starts_at)`.
5. “Hide completed” / “Show completed” — same as leaflet schedule page.

---

## 8. Read-only mode

If event is completed (`ends_at < now()`), disable checkboxes and add buttons (match `LeafletContext.readOnly`).

---

## 9. Dependencies

- [events-list.md](./events-list.md) — event row + task spawn.
- [event-overview.md](./event-overview.md) — shares task data for preview card.
- `task_templates` seeded for `context = 'event'`.

---

## 10. Verification checklist

- [ ] Tasks load from DB for `context_id = eventId`.
- [ ] Due labels match `starts_at + offset_days`.
- [ ] Checkbox toggle persists after refresh.
- [ ] Overdue group shows correct styling.
- [ ] Add task creates new row.
- [ ] Completed section toggle works.
- [ ] Leaflet `/leaflet/todo` still works after `useTasks` generalization.

---

## 11. Files to touch

| File | Change |
|------|--------|
| `hooks/useTasks.ts` | Generalize context |
| `EventSchedulePageContent.tsx` | Wire hook |
| `leaflet/schedule/SchedulePageContent.tsx` | Update to new `useTasks` API |
| `src/lib/events/createEvent.ts` | Spawn tasks |
| `api/events/[id]/tasks/route.ts` | Optional CRUD |

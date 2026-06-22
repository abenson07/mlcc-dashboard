# Event Volunteers — Data Wiring Plan

> **Route:** `/events-hub/[eventId]/volunteers`  
> **Component:** `src/components/integrated/events/EventVolunteersPageContent.tsx`  
> **Design node:** `MgRVq`  
> **Status:** Mock hubs + table; **`useVolunteerAsks` exists**

---

## 1. Purpose

Manage volunteer **hubs** (roles/shifts) for an event and list individual signups with status filters.

Design maps **hub cards** → `volunteer_asks` and **table rows** → `volunteers` joined to `people`.

---

## 2. Database tables

### 2.1 `volunteer_asks` (= hub)

| Column | UI (hub card) |
|--------|---------------|
| `title` | Hub name (“Setup crew”) |
| `quantity` | Target slots |
| `commitment_quantity` + `commitment_unit` | “Min hours: N hrs” |
| `description` | Tooltip / card subtitle |
| `event_id` | Filter to current event |

**Registered count:** `COUNT(volunteers WHERE volunteer_ask_id = ask.id)`

### 2.2 `volunteers` (= signup)

| Column | UI (table) |
|--------|------------|
| `person_id` → `people.full_name` | Name |
| `volunteer_ask_id` → `volunteer_asks.title` | Volunteer hub |
| `people.email` | Email |
| `commitment_quantity` | Hours — **on ask, not volunteer row** |

**Hours column gap:** Design shows per-volunteer hours. Options:

1. Add `hours_committed numeric` to `volunteers` table.
2. Display ask’s `commitment_quantity` for all signups (approximation).
3. Defer hours column.

**Status gap:** Design shows Confirmed/Pending/Declined. Options:

1. Add `status enum` to `volunteers`.
2. Derive: all signups = Confirmed (v1).
3. Integrate volunteer ask email workflow (future).

**Recommend v1:** (2) all Confirmed; add `volunteers.status` migration for v2.

---

## 3. Existing infrastructure

| Piece | Location |
|-------|----------|
| Hook | `hooks/useVolunteerAsks.ts` — full CRUD + signups |
| API | `/api/volunteers/asks`, `/api/volunteers/asks/[id]` |
| Legacy UI | `/volunteers` admin page |

### 3.1 Event-scoped hook

```ts
export function useEventVolunteers(eventId: string) {
  const { asks, ...mutations } = useVolunteerAsks();
  const eventAsks = asks.filter(a => a.event_id === eventId);
  const allSignups = eventAsks.flatMap(a => 
    a.signups.map(s => ({ ...s, hub: a.title, hours: a.commitment_quantity }))
  );
  return { hubs: eventAsks, signups: allSignups, ...mutations };
}
```

Better: add `eventId` filter to API query to avoid loading all asks.

```sql
select ... from volunteer_asks where event_id = :eventId
```

---

## 4. UI wiring

### Hub cards row

Replace `MOCK_VOLUNTEER_HUBS`:

```ts
hubs.map(ask => ({
  name: ask.title,
  registered: ask.signup_count,
  minHours: ask.commitment_quantity,
  target: ask.quantity,
}))
```

“New volunteer hub” → modal:

```ts
createAsk({
  title, description, commitment_type, commitment_unit,
  commitment_quantity, quantity, event_id: eventId
})
```

### Table + tabs

| Tab | Filter |
|-----|--------|
| All | all signups |
| Confirmed | `status === 'confirmed'` (when column exists) |
| Pending | pending |
| Declined | declined |

v1: only “All” tab active; others disabled or same data.

---

## 5. Add volunteer flow

Design: per-hub signup. Modal:

1. Search `people` (reuse people search combobox).
2. `addSignup({ volunteer_ask_id, person_id })`.
3. Guard: `signup_count < quantity`.

Remove signup: `removeSignup(volunteerId)`.

---

## 6. Link to Supabase `events` row

Volunteer asks must reference dashboard `events.id`, not Webflow CMS id.

When migrating events:

```sql
update volunteer_asks
set event_id = :newSupabaseEventId
where event_id = :oldWebflowBackedId;
```

Or use `ensureSupabaseEventFromWebflow` when creating asks from legacy flows.

---

## 7. Do NOT use `event_volunteers`

Legacy table `event_volunteers` (person ↔ event only) lacks hub concept. **Use `volunteer_asks` + `volunteers` only.**

---

## 8. Dependencies

- [events-list.md](./events-list.md) — event row with Supabase id.
- [people.md](./people.md) — person search for add signup.

---

## 9. Optional migration

```sql
alter table public.volunteers
  add column if not exists status text not null default 'confirmed'
    check (status in ('confirmed', 'pending', 'declined')),
  add column if not exists hours numeric;
```

---

## 10. Verification checklist

- [ ] Hub cards show asks filtered to `event_id`.
- [ ] Registered count matches volunteers join.
- [ ] Create hub inserts `volunteer_asks` with correct `event_id`.
- [ ] Add signup creates `volunteers` row.
- [ ] Table shows correct person name/email.
- [ ] Cannot exceed `quantity` slots.
- [ ] Legacy `/volunteers` page still works.

---

## 11. Files to touch

| File | Change |
|------|--------|
| `EventVolunteersPageContent.tsx` | Wire `useEventVolunteers` |
| `hooks/useVolunteerAsks.ts` | Optional `eventId` filter param |
| `api/volunteers/asks/route.ts` | Support `?event_id=` query |
| Migration (optional) | `volunteers.status`, `hours` |

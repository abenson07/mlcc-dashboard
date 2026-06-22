# Event Overview — Data Wiring Plan

> **Route:** `/events-hub/[eventId]/overview`  
> **Component:** `src/components/integrated/events/EventOverviewPageContent.tsx`  
> **Layout:** `src/app/(admin)/events-hub/[eventId]/layout.tsx` + `EventSidebar`  
> **Design node:** `O7GJT`  
> **Status:** Mock widgets

---

## 1. Purpose

Event command center: hero, to-do preview, volunteer summary, budget/sponsorship rollup, marketing preview, and right-rail metadata (details, image, QR).

---

## 2. Provider: `EventProvider`

Create `src/components/integrated/events/EventContext.tsx` (mirror `LeafletContext`):

```ts
type EventContextValue = {
  eventId: string;
  event: EventEdition;           // mapped from events row
  readOnly: boolean;             // ends_at in past or status completed
  tasks: TaskUi[];
  tasksOpenTotal: number;
  toggleTask: (id: string) => void;
  volunteerAsks: VolunteerAskWithSignups[];  // filtered to eventId
  volunteerSignupTotal: number;
  budget: SponsorshipBudget;
  sponsors: SponsorUi[];
  marketingItems: MarketingItemUi[];  // Buffer + Resend
  refetchAll: () => Promise<void>;
};
```

Load in layout or dedicated provider wrapping `[eventId]/*` routes.

---

## 3. Primary table: `events`

| UI section | Columns / JSON |
|------------|----------------|
| Hero title | `name` |
| Days until event | `starts_at` vs `now()` |
| Date chip | `starts_at` formatted |
| Details panel — date/time | `starts_at`, `ends_at` |
| Location | `field_data.location` |
| Capacity | `field_data.capacity` |
| Status pill | `field_data.status` |
| Description | `field_data.description` |
| Event image | `field_data.image_url` |
| QR code | `qr_codes` row linked via `field_data.qr_code_id` |

### 3.1 QR code

On event create, optionally:

1. `INSERT qr_codes (name, url)` where `url` = public event page URL.
2. Store `field_data.qr_code_id`.

Reuse `MembershipQrDownload` patterns from leaflet (`hooks/useLeafletQr.ts`).

---

## 4. To-do checklist card

| UI | Data |
|----|------|
| Open count | `tasks` where `context='event'`, `context_id=eventId`, `is_complete=false` |
| Preview rows (2) | First 2 incomplete tasks by due date |
| “See all items” link | `/events-hub/[id]/schedule` |

### Hook: generalize `useTasks`

Extend `hooks/useTasks.ts`:

```ts
export function useTasks(
  context: 'leaflet' | 'event',
  contextId: string | null,
  anchorDate: string | null,  // distribution_date OR starts_at date
)
```

Due date: `anchorDate + offset_days` (same formula as leaflet).

Toggle: `PATCH` task via new `PATCH /api/events/[id]/tasks/[taskId]` or direct Supabase mutation.

---

## 5. Volunteers card

| UI | Data |
|----|------|
| “N signed up” | Sum of `volunteers` rows for asks where `event_id = eventId` |
| Preview list (3) | Top asks by signup count, show person name + ask title |
| Status dots | Derived: hub filled vs `quantity` |

### Hook

Filter existing `useVolunteerAsks()`:

```ts
asks.filter(a => a.event_id === eventId)
```

Or dedicated `useEventVolunteerAsks(eventId)` for efficiency:

```sql
select volunteer_asks.*, volunteers(*, people(*))
from volunteer_asks
left join volunteers on ...
where event_id = :eventId
```

---

## 6. Budget & sponsorships card

| UI | Data |
|----|------|
| Progress % | `raised / goal` from sponsorships |
| Goal / Raised / Pledged | `useEventSponsorships(eventId)` — copy `useLeafletSponsorships` |
| Available levels | Group `sponsorships` by `description` or tier field |

```ts
// hooks/useEventSponsorships.ts
supabase.from('sponsorships')
  .select('*, businesses(business_name, email)')
  .eq('event_id', eventId);
```

Status mapping: `pledged` | `paid` | `invoiced` → UI labels.

---

## 7. Marketing card

| UI row | Source |
|--------|--------|
| Date | `scheduled_at` or `created_at` |
| Status badge | Buffer/Resend status |
| Campaign name | Broadcast subject or Buffer caption |

### Aggregator

```ts
// Parallel fetch
const [broadcasts, bufferPosts] = await Promise.all([
  fetch('/api/marketing/email/broadcasts'),
  fetch('/api/buffer/posts?...'),
]);
// Filter to event — requires metadata link (gap)
```

**Gap:** Neither API filters by `event_id` today. Options:

1. Store `event_id` in Buffer post metadata / Resend broadcast metadata when scheduling from event.
2. v1: show all org campaigns (no filter) with disclaimer.
3. v1: hide marketing card until linked.

**Recommend:** v1 hide or show org-wide list; add `event_id` metadata in [event-marketing.md](./event-marketing.md).

---

## 8. Right panel mutations

| Action | API |
|--------|-----|
| Replace image | Upload → `field_data.image_url` PATCH |
| Edit description | PATCH `events.field_data` |
| Download QR | Generate from `qr_codes.url` (leaflet pattern) |

---

## 9. API routes

| Route | Purpose |
|-------|---------|
| `GET /api/events/[id]` | Full event + computed stats |
| `PATCH /api/events/[id]` | Update name, dates, field_data |

Optional BFF aggregates tasks + volunteers + sponsorships in one call to reduce waterfall.

---

## 10. Dependencies

- [events-list.md](./events-list.md) — event must exist.
- [event-schedule.md](./event-schedule.md) — full task list.
- [event-volunteers.md](./event-volunteers.md) — volunteer data.
- [event-sponsorship.md](./event-sponsorship.md) — budget numbers.

---

## 11. Verification checklist

- [ ] Hero shows correct `name` and countdown from `starts_at`.
- [ ] Task preview matches `tasks` table (toggle updates DB).
- [ ] Volunteer count matches `volunteers` join count.
- [ ] Budget numbers match `sponsorships` aggregation.
- [ ] Details panel fields match `field_data`.
- [ ] QR download works when `qr_code_id` set.
- [ ] Read-only when event completed.

---

## 12. Files to touch

| File | Change |
|------|--------|
| `EventContext.tsx` | New provider |
| `EventOverviewPageContent.tsx` | Consume context |
| `hooks/useTasks.ts` | Generalize for event context |
| `hooks/useEventSponsorships.ts` | New |
| `src/app/api/events/[id]/route.ts` | GET/PATCH |

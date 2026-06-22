# Event Sponsorship — Data Wiring Plan

> **Route:** `/events-hub/[eventId]/sponsorship`  
> **Component:** `src/components/integrated/events/EventSponsorshipPageContent.tsx`  
> **Design node:** `p143P`  
> **Status:** Mock data; **leaflet sponsorship page is fully wired — reuse patterns**

---

## 1. Purpose

Event-scoped sponsorship dashboard: budget summary, tier availability, sponsors table with tabs, invoices table with tabs.

---

## 2. Reference implementation

**Copy from:** `src/components/leaflet/sponsorships/SponsorshipsPageContent.tsx` + `LeafletContext` sponsorship/invoice mappers.

Key differences: filter by `sponsorships.event_id` instead of `leaflet_id`, and Stripe metadata `event_id`.

---

## 3. Database: `sponsorships`

| Column | UI |
|--------|-----|
| `business_id` → `businesses` | Business name, contact email |
| `event_id` | Scope filter |
| `amount` | Dollar amount |
| `status` | `pledged` \| `invoiced` \| `paid` → Paid/Pledged/Pending tabs |
| `description` | Sponsorship **level** (Platinum, Gold, …) |
| `quantity` | Slots at tier |
| `memo` | Internal notes |
| `paid_date` | Paid tab sorting |

### Query

```ts
supabase.from('sponsorships')
  .select(`
    *,
    businesses ( id, business_name, email, contact_name )
  `)
  .eq('event_id', eventId);
```

### Budget rollup

Same as `useLeafletSponsorships`:

```ts
goal = sum(amount) or configured goal from field_data
raised = sum(amount) where status = 'paid'
pledged = sum(amount) where status = 'pledged'
progressPct = raised / goal * 100
```

**Goal gap:** Design shows $15,000 goal. Store in `events.field_data.sponsorship_goal_cents` or sum of tier amounts.

### Tier availability

Group by `description` (tier name):

```ts
tiers = groupBy(sponsorships, s => s.description)
remaining = tier.quantity - count(paid + pledged at tier)
```

If tiers are not pre-seeded rows, define in `event_templates.default_field_data.sponsorship_tiers`.

---

## 4. Stripe invoices

### Existing API

`GET /api/stripe/invoices` returns dashboard-tagged invoices with metadata:

| Metadata key | Value |
|--------------|-------|
| `category` | `Event Sponsorship` |
| `event_id` | **Currently Webflow CMS id** — migrate to Supabase `events.id` |
| `sponsorship_id` | `sponsorships.id` |
| `created_by` | User display name |

### Filter for event page

```ts
invoices.filter(inv => 
  inv.event_id === eventId || 
  inv.event_id === event.webflow_item_id  // transition
);
```

Extract mapper from `LeafletContext` lines 273–298 into `src/lib/stripe/mapInvoicesForUi.ts`.

### Issue invoice

Reuse `POST /api/stripe/invoices/issue` with metadata:

```json
{
  "category": "event",
  "event_id": "<supabase-events-id>",
  "event_name": "<event.name>",
  "sponsorship_id": "<uuid>"
}
```

Update `invoiceDashboardMetadata.ts` if needed to accept Supabase UUID alongside Webflow id.

---

## 5. Sponsor table tabs

| Tab | Filter |
|-----|--------|
| All | no filter |
| Paid | `status === 'paid'` |
| Pledged | `status === 'pledged'` |
| Pending | `status === 'invoiced'` or null |

Map DB enum to UI labels (leaflet page already does this).

---

## 6. Invoice table tabs

| Tab | Stripe `status` |
|-----|-----------------|
| Paid | `paid` |
| Sent | `open` |
| Overdue | `open` + `due_date < now` or `uncollectible` |
| Draft | `draft` |

Same mapping as leaflet `SponsorshipsPageContent`.

---

## 7. Hook: `useEventSponsorships`

```ts
export function useEventSponsorships(eventId: string | null) {
  // sponsorships query (Supabase)
  // invoices query (Stripe API, client-side filter)
  return { sponsors, invoices, budget, tiers, loading, refetch };
}
```

Optional: wrap in `EventContext` (see event-overview plan).

---

## 8. Mutations

| UI | Action |
|----|--------|
| Add sponsor | Insert `sponsorships` row + pick `businesses` |
| Issue invoice | `POST /api/stripe/invoices/issue` |
| Mark paid | Update `sponsorships.status` (or Stripe webhook) |

Reuse patterns from `/(others-pages)/sponsorship/invoices/new`.

---

## 9. Copy sponsorships on event create

Mirror leaflet create behavior:

When spawning event from template, copy prior event’s sponsorship rows **or** seed empty tier placeholders.

```sql
insert into sponsorships (event_id, description, amount, quantity, status)
select :newEventId, description, amount, quantity, 'pledged'
from sponsorships where event_id = :previousEventId;
```

---

## 10. Dependencies

- [events-list.md](./events-list.md)
- `businesses` table populated (existing business outreach flows)
- Stripe env configured
- [event-overview.md](./event-overview.md) — budget card shares data

---

## 11. Verification checklist

- [ ] Budget card numbers match Supabase sponsorship sums.
- [ ] Sponsor tabs filter correctly.
- [ ] Issue invoice creates Stripe row with correct metadata.
- [ ] Invoice appears in table after issue.
- [ ] Leaflet sponsorship page unaffected (regression).
- [ ] Webflow-era invoices still display during migration (dual id filter).

---

## 12. Files to touch

| File | Change |
|------|--------|
| `hooks/useEventSponsorships.ts` | New |
| `EventSponsorshipPageContent.tsx` | Wire hook (copy leaflet component) |
| `src/lib/stripe/mapInvoicesForUi.ts` | Extract shared mapper |
| `api/stripe/invoices/issue/route.ts` | Accept Supabase event id |

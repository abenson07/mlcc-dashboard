# Leaflet Sponsorships — Data Wiring Plan

> **Route:** `/leaflet/sponsorships`  
> **Component:** `src/components/leaflet/sponsorships/SponsorshipsPageContent.tsx`  
> **Design node:** `xSpNP`  
> **Status:** ✅ **Wired to live data**

---

## 1. Purpose

Leaflet-scoped sponsorship budget, sponsors table with tabs, invoices table, tier breakdown in right panel.

---

## 2. Data flow

```
LeafletContext
  → useLeafletSponsorships(leafletId)
  → sponsorships + businesses join
  → Stripe GET /api/stripe/invoices (filter leaflet_id)
  → mapSponsors, buildSponsorshipTiers
```

---

## 3. Tables & APIs

| Source | Filter |
|--------|--------|
| `sponsorships` | `leaflet_id = selected` |
| `businesses` | join on `business_id` |
| Stripe invoices | `metadata.leaflet_id` |

### Sponsorship columns

| Column | UI |
|--------|-----|
| `business_id` → name | Business |
| `businesses.email` | Contact |
| `description` | Level |
| `amount` | Amount |
| `status` | Paid / Pledged / tabs |

### Budget

```ts
goal = sum(sponsorship amounts) or configured goal
raised = paid sum
pledged = pledged sum
progress = raised / goal
```

From `useLeafletSponsorships` + `buildBudget`.

---

## 4. Invoices

Mapper in `LeafletContext` (lines 273–298):

| Stripe status | UI label |
|---------------|----------|
| `paid` | Paid |
| `open` | Sent |
| `draft` | Draft |
| `uncollectible` | Overdue |

Issue new: `POST /api/stripe/invoices/issue` with `leaflet_id` metadata.

---

## 5. Copy on leaflet create

New leaflet copies sponsorship rows from previous closed edition (`createLeaflet` lib) — pledges reset per product rules.

---

## 6. Relation to event sponsorship plan

Event page should copy this implementation with `event_id` filter — see [event-sponsorship.md](./event-sponsorship.md).

---

## 7. Gaps / enhancements

| Item | Notes |
|------|-------|
| Add sponsor UI | May link to existing `/sponsorship/invoices/new` |
| Tier config | Derived from sponsorship rows — no separate tiers table |
| Previous tab | Sponsors from prior leaflets — filter `status` or separate query |

---

## 8. Verification checklist

- [ ] Only current leaflet sponsorships shown.
- [ ] Invoice list filtered by `leaflet_id` metadata.
- [ ] Tabs filter sponsor rows correctly.
- [ ] Tier panel counts match sponsorship descriptions.
- [ ] Issue invoice appears after Stripe create.

---

## 9. Files (reference)

| File | Role |
|------|------|
| `sponsorships/SponsorshipsPageContent.tsx` | UI |
| `hooks/useLeafletSponsorships.ts` | Supabase query |
| `api/stripe/invoices/route.ts` | Invoice list |
| `lib/stripe/invoiceDashboardMetadata.ts` | Metadata keys |

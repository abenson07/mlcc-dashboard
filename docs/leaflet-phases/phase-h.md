# Phase H — Sponsorships + Stripe metadata

**Goal:** Per-leaflet sponsorship dashboard with budget summary, sponsor/invoice tables, Stripe issue flow.

**Depends on:** Phases B, C.

**Design node:** `xSpNP`.

---

## YOUR TASKS

| # | Task | When |
|---|------|------|
| H.1 | Confirm Stripe env vars in `.env.local` (already used elsewhere) | Batch 1 if not set |
| H.2 | Batch **3** — Sponsorships page loads; try issuing a test invoice to yourself | After agent done |
| H.3 | **⏸ Before Phase I:** complete Batch **2.1** (Resend template IDs) | [00-human-checklist.md](./00-human-checklist.md) |

---

## AGENT TASKS

### Hook

1. **`useLeafletSponsorships.ts`** — CRUD scoped to `leaflet_id`; filter by status tabs.

### Stripe metadata

2. Extend `src/lib/stripe/invoiceDashboardMetadata.ts`:
   - `leaflet_id`, `sponsorship_id` in `METADATA_KEYS`
   - Require `leaflet_id` when `category = leaflet`
3. Update `src/app/api/stripe/invoices/issue/route.ts` for leaflet sponsorships.

### Components (`src/components/leaflet/sponsorships/`)

4. **Budget summary** — goal, raised, pledged, progress bar.
5. **Sponsors table** — tabs: All / Paid / Pledged / Previous.
6. **Invoices table** — tabs: All / Paid / Sent / Overdue / Draft.
7. **Tier breakdown** panel (Platinum / Gold / Silver / Bronze) — reuse sponsorship tier logic from `SponsorshipHubContent` where possible.

### Page

8. `sponsorships/page.tsx`.

### Copy on create

9. Ensure `createLeaflet` copies prior sponsorships with `status = 'pledged'` (Phase B; verify here).

---

## VERIFICATION

| Check | Who |
|-------|-----|
| Sponsorships filtered to selected `leaflet_id` | Agent |
| Invoice metadata includes `leaflet_id` | Agent |
| Test invoice creates in Stripe dashboard | You (H.2) |

---

## HANDOFF → Phase I

**Pause point:** You paste Resend template IDs (Batch 2.1), then agent implements Phase I.

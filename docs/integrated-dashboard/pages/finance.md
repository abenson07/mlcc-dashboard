# Finance — Data Wiring Plan

> **Route:** `/finance`  
> **Component:** `src/components/integrated/finance/FinancePageContent.tsx`  
> **Design:** Finance / revenue dashboard (integrated pen + topbar revenue icon)  
> **Status:** Mock metrics and transactions

---

## 1. Purpose

Organization-wide financial overview: balances, income/expense metrics, transaction list, and sidebar navigation to invoices, memberships, sponsorships, reports.

**Note:** This overlaps with existing legacy pages:

| Legacy route | Focus |
|--------------|-------|
| `/billing/invoices` | Stripe invoices |
| `/sponsorship/invoices` | Sponsorship invoices |
| `/commerce/fundraising` | Fundraising donations |
| `/neighbors/members` | Memberships |

Finance mode should **aggregate** these, not replace detailed workflows initially.

---

## 2. Current UI (mock)

| Element | Mock |
|---------|------|
| Metrics cards | Hardcoded dollar amounts |
| Transactions table | 3 fake rows |
| Sidebar nav | Links to `/finance/invoices`, etc. (routes may not exist) |
| “New invoice” | No-op |

---

## 3. Data sources

### 3.1 Stripe Invoices

**API:** `GET /api/stripe/invoices`

Aggregate:

```ts
totalOutstanding = sum(amount_due) where status = 'open'
totalPaidMTD = sum(amount_paid) where paid in current month
```

Filter dashboard-tagged invoices only (`invoiceHasDashboardTags`).

### 3.2 Stripe Subscriptions / Memberships

**API:** `GET /api/stripe/duplicate-members` (edge case)  
**DB:** `memberships` table — active count, MRR estimate from `stripe_tier_id`.

No single MRR API today — may need new `GET /api/finance/memberships-summary`.

### 3.3 Sponsorships (Postgres)

```sql
select status, sum(amount) from sponsorships group by status;
```

Across **all** `event_id` and `leaflet_id` scopes.

### 3.4 Fundraising donations

**Table:** `fundraising_donations`  
**API:** `GET /api/commerce/fundraising-donations`

```ts
paidTotal = sum(amount_cents) where status = 'paid'
```

### 3.5 Payments (Postgres)

**Table:** `payments` — person/membership payments not through Stripe invoices.

```sql
select date, amount, memo, type, method, person_id
from payments
order by date desc
limit 50;
```

Use for “transactions” table if not all flows go through Stripe.

---

## 4. Recommended API: `GET /api/finance/summary`

BFF endpoint returning:

```json
{
  "metrics": {
    "membershipMrrCents": 0,
    "sponsorshipRaisedCents": 0,
    "sponsorshipPledgedCents": 0,
    "fundraisingPaidCents": 0,
    "invoicesOpenCents": 0
  },
  "recentTransactions": [
    {
      "id": "...",
      "date": "2026-01-12",
      "label": "Main Street Bakery — Invoice INV-1042",
      "category": "Sponsorship",
      "amountCents": 250000,
      "status": "paid",
      "source": "stripe_invoice"
    }
  ]
}
```

Build `recentTransactions` by merging:

1. Recent paid Stripe invoices (dashboard-tagged).
2. Recent `fundraising_donations` (paid).
3. Recent `payments` rows.

Sort by date desc, limit 25.

---

## 5. Sidebar sub-routes

Create stub pages or redirect to legacy:

| Finance nav | Target (v1) |
|-------------|-------------|
| Overview | `/finance` |
| Invoices | `/billing/invoices` or new `/finance/invoices` |
| Memberships | `/neighbors/members` |
| Sponsorships | `/sponsorship` |
| Reports | Defer / export CSV |

---

## 6. Topbar revenue icon

`IntegratedTopbar` dollar icon should link to `/finance` (currently no-op button).

---

## 7. UI → data mapping

| Mock metric | Real source |
|-------------|-------------|
| Total balance | **Undefined** — nonprofit may not use “balance”; replace with “YTD revenue” |
| Monthly income | Sum paid invoices + fundraising + payments in month |
| Monthly expenses | **Gap** — no expenses table; hide or manual `print_cost_cents` sum from leaflets |
| Savings rate | Defer — not meaningful without expenses |
| Total debt | Defer |

**Recommend:** Replace generic finance metrics with MLCC-specific:

- Active memberships count
- Sponsorship raised (YTD)
- Fundraising (YTD)
- Open invoices total

---

## 8. Dependencies

- Stripe configured.
- Leaflet + event sponsorship flows producing invoices.
- `fundraising_donations` populated from public checkout.

---

## 9. Out of scope (v1)

- Double-entry accounting.
- Expense tracking / QuickBooks sync.
- Budget forecasting charts.

---

## 10. Verification checklist

- [ ] Metrics reflect live Stripe + Supabase sums.
- [ ] Transaction list shows real recent activity.
- [ ] Sidebar links reach working pages.
- [ ] Topbar revenue icon opens `/finance`.
- [ ] No hardcoded dollar strings in component.

---

## 11. Files to touch

| File | Change |
|------|--------|
| `FinancePageContent.tsx` | Wire `useFinanceSummary` |
| `hooks/useFinanceSummary.ts` | New |
| `api/finance/summary/route.ts` | New BFF |
| `IntegratedTopbar.tsx` | Link dollar icon |
| `finance/invoices/page.tsx` | Optional sub-route |

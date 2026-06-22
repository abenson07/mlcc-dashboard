# People — Data Wiring Plan

> **Route:** `/people`  
> **Component:** `src/components/integrated/people/PeoplePageContent.tsx`, `PersonDetailPanel.tsx`, `PeopleSidebar.tsx`  
> **Design nodes:** `PZR3p` (list), `B0N7uL` (detail selected)  
> **Status:** Mock data in `mockData.ts`; **`usePeople` hook already exists**

---

## 1. Purpose

Master-detail CRM view for neighbors/members: searchable table + 300px detail panel. Sidebar filters by segment (members, volunteers, donors, etc.).

---

## 2. Current UI (mock)

| Element | Mock source |
|---------|-------------|
| Table rows | `MOCK_PEOPLE` |
| Row selection | Local `useState(selectedId)` |
| Search / status filter | Client-side on mock array |
| Detail panel | `PersonDetailPanel` from selected mock person |
| Sidebar filters | Buttons with no data effect |
| “64 people” ribbon | Hardcoded count |
| Colored dots | `person.dotColor` — **no DB column** |

---

## 3. Database tables

### 3.1 Primary: `people`

| Column | UI column / field |
|--------|-------------------|
| `id` | Row key, selection |
| `full_name` | Name |
| `address` | Address |
| `email` | Email |
| `phone` | Phone |
| `roles` | Derive sidebar filters + detail “role” |
| `tags` | Optional colored dot mapping |
| `membership_id` | Join to memberships |
| `created_at` | “Member since” fallback |

### 3.2 Join: `memberships`

| Column | UI field |
|--------|----------|
| `status` | Table “Status” + detail badge |
| `tier` | Detail “Type” (map tier → Household/Individual) |
| `start_date` | “Member since” |
| `last_renewal` | “Renewed” |
| `stripe_customer_id` | Finance cross-link (future) |

### 3.3 Join: `payments` (donation history)

| Column | UI field |
|--------|----------|
| `amount` | Donation amount |
| `date` | Donation date |
| `memo` | Donation label |
| `type` | Filter donation vs dues |

Query:

```sql
select * from payments
where person_id = :personId
order by date desc
limit 10;
```

**Gap:** Detail panel shows `birthday` — **not on `people` table**. Either add `birthday date` column or remove from UI until supported.

---

## 4. Existing hook: `usePeople`

Location: `hooks/usePeople.ts`

Already supports:

- `search` on name, email, address
- `hasMembership`, `membershipId`, `membershipStatus` filters
- `create`, `update`, `delete` mutations
- Joins `memberships` into `PersonWithMembership`

### 4.1 Extend hook

| Extension | Purpose |
|-----------|---------|
| `filters.roles?: string[]` | Sidebar “Volunteers”, “Donors” |
| `filters.tags?: string[]` | Tag-based segments |
| `usePersonPayments(personId)` | Donation history panel |
| `count` in return value | Topbar “N people” ribbon |

Sidebar filter mapping:

| Sidebar label | Filter logic |
|---------------|--------------|
| All people | No filter |
| All households | `membership.tier` = household **or** group by address (TBD) |
| Members | `hasMembership: true`, `membershipStatus: 'active'` |
| Volunteers | `roles` contains `'volunteer'` |
| Donors | `roles` contains `'donor'` OR `payments` exist |
| Contacted members | `tags` contains `'contacted'` |
| Business owners | Join `businesses` on email (stretch) |
| Duplicate members | Reuse `GET /api/stripe/duplicate-members` |

---

## 5. UI → data mapping

### Table

```ts
people.map(p => ({
  id: p.id,
  name: p.full_name,
  address: p.address ?? '—',
  email: p.email ?? '—',
  phone: p.phone ?? '—',
  status: p.membership?.status ?? 'Non-member',
  dotColor: tagToColor(p.tags?.[0]), // deterministic hash if no tags
}))
```

### Detail panel

| UI field | Source |
|----------|--------|
| Name | `full_name` |
| Role | `roles[0]` or joined label |
| Member since | `membership.start_date` or `created_at` |
| Address, email, phone | direct columns |
| Birthday | **Gap** — hide or new column |
| Membership status | `membership.status` |
| Type | `membership.tier` |
| Renewed | `membership.last_renewal` |
| Donations | `payments` query |

### URL state

Persist selection in query param for shareable links:

```
/people?selected=<uuid>
```

Update `setSelectedId` → `router.push` with query param.

---

## 6. Mutations

| UI action | API |
|-----------|-----|
| Add neighbor / Add person | `usePeople.create()` |
| Edit (detail panel) | `usePeople.update()` — modal with form |
| Export | Client CSV from filtered `people` array |
| Sidebar filters | Update hook filters + refetch |

---

## 7. Colored dots

Design shows per-person colored dots. Options:

1. **Map first tag** to a fixed color palette.
2. **Map `membership.status`** (active=green, pending=amber).
3. **Store `color` in `tags`** as hex (hacky).

Recommend (2) for v1 with tag override if present.

---

## 8. Households

No `households` table. “All households” options:

| Approach | Effort |
|----------|--------|
| Filter `membership.tier = 'household'` | Low |
| Group people by normalized `address` | Medium |
| New `households` table + FK | High |

**Recommend:** tier filter for v1; document household grouping as v2.

---

## 9. Dependencies

- None blocking — `people` + `memberships` exist.
- Optional: `payments` query for donations.
- Coordinate with legacy `/neighbors/*` — same data, different UI.

---

## 10. Migration needs

| Change | Required? |
|--------|-----------|
| `people.birthday` | Optional |
| `households` table | Defer |
| Index on `people.roles` (GIN) | Nice-to-have if filtering slow |

---

## 11. Verification checklist

- [ ] Table loads all people from Supabase (compare count to Table Editor).
- [ ] Search filters server-side via `usePeople({ filters: { search } })`.
- [ ] Status dropdown filters by `membership.status`.
- [ ] Row click updates detail panel with correct joins.
- [ ] `?selected=` survives refresh.
- [ ] Add person creates row visible in table.
- [ ] Donation history shows `payments` rows when present.
- [ ] Sidebar “Members” matches `/neighbors/members` count approximately.

---

## 12. Files to touch

| File | Change |
|------|--------|
| `PeoplePageContent.tsx` | Replace `MOCK_PEOPLE` with `usePeople` |
| `PersonDetailPanel.tsx` | Accept `PersonWithMembership` + payments |
| `PeopleSidebar.tsx` | Wire filters to URL params or context |
| `hooks/usePeople.ts` | Extend filters, count |
| `hooks/usePersonPayments.ts` | New (optional) |

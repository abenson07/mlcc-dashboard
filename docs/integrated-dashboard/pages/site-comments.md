# Site Comments — Data Wiring Plan

> **Route:** `/site/comments`  
> **Component:** `src/components/integrated/site/SiteCommentsPageContent.tsx`  
> **Design node:** `mhtPv`  
> **Status:** Mock comments from `MOCK_SITE_COMMENTS`

---

## 1. Purpose

Split view: **site canvas** (left) + **comments column** (right, 300px). Comments are internal review notes about the website — who said what, when, with edit/delete.

---

## 2. Current UI (mock)

| Element | Mock behavior |
|---------|---------------|
| Comment cards | `MOCK_SITE_COMMENTS` static array |
| “···” menu | Local `useState` toggle; Edit/Delete no-ops |
| “+” add button | No-op |
| Canvas | Empty (same as `/site`) |

---

## 3. Schema gap — must decide first

**There is no `site_comments` table today.**

### Option A — Postgres (recommended)

```sql
create table public.site_comments (
  id uuid primary key default gen_random_uuid(),
  author_user_id uuid references auth.users (id) on delete set null,
  author_display_name text not null,  -- denormalized for list speed
  body text not null,
  page_path text,                     -- optional: which page the comment refers to
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index site_comments_created_at_idx on public.site_comments (created_at desc);
```

RLS: authenticated users can CRUD (match leaflet tables).

### Option B — External (Linear, Notion)

Only if product explicitly wants tickets elsewhere. **Not recommended** — breaks offline dashboard UX.

### Option C — Defer

Keep mock data until schema approved.

---

## 4. Data model (Option A)

| Column | UI mapping |
|--------|------------|
| `author_display_name` | Card header name |
| `body` | Card body text |
| `created_at` | Footer date (“Jun 10”) |
| `resolved` | “Show resolved” filter (design shows this in dropdown) |
| `page_path` | Future: anchor comment to site section |

---

## 5. API design

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/site/comments` | GET | `?resolved=false` | `{ comments: SiteComment[] }` |
| `/api/site/comments` | POST | `{ body, page_path? }` | Created row |
| `/api/site/comments/[id]` | PATCH | `{ body?, resolved? }` | Updated row |
| `/api/site/comments/[id]` | DELETE | — | 204 |

**Author on create:** Set `author_user_id` from session; `author_display_name` from `user.user_metadata.full_name` or email.

---

## 6. Hook: `useSiteComments`

```ts
type SiteComment = {
  id: string;
  author: string;
  body: string;
  date: string;      // formatted created_at
  resolved: boolean;
};

// useSiteComments({ showResolved: boolean })
// - list via GET
// - create, update, delete mutations
// - invalidate on success
```

Use TanStack Query (match `usePeople` pattern).

---

## 7. Wire `SiteCommentsPageContent`

1. Replace `MOCK_SITE_COMMENTS` with `useSiteComments()`.
2. “+” opens inline composer or modal → `POST`.
3. Edit → inline edit or modal → `PATCH`.
4. Delete → confirm → `DELETE`.
5. Add “Show resolved” toggle in header → filter query param or client filter.
6. Reuse `useSiteWorkspace()` for left canvas iframe (same as site.md).

---

## 8. Real-time (optional)

Supabase Realtime on `site_comments` for collaborative editing. **Not required v1** — manual refetch after mutations is enough.

---

## 9. Security

- Only authenticated admin users (existing middleware).
- Users can only delete own comments **or** any admin can delete (product decision — default: any authenticated admin).

---

## 10. Dependencies

- [site.md](./site.md) — shared canvas preview.
- Migration for `site_comments` if Option A.

---

## 11. Verification checklist

- [ ] Comments persist across refresh.
- [ ] New comment shows current user as author.
- [ ] Edit updates `body` and `updated_at`.
- [ ] Delete removes card.
- [ ] Resolved filter works.
- [ ] Left canvas shows site preview (not empty box).

---

## 12. Files to touch

| File | Change |
|------|--------|
| `supabase/migrations/…_site_comments.sql` | New table |
| `schemas/site_comments.ts` | New |
| `hooks/useSiteComments.ts` | New |
| `src/app/api/site/comments/route.ts` | New |
| `src/app/api/site/comments/[id]/route.ts` | New |
| `SiteCommentsPageContent.tsx` | Wire hook |

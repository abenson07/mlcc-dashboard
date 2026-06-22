# Stories — Data Wiring Plan

> **Route:** `/stories`  
> **Component:** `src/components/integrated/stories/StoriesPageContent.tsx`  
> **Design:** Topbar tab exists; pen has limited stories screens  
> **Status:** Empty state placeholder — **deferred v2 per product plan**

---

## 1. Purpose

“Stories” mode covers **marketing content** for the public site: blog posts, news stories, social content calendar, and possibly website story sections. Product decision (leaflet plan §7): **postponed v1**.

This plan documents wiring options for when you implement it.

---

## 2. Current UI

Empty state message: “Marketing stories and website content will live here.”

No sidebar, no list, no editor.

---

## 3. Data source options

### Option A — Webflow CMS collection (existing pattern)

Stories live in Webflow like events/banners today.

| Piece | Implementation |
|-------|----------------|
| List stories | New `GET /api/stories/webflow` (copy events webflow route) |
| Edit story | Webflow item API |
| Publish | `publishCollectionItemIds` |

Env: `WEBFLOW_STORIES_COLLECTION_ID`.

**Pros:** Matches current CMS strategy. **Cons:** Being migrated off Webflow.

### Option B — Postgres `stories` table (dashboard-native)

```sql
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  body_html text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  published_at timestamptz,
  hero_image_url text,
  author_user_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Pros:** Full dashboard control. **Cons:** Need public site rendering path (not Webflow).

### Option C — Aggregator view (Buffer + Resend + Webflow)

Stories page = unified **content calendar** without owning body text:

| Source | Shows |
|--------|-------|
| Buffer posts | Social stories |
| Resend broadcasts | Email stories |
| Webflow blog items | Site stories |

**Pros:** Reuses existing APIs. **Cons:** No single editor.

---

## 4. Recommended phased approach

| Phase | Deliverable |
|-------|-------------|
| **Stories v1** | Option C — read-only calendar list across channels |
| **Stories v2** | Option B — native CRUD + publish pipeline |
| **Stories v3** | Deprecate Webflow stories collection |

---

## 5. UI sketch (v1 calendar)

| Component | Data |
|-----------|------|
| Month list | Merged scheduled items |
| Story row | title, channel icon, status, date |
| Filter tabs | All / Social / Email / Website |
| Create | Dropdown: New social / New email / New site story |

Reuse layout from [events-list.md](./events-list.md) calendar column patterns.

---

## 6. Sidebar (future)

Pen may show stories-specific nav. Tentative:

- All stories
- Drafts
- Scheduled
- Published
- Settings

No DB until Option B.

---

## 7. Dependencies

- [event-marketing.md](./event-marketing.md) — overlapping Buffer/Resend data.
- Product decision on Webflow vs native CMS.
- Public site must render stories from chosen source.

---

## 8. Out of scope until v2

- Full rich-text editor in dashboard.
- Live website publish automation.
- Sanity or third-party CMS.

---

## 9. Verification checklist (when implemented)

- [ ] List loads from chosen source(s).
- [ ] Filters work per channel.
- [ ] Create flow reaches external API or inserts DB row.
- [ ] Empty state removed when data exists.

---

## 10. Files to touch (future)

| File | Change |
|------|--------|
| `StoriesPageContent.tsx` | Replace empty state |
| `hooks/useStories.ts` | New |
| `api/stories/*` or webflow route | New |
| Migration | If Option B |

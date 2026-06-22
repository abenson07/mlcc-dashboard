# Site — Data Wiring Plan

> **Route:** `/site`  
> **Component:** `src/components/integrated/site/SitePageContent.tsx`  
> **Design node:** `bi8Au`  
> **Status:** Mock UI only

---

## 1. Purpose

The Site mode is the **website management canvas** — a preview/workspace for the public MLCC site. Today it renders an empty card with a “Canvas permissions” affordance. The goal is to embed or link to the live site preview and surface site-level actions (publish, permissions, comments toggle).

---

## 2. Current UI (mock)

| Element | Behavior today | Target |
|---------|----------------|--------|
| Topbar context ribbon “MLCC Website” | Static button | Site selector if multiple Webflow sites (future) |
| “Comments” button | Links to `/site/comments` | Keep — wired to real comments store |
| Canvas area | Empty gray box | iframe preview or Webflow designer deep-link |
| “Canvas permissions” | No-op button | Role/permission UI (defer v1) |

---

## 3. Data sources

### 3.1 Primary: Webflow (existing)

The public website is on **Webflow**. Existing integrations:

| Asset | API / lib | Notes |
|-------|-----------|-------|
| Site ID | `getWebflowSiteId()` in `src/lib/webflow/env.ts` | Required env var |
| Banners collection | `GET/POST /api/banners` | Committee/site banners |
| Events CMS | `GET/POST /api/events/webflow` | Being migrated to Supabase `events` |
| Image upload | `POST /api/events/webflow/upload-image` | Reuse for site assets |

**There is no `sites` table in Postgres.** Site metadata lives in Webflow + env config.

### 3.2 Secondary: Supabase (optional)

If you want dashboard-native site settings later:

```sql
-- Optional future table (NOT in migrations today)
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  webflow_site_id text not null unique,
  display_name text not null,
  preview_url text,
  updated_at timestamptz not null default now()
);
```

**Recommendation for v1:** Skip new table; hardcode display name from env (`WEBFLOW_SITE_NAME`) or Webflow Sites API.

---

## 4. Implementation plan

### 4.1 Hook: `useSiteWorkspace`

```ts
// hooks/useSiteWorkspace.ts
type SiteWorkspace = {
  siteName: string;
  previewUrl: string;       // e.g. https://mlcc.org or Webflow staging URL
  designerUrl: string | null; // Webflow designer deep link if available
  loading: boolean;
};
```

**Fetch strategy:**

1. Server component or API `GET /api/site/workspace` returns `{ siteName, previewUrl }` from env.
2. Optional: call Webflow Sites API for published domain (requires `WEBFLOW_API_TOKEN`).

### 4.2 Canvas preview options

| Option | Pros | Cons |
|--------|------|------|
| **iframe** `previewUrl` | Matches design “canvas” | X-Frame-Options may block |
| **Screenshot thumbnail** via Webflow | Always renders | Not live |
| **“Open in Webflow”** external link | Zero iframe issues | Leaves dashboard |

**Recommended v1:** iframe with fallback message + “Open site in new tab” link.

### 4.3 Wire `SitePageContent`

1. Replace static canvas with `useSiteWorkspace()` data.
2. Context ribbon shows `siteName` from hook.
3. “Comments” stays as navigation to `/site/comments`.
4. “Canvas permissions” → toast “Coming soon” or hide until RBAC exists.

### 4.4 API route (new)

`GET /api/site/workspace`

```json
{
  "siteName": "MLCC Website",
  "previewUrl": "https://www.mlcc.org",
  "designerUrl": null
}
```

Auth: `requireSession()` (same as other admin APIs).

---

## 5. UI → data mapping

| UI field | Source |
|----------|--------|
| Context ribbon label | `siteName` from env/API |
| Canvas iframe `src` | `previewUrl` |
| Comments toggle | Route only — no data |

---

## 6. Mutations (v1 scope)

| Action | v1 |
|--------|-----|
| Publish site | Defer — Webflow publish is destructive; confirm with user |
| Edit permissions | Defer |
| Replace preview | N/A |

---

## 7. Dependencies

- [site-comments.md](./site-comments.md) for comments panel (independent).
- Webflow env vars configured (`.env.example`).

---

## 8. Out of scope (v1)

- In-dashboard Webflow CMS editing (use existing `/features/website`, `/features/banners`).
- Multi-site switching.
- Version history / audit log.

---

## 9. Verification checklist

- [ ] `/site` loads preview URL without auth errors.
- [ ] iframe displays site or shows clear fallback if blocked.
- [ ] Context ribbon shows configured site name.
- [ ] “Comments” navigates to `/site/comments`.
- [ ] No mock imports from `mockData.ts`.

---

## 10. Files to touch (when implementing)

| File | Change |
|------|--------|
| `src/components/integrated/site/SitePageContent.tsx` | Use hook, iframe |
| `hooks/useSiteWorkspace.ts` | New |
| `src/app/api/site/workspace/route.ts` | New |
| `.env.example` | `NEXT_PUBLIC_SITE_PREVIEW_URL` |

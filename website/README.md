# website (Astro)

New public site for MLCC, replacing the Next-based `mlcc-website/` at cutover.
Content comes from Sanity; Studio + Presentation live in the dashboard at `/admin/website`.
Plan: see the Astro + Sanity migration plan (Phase 1 in progress).

```bash
cd website && npm install && npm run dev   # http://localhost:4321
```

Deployed as its own Vercel project with Root Directory `website`.
Public APIs (checkout, signups) stay in the dashboard's Next app and are called cross-origin via `PUBLIC_API_BASE`.

## How editing works

Editors never see Sanity. They use **admin → Edit website** (`/admin/website` in the dashboard):

1. The dashboard mints a short-lived signed token (`WEBSITE_EDIT_SECRET`, same value in both apps) and frames this site with `?edit=<token>`.
2. `src/middleware.ts` verifies the token. In edit mode the site reads **draft** content, is never cached, and may only be framed by the admin that minted the token. Without a token it's the normal public site, cached at the CDN for ~60s.
3. `src/components/EditBridge.astro` makes fields editable. Mark a field with `{...ed(edit, doc._id, "field", "text")}` (type on the page) or `"open"` (opens the side panel).
4. Saves go to `/api/website/*` in the dashboard (admin login required, field allowlist in `src/lib/website/fields.ts`) and are written to Sanity **drafts**. Publishing promotes the draft; the public site picks it up within about a minute.

To make a new field editable: add it to the Sanity schema (`/sanity/schemas`), to the allowlist (`src/lib/website/fields.ts`), then mark it in the template.

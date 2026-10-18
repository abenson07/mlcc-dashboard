# website (Astro)

New public site for MLCC, replacing the Next-based `mlcc-website/` at cutover.
Content comes from Sanity; Studio + Presentation live in the dashboard at `/admin/website`.
Plan: see the Astro + Sanity migration plan (Phase 1 in progress).

```bash
cd website && npm install && npm run dev   # http://localhost:4321
```

Deployed as its own Vercel project with Root Directory `website`.
Public APIs (checkout, signups) stay in the dashboard's Next app and are called cross-origin via `PUBLIC_API_BASE`.

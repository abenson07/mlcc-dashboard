# API routes 404 in production (e.g. Linear)

If API routes work locally but return **404** on the deployed site (e.g. `GET /api/linear/project-issues`), the app is likely deployed under a **mount path** (e.g. `/dashboard`). Only requests under that path reach the Next.js worker; requests to `/api/...` at the site root hit the host and 404.

## Fix

1. **Preferred:** In your Webflow Cloud environment (or hosting env), set at **build** time:
   - `NEXT_PUBLIC_BASE_PATH` = your app’s mount path (e.g. `"/dashboard"`).
   - `BASE_PATH` = same value so the Next.js build uses `basePath` / `assetPrefix`.

2. **Redeploy** after changing env vars.

3. **Fallback (client):** If `NEXT_PUBLIC_BASE_PATH` was not set, `getApiBase()` in `src/lib/apiBase.ts` infers `/dashboard` when the page URL is under `/dashboard/...`, so API calls become `/dashboard/api/...`. This fixes the common “404 on `/api/...` at site root” case without relying on build-time env—**but** you should still set `BASE_PATH` for correct `_next` asset URLs and router base in all setups.

## Summary

| Where        | Variable                  | Example     |
|-------------|---------------------------|-------------|
| Webflow env | `NEXT_PUBLIC_BASE_PATH`  | `"/dashboard"` |
| Webflow env | `BASE_PATH`              | `"/dashboard"` |

The `browsing-topics` Permissions-Policy warning in the console is unrelated and can be ignored.

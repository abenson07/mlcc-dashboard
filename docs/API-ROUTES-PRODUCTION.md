# API routes 404 in production (e.g. Linear)

If API routes work locally but return **404** on the deployed site (e.g. `GET /api/linear/project-issues`), the app is likely deployed under a **mount path** (e.g. `/dashboard`). Only requests under that path reach the Next.js worker; requests to `/api/...` at the site root hit the host and 404.

## Fix

1. **In your Webflow Cloud environment** (or hosting env), set:
   - `NEXT_PUBLIC_BASE_PATH` = your app’s mount path (e.g. `"/dashboard"`).
   - `BASE_PATH` = same value (e.g. `"/dashboard"`) so the Next.js build uses that base path.

2. **Redeploy** so the worker and client both use the same path. The client will request e.g. `/dashboard/api/linear/project-issues`, which is routed to the Next.js app.

3. **Optional:** In `next.config.ts`, `basePath` and `assetPrefix` are applied when `BASE_PATH` is set, so you don’t need to edit the config file if you set `BASE_PATH` in the environment.

## Summary

| Where        | Variable                  | Example     |
|-------------|---------------------------|-------------|
| Webflow env | `NEXT_PUBLIC_BASE_PATH`  | `"/dashboard"` |
| Webflow env | `BASE_PATH`              | `"/dashboard"` |

The `browsing-topics` Permissions-Policy warning in the console is unrelated and can be ignored.

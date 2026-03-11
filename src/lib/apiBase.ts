/**
 * Base path for API (and app) when deployed behind a mount path (e.g. Webflow Cloud).
 * Set NEXT_PUBLIC_BASE_PATH in production to match your environment's mount path
 * (e.g. "/dashboard") so requests like /api/linear/... go to /dashboard/api/linear/...
 * and are handled by the Next.js worker. Leave unset for local dev (app at /).
 */
export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

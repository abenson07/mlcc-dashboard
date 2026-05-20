/**
 * Base path for API (and app) when deployed behind a mount path (e.g. Webflow Cloud).
 * Set NEXT_PUBLIC_BASE_PATH and BASE_PATH at build time to match the mount (e.g. "/dashboard").
 *
 * When the env var is missing (easy to forget), we infer `/dashboard` from `window.location`
 * so client fetches hit `/dashboard/api/...` instead of root `/api/...` (which 404s on the host).
 */
const WEBFLOW_CLOUD_DASHBOARD_MOUNT = "/dashboard";

function inferClientMountFromPathname(pathname: string): string {
  if (
    pathname === WEBFLOW_CLOUD_DASHBOARD_MOUNT ||
    pathname.startsWith(`${WEBFLOW_CLOUD_DASHBOARD_MOUNT}/`)
  ) {
    return WEBFLOW_CLOUD_DASHBOARD_MOUNT;
  }
  return "";
}

export function getApiBase(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    return inferClientMountFromPathname(window.location.pathname);
  }

  return "";
}

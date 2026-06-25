/** URL prefix for authenticated dashboard routes. */
export const ADMIN_PREFIX = "/admin";

/** Build a dashboard path under `/admin`. Idempotent if already prefixed. */
export function adminPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === ADMIN_PREFIX || normalized.startsWith(`${ADMIN_PREFIX}/`)) {
    return normalized;
  }
  return `${ADMIN_PREFIX}${normalized}`;
}

/** True when `pathname` is under the dashboard (including `/admin` itself). */
export function isAdminPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

/** Path after `/admin`, or the full pathname if not under admin. */
export function adminSegment(pathname: string | null | undefined): string {
  if (!pathname || !isAdminPath(pathname)) return pathname ?? "";
  const rest = pathname.slice(ADMIN_PREFIX.length);
  return rest === "" ? "/" : rest;
}

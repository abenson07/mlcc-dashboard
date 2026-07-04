/** True when the pathname uses the integrated dashboard shell (no legacy sidebar). */
export function isIntegratedShellPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/old-admin/leaflet") ||
    pathname.startsWith("/old-admin/site") ||
    pathname.startsWith("/old-admin/people") ||
    pathname.startsWith("/old-admin/biz") ||
    pathname === "/old-admin/events" ||
    pathname.startsWith("/old-admin/events?") ||
    pathname.startsWith("/old-admin/events-hub") ||
    pathname.startsWith("/old-admin/stories") ||
    pathname.startsWith("/old-admin/finance") ||
    pathname.startsWith("/old-admin/settings") ||
    pathname.startsWith("/old-admin/action-items")
  );
}

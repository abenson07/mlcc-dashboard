/** True when the pathname uses the integrated dashboard shell (no legacy sidebar). */
export function isIntegratedShellPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/admin/leaflet") ||
    pathname.startsWith("/admin/site") ||
    pathname.startsWith("/admin/people") ||
    pathname.startsWith("/admin/biz") ||
    pathname === "/admin/events" ||
    pathname.startsWith("/admin/events?") ||
    pathname.startsWith("/admin/events-hub") ||
    pathname.startsWith("/admin/stories") ||
    pathname.startsWith("/admin/finance") ||
    pathname.startsWith("/admin/settings") ||
    pathname.startsWith("/admin/action-items")
  );
}

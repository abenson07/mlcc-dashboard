/** True when the pathname is under the live `/admin` app. */
export function isIntegratedShellPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

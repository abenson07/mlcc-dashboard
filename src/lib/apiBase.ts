/**
 * Base path for API when deployed behind a mount path (legacy Webflow Cloud).
 * On Vercel, leave NEXT_PUBLIC_BASE_PATH unset — APIs live at `/api/*`.
 */
export function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
}

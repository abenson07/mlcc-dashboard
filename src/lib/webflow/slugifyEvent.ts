/** URL-safe slug from a display name (Webflow Designer–style, no random suffix). */
export function slugifyFromEventName(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return s || "event";
}

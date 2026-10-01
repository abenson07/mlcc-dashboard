export type PageIndexEntry = {
  id: string;
  label: string;
  href: string;
  keywords?: string[];
};

export const INTEGRATED_PAGE_INDEX: PageIndexEntry[] = [
  { id: "people", label: "People", href: "/admin/people", keywords: ["neighbors", "members"] },
  {
    id: "businesses",
    label: "Businesses",
    href: "/admin/businesses",
    keywords: ["biz", "sponsors"],
  },
  { id: "events", label: "Events", href: "/admin/events" },
  { id: "leaflet", label: "Leaflets", href: "/admin/leaflets", keywords: ["distribution"] },
  { id: "stories", label: "Stories", href: "/admin/content", keywords: ["content"] },
  { id: "finance-invoices", label: "Invoices", href: "/admin/invoices", keywords: ["finance", "billing"] },
  { id: "action-items", label: "Action items", href: "/admin/action-items" },
  { id: "settings", label: "Settings", href: "/admin/settings" },
  { id: "leaflet-routes", label: "Leaflet routes", href: "/admin/leaflets", keywords: ["routes"] },
  { id: "qr-codes", label: "QR codes", href: "/admin/qr-codes" },
  { id: "comms", label: "Comms", href: "/admin/comms" },
];

export function searchPages(q: string, limit: number) {
  const term = q.trim().toLowerCase();
  if (!term) return INTEGRATED_PAGE_INDEX.slice(0, limit);

  return INTEGRATED_PAGE_INDEX.filter((page) => {
    const haystack = [page.label, ...(page.keywords ?? [])].join(" ").toLowerCase();
    return haystack.includes(term);
  }).slice(0, limit);
}

/** Opens the Log checks dialog on the invoices page. */
export const LOG_CHECKS_HREF = "/admin/invoices?action=log-checks";

/** Quick actions: jump straight to a task rather than a page. */
export const ACTION_INDEX: PageIndexEntry[] = [
  {
    id: "log-checks",
    label: "Log checks",
    href: LOG_CHECKS_HREF,
    keywords: ["write check", "upload checks", "bulk checks", "record payment", "membership payment"],
  },
];

export function searchActions(q: string, limit: number) {
  const term = q.trim().toLowerCase();
  if (!term) return ACTION_INDEX.slice(0, limit);

  return ACTION_INDEX.filter((action) => {
    const haystack = [action.label, ...(action.keywords ?? [])].join(" ").toLowerCase();
    return haystack.includes(term);
  }).slice(0, limit);
}

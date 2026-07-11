export type PageIndexEntry = {
  id: string;
  label: string;
  href: string;
  keywords?: string[];
};

export const INTEGRATED_PAGE_INDEX: PageIndexEntry[] = [
  { id: "people", label: "People", href: "/old-admin/people", keywords: ["neighbors", "members"] },
  {
    id: "businesses",
    label: "Businesses",
    href: "/old-admin/people?filter=businesses",
    keywords: ["biz", "sponsors"],
  },
  { id: "events", label: "Events", href: "/old-admin/events" },
  { id: "leaflet", label: "Leaflets", href: "/old-admin/leaflet", keywords: ["distribution"] },
  { id: "stories", label: "Stories", href: "/old-admin/stories" },
  { id: "finance", label: "Finance overview", href: "/old-admin/finance" },
  { id: "finance-invoices", label: "Finance invoices", href: "/old-admin/finance/invoices" },
  { id: "finance-memberships", label: "Finance memberships", href: "/old-admin/finance/memberships" },
  { id: "finance-sponsorships", label: "Finance sponsorships", href: "/old-admin/finance/sponsorships" },
  { id: "finance-reports", label: "Finance reports", href: "/old-admin/finance/reports" },
  { id: "action-items", label: "Action items", href: "/old-admin/action-items" },
  { id: "settings", label: "Settings", href: "/old-admin/settings" },
  { id: "settings-committee", label: "Committee settings", href: "/old-admin/settings/committee" },
  { id: "site", label: "Site", href: "/old-admin/site" },
  { id: "site-comments", label: "Site comments", href: "/old-admin/site/comments" },
  { id: "leaflet-routes", label: "Leaflet routes", href: "/old-admin/leaflet/routes" },
  { id: "leaflet-deliverers", label: "Leaflet deliverers", href: "/old-admin/leaflet/deliverers" },
  { id: "leaflet-open-routes", label: "Open routes", href: "/old-admin/leaflet/open-routes" },
  { id: "leaflet-substitutions", label: "Skipped Routes", href: "/old-admin/leaflet/substitutions" },
  { id: "leaflet-sponsorships", label: "Leaflet sponsorships", href: "/old-admin/leaflet/sponsorships" },
  { id: "leaflet-todo", label: "Leaflet to-do", href: "/old-admin/leaflet/todo" },
];

export function searchPages(q: string, limit: number) {
  const term = q.trim().toLowerCase();
  if (!term) return INTEGRATED_PAGE_INDEX.slice(0, limit);

  return INTEGRATED_PAGE_INDEX.filter((page) => {
    const haystack = [page.label, ...(page.keywords ?? [])].join(" ").toLowerCase();
    return haystack.includes(term);
  }).slice(0, limit);
}

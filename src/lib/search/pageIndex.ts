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
    href: "/admin/people?filter=businesses",
    keywords: ["biz", "sponsors"],
  },
  { id: "events", label: "Events", href: "/admin/events" },
  { id: "leaflet", label: "Leaflets", href: "/admin/leaflet", keywords: ["distribution"] },
  { id: "stories", label: "Stories", href: "/admin/stories" },
  { id: "finance", label: "Finance overview", href: "/admin/finance" },
  { id: "finance-invoices", label: "Finance invoices", href: "/admin/finance/invoices" },
  { id: "finance-memberships", label: "Finance memberships", href: "/admin/finance/memberships" },
  { id: "finance-sponsorships", label: "Finance sponsorships", href: "/admin/finance/sponsorships" },
  { id: "finance-reports", label: "Finance reports", href: "/admin/finance/reports" },
  { id: "action-items", label: "Action items", href: "/admin/action-items" },
  { id: "settings", label: "Settings", href: "/admin/settings" },
  { id: "settings-committee", label: "Committee settings", href: "/admin/settings/committee" },
  { id: "site", label: "Site", href: "/admin/site" },
  { id: "site-comments", label: "Site comments", href: "/admin/site/comments" },
  { id: "leaflet-routes", label: "Leaflet routes", href: "/admin/leaflet/routes" },
  { id: "leaflet-deliverers", label: "Leaflet deliverers", href: "/admin/leaflet/deliverers" },
  { id: "leaflet-open-routes", label: "Open routes", href: "/admin/leaflet/open-routes" },
  { id: "leaflet-substitutions", label: "Substitutions", href: "/admin/leaflet/substitutions" },
  { id: "leaflet-sponsorships", label: "Leaflet sponsorships", href: "/admin/leaflet/sponsorships" },
  { id: "leaflet-todo", label: "Leaflet to-do", href: "/admin/leaflet/todo" },
];

export function searchPages(q: string, limit: number) {
  const term = q.trim().toLowerCase();
  if (!term) return INTEGRATED_PAGE_INDEX.slice(0, limit);

  return INTEGRATED_PAGE_INDEX.filter((page) => {
    const haystack = [page.label, ...(page.keywords ?? [])].join(" ").toLowerCase();
    return haystack.includes(term);
  }).slice(0, limit);
}

export type SearchSection =
  | "pages"
  | "events"
  | "people"
  | "businesses"
  | "leaflets"
  | "stories"
  | "routes"
  | "invoices"
  | "action_items";

export type SearchResult = {
  id: string;
  section: SearchSection;
  title: string;
  subtitle?: string;
  href: string;
};

export type SearchResponse = {
  q: string;
  sections: Partial<Record<SearchSection, SearchResult[]>>;
};

export const SEARCH_SECTION_LABELS: Record<SearchSection, string> = {
  pages: "Pages",
  events: "Events",
  people: "People",
  businesses: "Businesses",
  leaflets: "Leaflets",
  stories: "Stories",
  routes: "Routes",
  invoices: "Invoices",
  action_items: "Action items",
};

export const SEARCH_SECTION_ORDER: SearchSection[] = [
  "pages",
  "events",
  "people",
  "businesses",
  "leaflets",
  "stories",
  "routes",
  "invoices",
  "action_items",
];

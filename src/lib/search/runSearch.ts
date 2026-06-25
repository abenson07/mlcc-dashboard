import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import { searchPages } from "@/lib/search/pageIndex";
import { searchStories } from "@/lib/search/storyIndex";
import type { SearchResponse, SearchResult, SearchSection } from "@/lib/search/types";
import { listDashboardInvoices } from "@/lib/stripe/listDashboardInvoices";
import { getStripe } from "@/lib/stripe/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_LIMIT = 5;

function escapeIlike(term: string): string {
  return term.replace(/[%_\\]/g, "\\$&");
}

function toSections(
  results: SearchResult[],
): Partial<Record<SearchSection, SearchResult[]>> {
  const sections: Partial<Record<SearchSection, SearchResult[]>> = {};
  for (const result of results) {
    const list = sections[result.section] ?? [];
    list.push(result);
    sections[result.section] = list;
  }
  return sections;
}

async function searchEvents(
  supabase: SupabaseClient,
  term: string,
  limit: number,
): Promise<SearchResult[]> {
  const pattern = `%${escapeIlike(term)}%`;
  const { data, error } = await supabase
    .from("events")
    .select("id, name, starts_at")
    .ilike("name", pattern)
    .order("starts_at", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    section: "events" as const,
    title: row.name ?? "Untitled event",
    subtitle: row.starts_at
      ? new Date(row.starts_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : undefined,
    href: `/admin/events-hub/${row.id}/overview`,
  }));
}

async function searchPeople(
  supabase: SupabaseClient,
  term: string,
  limit: number,
): Promise<SearchResult[]> {
  const pattern = `%${escapeIlike(term)}%`;
  const { data, error } = await supabase
    .from("people")
    .select("id, full_name, email, address")
    .or(
      `full_name.ilike.${pattern},email.ilike.${pattern},address.ilike.${pattern}`,
    )
    .order("full_name", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    section: "people" as const,
    title: row.full_name ?? "Unknown",
    subtitle: row.email ?? row.address ?? undefined,
    href: `/admin/people?selected=${encodeURIComponent(row.id)}`,
  }));
}

async function searchBusinesses(
  supabase: SupabaseClient,
  term: string,
  limit: number,
): Promise<SearchResult[]> {
  const pattern = `%${escapeIlike(term)}%`;
  const { data, error } = await supabase
    .from("businesses")
    .select("id, business_name, contact_name, email, address")
    .eq("hidden", false)
    .or(
      `business_name.ilike.${pattern},contact_name.ilike.${pattern},email.ilike.${pattern}`,
    )
    .order("business_name", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    section: "businesses" as const,
    title: row.business_name ?? row.contact_name ?? "Unknown business",
    subtitle: row.email ?? row.address ?? undefined,
    href: `/admin/people?filter=businesses&selected=${encodeURIComponent(row.id)}`,
  }));
}

async function searchLeaflets(
  supabase: SupabaseClient,
  term: string,
  limit: number,
): Promise<SearchResult[]> {
  const pattern = `%${escapeIlike(term)}%`;
  const { data, error } = await supabase
    .from("leaflets")
    .select("id, title, distribution_date, status")
    .ilike("title", pattern)
    .order("distribution_date", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    section: "leaflets" as const,
    title: row.title ?? "Untitled leaflet",
    subtitle: row.distribution_date
      ? new Date(row.distribution_date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : (row.status ?? undefined),
    href: `/admin/leaflet?leaflet=${encodeURIComponent(row.id)}`,
  }));
}

type RouteRow = {
  id: string;
  route_name: string;
  primary_deliverer_email: string | null;
  people: { full_name: string | null } | { full_name: string | null }[] | null;
};

async function searchRoutes(
  supabase: SupabaseClient,
  term: string,
  limit: number,
): Promise<SearchResult[]> {
  const pattern = `%${escapeIlike(term)}%`;

  const [routesByName, peopleMatches] = await Promise.all([
    supabase
      .from("routes")
      .select("id, route_name, primary_deliverer_email, people:primary_deliverer_id(full_name)")
      .or(`route_name.ilike.${pattern},primary_deliverer_email.ilike.${pattern}`)
      .order("route_name", { ascending: true })
      .limit(limit),
    supabase
      .from("people")
      .select("id")
      .ilike("full_name", pattern)
      .limit(limit),
  ]);

  if (routesByName.error) throw new Error(routesByName.error.message);
  if (peopleMatches.error) throw new Error(peopleMatches.error.message);

  const routeMap = new Map<string, RouteRow>();
  for (const row of (routesByName.data ?? []) as RouteRow[]) {
    routeMap.set(row.id, row);
  }

  const delivererIds = (peopleMatches.data ?? []).map((p) => p.id);
  if (delivererIds.length > 0) {
    const { data: routesByDeliverer, error } = await supabase
      .from("routes")
      .select("id, route_name, primary_deliverer_email, people:primary_deliverer_id(full_name)")
      .in("primary_deliverer_id", delivererIds)
      .limit(limit);

    if (error) throw new Error(error.message);
    for (const row of (routesByDeliverer ?? []) as RouteRow[]) {
      routeMap.set(row.id, row);
    }
  }

  const routes = [...routeMap.values()].slice(0, limit);
  if (routes.length === 0) return [];

  const routeIds = routes.map((r) => r.id);
  const { data: deliveries, error: deliveriesError } = await supabase
    .from("deliveries")
    .select("id, route_id, leaflet_id, created_at")
    .in("route_id", routeIds)
    .order("created_at", { ascending: false });

  if (deliveriesError) throw new Error(deliveriesError.message);

  const latestDeliveryByRoute = new Map<string, { id: string; leaflet_id: string | null }>();
  for (const delivery of deliveries ?? []) {
    if (!latestDeliveryByRoute.has(delivery.route_id)) {
      latestDeliveryByRoute.set(delivery.route_id, {
        id: delivery.id,
        leaflet_id: delivery.leaflet_id,
      });
    }
  }

  return routes.map((route) => {
    const deliverer = Array.isArray(route.people) ? route.people[0] : route.people;
    const delivery = latestDeliveryByRoute.get(route.id);
    const leafletId = delivery?.leaflet_id;
    const params = new URLSearchParams();
    if (leafletId) params.set("leaflet", leafletId);
    if (delivery?.id) params.set("delivery", delivery.id);
    const qs = params.toString();

    return {
      id: route.id,
      section: "routes" as const,
      title: route.route_name,
      subtitle: deliverer?.full_name ?? route.primary_deliverer_email ?? undefined,
      href: qs ? `/admin/leaflet/routes?${qs}` : "/admin/leaflet/routes",
    };
  });
}

async function searchActionItems(
  supabase: SupabaseClient,
  term: string,
  limit: number,
): Promise<SearchResult[]> {
  const pattern = `%${escapeIlike(term)}%`;
  const { data, error } = await supabase
    .from("action_items")
    .select("id, title, description, status, due_at")
    .or(`title.ilike.${pattern},description.ilike.${pattern}`)
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    section: "action_items" as const,
    title: row.title ?? "Untitled action item",
    subtitle: row.status ?? undefined,
    href: `/admin/action-items?item=${encodeURIComponent(row.id)}`,
  }));
}

async function searchInvoices(term: string, limit: number): Promise<SearchResult[]> {
  const stripe = getStripe();
  if (!stripe) return [];

  const invoices = await listDashboardInvoices(stripe);
  const q = term.toLowerCase();

  return invoices
    .filter((inv) => {
      const haystack = [
        inv.number,
        inv.customer_email,
        inv.event_name,
        inv.created_by_name,
        inv.sponsorship_category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, limit)
    .map((inv) => ({
      id: inv.id,
      section: "invoices" as const,
      title: inv.number ? `Invoice ${inv.number}` : `Invoice ${inv.id.slice(-8)}`,
      subtitle: inv.customer_email ?? inv.event_name ?? inv.status ?? undefined,
      href: `/admin/sponsorship/invoices/${encodeURIComponent(inv.id)}`,
    }));
}

export async function runSearch(q: string, limit = DEFAULT_LIMIT): Promise<SearchResponse> {
  const term = q.trim();
  const pageResults: SearchResult[] = searchPages(term, limit).map((page) => ({
    id: page.id,
    section: "pages",
    title: page.label,
    href: page.href,
  }));

  if (!term) {
    return { q: term, sections: { pages: pageResults } };
  }

  const supabase = await getSupabaseForLeafletRoutes();

  const [
    events,
    people,
    businesses,
    leaflets,
    stories,
    routes,
    invoices,
    action_items,
  ] = await Promise.all([
    searchEvents(supabase, term, limit),
    searchPeople(supabase, term, limit),
    searchBusinesses(supabase, term, limit),
    searchLeaflets(supabase, term, limit),
    Promise.resolve(
      searchStories(term, limit).map((story) => ({
        id: story.id,
        section: "stories" as const,
        title: story.title,
        href: `/admin/stories?selected=${encodeURIComponent(story.id)}`,
      })),
    ),
    searchRoutes(supabase, term, limit),
    searchInvoices(term, limit),
    searchActionItems(supabase, term, limit),
  ]);

  const allResults = [
    ...pageResults,
    ...events,
    ...people,
    ...businesses,
    ...leaflets,
    ...stories,
    ...routes,
    ...invoices,
    ...action_items,
  ];

  return { q: term, sections: toSections(allResults) };
}

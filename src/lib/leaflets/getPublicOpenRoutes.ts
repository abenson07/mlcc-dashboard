import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

export type PublicOpenRoute = {
  slug: string;
  deliveryId: string;
  routeName: string;
  routeType: string | null;
  leafletCount: number | null;
  isSkipped: boolean;
  leafletTitle: string | null;
};

type RouteEmbed = {
  route_name?: string | null;
  route_type?: string | null;
};

function unwrapRoute(raw: unknown): RouteEmbed | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return (raw[0] as RouteEmbed | undefined) ?? null;
  return raw as RouteEmbed;
}

function slugifyRouteName(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return s || "route";
}

function uniqueSlug(base: string, used: Set<string>, deliveryId: string): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  const withId = `${base}-${deliveryId.slice(0, 8)}`;
  used.add(withId);
  return withId;
}

export async function getPublicOpenRoutes(): Promise<{
  leafletTitle: string | null;
  routes: PublicOpenRoute[];
}> {
  const supabase = await getSupabaseForLeafletRoutes();

  const { data: leaflet, error: leafletError } = await supabase
    .from("leaflets")
    .select("id, title")
    .eq("status", "active")
    .maybeSingle();

  if (leafletError) {
    throw new Error(leafletError.message);
  }

  if (!leaflet) {
    return { leafletTitle: null, routes: [] };
  }

  const { data: deliveries, error: deliveriesError } = await supabase
    .from("deliveries")
    .select("id, leaflet_count, is_skipped, routes ( route_name, route_type )")
    .eq("leaflet_id", leaflet.id)
    .or("person_id.is.null,is_skipped.eq.true")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (deliveriesError) {
    throw new Error(deliveriesError.message);
  }

  const used = new Set<string>();
  const routes: PublicOpenRoute[] = (deliveries ?? []).map((row) => {
    const route = unwrapRoute(row.routes);
    const routeName = route?.route_name?.trim() || "Open route";
    return {
      slug: uniqueSlug(slugifyRouteName(routeName), used, row.id),
      deliveryId: row.id,
      routeName,
      routeType: route?.route_type?.trim() || null,
      leafletCount: row.leaflet_count,
      isSkipped: Boolean(row.is_skipped),
      leafletTitle: leaflet.title,
    };
  });

  return { leafletTitle: leaflet.title, routes };
}

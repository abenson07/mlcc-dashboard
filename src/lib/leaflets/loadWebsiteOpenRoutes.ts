import type { OpenRoute } from "@marketing/data/open-routes";
import { publicRouteToOpenRoute } from "@marketing/data/open-routes";
import { getPublicOpenRoutes } from "@/lib/leaflets/getPublicOpenRoutes";

export async function loadWebsiteOpenRoutes(): Promise<OpenRoute[]> {
  try {
    const { routes } = await getPublicOpenRoutes();
    return routes.map(publicRouteToOpenRoute);
  } catch {
    return [];
  }
}

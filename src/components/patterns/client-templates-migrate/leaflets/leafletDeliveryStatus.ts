import type { DeliveriesUpdate, RoutesUpdate } from "@/types/database";
import { listDemoScoped, writeDemoScoped } from "@/lib/demo/demoStore";
import type {
  LeafletDelivererRouteRow,
  LeafletDelivererRow,
  LeafletRouteRow,
} from "@/data/mocks/leaflets";
import { sampleDeliverers } from "@/data/mocks/leaflets";
import { sampleAllRouteRows } from "./adapters";

export type LeafletDeliveryStatusAction = "confirm" | "skip" | "remove";

export function leafletDeliveryStatusPatch(
  action: LeafletDeliveryStatusAction,
): DeliveriesUpdate {
  const now = new Date().toISOString();
  if (action === "confirm") {
    return { response: "confirmed", is_skipped: false, responded_at: now };
  }
  if (action === "skip") {
    return { is_skipped: true, response: "needs_cover", responded_at: now };
  }
  return { person_id: null, is_skipped: false, response: "pending" };
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function delivererStatus(
  routes: LeafletDelivererRouteRow[],
): LeafletDelivererRow["status"] {
  const responses = routes.map((r) => r.response);
  if (responses.length > 0 && responses.every((r) => r === "confirmed")) return "Confirmed";
  if (responses.some((r) => r === "rejected")) return "Declined";
  return "Invited";
}

export function applyStatusToRouteRow(
  row: LeafletRouteRow,
  action: LeafletDeliveryStatusAction,
): LeafletRouteRow {
  if (action === "confirm") {
    const personName = row.personName ?? null;
    return {
      ...row,
      status: "in-progress",
      response: "confirmed",
      detail: personName ? `Assigned to ${personName}` : "Assigned",
      initials: personName ? initialsFromName(personName) : row.initials,
    };
  }
  if (action === "skip") {
    const personName = row.personName ?? null;
    return {
      ...row,
      status: "skipped",
      response: "needs_cover",
      detail: personName ? `Skipped by ${personName}` : "Needs a substitute",
    };
  }
  return {
    ...row,
    status: "unassigned",
    personId: null,
    personName: null,
    response: "pending",
    initials: "—",
    detail: "Unassigned",
  };
}

export function applyStatusToDelivererRows(
  deliverers: LeafletDelivererRow[],
  deliveryIds: Set<string>,
  action: LeafletDeliveryStatusAction,
): LeafletDelivererRow[] {
  return deliverers
    .map((deliverer) => {
      const nextRoutes =
        action === "remove"
          ? deliverer.routes.filter((r) => !deliveryIds.has(r.deliveryId ?? r.id))
          : deliverer.routes.map((r) => {
              if (!deliveryIds.has(r.deliveryId ?? r.id)) return r;
              if (action === "confirm") {
                return { ...r, isSkipped: false, response: "confirmed" as const };
              }
              return { ...r, isSkipped: true, response: "needs_cover" as const };
            });
      return {
        ...deliverer,
        routes: nextRoutes,
        status: delivererStatus(nextRoutes),
      };
    })
    .filter((d) => d.routes.length > 0);
}

export function applyDemoLeafletDeliveryStatus(
  scopeKey: string,
  deliveryIds: string[],
  action: LeafletDeliveryStatusAction,
): { routes: LeafletRouteRow[]; deliverers: LeafletDelivererRow[] } {
  const ids = new Set(deliveryIds);
  const currentRoutes =
    listDemoScoped<LeafletRouteRow>("leafletRoutes", scopeKey) ?? sampleAllRouteRows();
  const currentDeliverers =
    listDemoScoped<LeafletDelivererRow>("leafletDeliverers", scopeKey) ?? sampleDeliverers;

  const routes = currentRoutes.map((row) =>
    ids.has(row.id) ? applyStatusToRouteRow(row, action) : row,
  );
  const deliverers = applyStatusToDelivererRows(currentDeliverers, ids, action);

  writeDemoScoped("leafletRoutes", scopeKey, routes);
  writeDemoScoped("leafletDeliverers", scopeKey, deliverers);
  return { routes, deliverers };
}

export function deliveryIdsForDeliverer(deliverer: LeafletDelivererRow): string[] {
  return deliverer.routes.map((r) => r.deliveryId).filter((id): id is string => Boolean(id));
}

export function routeHasDeliverer(row: LeafletRouteRow): boolean {
  return row.status === "in-progress" || row.status === "skipped" || Boolean(row.personId);
}

export async function applyLeafletDeliveryStatus(params: {
  isDemo: boolean;
  scopeKey: string;
  deliveryIds: string[];
  action: LeafletDeliveryStatusAction;
  update: (id: string, patch: DeliveriesUpdate) => Promise<unknown>;
  refetch?: () => Promise<void>;
}): Promise<void> {
  if (params.deliveryIds.length === 0) return;
  if (params.isDemo) {
    applyDemoLeafletDeliveryStatus(params.scopeKey, params.deliveryIds, params.action);
    return;
  }
  const patch = leafletDeliveryStatusPatch(params.action);
  await Promise.all(params.deliveryIds.map((id) => params.update(id, patch)));
  await params.refetch?.();
}

export type AssignDelivererPerson = {
  id: string;
  name: string;
  email: string | null;
};

export type AssignDelivererScope = "this-route" | "permanent";

function applyAssignToRouteRow(
  row: LeafletRouteRow,
  person: AssignDelivererPerson,
): LeafletRouteRow {
  return {
    ...row,
    status: "in-progress",
    personId: person.id,
    personName: person.name,
    response: "pending",
    initials: initialsFromName(person.name),
    detail: `Assigned to ${person.name}`,
  };
}

function applyAssignToDelivererRows(
  deliverers: LeafletDelivererRow[],
  row: LeafletRouteRow,
  person: AssignDelivererPerson,
): LeafletDelivererRow[] {
  const deliveryId = row.id;
  const routeEntry: LeafletDelivererRouteRow = {
    id: row.routeId ?? row.id,
    name: row.name,
    leafletCount: 0,
    deliveryId: row.id,
    routeId: row.routeId ?? row.id,
    isSkipped: false,
    response: "pending",
  };

  const withoutRoute = deliverers
    .map((deliverer) => ({
      ...deliverer,
      routes: deliverer.routes.filter((r) => (r.deliveryId ?? r.id) !== deliveryId),
    }))
    .filter((d) => d.routes.length > 0)
    .map((d) => ({ ...d, status: delivererStatus(d.routes) }));

  const existing = withoutRoute.find((d) => d.id === person.id);
  if (existing) {
    return withoutRoute
      .map((d) => {
        if (d.id !== person.id) return d;
        const routes = [...d.routes, routeEntry];
        return { ...d, routes, status: delivererStatus(routes) };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return [
    ...withoutRoute,
    {
      id: person.id,
      name: person.name,
      email: person.email ?? "",
      address: "Address not on file",
      status: "Invited" as const,
      routes: [routeEntry],
    },
  ].sort((a, b) => a.name.localeCompare(b.name));
}

export function applyDemoLeafletDelivererAssign(
  scopeKey: string,
  row: LeafletRouteRow,
  person: AssignDelivererPerson,
): { routes: LeafletRouteRow[]; deliverers: LeafletDelivererRow[] } {
  const currentRoutes =
    listDemoScoped<LeafletRouteRow>("leafletRoutes", scopeKey) ?? sampleAllRouteRows();
  const currentDeliverers =
    listDemoScoped<LeafletDelivererRow>("leafletDeliverers", scopeKey) ?? sampleDeliverers;

  const routes = currentRoutes.map((r) => (r.id === row.id ? applyAssignToRouteRow(r, person) : r));
  const deliverers = applyAssignToDelivererRows(currentDeliverers, row, person);

  writeDemoScoped("leafletRoutes", scopeKey, routes);
  writeDemoScoped("leafletDeliverers", scopeKey, deliverers);
  return { routes, deliverers };
}

export async function applyLeafletDelivererAssign(params: {
  isDemo: boolean;
  scopeKey: string;
  row: LeafletRouteRow;
  person: AssignDelivererPerson;
  scope: AssignDelivererScope;
  updateDelivery: (id: string, patch: DeliveriesUpdate) => Promise<unknown>;
  updateRoute: (id: string, patch: RoutesUpdate) => Promise<unknown>;
  refetch?: () => Promise<void>;
}): Promise<void> {
  const { row, person, scope } = params;
  if (params.isDemo) {
    applyDemoLeafletDelivererAssign(params.scopeKey, row, person);
    return;
  }

  await params.updateDelivery(row.id, {
    person_id: person.id,
    is_skipped: false,
    response: "pending",
  });

  if (scope === "permanent") {
    const routeId = row.routeId;
    if (!routeId) throw new Error("Route id is required for a permanent assignment");
    const updated = await params.updateRoute(routeId, {
      primary_deliverer_id: person.id,
      primary_deliverer_email: person.email,
    });
    if (updated == null) throw new Error("Failed to update the route default deliverer");
  }

  await params.refetch?.();
}

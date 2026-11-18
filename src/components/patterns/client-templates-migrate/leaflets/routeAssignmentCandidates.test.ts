import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LeafletRouteRow } from "@/data/mocks/leaflets";
import { sampleDeliverers, sampleOpenRoutes } from "@/data/mocks/leaflets";
import { listDemoScoped } from "@/lib/demo/demoStore";
import { routeAssignmentCandidates } from "./routeAssignmentCandidates";
import {
  applyLeafletDelivererAssign,
  applyDemoLeafletDelivererAssign,
} from "./leafletDeliveryStatus";
import { sampleAllRouteRows } from "./adapters";

const person = { id: "target", name: "Target Deliverer", email: "target@example.com" };
const open: LeafletRouteRow = {
  id: "delivery-open", routeId: "route-open", name: "Open street", initials: "", detail: "",
  status: "unassigned", leafletCount: 45,
};
const assigned: LeafletRouteRow = {
  ...open, id: "delivery-assigned", routeId: "route-assigned", name: "Assigned street",
  status: "in-progress", personId: "someone-else", personName: "Other Deliverer",
};
const skipped: LeafletRouteRow = {
  ...assigned, id: "delivery-skipped", name: "Skipped street", status: "skipped",
};
const own: LeafletRouteRow = { ...assigned, id: "own", personId: person.id };

beforeEach(() => {
  const entries = new Map<string, string>();
  const storage = {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  };
  vi.stubGlobal("window", { localStorage: storage, sessionStorage: storage, dispatchEvent: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());

describe("route assignment picker", () => {
  const routes = [assigned, own, skipped, open];

  it("defaults to open/skipped routes and excludes routes the person already has", () => {
    expect(routeAssignmentCandidates(routes, person.id, "  ")).toEqual([open, skipped]);
    expect(routeAssignmentCandidates([{ ...own, status: "skipped" }], person.id, "")).toEqual([]);
  });

  it("searches all route assignments, case-insensitively, without truncating matches", () => {
    expect(routeAssignmentCandidates(routes, person.id, " ASSIGNED ")).toEqual([assigned]);
    expect(routeAssignmentCandidates(routes, person.id, "unknown")).toEqual([]);
    const many = Array.from({ length: 15 }, (_, i) => ({ ...assigned, id: String(i) }));
    expect(routeAssignmentCandidates(many, person.id, "street")).toHaveLength(15);
  });
});

describe("assignment scope", () => {
  it("changes only this issue when requested, not the route default", async () => {
    const updateDelivery = vi.fn().mockResolvedValue({});
    const updateRoute = vi.fn();
    const refetch = vi.fn();
    await applyLeafletDelivererAssign({
      isDemo: false, scopeKey: "edition", row: assigned, person, scope: "this-route",
      updateDelivery, updateRoute, refetch,
    });
    expect(updateDelivery).toHaveBeenCalledExactlyOnceWith(assigned.id, {
      person_id: person.id, is_skipped: false, response: "pending",
    });
    expect(updateRoute).not.toHaveBeenCalled();
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("also updates the default for permanent assignments and propagates save failures", async () => {
    const updateDelivery = vi.fn().mockResolvedValue({});
    const updateRoute = vi.fn().mockResolvedValue({});
    const refetch = vi.fn();
    const params = {
      isDemo: false, scopeKey: "edition", row: assigned, person, scope: "permanent" as const,
      updateDelivery, updateRoute, refetch,
    };
    await applyLeafletDelivererAssign(params);
    expect(updateRoute).toHaveBeenCalledExactlyOnceWith(assigned.routeId, {
      primary_deliverer_id: person.id, primary_deliverer_email: person.email,
    });
    updateDelivery.mockRejectedValueOnce(new Error("Assignment denied"));
    await expect(applyLeafletDelivererAssign(params)).rejects.toThrow("Assignment denied");
    expect(updateRoute).toHaveBeenCalledTimes(1);
    updateRoute.mockResolvedValueOnce(null);
    await expect(applyLeafletDelivererAssign(params)).rejects.toThrow("Failed to update the route default");
  });
});

describe("demo route assignment", () => {
  it("reassigns from the previous deliverer without losing leaflet count or route type", () => {
    const source = sampleDeliverers[0]!;
    const row = sampleAllRouteRows().find((r) => r.personId === source.id)!;
    const before = source.routes.find((r) => (r.deliveryId ?? r.id) === row.id)!;
    const result = applyDemoLeafletDelivererAssign("edition", row, person);
    const moved = result.deliverers.find((p) => p.id === person.id)!.routes[0]!;
    expect(moved).toMatchObject({
      deliveryId: row.id, leafletCount: before.leafletCount, routeType: before.routeType,
      response: "pending", isSkipped: false,
    });
    expect(result.deliverers.find((p) => p.id === source.id)?.routes.some((r) => r.deliveryId === row.id)).not.toBe(true);
    expect(result.routes.find((r) => r.id === row.id)?.personId).toBe(person.id);
  });

  it("persists new open-route assignment locally for either scope without calling live writes", async () => {
    const updateDelivery = vi.fn();
    const updateRoute = vi.fn();
    const row = sampleAllRouteRows().find((r) => r.id === sampleOpenRoutes[0]!.id)!;
    await applyLeafletDelivererAssign({
      isDemo: true, scopeKey: "edition", row, person, scope: "permanent",
      updateDelivery, updateRoute,
    });
    expect(updateDelivery).not.toHaveBeenCalled();
    expect(updateRoute).not.toHaveBeenCalled();
    expect(listDemoScoped<LeafletRouteRow>("leafletRoutes", "edition")!.find((r) => r.id === row.id)?.personId).toBe(person.id);
    const deliverers = listDemoScoped<{ id: string; routes: { leafletCount: number }[] }>("leafletDeliverers", "edition")!;
    expect(deliverers.find((p) => p.id === person.id)!.routes[0]!.leafletCount).toBe(50);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { POST as activate } from "./[id]/activate/route";
import { POST as close } from "./[id]/close/route";
import { LeafletActivationConflictError } from "@/lib/leaflets/activateLeaflet";

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  client: vi.fn(),
  activate: vi.fn(),
  close: vi.fn(),
}));
vi.mock("@/lib/auth/require-session", () => ({ requireSession: mocks.session }));
vi.mock("@/lib/leaflets/supabaseForLeafletRoutes", () => ({
  getSupabaseForLeafletRoutes: mocks.client,
}));
vi.mock("@/lib/leaflets/activateLeaflet", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/leaflets/activateLeaflet")>(),
  activateLeaflet: mocks.activate,
}));
vi.mock("@/lib/leaflets/closeLeaflet", () => ({ closeLeaflet: mocks.close }));

const id = "11111111-1111-4111-8111-111111111111";
const activeId = "22222222-2222-4222-8222-222222222222";
const params = () => ({ params: Promise.resolve({ id }) });
function request(action: string, body?: string) {
  return new NextRequest(`http://localhost/api/leaflets/${id}/${action}`, {
    method: "POST",
    ...(body === undefined ? {} : { body }),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.session.mockResolvedValue({ ok: true, user: { id: "admin" } });
  mocks.client.mockResolvedValue({ client: "test" });
  mocks.activate.mockResolvedValue({ id, status: "active" });
  mocks.close.mockResolvedValue({ closed: { id, status: "closed" }, nextActivated: null });
});

describe("leaflet lifecycle API", () => {
  it("requires a session before either lifecycle operation", async () => {
    mocks.session.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
    expect((await activate(request("activate"), params())).status).toBe(401);
    expect((await close(request("close"), params())).status).toBe(401);
    expect(mocks.client).not.toHaveBeenCalled();
    expect(mocks.activate).not.toHaveBeenCalled();
    expect(mocks.close).not.toHaveBeenCalled();
  });

  it.each([activeId, null])("passes the explicitly confirmed active issue (%s) to the atomic operation", async (expectedActiveId) => {
    const response = await activate(request("activate", JSON.stringify({ expectedActiveId })), params());
    expect(response.status).toBe(200);
    expect(mocks.activate).toHaveBeenCalledWith(
      { client: "test" }, id, { expectedActiveId },
    );
  });

  it("preserves activation without a replacement request for legacy callers", async () => {
    expect((await activate(request("activate"), params())).status).toBe(200);
    expect(mocks.activate).toHaveBeenCalledWith({ client: "test" }, id, undefined);
  });

  it.each(["{", "null", "[]", "{}", '{"expectedActiveId":42}', '{"expectedActiveId":"not-an-id"}'])(
    "rejects an invalid replacement request: %s", async (body) => {
      expect((await activate(request("activate", body), params())).status).toBe(400);
      expect(mocks.client).not.toHaveBeenCalled();
      expect(mocks.activate).not.toHaveBeenCalled();
    },
  );

  it("returns a conflict instead of replacing an active issue the user did not confirm", async () => {
    mocks.activate.mockRejectedValue(new LeafletActivationConflictError("Active issue changed"));
    const response = await activate(request("activate", JSON.stringify({ expectedActiveId: activeId })), params());
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "Active issue changed" });
  });

  it("does not report success when activation fails", async () => {
    mocks.activate.mockRejectedValue(new Error("Database unavailable"));
    const response = await activate(request("activate", JSON.stringify({ expectedActiveId: null })), params());
    expect(response.ok).toBe(false);
    expect(await response.json()).toEqual({ error: "Database unavailable" });
  });

  it.each([["", true], ["?activateNext=true", true], ["?activateNext=false", false]])(
    "closes with the requested next-activation behavior (%s)", async (query, expected) => {
      expect((await close(request(`close${query}`), params())).status).toBe(200);
      expect(mocks.close).toHaveBeenCalledWith({ client: "test" }, id, { activateNext: expected });
    },
  );

  it("rejects ambiguous close options without writing", async () => {
    expect((await close(request("close?activateNext=invalid"), params())).status).toBe(400);
    expect(mocks.client).not.toHaveBeenCalled();
    expect(mocks.close).not.toHaveBeenCalled();
  });

  it("surfaces close failures without returning a successful closed state", async () => {
    mocks.close.mockRejectedValue(new Error("Cannot close issue"));
    const response = await close(request("close?activateNext=false"), params());
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Cannot close issue" });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sampleLeaflets } from "@/data/mocks/leaflets";
import { mergeDemoCollection, patchDemoEntity, readDemoStore } from "@/lib/demo/demoStore";
import { setDemoLeafletStatus } from "./demoLeafletStatus";

const currentId = "lf-aug-2026";
const targetId = "lf-oct-2026";
const rows = () => mergeDemoCollection("leaflets", sampleLeaflets);

beforeEach(() => {
  const entries = new Map<string, string>();
  const storage = {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  };
  vi.stubGlobal("window", {
    localStorage: storage, sessionStorage: storage, dispatchEvent: vi.fn(),
  });
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Demo must not make live requests"); }));
});
afterEach(() => vi.unstubAllGlobals());

describe("demo leaflet status", () => {
  it("closes the confirmed current issue and activates the target in one persisted change", () => {
    patchDemoEntity("leaflets", targetId, { status: "closed", closed_at: "old-date" });
    const notify = vi.spyOn(window, "dispatchEvent").mockClear();
    setDemoLeafletStatus(targetId, "active", currentId);
    expect(rows().filter((row) => row.status === "active").map((row) => row.id)).toEqual([targetId]);
    expect(rows().find((row) => row.id === currentId)?.status).toBe("closed");
    expect(readDemoStore().buckets.leaflets.patches[targetId]).toMatchObject({
      status: "active", activated_at: expect.any(String), closed_at: null,
    });
    expect(notify).toHaveBeenCalledOnce();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects stale consent without closing a different active issue", () => {
    setDemoLeafletStatus(targetId, "active", currentId);
    const before = readDemoStore();
    expect(() => setDemoLeafletStatus("lf-nov-2026", "active", currentId))
      .toThrow("active issue has changed");
    expect(readDemoStore()).toEqual(before);
  });

  it("does not activate the next planned issue when closing the current one", () => {
    setDemoLeafletStatus(currentId, "closed", currentId);
    expect(rows().filter((row) => row.status === "active")).toEqual([]);
    setDemoLeafletStatus(targetId, "active", null);
    expect(rows().filter((row) => row.status === "active").map((row) => row.id)).toEqual([targetId]);
  });

  it("can close a planned issue without altering the active one or other issues", () => {
    setDemoLeafletStatus(targetId, "closed", currentId);
    expect(rows()).toEqual(sampleLeaflets.map((row) => row.id === targetId ? { ...row, status: "closed", closed_at: expect.any(String), updated_at: expect.any(String) } : row));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("leaves an already active issue unchanged and rejects missing targets", () => {
    const before = readDemoStore();
    setDemoLeafletStatus(currentId, "active", null);
    expect(readDemoStore()).toEqual(before);
    expect(() => setDemoLeafletStatus("missing", "active", currentId)).toThrow("Leaflet not found");
    expect(readDemoStore()).toEqual(before);
  });

  it("surfaces storage failures without persisting half a switch", () => {
    const before = readDemoStore();
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => { throw new Error("Storage full"); });
    expect(() => setDemoLeafletStatus(targetId, "active", currentId)).toThrow("Storage full");
    expect(readDemoStore()).toEqual(before);
  });
});

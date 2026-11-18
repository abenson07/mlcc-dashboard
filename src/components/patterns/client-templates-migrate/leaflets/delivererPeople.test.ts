import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { People } from "@/types/database";
import { sampleDeliverers, type LeafletRouteRow } from "@/data/mocks/leaflets";
import { listDemoScoped } from "@/lib/demo/demoStore";
import {
  createDelivererPerson,
  demoDelivererPeople,
  newDelivererData,
  normalizeContact,
  personContact,
  updateDelivererContact,
  withDemoContacts,
} from "./delivererPeople";
import { applyDemoLeafletDelivererAssign } from "./leafletDeliveryStatus";

const input = { name: " New Neighbor ", email: " neighbor@example.com ", address: " 123 Main St ", phone: " 206-555-1234 " };

function storage() {
  const entries = new Map<string, string>();
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  };
}

beforeEach(() => {
  vi.stubGlobal("window", { localStorage: storage(), sessionStorage: storage(), dispatchEvent: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());

describe("deliverer contact validation", () => {
  it("requires a name and valid email when creating, and trims contact fields", () => {
    expect(newDelivererData(input)).toEqual({
      full_name: "New Neighbor",
      email: "neighbor@example.com",
      address: "123 Main St",
      phone: "206-555-1234",
    });
    expect(() => newDelivererData({ ...input, name: " " })).toThrow("Enter a name and email.");
    expect(() => newDelivererData({ ...input, email: "" })).toThrow("Enter a name and email.");
    expect(() => newDelivererData({ ...input, email: "invalid" })).toThrow("valid email");
    expect(() => newDelivererData({ ...input, phone: "123" })).toThrow("valid phone");
  });

  it("allows all existing contacts to be cleared and validates only non-empty values", () => {
    for (const field of ["email", "address", "phone"] as const) {
      expect(normalizeContact(field, "  ")).toBeNull();
    }
    expect(personContact({ id: "p", full_name: "Name", email: null, address: null, phone: null }))
      .toEqual({ name: "Name", email: "", address: "", phone: "" });
    expect(withDemoContacts([sampleDeliverers[1]!])[0]!.address).toBe("");
  });
});

describe("demo creation and editing", () => {
  it("keeps a created person selectable before assignment and preserves their contacts during assignment", async () => {
    const create = vi.fn();
    const person = await createDelivererPerson(input, { demo: true, create });
    expect(create).not.toHaveBeenCalled();
    expect(demoDelivererPeople().find((p) => p.id === person.id)).toMatchObject({
      email: "neighbor@example.com", address: "123 Main St", phone: "206-555-1234",
    });
    // Canceling the assignment does not remove the independently created person.
    expect(demoDelivererPeople().some((p) => p.id === person.id)).toBe(true);
    const route: LeafletRouteRow = { id: "open-route", routeId: "route", name: "Main St", initials: "", detail: "", status: "unassigned" };
    const assigned = applyDemoLeafletDelivererAssign("edition", route, { id: person.id, name: person.full_name, email: person.email });
    expect(assigned.deliverers.find((p) => p.id === person.id)).toMatchObject({
      name: "New Neighbor", email: "neighbor@example.com", address: "123 Main St", phone: "206-555-1234",
      routes: [expect.objectContaining({ deliveryId: "open-route" })],
    });
    expect(listDemoScoped("leafletDeliverers", "edition")).toEqual(assigned.deliverers);
  });

  it("merges shared contact edits over multiple leaflet snapshots without live writes", async () => {
    const update = vi.fn();
    const row = sampleDeliverers[0]!;
    await updateDelivererContact(row.id, "email", "changed@example.com", { demo: true, update });
    await updateDelivererContact(row.id, "address", "", { demo: true, update });
    await updateDelivererContact(row.id, "phone", "206 555 9999", { demo: true, update });
    for (const snapshot of [[row], [{ ...row, routes: [] }]]) {
      expect(withDemoContacts(snapshot)[0]).toMatchObject({
        email: "changed@example.com", address: "", phone: "206 555 9999",
      });
    }
    expect(demoDelivererPeople().find((p) => p.id === row.id)?.email).toBe("changed@example.com");
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects duplicate demo emails without altering a person", async () => {
    const create = vi.fn();
    const update = vi.fn();
    await createDelivererPerson(input, { demo: true, create });
    await expect(createDelivererPerson({ ...input, email: "NEIGHBOR@example.com" }, { demo: true, create }))
      .rejects.toThrow("already in the database");
    await expect(updateDelivererContact(sampleDeliverers[0]!.id, "email", "neighbor@example.com", { demo: true, update }))
      .rejects.toThrow("already in the database");
    expect(withDemoContacts([sampleDeliverers[0]!])[0]!.email).toBe(sampleDeliverers[0]!.email);
  });
});

describe("live mutations", () => {
  it("uses only the intended contact patch and propagates save failures", async () => {
    const update = vi.fn().mockResolvedValue({});
    await updateDelivererContact("person", "email", " ", { demo: false, update });
    expect(update).toHaveBeenCalledExactlyOnceWith("person", { email: null });
    update.mockRejectedValueOnce(new Error("Permission denied"));
    await expect(updateDelivererContact("person", "phone", "2065551234", { demo: false, update }))
      .rejects.toThrow("Permission denied");
    await expect(updateDelivererContact("person", "email", "bad", { demo: false, update }))
      .rejects.toThrow("valid email");
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("propagates failed creation and returns the saved person on success", async () => {
    const failure = { code: "23505", message: "Duplicate email" };
    const create = vi.fn().mockRejectedValueOnce(failure);
    await expect(createDelivererPerson(input, { demo: false, create })).rejects.toEqual(failure);
    const saved = { id: "person", ...newDelivererData(input) } as People;
    create.mockResolvedValueOnce(saved);
    expect(await createDelivererPerson(input, { demo: false, create })).toBe(saved);
    expect(create).toHaveBeenLastCalledWith(newDelivererData(input));
  });
});

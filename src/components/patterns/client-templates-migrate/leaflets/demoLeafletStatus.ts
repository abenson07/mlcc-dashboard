import { sampleLeaflets } from "@/data/mocks/leaflets";
import { mergeDemoCollection, patchDemoEntities, patchDemoEntity } from "@/lib/demo/demoStore";

export function setDemoLeafletStatus(
  id: string,
  status: "active" | "closed",
  expectedActiveId: string | null,
) {
  const leaflets = mergeDemoCollection("leaflets", sampleLeaflets);
  const target = leaflets.find((leaflet) => leaflet.id === id);
  if (!target) throw new Error("Leaflet not found");
  const now = new Date().toISOString();
  if (status === "closed") {
    patchDemoEntity("leaflets", id, { status, closed_at: now, updated_at: now });
    return;
  }
  const active = leaflets.find((leaflet) => leaflet.status === "active");
  if (active?.id === id) return;
  if ((active?.id ?? null) !== expectedActiveId) {
    throw new Error("The active issue has changed. Close this dialog and try again.");
  }
  patchDemoEntities("leaflets", [
    ...(active ? [{ id: active.id, patch: { status: "closed", closed_at: now, updated_at: now } }] : []),
    { id, patch: { status, activated_at: now, closed_at: null, updated_at: now } },
  ]);
}

export type DemoOverlayKind = "people" | "businesses";

export type DemoOverlay = {
  people: Record<string, Record<string, unknown>>;
  businesses: Record<string, Record<string, unknown>>;
};

const STORAGE_KEY = "admin-migrate-demo-overlay:v1";

function emptyOverlay(): DemoOverlay {
  return { people: {}, businesses: {} };
}

export function readOverlay(): DemoOverlay {
  if (typeof window === "undefined") return emptyOverlay();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyOverlay();
    const parsed = JSON.parse(raw) as Partial<DemoOverlay>;
    return { people: parsed.people ?? {}, businesses: parsed.businesses ?? {} };
  } catch {
    return emptyOverlay();
  }
}

function writeOverlay(overlay: DemoOverlay) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay));
}

/** Merge `patch` into the stored record for `kind`/`id` and persist. Returns the new overlay. */
export function patchOverlayEntity(
  kind: DemoOverlayKind,
  id: string,
  patch: Record<string, unknown>,
): DemoOverlay {
  const overlay = readOverlay();
  overlay[kind] = { ...overlay[kind], [id]: { ...overlay[kind][id], ...patch } };
  writeOverlay(overlay);
  return overlay;
}

export function clearOverlay(): DemoOverlay {
  const overlay = emptyOverlay();
  writeOverlay(overlay);
  return overlay;
}

/** Merge any stored overlay patch for `kind`/`id` over `base`. Returns `base` unchanged if no override exists. */
export function applyOverlay<T extends { id: string }>(overlay: DemoOverlay, kind: DemoOverlayKind, base: T): T {
  const patch = overlay[kind][base.id];
  return patch ? { ...base, ...patch } : base;
}

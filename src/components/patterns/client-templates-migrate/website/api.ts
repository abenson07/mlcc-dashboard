import { getApiBase } from "@/lib/apiBase";

export type SiteSession = { token: string; siteUrl: string };
export type EventItem = { id: string; title: string; slug?: string; startsAt?: string; hasDraft: boolean; published: boolean };
export type LoadedWebsiteDoc = {
  doc: { _id: string; _type: string; [field: string]: unknown };
  type: string;
  hasDraft: boolean;
  published: boolean;
};
export type SanityImageValue = { _type: "image"; asset: { _type: "reference"; _ref: string }; alt?: string };

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}/api/website/${path}`, { credentials: "same-origin", ...init });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`);
  return body as T;
}

const json = (data: unknown): RequestInit => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });

export const websiteApi = {
  session: () => call<SiteSession>("session", { method: "POST" }),
  events: () => call<{ events: EventItem[] }>("pages").then((r) => r.events),
  doc: (id: string) => call<LoadedWebsiteDoc>(`doc?id=${encodeURIComponent(id)}`),
  save: (id: string, changes: Record<string, unknown>) => call<{ ok: true }>("save", json({ id, changes })),
  publish: (id: string) => call<{ ok: true }>("publish", json({ id, action: "publish" })),
  discard: (id: string) => call<{ ok: true }>("publish", json({ id, action: "discard" })),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return call<{ image: SanityImageValue }>("upload", { method: "POST", body: form }).then((r) => r.image);
  },
};

/** CDN URL for a Sanity image reference like `image-<id>-800x600-jpg`. */
export function sanityImageUrl(ref: string | undefined, width = 400): string | undefined {
  const m = ref?.match(/^image-([A-Za-z0-9]+)-(\d+x\d+)-([a-z0-9]+)$/);
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!m || !projectId) return undefined;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${m[1]}-${m[2]}.${m[3]}?w=${width}&auto=format`;
}

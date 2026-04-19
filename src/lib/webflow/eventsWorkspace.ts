import { getWebflowApiToken, getWebflowEventsCollectionId } from "@/lib/webflow/env";
import { webflowJson } from "@/lib/webflow/client";

export type WebflowOptionChoice = { id: string; name: string };

export type WebflowCollectionField = {
  id: string;
  slug: string;
  displayName: string;
  type: string;
  isRequired: boolean;
  isEditable: boolean;
  validations?: { options?: WebflowOptionChoice[] };
  metadata?: { options?: Array<Partial<WebflowOptionChoice> & { name?: string }> };
};

export type WebflowEventsCollectionInfo = {
  id: string;
  displayName: string;
  fields: WebflowCollectionField[];
};

export type WebflowEventItem = {
  id: string;
  isArchived?: boolean;
  isDraft?: boolean;
  fieldData: Record<string, unknown>;
};

type ListItemsResponse = {
  items: WebflowEventItem[];
  pagination: { total: number; limit: number; offset: number };
};

export function getEventsEnv(): { token: string; collectionId: string } | null {
  const token = getWebflowApiToken();
  const collectionId = getWebflowEventsCollectionId();
  if (!token || !collectionId) return null;
  return { token, collectionId };
}

export async function fetchEventsCollection(
  token: string,
  collectionId: string
): Promise<WebflowEventsCollectionInfo> {
  const raw = await webflowJson<{
    id: string;
    displayName: string;
    fields: WebflowCollectionField[];
  }>(token, `/collections/${collectionId}`, { method: "GET" });
  return {
    id: raw.id,
    displayName: raw.displayName,
    fields: raw.fields ?? [],
  };
}

export async function listAllEventItems(
  token: string,
  collectionId: string
): Promise<WebflowEventItem[]> {
  const all: WebflowEventItem[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const q = new URLSearchParams({ offset: String(offset), limit: String(limit) });
    const res = await webflowJson<ListItemsResponse>(
      token,
      `/collections/${collectionId}/items?${q.toString()}`,
      { method: "GET" }
    );
    const batch = res.items ?? [];
    all.push(...batch);
    const total = res.pagination?.total ?? all.length;
    if (all.length >= total || batch.length < limit) break;
    offset += limit;
  }
  return all;
}

export function pickCalendarFieldSlug(
  fields: WebflowCollectionField[],
  override?: string | null
): string | null {
  if (override?.trim()) return override.trim();
  const dt = fields.find((f) => f.type === "DateTime");
  return dt?.slug ?? null;
}

export function pickTitleFieldSlug(fields: WebflowCollectionField[]): string {
  const nameField = fields.find((f) => f.slug === "name");
  if (nameField) return "name";
  const text = fields.find((f) => f.type === "PlainText" && f.slug !== "slug");
  return text?.slug ?? "name";
}

export function slugifyForWebflow(name: string, suffix: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "event"}-${suffix.replace(/[^a-z0-9]/gi, "").slice(0, 10)}`;
}

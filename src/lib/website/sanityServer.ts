import { createClient, type SanityClient } from "@sanity/client";
import { DOC_TYPES, type ValidatedChanges } from "./fields";

export type WebsiteDoc = { _id: string; _type: string; [field: string]: unknown };
export type LoadedDoc = { doc: WebsiteDoc; type: string; hasDraft: boolean; published: boolean };

let cached: SanityClient | null = null;

/** Server-only Sanity client with the write token. The token never reaches the browser. */
export function sanityWrite(): SanityClient {
  if (cached) return cached;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) throw new Error("Sanity isn't configured (NEXT_PUBLIC_SANITY_PROJECT_ID / SANITY_API_WRITE_TOKEN)");
  cached = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2025-02-19",
    token,
    useCdn: false,
  });
  return cached;
}

const draftId = (id: string) => `drafts.${id}`;
const stripSystem = ({ _rev, _updatedAt, _createdAt, ...rest }: WebsiteDoc) => rest as WebsiteDoc; // eslint-disable-line @typescript-eslint/no-unused-vars

/** The document as editors should see it: the draft if there is one, otherwise the published version. */
export async function loadDoc(id: string): Promise<LoadedDoc | null> {
  const c = sanityWrite();
  const [draft, published] = await Promise.all([
    c.getDocument<WebsiteDoc>(draftId(id)),
    c.getDocument<WebsiteDoc>(id),
  ]);
  const doc = draft ?? published;
  if (!doc || !DOC_TYPES[doc._type]) return null;
  return { doc: { ...doc, _id: id }, type: doc._type, hasDraft: Boolean(draft), published: Boolean(published) };
}

/** Writes edits to the draft (creating it from the published version first), never to the live document. */
export async function saveChanges(id: string, changes: ValidatedChanges): Promise<void> {
  const c = sanityWrite();
  const [draft, published] = await Promise.all([c.getDocument<WebsiteDoc>(draftId(id)), c.getDocument<WebsiteDoc>(id)]);
  const base = draft ?? published;
  if (!base) throw new Error("Document not found");
  const tx = c.transaction();
  if (!draft) tx.createIfNotExists({ ...stripSystem(base), _id: draftId(id) });
  tx.patch(draftId(id), (p) => {
    if (Object.keys(changes.set).length) p = p.set(changes.set);
    if (changes.unset.length) p = p.unset(changes.unset);
    return p;
  });
  await tx.commit();
}

/** Publishes the draft: it replaces the live document and the draft is removed. */
export async function publishDoc(id: string): Promise<boolean> {
  const c = sanityWrite();
  const draft = await c.getDocument<WebsiteDoc>(draftId(id));
  if (!draft) return false;
  await c.transaction().createOrReplace({ ...stripSystem(draft), _id: id }).delete(draftId(id)).commit();
  return true;
}

export async function discardDraft(id: string): Promise<boolean> {
  const c = sanityWrite();
  if (!(await c.getDocument(draftId(id)))) return false;
  await c.delete(draftId(id));
  return true;
}

export async function uploadImage(bytes: Buffer, filename: string, contentType: string) {
  const asset = await sanityWrite().assets.upload("image", bytes, { filename, contentType });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

export type EventListItem = { id: string; title: string; slug?: string; startsAt?: string; hasDraft: boolean; published: boolean };

/** Events for the Edit website menu, including ones that only exist as drafts. */
export async function listEvents(): Promise<EventListItem[]> {
  const rows = await sanityWrite().fetch<{ _id: string; title?: string; slug?: string; startsAt?: string }[]>(
    `*[_type == "event"]{_id, title, "slug": slug.current, startsAt}`,
    {},
    { perspective: "raw" },
  );
  const byId = new Map<string, EventListItem>();
  for (const r of rows) {
    const id = r._id.replace(/^drafts\./, "");
    const isDraft = r._id.startsWith("drafts.");
    const prev = byId.get(id);
    byId.set(id, {
      id,
      title: (isDraft ? r.title : prev?.title ?? r.title) ?? "Untitled event",
      slug: (isDraft ? r.slug : prev?.slug ?? r.slug),
      startsAt: (isDraft ? r.startsAt : prev?.startsAt ?? r.startsAt),
      hasDraft: Boolean(prev?.hasDraft) || isDraft,
      published: Boolean(prev?.published) || !isDraft,
    });
  }
  return [...byId.values()].sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""));
}

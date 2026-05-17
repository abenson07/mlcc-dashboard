import type { VolunteerAskWithSignups } from "hooks";
import {
  formatCommitmentTypeLabel,
  formatVolunteerCommitment,
} from "@/lib/volunteers/formatCommitment";
import { webflowJson } from "@/lib/webflow/client";
import type { VolunteerAskFieldSlugs } from "@/lib/webflow/volunteer-ask-field-slugs";
import { getVolunteerAskFieldSlugs } from "@/lib/webflow/volunteer-ask-field-slugs";
import { getWebflowApiToken, getWebflowVolunteerAsksCollectionId } from "@/lib/webflow/env";
import {
  getVolunteerAskWebflowConfigIssues,
  isVolunteerAsksWebflowConfigured,
} from "@/lib/webflow/volunteerAskConfig";
import { listAllItems, publishItemIds } from "@/lib/webflow/banners";
import type { WebflowCollectionItem } from "@/lib/webflow/banners";
import { getBannerLocaleContext } from "@/lib/webflow/siteLocales";
import type { PublishCollectionItemsOptions } from "@/lib/webflow/publishItems";
import { slugifyFromEventName } from "@/lib/webflow/slugifyEvent";

export { isVolunteerAsksWebflowConfigured, getVolunteerAskWebflowConfigIssues };

function readStr(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}

function slugForAsk(ask: Pick<VolunteerAskWithSignups, "id" | "title">): string {
  const base = slugifyFromEventName(ask.title);
  return `${base}-${ask.id.slice(0, 8)}`;
}

function buildFieldData(
  slugs: VolunteerAskFieldSlugs,
  ask: VolunteerAskWithSignups
): Record<string, unknown> {
  const eventName = ask.event?.name?.trim() || "";
  return {
    name: ask.title.trim(),
    slug: slugForAsk(ask),
    [slugs.supabaseAskId]: ask.id,
    [slugs.description]: ask.description?.trim() ?? "",
    [slugs.commitmentType]: formatCommitmentTypeLabel(ask.commitment_type),
    [slugs.commitmentUnit]: ask.commitment_unit,
    [slugs.commitmentQuantity]: ask.commitment_quantity,
    [slugs.commitmentSummary]: formatVolunteerCommitment(ask),
    [slugs.quantityNeeded]: ask.quantity,
    [slugs.signedUp]: ask.signup_count,
    [slugs.remaining]: ask.remaining_slots,
    [slugs.eventName]: eventName,
  };
}

function findItemBySupabaseId(
  items: WebflowCollectionItem[],
  slugs: VolunteerAskFieldSlugs,
  askId: string
): WebflowCollectionItem | undefined {
  return items.find(
    (item) => readStr(item.fieldData?.[slugs.supabaseAskId]) === askId
  );
}

export type SyncVolunteerAskResult = {
  askId: string;
  webflowItemId: string;
  action: "created" | "updated" | "archived";
};

export async function syncVolunteerAskToWebflow(
  ask: VolunteerAskWithSignups
): Promise<SyncVolunteerAskResult> {
  const issues = getVolunteerAskWebflowConfigIssues();
  const token = getWebflowApiToken();
  const collectionId = getWebflowVolunteerAsksCollectionId();
  if (issues.length > 0 || !token?.trim() || !collectionId) {
    throw new Error(
      `Webflow volunteer asks not configured. Set: ${issues.join(", ") || "missing env"}.`
    );
  }

  const slugs = getVolunteerAskFieldSlugs();
  const localeCtx = await getBannerLocaleContext(token);
  const publishOpts: PublishCollectionItemsOptions | undefined =
    localeCtx.cmsLocaleIds.length > 0 ? { cmsLocaleIds: localeCtx.cmsLocaleIds } : undefined;

  const items = await listAllItems(token, collectionId);
  const existing = findItemBySupabaseId(items, slugs, ask.id);
  const fieldData = buildFieldData(slugs, ask);

  const body: Record<string, unknown> = {
    isDraft: false,
    isArchived: false,
    fieldData,
  };
  if (localeCtx.cmsLocaleId) {
    body.cmsLocaleId = localeCtx.cmsLocaleId;
  }

  if (existing) {
    const updated = await webflowJson<WebflowCollectionItem>(
      token,
      `/collections/${collectionId}/items/${existing.id}`,
      { method: "PATCH", body: JSON.stringify(body) }
    );
    await publishItemIds(token, collectionId, [updated.id], publishOpts);
    return { askId: ask.id, webflowItemId: updated.id, action: "updated" };
  }

  const created = await webflowJson<WebflowCollectionItem>(
    token,
    `/collections/${collectionId}/items`,
    { method: "POST", body: JSON.stringify(body) }
  );
  await publishItemIds(token, collectionId, [created.id], publishOpts);
  return { askId: ask.id, webflowItemId: created.id, action: "created" };
}

export async function archiveVolunteerAskOnWebflow(askId: string): Promise<SyncVolunteerAskResult | null> {
  const issues = getVolunteerAskWebflowConfigIssues();
  const token = getWebflowApiToken();
  const collectionId = getWebflowVolunteerAsksCollectionId();
  if (issues.length > 0 || !token?.trim() || !collectionId) {
    throw new Error(
      `Webflow volunteer asks not configured. Set: ${issues.join(", ") || "missing env"}.`
    );
  }

  const slugs = getVolunteerAskFieldSlugs();
  const items = await listAllItems(token, collectionId);
  const existing = findItemBySupabaseId(items, slugs, askId);
  if (!existing) return null;

  const localeCtx = await getBannerLocaleContext(token);
  const publishOpts: PublishCollectionItemsOptions | undefined =
    localeCtx.cmsLocaleIds.length > 0 ? { cmsLocaleIds: localeCtx.cmsLocaleIds } : undefined;

  const body: Record<string, unknown> = { isArchived: true };
  if (localeCtx.cmsLocaleId) {
    body.cmsLocaleId = localeCtx.cmsLocaleId;
  }

  const updated = await webflowJson<WebflowCollectionItem>(
    token,
    `/collections/${collectionId}/items/${existing.id}`,
    { method: "PATCH", body: JSON.stringify(body) }
  );
  await publishItemIds(token, collectionId, [updated.id], publishOpts);
  return { askId, webflowItemId: updated.id, action: "archived" };
}

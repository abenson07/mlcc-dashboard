import { getWebflowApiToken, getWebflowBannersCollectionId } from "@/lib/webflow/env";

export type WebflowBannerConfig = {
  token: string;
  collectionId: string;
};

export function getWebflowBannerConfig():
  | { ok: true; config: WebflowBannerConfig }
  | { ok: false; missing: string[] } {
  const token = getWebflowApiToken();
  const collectionId = getWebflowBannersCollectionId();
  if (!token || !collectionId) {
    const missing: string[] = [];
    if (!token) missing.push("WEBFLOW_SITE_API_TOKEN or WEBFLOW_API_TOKEN");
    if (!collectionId) missing.push("WEBFLOW_BANNERS_COLLECTION_ID");
    return { ok: false, missing };
  }
  const config: WebflowBannerConfig = { token, collectionId };
  return { ok: true, config };
}

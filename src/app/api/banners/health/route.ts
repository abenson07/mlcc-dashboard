import { requireSession } from "@/lib/auth/require-session";
import { getWebflowBannerConfig } from "@/lib/webflow/config";
import { getBannerFieldSlugs } from "@/lib/webflow/field-slugs";
import { webflowJson, WebflowRequestError } from "@/lib/webflow/client";
import { validateBannerCollectionFields } from "@/lib/webflow/validate-banner-collection";
import { NextResponse } from "next/server";

type CollectionResponse = {
  id: string;
  displayName: string;
  singularName?: string;
  slug: string;
  fields?: Array<{ slug: string; type: string }>;
};

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const wf = getWebflowBannerConfig();
  if (!wf.ok) {
    return NextResponse.json({
      configured: false,
      missing: wf.missing,
      issues: [] as string[],
    });
  }

  const slugs = getBannerFieldSlugs();
  try {
    const collection = await webflowJson<CollectionResponse>(
      wf.config.token,
      `/collections/${wf.config.collectionId}`,
      { method: "GET" }
    );
    const fields = (collection.fields ?? []).map((f) => ({
      slug: f.slug,
      type: f.type,
    }));
    const validation = validateBannerCollectionFields(fields, slugs);
    const issues = validation.ok ? [] : validation.issues;

    return NextResponse.json({
      configured: true,
      missing: [] as string[],
      collection: {
        id: collection.id,
        displayName: collection.displayName,
        slug: collection.slug,
      },
      fieldSlugs: slugs,
      fieldCheck: validation.ok ? "ok" : "issues",
      issues,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Webflow request failed";
    const status =
      e instanceof WebflowRequestError &&
      e.status >= 400 &&
      e.status < 600
        ? e.status
        : 502;
    return NextResponse.json(
      {
        configured: true,
        missing: [] as string[],
        fieldCheck: "error",
        issues: [message],
      },
      { status }
    );
  }
}

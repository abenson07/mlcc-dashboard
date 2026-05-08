import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchEventsCollection,
  listAllCollectionItems,
  pickTitleFieldSlug,
} from "@/lib/webflow/eventsWorkspace";
import { getWebflowApiToken, getWebflowCommitteesCollectionId } from "@/lib/webflow/env";
import { WebflowRequestError } from "@/lib/webflow/client";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = getWebflowApiToken();
    const collectionId = getWebflowCommitteesCollectionId();
    if (!token || !collectionId) {
      return NextResponse.json(
        {
          error:
            "Missing Webflow committees: set WEBFLOW_COMMITTEES_COLLECTION_ID and WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN).",
        },
        { status: 503 }
      );
    }

    const collection = await fetchEventsCollection(token, collectionId);
    const titleSlug = pickTitleFieldSlug(collection.fields);
    const items = await listAllCollectionItems(token, collectionId);
    const rows = items
      .filter((i) => !i.isArchived)
      .map((i) => {
        const fd = i.fieldData ?? {};
        const name = String(fd[titleSlug] ?? fd.name ?? "Untitled");
        const slug = typeof fd.slug === "string" ? fd.slug : "";
        return { id: i.id, name, slug };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ items: rows });
  } catch (e) {
    if (e instanceof WebflowRequestError) {
      const status = e.status >= 400 && e.status < 600 ? e.status : 502;
      return NextResponse.json({ error: e.message }, { status });
    }
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

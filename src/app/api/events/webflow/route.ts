import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchEventsCollection,
  getEventsEnv,
  listAllEventItems,
  pickCalendarFieldSlug,
  pickTitleFieldSlug,
} from "@/lib/webflow/eventsWorkspace";
import { slugifyFromEventName } from "@/lib/webflow/slugifyEvent";
import { webflowJson, WebflowRequestError } from "@/lib/webflow/client";
import { publishCollectionItemIds } from "@/lib/webflow/publishItems";

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

    const env = getEventsEnv();
    if (!env) {
      return NextResponse.json(
        {
          error:
            "Missing Webflow credentials: set WEBFLOW_EVENTS_COLLECTION_ID and either WEBFLOW_SITE_API_TOKEN or WEBFLOW_API_TOKEN",
        },
        { status: 503 }
      );
    }
    const { token, collectionId } = env;

    const calendarFieldOverride = process.env.WEBFLOW_EVENT_CALENDAR_FIELD_SLUG?.trim() || null;

    const collection = await fetchEventsCollection(token, collectionId);
    const items = await listAllEventItems(token, collectionId);
    const calendarFieldSlug = pickCalendarFieldSlug(collection.fields, calendarFieldOverride);
    const titleFieldSlug = pickTitleFieldSlug(collection.fields);

    return NextResponse.json({
      collection,
      items,
      calendarFieldSlug,
      titleFieldSlug,
    });
  } catch (e) {
    if (e instanceof WebflowRequestError) {
      const status = e.status >= 400 && e.status < 600 ? e.status : 502;
      return NextResponse.json({ error: e.message }, { status });
    }
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { fieldData?: Record<string, unknown> };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const incoming = body.fieldData && typeof body.fieldData === "object" ? body.fieldData : null;
    if (!incoming) {
      return NextResponse.json({ error: "fieldData object is required" }, { status: 400 });
    }

    const env = getEventsEnv();
    if (!env) {
      return NextResponse.json(
        {
          error:
            "Missing Webflow credentials: set WEBFLOW_EVENTS_COLLECTION_ID and either WEBFLOW_SITE_API_TOKEN or WEBFLOW_API_TOKEN",
        },
        { status: 503 }
      );
    }
    const { token, collectionId } = env;

    const name = typeof incoming.name === "string" ? incoming.name : "Untitled event";
    const fd: Record<string, unknown> = { ...incoming, name };
    if (typeof fd.slug !== "string" || !fd.slug.trim()) {
      fd.slug = slugifyFromEventName(name);
    }

    const created = await webflowJson<{ id: string; fieldData?: Record<string, unknown> }>(
      token,
      `/collections/${collectionId}/items`,
      {
        method: "POST",
        body: JSON.stringify({
          isArchived: false,
          isDraft: false,
          fieldData: fd,
        }),
      }
    );

    const itemId = created.id;
    if (itemId && process.env.WEBFLOW_EVENTS_SKIP_PUBLISH !== "true") {
      try {
        await publishCollectionItemIds(token, collectionId, [itemId]);
      } catch (pubErr) {
        return NextResponse.json(
          {
            id: itemId,
            fieldData: created.fieldData ?? fd,
            warning:
              pubErr instanceof Error
                ? `Created in CMS but publish to live site failed: ${pubErr.message}`
                : "Created in CMS but publish to live site failed.",
          },
          { status: 202 }
        );
      }
    }

    return NextResponse.json(
      { id: created.id, fieldData: created.fieldData ?? fd },
      { status: 202 }
    );
  } catch (e) {
    if (e instanceof WebflowRequestError) {
      const status = e.status >= 400 && e.status < 600 ? e.status : 502;
      return NextResponse.json({ error: e.message }, { status });
    }
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

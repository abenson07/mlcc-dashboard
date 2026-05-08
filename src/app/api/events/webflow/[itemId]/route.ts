import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEventsEnv } from "@/lib/webflow/eventsWorkspace";
import { webflowJson, WebflowRequestError } from "@/lib/webflow/client";
import { publishCollectionItemIds } from "@/lib/webflow/publishItems";

type Ctx = { params: Promise<{ itemId: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  try {
    const { itemId } = await ctx.params;
    if (!itemId) {
      return NextResponse.json({ error: "Missing item id" }, { status: 400 });
    }

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

    const item = await webflowJson<{
      id: string;
      isArchived?: boolean;
      isDraft?: boolean;
      fieldData?: Record<string, unknown>;
    }>(token, `/collections/${collectionId}/items/${encodeURIComponent(itemId)}`, {
      method: "GET",
    });

    return NextResponse.json({
      id: item.id,
      isArchived: item.isArchived,
      isDraft: item.isDraft,
      fieldData: item.fieldData ?? {},
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

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { itemId } = await ctx.params;
    if (!itemId) {
      return NextResponse.json({ error: "Missing item id" }, { status: 400 });
    }

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

    const updated = await webflowJson<{ id: string; fieldData?: Record<string, unknown> }>(
      token,
      `/collections/${collectionId}/items/${encodeURIComponent(itemId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ isDraft: false, fieldData: incoming }),
      }
    );

    if (process.env.WEBFLOW_EVENTS_SKIP_PUBLISH !== "true") {
      try {
        await publishCollectionItemIds(token, collectionId, [itemId]);
      } catch (pubErr) {
        return NextResponse.json({
          id: updated.id,
          fieldData: updated.fieldData ?? incoming,
          warning:
            pubErr instanceof Error
              ? `Saved in CMS but publish to live site failed: ${pubErr.message}`
              : "Saved in CMS but publish to live site failed.",
        });
      }
    }

    return NextResponse.json({ id: updated.id, fieldData: updated.fieldData ?? incoming });
  } catch (e) {
    if (e instanceof WebflowRequestError) {
      const status = e.status >= 400 && e.status < 600 ? e.status : 502;
      return NextResponse.json({ error: e.message }, { status });
    }
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    const { itemId } = await ctx.params;
    if (!itemId) {
      return NextResponse.json({ error: "Missing item id" }, { status: 400 });
    }

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

    await webflowJson<unknown>(
      token,
      `/collections/${collectionId}/items/${encodeURIComponent(itemId)}`,
      { method: "DELETE" }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof WebflowRequestError) {
      const status = e.status >= 400 && e.status < 600 ? e.status : 502;
      return NextResponse.json({ error: e.message }, { status });
    }
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

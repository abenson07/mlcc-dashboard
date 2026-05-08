import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWebflowApiToken, getWebflowSiteId } from "@/lib/webflow/env";
import { WebflowRequestError } from "@/lib/webflow/client";
import { uploadSiteImageAsset } from "@/lib/webflow/uploadSiteAsset";

export const runtime = "nodejs";

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

    const token = getWebflowApiToken();
    const siteId = getWebflowSiteId();
    if (!token || !siteId) {
      return NextResponse.json(
        {
          error:
            "Missing Webflow credentials: set WEBFLOW_SITE_ID and WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN); token needs assets:write.",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const { url, fileId } = await uploadSiteImageAsset(
      token,
      siteId,
      buf,
      file.name || "image",
      file.type || "application/octet-stream"
    );

    return NextResponse.json({ url, fileId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    const status =
      e instanceof WebflowRequestError && e.status >= 400 && e.status < 600
        ? e.status
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { placeDetailsNew } from "@/lib/places/googlePlaces";

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

    let body: { placeId?: unknown; sessionToken?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const placeId = typeof body.placeId === "string" ? body.placeId.trim() : "";
    if (!placeId) {
      return NextResponse.json({ error: "placeId is required" }, { status: 400 });
    }
    const sessionToken =
      typeof body.sessionToken === "string" ? body.sessionToken.slice(0, 120) : undefined;

    const place = await placeDetailsNew(placeId, sessionToken);
    return NextResponse.json({ place });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Place details failed";
    const status = /not set|GOOGLE_PLACES/i.test(message) ? 503 : 502;
    console.error("[places/details]", e);
    return NextResponse.json({ error: message }, { status });
  }
}

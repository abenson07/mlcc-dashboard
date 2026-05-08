import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { placesAutocompleteNew } from "@/lib/places/googlePlaces";

export const runtime = "nodejs";

const MAX_INPUT = 200;

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

    let body: { input?: unknown; sessionToken?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const input = typeof body.input === "string" ? body.input.slice(0, MAX_INPUT) : "";
    const sessionToken =
      typeof body.sessionToken === "string" ? body.sessionToken.slice(0, 120) : undefined;

    const suggestions = await placesAutocompleteNew(input, sessionToken);
    return NextResponse.json({ suggestions });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Autocomplete failed";
    const status = /not set|GOOGLE_PLACES/i.test(message) ? 503 : 502;
    console.error("[places/autocomplete]", e);
    return NextResponse.json({ error: message }, { status });
  }
}

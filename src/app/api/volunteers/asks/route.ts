import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForVolunteerRoutes } from "@/lib/volunteers/supabaseForVolunteerRoutes";
import type { VolunteerAsksInsert } from "@/types/database";
import { parseVolunteerAskBody } from "@/lib/volunteers/parseVolunteerAskBody";

/** Create a volunteer ask in Supabase. */
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseVolunteerAskBody(body);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid volunteer ask payload" }, { status: 400 });
  }

  const supabase = await getSupabaseForVolunteerRoutes();
  const {
    event_id: directEventId,
    committee: parsedCommittee,
    auto_accept_provided: _autoProvided,
    ...fields
  } = parsed;
  const insertPayload: VolunteerAsksInsert = {
    ...fields,
    event_id: directEventId,
    committee: parsedCommittee ?? "steering",
  };

  try {
    // Prefer committee from linked event field_data when caller omitted it.
    if (!parsedCommittee && insertPayload.event_id) {
      const { data: eventRow } = await supabase
        .from("events")
        .select("field_data")
        .eq("id", insertPayload.event_id)
        .maybeSingle();
      const raw = (eventRow?.field_data as Record<string, unknown> | null)?.committee;
      if (
        raw === "events" ||
        raw === "outreach" ||
        raw === "hub" ||
        raw === "leaflet" ||
        raw === "communications" ||
        raw === "steering" ||
        raw === "executive_board" ||
        raw === "businesses"
      ) {
        insertPayload.committee = raw;
      }
    }

    const { data: created, error: insertError } = await supabase
      .from("volunteer_asks")
      .insert(insertPayload)
      .select()
      .single();

    if (insertError || !created) {
      return NextResponse.json(
        { error: insertError?.message ?? "Failed to create volunteer ask" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      ask: created,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create volunteer ask";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

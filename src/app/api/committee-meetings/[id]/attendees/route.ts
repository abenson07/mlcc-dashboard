import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const rawPersonIds = Array.isArray(o.person_ids)
    ? o.person_ids.filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    : null;

  if (!rawPersonIds) {
    return NextResponse.json({ error: "person_ids array is required" }, { status: 400 });
  }

  const personIds = [...new Set(rawPersonIds.map((id) => id.trim()))];

  const supabase = await getSupabaseForLeafletRoutes();

  const { data: meeting, error: meetingError } = await supabase
    .from("committee_meetings")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (meetingError) {
    return NextResponse.json({ error: meetingError.message }, { status: 500 });
  }
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("committee_meeting_attendees")
    .delete()
    .eq("meeting_id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (personIds.length > 0) {
    const { data: existingPeople, error: peopleError } = await supabase
      .from("people")
      .select("id")
      .in("id", personIds);

    if (peopleError) {
      return NextResponse.json({ error: peopleError.message }, { status: 500 });
    }

    const validIds = (existingPeople ?? []).map((p) => p.id);
    if (validIds.length !== personIds.length) {
      return NextResponse.json(
        { error: "One or more selected people no longer exist. Refresh and try again." },
        { status: 400 },
      );
    }

    const { error: insertError } = await supabase
      .from("committee_meeting_attendees")
      .insert(validIds.map((person_id) => ({ meeting_id: id, person_id })));

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  const { data: attendees, error: fetchError } = await supabase
    .from("committee_meeting_attendees")
    .select("id, person_id, created_at, people ( id, full_name, email )")
    .eq("meeting_id", id);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, attendees: attendees ?? [] });
}

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

const MEETING_SELECT = `
  *,
  events ( id, name, starts_at, ends_at ),
  committee_meeting_attendees (
    id,
    person_id,
    created_at,
    people ( id, full_name, email )
  ),
  action_items (
    id,
    title,
    description,
    assignee_person_id,
    status,
    due_at,
    source,
    sort_order,
    completed_at,
    people:assignee_person_id ( id, full_name, email )
  )
`;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const supabase = await getSupabaseForLeafletRoutes();

  const { data, error } = await supabase
    .from("committee_meetings")
    .select(MEETING_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  return NextResponse.json({ meeting: data });
}

export async function PATCH(
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
  const supabase = await getSupabaseForLeafletRoutes();

  const { data: existing, error: fetchError } = await supabase
    .from("committee_meetings")
    .select("minutes_status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof o.location_type === "string") patch.location_type = o.location_type;
  if (typeof o.location === "string" || o.location === null) patch.location = o.location;
  if (typeof o.google_calendar_url === "string" || o.google_calendar_url === null) {
    patch.google_calendar_url = o.google_calendar_url;
  }
  if (o.agenda_json && typeof o.agenda_json === "object") {
    patch.agenda_json = o.agenda_json;
  }

  const minutesLocked =
    existing.minutes_status !== "draft" &&
    existing.minutes_status !== "error" &&
    existing.minutes_status !== "submitted";

  if (!minutesLocked && (typeof o.raw_transcript === "string" || o.raw_transcript === null)) {
    patch.raw_transcript = o.raw_transcript;
  }

  if (
    !minutesLocked &&
    o.structured_minutes &&
    typeof o.structured_minutes === "object"
  ) {
    patch.structured_minutes = o.structured_minutes;
  }

  if (
    !minutesLocked &&
    (o.minutes_source === "written" ||
      o.minutes_source === "transcript" ||
      o.minutes_source === "audio" ||
      o.minutes_source === "file" ||
      o.minutes_source === null)
  ) {
    patch.minutes_source = o.minutes_source;
  }

  if (
    !minutesLocked &&
    (typeof o.minutes_attachment_url === "string" || o.minutes_attachment_url === null)
  ) {
    patch.minutes_attachment_url = o.minutes_attachment_url;
  }

  if (!minutesLocked && (typeof o.audio_url === "string" || o.audio_url === null)) {
    patch.audio_url = o.audio_url;
  }

  // Written path: save minutes as submitted (not yet published to website).
  if (
    !minutesLocked &&
    o.minutes_status === "submitted" &&
    (existing.minutes_status === "draft" || existing.minutes_status === "error")
  ) {
    patch.minutes_status = "submitted";
  }

  const { data, error } = await supabase
    .from("committee_meetings")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, meeting: data });
}

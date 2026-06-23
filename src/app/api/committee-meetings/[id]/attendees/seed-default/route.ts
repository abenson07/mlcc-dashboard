import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { seedMeetingAttendeesFromDefaults } from "@/lib/committee-meetings/defaultAttendees";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import type { CommitteeSlug } from "schemas/committee_meetings";

/** Seed configured default attendees when a meeting has none yet. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const supabase = await getSupabaseForLeafletRoutes();

  const { data: meeting, error: meetingError } = await supabase
    .from("committee_meetings")
    .select("id, committee")
    .eq("id", id)
    .maybeSingle();

  if (meetingError) {
    return NextResponse.json({ error: meetingError.message }, { status: 500 });
  }
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const { count, error: countError } = await supabase
    .from("committee_meeting_attendees")
    .select("id", { count: "exact", head: true })
    .eq("meeting_id", id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }
  if ((count ?? 0) > 0) {
    return NextResponse.json({ ok: true, seeded: 0 });
  }

  try {
    const seeded = await seedMeetingAttendeesFromDefaults(
      supabase,
      id,
      meeting.committee as CommitteeSlug,
    );
    return NextResponse.json({ ok: true, seeded });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to seed attendees";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

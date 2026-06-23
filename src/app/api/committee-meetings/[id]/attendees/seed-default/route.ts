import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

/** Seed executive-board members as default attendees when none exist yet. */
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
    .select("id")
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

  const { data: boardMembers, error: boardError } = await supabase
    .from("people")
    .select("id")
    .eq("is_executive_board", true);

  if (boardError) {
    return NextResponse.json({ error: boardError.message }, { status: 500 });
  }

  if (!boardMembers?.length) {
    return NextResponse.json({ ok: true, seeded: 0 });
  }

  const { error: insertError } = await supabase.from("committee_meeting_attendees").insert(
    boardMembers.map((p) => ({
      meeting_id: id,
      person_id: p.id,
    })),
  );

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, seeded: boardMembers.length });
}

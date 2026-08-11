import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import type { CommitteeSlug } from "schemas/committee_meetings";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

/**
 * Open + canceled action items from prior meetings of the same committee.
 * Used as the carryover / outstanding section on the next meeting workspace.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const supabase = await getSupabaseForLeafletRoutes();

  const { data: meeting, error: fetchError } = await supabase
    .from("committee_meetings")
    .select("id, committee")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const committee = meeting.committee as CommitteeSlug;

  const { data: priorMeetings, error: priorError } = await supabase
    .from("committee_meetings")
    .select("id")
    .eq("committee", committee)
    .neq("id", id);

  if (priorError) {
    return NextResponse.json({ error: priorError.message }, { status: 500 });
  }

  const priorIds = (priorMeetings ?? []).map((m) => m.id);
  if (priorIds.length === 0) {
    return NextResponse.json({ action_items: [] });
  }

  const { data, error } = await supabase
    .from("action_items")
    .select(
      `
      id, title, description, status, due_at, sort_order, committee_meeting_id, assignee_person_id, source,
      people:assignee_person_id ( id, full_name, email ),
      committee_meetings (
        id, committee, event_id,
        events ( name, starts_at )
      )
    `,
    )
    .in("committee_meeting_id", priorIds)
    .in("status", ["open", "canceled"])
    .order("due_at", { ascending: true, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const action_items = (data ?? []).map((row) => {
    const { people, ...rest } = row as unknown as Record<string, unknown> & {
      people: { id: string; full_name: string; email: string | null } | null;
    };
    return { ...rest, assignee: people ?? null };
  });

  return NextResponse.json({ action_items });
}

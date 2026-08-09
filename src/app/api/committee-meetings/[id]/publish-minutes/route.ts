import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createCommitteeMeeting } from "@/lib/committee-meetings/createCommitteeMeeting";
import { meetingWebsiteSlug } from "@/lib/committee-meetings/committeeMeetingUtils";
import { asOne } from "@/lib/committee-meetings/asOne";
import type { CommitteeSlug, StructuredMinutes } from "schemas/committee_meetings";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type ActionItemRow = {
  id: string;
  title: string;
  assignee_person_id: string | null;
  status: string;
  due_at: string | null;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const nextMeetingStartsAt =
    typeof body.next_meeting_starts_at === "string" ? body.next_meeting_starts_at : null;
  const nextLocationType =
    body.next_location_type === "remote" || body.next_location_type === "hybrid"
      ? body.next_location_type
      : "in_person";
  const nextLocation =
    typeof body.next_location === "string" ? body.next_location : null;

  const supabase = await getSupabaseForLeafletRoutes();

  const { data: meeting, error: fetchError } = await supabase
    .from("committee_meetings")
    .select(
      `
      id, committee, event_id, minutes_status, structured_minutes, website_slug, location_type, location,
      events ( starts_at, name ),
      action_items ( id, title, assignee_person_id, status, due_at )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const structured = meeting.structured_minutes as StructuredMinutes | null;
  if (!structured?.blocks?.length) {
    return NextResponse.json(
      { error: "Structured minutes are required before publishing" },
      { status: 400 },
    );
  }

  const actionItems = (meeting.action_items as ActionItemRow[] | null) ?? [];
  const openItems = actionItems.filter((item) => item.status === "open");
  const unassigned = openItems.filter((item) => !item.assignee_person_id);
  if (unassigned.length > 0) {
    return NextResponse.json(
      {
        error: `Every open action item must be assigned before publishing (${unassigned.length} unassigned)`,
        unassigned_ids: unassigned.map((i) => i.id),
      },
      { status: 400 },
    );
  }

  if (!nextMeetingStartsAt) {
    return NextResponse.json(
      { error: "next_meeting_starts_at is required" },
      { status: 400 },
    );
  }

  const committee = meeting.committee as CommitteeSlug;
  const dueDate = nextMeetingStartsAt.slice(0, 10);

  // Create next meeting if none exists for this committee on that calendar day.
  const dayStart = `${dueDate}T00:00:00.000Z`;
  const dayEnd = `${dueDate}T23:59:59.999Z`;

  const { data: existingNext } = await supabase
    .from("committee_meetings")
    .select("id, event_id, events!inner ( starts_at )")
    .eq("committee", committee)
    .neq("id", id)
    .gte("events.starts_at", dayStart)
    .lte("events.starts_at", dayEnd)
    .maybeSingle();

  let nextMeetingId: string | null = existingNext?.id ?? null;
  let nextEventId: string | null =
    (existingNext as { event_id?: string } | null)?.event_id ?? null;

  if (!nextMeetingId) {
    const created = await createCommitteeMeeting(supabase, {
      committee,
      starts_at: nextMeetingStartsAt,
      location_type: nextLocationType,
      location: nextLocation ?? (meeting.location as string | null),
    });
    nextMeetingId = created.meeting.id;
    nextEventId = created.event.id;
  }

  // Default missing dues on open items to the next meeting date.
  const missingDueIds = openItems.filter((item) => !item.due_at).map((item) => item.id);
  if (missingDueIds.length > 0) {
    const { error: dueError } = await supabase
      .from("action_items")
      .update({ due_at: dueDate, updated_at: new Date().toISOString() })
      .in("id", missingDueIds);
    if (dueError) {
      return NextResponse.json({ error: dueError.message }, { status: 500 });
    }
  }

  const events = asOne(
    meeting.events as
      | { starts_at: string | null; name: string }
      | { starts_at: string | null; name: string }[]
      | null,
  );
  const website_slug =
    (meeting.website_slug as string | null) ??
    meetingWebsiteSlug(committee, events?.starts_at ?? new Date().toISOString());

  const { error: updateError } = await supabase
    .from("committee_meetings")
    .update({
      minutes_status: "ready",
      website_slug,
      minutes_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: updated, error: refetchError } = await supabase
    .from("committee_meetings")
    .select(
      `
      *,
      action_items (
        id, title, description, assignee_person_id, status, due_at, source, sort_order,
        people:assignee_person_id ( id, full_name, email )
      )
    `,
    )
    .eq("id", id)
    .single();

  if (refetchError) {
    return NextResponse.json({ error: refetchError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    meeting: updated,
    next_meeting: { id: nextMeetingId, event_id: nextEventId, starts_at: nextMeetingStartsAt },
  });
}

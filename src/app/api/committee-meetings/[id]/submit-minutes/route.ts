import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { composeMeetingMinutes } from "@/lib/committee-meetings/composeMeetingMinutes";
import { agendaPlainText, meetingWebsiteSlug } from "@/lib/committee-meetings/committeeMeetingUtils";
import { COMMITTEE_LABELS } from "schemas/committee_meetings";
import type { CommitteeSlug } from "schemas/committee_meetings";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type AttendeeRow = {
  person_id: string;
  people: { id: string; full_name: string; email: string | null } | null;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const supabase = await getSupabaseForLeafletRoutes();

  let skipPublish = false;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    skipPublish = body.skipPublish === true;
  } catch {
    // empty body is fine (old-admin)
  }

  const { data: meeting, error: fetchError } = await supabase
    .from("committee_meetings")
    .select(
      `
      *,
      events ( starts_at, name ),
      committee_meeting_attendees (
        person_id,
        people ( id, full_name, email )
      )
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

  const status = meeting.minutes_status as string;
  if (status !== "draft" && status !== "error" && status !== "submitted") {
    return NextResponse.json(
      { error: "Minutes have already been submitted" },
      { status: 400 },
    );
  }

  const transcript = typeof meeting.raw_transcript === "string" ? meeting.raw_transcript.trim() : "";
  if (!transcript) {
    return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
  }

  await supabase
    .from("committee_meetings")
    .update({
      minutes_status: "processing",
      minutes_error: null,
      minutes_source: meeting.minutes_source ?? "transcript",
      submitted_at: new Date().toISOString(),
      submitted_by: session.user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  try {
    const attendees = (meeting.committee_meeting_attendees as AttendeeRow[] | null) ?? [];
    const attendeeList = attendees
      .map((a) => a.people)
      .filter((p): p is { id: string; full_name: string; email: string | null } => Boolean(p));

    const events = meeting.events as { starts_at: string | null; name: string } | null;
    const committee = meeting.committee as CommitteeSlug;
    const committeeName = COMMITTEE_LABELS[committee] ?? committee;
    const meetingDate = events?.starts_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);

    const result = await composeMeetingMinutes({
      rawTranscript: transcript,
      agendaText: agendaPlainText(meeting.agenda_json as Record<string, unknown> | null),
      attendees: attendeeList,
      committeeName,
      meetingDate,
    });

    const website_slug = meeting.website_slug ?? meetingWebsiteSlug(committee, events?.starts_at ?? meetingDate);

    const { error: updateError } = await supabase
      .from("committee_meetings")
      .update({
        structured_minutes: result.structured_minutes,
        minutes_status: skipPublish ? "submitted" : "ready",
        minutes_error: null,
        website_slug: skipPublish ? meeting.website_slug : website_slug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) throw new Error(updateError.message);

    await supabase.from("action_items").delete().eq("committee_meeting_id", id).eq("source", "ai");

    if (result.action_items.length > 0) {
      const { error: insertError } = await supabase.from("action_items").insert(
        result.action_items.map((item, index) => ({
          title: item.title,
          description: item.description,
          assignee_person_id: item.assignee_person_id,
          committee_meeting_id: id,
          status: "open",
          due_at: item.due_at,
          source: "ai",
          sort_order: index,
        })),
      );

      if (insertError) throw new Error(insertError.message);
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

    if (refetchError) throw new Error(refetchError.message);

    return NextResponse.json({ ok: true, meeting: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process minutes";
    await supabase
      .from("committee_meetings")
      .update({
        minutes_status: "error",
        minutes_error: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

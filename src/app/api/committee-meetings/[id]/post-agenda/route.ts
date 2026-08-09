import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { agendaPlainText } from "@/lib/committee-meetings/committeeMeetingUtils";
import { slackCommitteeName } from "@/lib/committee-meetings/slackCommittee";
import { asOne } from "@/lib/committee-meetings/asOne";
import { postToSlack } from "@/lib/slack";
import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const supabase = await getSupabaseForLeafletRoutes();

  const { data: meeting, error } = await supabase
    .from("committee_meetings")
    .select("id, committee, agenda_json, events ( name, starts_at )")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const agenda = agendaPlainText(meeting.agenda_json as Record<string, unknown> | null);
  if (!agenda.trim()) {
    return NextResponse.json({ error: "Agenda is empty" }, { status: 400 });
  }

  const committee = meeting.committee as CommitteeSlug;
  const label = COMMITTEE_LABELS[committee] ?? committee;
  const events = asOne(
    meeting.events as
      | { name: string; starts_at: string | null }
      | { name: string; starts_at: string | null }[]
      | null,
  );
  const dateStr = events?.starts_at
    ? new Date(events.starts_at).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";

  const text = [
    `*${label} committee — agenda*`,
    events?.name ? `_${events.name}_` : null,
    `Date: ${dateStr}`,
    "",
    agenda,
    "",
    "_Reply in thread with topics you’d like added._",
  ]
    .filter((line) => line !== null)
    .join("\n");

  await postToSlack(text, slackCommitteeName(committee));

  return NextResponse.json({ ok: true });
}

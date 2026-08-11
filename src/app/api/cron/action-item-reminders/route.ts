import { NextRequest, NextResponse } from "next/server";
import { postToSlack } from "@/lib/slack";
import { slackCommitteeName } from "@/lib/committee-meetings/slackCommittee";
import { asOne } from "@/lib/committee-meetings/asOne";
import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * Daily cron: Slack-remind open action items due in 6–8 days (once).
 * Protect with Authorization: Bearer $CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Admin Supabase client is not configured" }, { status: 500 });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() + 6);
  const to = new Date(today);
  to.setUTCDate(to.getUTCDate() + 8);

  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("action_items")
    .select(
      `
      id, title, due_at, reminder_sent_at,
      people:assignee_person_id ( full_name ),
      committee_meetings ( committee )
    `,
    )
    .eq("status", "open")
    .is("reminder_sent_at", null)
    .gte("due_at", fromStr)
    .lte("due_at", toStr);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = data ?? [];
  let sent = 0;

  for (const item of items) {
    const meeting = asOne(
      item.committee_meetings as { committee: string } | { committee: string }[] | null,
    );
    const committee = (meeting?.committee ?? "steering") as CommitteeSlug;
    const label = COMMITTEE_LABELS[committee] ?? committee;
    const assignee = asOne(
      item.people as { full_name: string } | { full_name: string }[] | null,
    );
    const assigneeName = assignee?.full_name ?? "Unassigned";
    const due = item.due_at as string;

    const text = [
      `*Action item reminder — ${label}*`,
      `• *${item.title}*`,
      `• Assignee: ${assigneeName}`,
      `• Due: ${due}`,
      `• View in dashboard: /admin/action-items`,
    ].join("\n");

    await postToSlack(text, slackCommitteeName(committee));

    await supabase
      .from("action_items")
      .update({ reminder_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", item.id);

    sent += 1;
  }

  return NextResponse.json({ ok: true, checked: items.length, sent, window: { from: fromStr, to: toStr } });
}

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import type { ActionItemListRow } from "@/lib/committee-meetings/actionItemsPage";

export async function GET() {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const supabase = await getSupabaseForLeafletRoutes();

  const { data, error } = await supabase
    .from("action_items")
    .select(
      `
      id, title, description, status, due_at, sort_order, committee_meeting_id,
      people:assignee_person_id ( id, full_name, email ),
      committee_meetings (
        id, committee, event_id,
        events ( name, starts_at )
      )
    `,
    )
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const action_items: ActionItemListRow[] = (data ?? []).map((row) => {
    const { people, ...rest } = row as unknown as Record<string, unknown> & {
      people: ActionItemListRow["assignee"];
    };
    return {
      ...(rest as Omit<ActionItemListRow, "assignee">),
      assignee: people ?? null,
    };
  });

  const open_count = action_items.filter((item) => item.status === "open").length;

  return NextResponse.json({ action_items, open_count });
}

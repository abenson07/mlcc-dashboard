import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const supabase = await getSupabaseForLeafletRoutes();

  const insert = {
    title,
    description: typeof o.description === "string" ? o.description : null,
    assignee_person_id: typeof o.assignee_person_id === "string" ? o.assignee_person_id : null,
    committee_meeting_id: typeof o.committee_meeting_id === "string" ? o.committee_meeting_id : null,
    status: o.status === "done" || o.status === "canceled" ? o.status : "open",
    due_at: typeof o.due_at === "string" ? o.due_at.slice(0, 10) : null,
    source: "manual" as const,
    sort_order: typeof o.sort_order === "number" ? o.sort_order : 0,
  };

  const { data, error } = await supabase
    .from("action_items")
    .insert(insert)
    .select(
      `
      id, title, description, status, due_at, sort_order, committee_meeting_id, assignee_person_id, source,
      people:assignee_person_id ( id, full_name, email )
    `,
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { people, ...rest } = data as unknown as Record<string, unknown> & {
    people: ActionItemListRow["assignee"];
  };

  return NextResponse.json({
    ok: true,
    action_item: { ...rest, assignee: people ?? null },
  });
}

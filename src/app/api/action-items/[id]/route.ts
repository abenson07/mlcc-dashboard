import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

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
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (o.status === "open" || o.status === "done") {
    patch.status = o.status;
    if (o.status === "done") {
      patch.completed_at = new Date().toISOString();
      patch.completed_by = session.user.id;
    } else {
      patch.completed_at = null;
      patch.completed_by = null;
    }
  }

  if (typeof o.assignee_person_id === "string" || o.assignee_person_id === null) {
    patch.assignee_person_id = o.assignee_person_id;
  }

  if (typeof o.title === "string") patch.title = o.title.trim();
  if (typeof o.description === "string" || o.description === null) {
    patch.description = o.description;
  }
  if (typeof o.due_at === "string" || o.due_at === null) patch.due_at = o.due_at;

  const supabase = await getSupabaseForLeafletRoutes();

  const { data, error } = await supabase
    .from("action_items")
    .update(patch)
    .eq("id", id)
    .select(
      `
      id, title, description, status, due_at, assignee_person_id, committee_meeting_id,
      people:assignee_person_id ( id, full_name, email )
    `,
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, action_item: data });
}

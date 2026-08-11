import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

function isMissingTable(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    msg.includes("committee_initiatives") ||
    msg.includes("does not exist") ||
    msg.includes("initiative_id")
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const supabase = await getSupabaseForLeafletRoutes();

  const { data: initiative, error } = await supabase
    .from("committee_initiatives")
    .select("id, committee, title, description, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json({ unavailable: true }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!initiative) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("action_items")
    .select(
      `
      id, title, status, due_at, assignee_person_id, sort_order,
      people:assignee_person_id ( id, full_name )
    `,
    )
    .eq("initiative_id", id)
    .order("sort_order", { ascending: true });

  if (tasksError) {
    if (isMissingTable(tasksError)) {
      return NextResponse.json({
        initiative: { ...initiative, tasks: [] },
        unavailable: true,
      });
    }
    return NextResponse.json({ error: tasksError.message }, { status: 500 });
  }

  const mappedTasks = (tasks ?? []).map((row) => {
    const { people, ...rest } = row as unknown as Record<string, unknown> & {
      people: { id: string; full_name: string } | null;
    };
    return { ...rest, assignee: people ?? null };
  });

  return NextResponse.json({
    initiative: { ...initiative, tasks: mappedTasks },
  });
}

export async function PATCH(
  request: Request,
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
  if (typeof o.title === "string") patch.title = o.title.trim();
  if (typeof o.description === "string" || o.description === null) {
    patch.description = o.description;
  }

  if (Object.keys(patch).length <= 1) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("committee_initiatives")
    .update(patch)
    .eq("id", id)
    .select("id, committee, title, description, created_at, updated_at")
    .single();

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { error: "committee_initiatives table is not available", unavailable: true },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, initiative: data });
}

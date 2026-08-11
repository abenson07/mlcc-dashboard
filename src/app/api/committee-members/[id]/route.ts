import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

const TITLES = new Set(["chair", "co_chair", "member"]);

function isMissingTable(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    msg.includes("committee_members") ||
    msg.includes("does not exist")
  );
}

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
  if (typeof o.title === "string" && TITLES.has(o.title)) {
    patch.title = o.title;
  }

  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("committee_members")
    .update(patch)
    .eq("id", id)
    .select(
      `
      id, committee, person_id, title, created_at, updated_at,
      people:person_id ( id, full_name, email )
    `,
    )
    .single();

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { error: "committee_members table is not available", unavailable: true },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { people, ...rest } = data as unknown as Record<string, unknown> & {
    people: { id: string; full_name: string; email: string | null } | null;
  };

  return NextResponse.json({ ok: true, member: { ...rest, person: people ?? null } });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const supabase = await getSupabaseForLeafletRoutes();
  const { error } = await supabase.from("committee_members").delete().eq("id", id);

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { error: "committee_members table is not available", unavailable: true },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

/** Mark interest handled without sending email (phone-only / already emailed outside). */
export async function POST(request: NextRequest, ctx: RouteContext) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing interest id" }, { status: 400 });
  }

  let notes: string | null = null;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.notes === "string" && body.notes.trim()) {
      notes = body.notes.trim();
    }
  } catch {
    // empty body is fine
  }

  const supabase = await createClient();
  const { data: interest, error: fetchError } = await supabase
    .from("committee_interests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!interest) {
    return NextResponse.json({ error: "Interest not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("committee_interests")
    .update({
      status: "handled",
      responded_at: now,
      responded_by: session.user.id,
      ...(notes ? { notes } : {}),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, interest: updated });
}

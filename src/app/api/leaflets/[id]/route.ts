import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("leaflets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Leaflet not found" }, { status: 404 });
  }

  return NextResponse.json({ leaflet: data });
}

export async function PATCH(request: NextRequest, { params }: Params) {
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

  if (typeof o.title === "string" && o.title.trim()) patch.title = o.title.trim();
  if (typeof o.distribution_date === "string" && o.distribution_date.trim()) {
    patch.distribution_date = o.distribution_date.trim();
  }
  if (typeof o.print_cost_cents === "number") {
    patch.print_cost_cents = o.print_cost_cents;
  }

  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("leaflets")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, leaflet: data });
}

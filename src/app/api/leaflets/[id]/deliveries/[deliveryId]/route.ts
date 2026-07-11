import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string; deliveryId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id, deliveryId } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (o.person_id === null || typeof o.person_id === "string") {
    patch.person_id = o.person_id;
  }
  if (typeof o.is_skipped === "boolean") patch.is_skipped = o.is_skipped;
  if (typeof o.leaflet_count === "number") {
    if (!Number.isInteger(o.leaflet_count) || o.leaflet_count < 0) {
      return NextResponse.json({ error: "leaflet_count must be a non-negative integer" }, { status: 400 });
    }
    patch.leaflet_count = o.leaflet_count;
  }
  if (typeof o.response === "string") patch.response = o.response;
  if (typeof o.responded_at === "string") patch.responded_at = o.responded_at;

  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("deliveries")
    .update(patch)
    .eq("id", deliveryId)
    .eq("leaflet_id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, delivery: data });
}

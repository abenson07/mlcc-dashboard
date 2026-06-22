import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { closeLeaflet } from "@/lib/leaflets/closeLeaflet";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const result = await closeLeaflet(supabase, id);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to close leaflet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

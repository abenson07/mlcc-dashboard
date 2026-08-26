import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { activateLeaflet } from "@/lib/leaflets/activateLeaflet";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const leaflet = await activateLeaflet(supabase, id);
    return NextResponse.json({ ok: true, leaflet });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to activate leaflet";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

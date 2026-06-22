import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getCloseOutMetrics } from "@/lib/leaflets/getCloseOutMetrics";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const metrics = await getCloseOutMetrics(supabase, id);
    return NextResponse.json({ metrics });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load close-out metrics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

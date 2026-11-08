import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { isMissingTableError } from "@/lib/leaflets/comm/commSends";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string }> };

/** Every logged deliverer email for this leaflet (who was sent which template, and when). */
export async function GET(_request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("leaflet_comm_sends")
    .select("person_id, step_key, sent_at")
    .eq("leaflet_id", id)
    .order("sent_at", { ascending: false });

  if (error) {
    // Migration not run yet: behave as "nothing logged" instead of breaking the page.
    if (isMissingTableError(error)) return NextResponse.json({ sends: [], pendingMigration: true });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ sends: data ?? [] });
}

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { activateLeaflet } from "@/lib/leaflets/activateLeaflet";
import { sendLeafletComm } from "@/lib/leaflets/comm/sendLeafletComm";
import { getAppOrigin } from "@/lib/leaflets/getAppOrigin";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    let leaflet = await activateLeaflet(supabase, id);

    const { data: setting } = await supabase
      .from("comm_settings")
      .select("*")
      .eq("context", "leaflet")
      .eq("step_key", "initial_confirmation")
      .is("event_template_id", null)
      .maybeSingle();

    if (
      setting?.trigger === "on_activate" &&
      setting.is_enabled &&
      !leaflet.comm_initial_confirmation_sent_at
    ) {
      await sendLeafletComm({
        supabase,
        leafletId: id,
        stepKey: "initial_confirmation",
        origin: getAppOrigin(request),
      });

      const { data: refreshed } = await supabase
        .from("leaflets")
        .select("*")
        .eq("id", id)
        .single();
      if (refreshed) leaflet = refreshed;
    }

    return NextResponse.json({ ok: true, leaflet });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to activate leaflet";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { sendLeafletComm } from "@/lib/leaflets/comm/sendLeafletComm";
import { getAppOrigin } from "@/lib/leaflets/getAppOrigin";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string; stepKey: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id, stepKey } = await params;

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const result = await sendLeafletComm({
      supabase,
      leafletId: id,
      stepKey,
      origin: getAppOrigin(request),
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

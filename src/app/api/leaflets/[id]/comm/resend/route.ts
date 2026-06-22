import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { resendLeafletCommToPerson } from "@/lib/leaflets/comm/sendLeafletComm";
import { getAppOrigin } from "@/lib/leaflets/getAppOrigin";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const personId = (body as { personId?: string }).personId;
  const stepKey = (body as { stepKey?: string }).stepKey;
  if (!personId) {
    return NextResponse.json({ error: "personId is required" }, { status: 400 });
  }

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const result = await resendLeafletCommToPerson({
      supabase,
      leafletId: id,
      personId,
      stepKey,
      origin: getAppOrigin(request),
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to resend";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

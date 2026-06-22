import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getAppOrigin } from "@/lib/leaflets/getAppOrigin";
import { sendOpenRouteEmail } from "@/lib/leaflets/sendOpenRouteEmail";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id: leafletId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const deliveryId = typeof o.deliveryId === "string" ? o.deliveryId : "";
  const personId = typeof o.personId === "string" ? o.personId : "";
  const message = typeof o.message === "string" ? o.message : undefined;

  if (!deliveryId || !personId) {
    return NextResponse.json(
      { error: "deliveryId and personId are required" },
      { status: 400 },
    );
  }

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const result = await sendOpenRouteEmail({
      supabase,
      leafletId,
      deliveryId,
      personId,
      message,
      origin: getAppOrigin(request),
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

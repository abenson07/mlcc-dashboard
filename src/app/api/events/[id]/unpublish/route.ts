import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { unpublishEvent } from "@/lib/events/publishEvent";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await context.params;

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const updated = await unpublishEvent(supabase, id);
    return NextResponse.json({ ok: true, event: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to unpublish event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { publishEvent } from "@/lib/events/publishEvent";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import type { Events } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await context.params;

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updated = await publishEvent(supabase, event as Events);
    return NextResponse.json({ ok: true, event: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to publish event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

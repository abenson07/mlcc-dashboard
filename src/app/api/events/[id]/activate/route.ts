import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { activateEventResources } from "@/lib/events/spawnEventResources";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import type { Events } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

/** Spawn checklist tasks and sponsorship tier placeholders for an existing event. */
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

    const result = await activateEventResources(supabase, event as Events);

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to activate event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

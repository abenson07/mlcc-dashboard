import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { activateLeaflet, LeafletActivationConflictError } from "@/lib/leaflets/activateLeaflet";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  let options: { expectedActiveId: string | null } | undefined;
  const raw = await request.text();
  if (raw.trim()) {
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (
      !body || typeof body !== "object" || !("expectedActiveId" in body) ||
      (body.expectedActiveId !== null &&
        (typeof body.expectedActiveId !== "string" ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.expectedActiveId)))
    ) {
      return NextResponse.json({ error: "expectedActiveId must be a leaflet ID or null" }, { status: 400 });
    }
    options = { expectedActiveId: body.expectedActiveId };
  }

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const leaflet = await activateLeaflet(supabase, id, options);
    return NextResponse.json({ ok: true, leaflet });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to activate leaflet";
    return NextResponse.json(
      { error: message },
      { status: err instanceof LeafletActivationConflictError ? 409 : 400 },
    );
  }
}

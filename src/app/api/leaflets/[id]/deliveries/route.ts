import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const supabase = await getSupabaseForLeafletRoutes();

  const searchParams = _request.nextUrl.searchParams;
  const openOnly = searchParams.get("open") === "true";
  const skippedOnly = searchParams.get("skipped") === "true";

  let query = supabase
    .from("deliveries")
    .select(
      `
      *,
      routes (
        *,
        primary_deliverer:people!routes_primary_deliverer_id_fkey (*)
      ),
      people!deliveries_person_id_fkey (*)
    `,
    )
    .eq("leaflet_id", id);

  if (openOnly) {
    query = query.or("person_id.is.null,is_skipped.eq.true");
  }
  if (skippedOnly) {
    query = query.eq("is_skipped", true);
  }

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deliveries: data ?? [] });
}

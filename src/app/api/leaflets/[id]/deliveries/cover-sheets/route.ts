import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { buildCoverSheetsHtml } from "@/lib/leaflets/buildCoverSheetHtml";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import type { Deliveries, Leaflets, People, Routes } from "@/types/database";

type Params = { params: Promise<{ id: string }> };

const HTML_HEADERS = { "Content-Type": "text/html; charset=utf-8" } as const;

export async function GET(_request: Request, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id: leafletId } = await params;

  try {
    const supabase = await getSupabaseForLeafletRoutes();

    const [{ data: leaflet, error: lErr }, { data: deliveries, error: dErr }] = await Promise.all([
      supabase
        .from("leaflets")
        .select("id, title, distribution_date")
        .eq("id", leafletId)
        .single(),
      supabase
        .from("deliveries")
        .select(
          `
          *,
          routes (*),
          people!deliveries_person_id_fkey (*)
        `,
        )
        .eq("leaflet_id", leafletId),
    ]);

    if (lErr || !leaflet) {
      return NextResponse.json({ error: lErr?.message ?? "Leaflet not found" }, { status: 404 });
    }
    if (dErr || !deliveries) {
      return NextResponse.json({ error: dErr?.message ?? "Deliveries not found" }, { status: 404 });
    }

    const rows = deliveries as (Deliveries & { routes?: Routes | null; people?: People | null })[];

    const html = buildCoverSheetsHtml(
      leaflet as Pick<Leaflets, "title" | "distribution_date">,
      rows.map((row) => ({
        delivery: row,
        route: row.routes ?? null,
        deliverer: row.people ?? null,
      })),
    );

    return new NextResponse(html, { headers: HTML_HEADERS });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate cover sheets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

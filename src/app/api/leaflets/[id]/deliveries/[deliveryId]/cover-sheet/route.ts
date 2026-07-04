import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { buildCoverSheetHtml } from "@/lib/leaflets/buildCoverSheetHtml";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import type { Deliveries, Leaflets, People, Routes } from "@/types/database";

type Params = { params: Promise<{ id: string; deliveryId: string }> };

const HTML_HEADERS = { "Content-Type": "text/html; charset=utf-8" } as const;

export async function GET(_request: Request, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id: leafletId, deliveryId } = await params;

  try {
    const supabase = await getSupabaseForLeafletRoutes();

    const [{ data: leaflet, error: lErr }, { data: delivery, error: dErr }] = await Promise.all([
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
        .eq("id", deliveryId)
        .eq("leaflet_id", leafletId)
        .single(),
    ]);

    if (lErr || !leaflet) {
      return NextResponse.json({ error: lErr?.message ?? "Leaflet not found" }, { status: 404 });
    }
    if (dErr || !delivery) {
      return NextResponse.json({ error: dErr?.message ?? "Delivery not found" }, { status: 404 });
    }

    const row = delivery as Deliveries & {
      routes?: Routes | null;
      people?: People | null;
    };

    const html = buildCoverSheetHtml({
      leaflet: leaflet as Pick<Leaflets, "title" | "distribution_date">,
      delivery: row,
      route: row.routes ?? null,
      deliverer: row.people ?? null,
    });

    return new NextResponse(html, { headers: HTML_HEADERS });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate cover sheet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

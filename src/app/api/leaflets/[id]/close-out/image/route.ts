import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { buildCelebrationImageSvg } from "@/lib/leaflets/buildCelebrationImageSvg";
import { getCloseOutMetrics } from "@/lib/leaflets/getCloseOutMetrics";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const metrics = await getCloseOutMetrics(supabase, id);
    const svg = buildCelebrationImageSvg(metrics);

    const format = request.nextUrl.searchParams.get("format");
    const filename = `${metrics.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-celebration.svg`;

    if (format === "svg") {
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate celebration image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

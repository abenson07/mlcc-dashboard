import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import {
  fetchAllVolunteerAsks,
  fetchVolunteerAskById,
} from "@/lib/volunteers/fetchVolunteerAsk";
import { getSupabaseForVolunteerRoutes } from "@/lib/volunteers/supabaseForVolunteerRoutes";
import {
  getVolunteerAskWebflowConfigIssues,
  isVolunteerAsksWebflowConfigured,
  syncVolunteerAskToWebflow,
} from "@/lib/webflow/volunteerAsks";

/** Manual sync from the dashboard (all asks or one by id). */
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const configIssues = getVolunteerAskWebflowConfigIssues();
  if (!isVolunteerAsksWebflowConfigured()) {
    return NextResponse.json(
      {
        error: "Webflow volunteer asks collection is not configured.",
        missing: configIssues,
      },
      { status: 503 }
    );
  }

  let body: { askId?: string; syncAll?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const askId = body.askId?.trim();
  const syncAll = body.syncAll === true || !askId;

  try {
    const supabase = await getSupabaseForVolunteerRoutes();

    if (!syncAll && askId) {
      const ask = await fetchVolunteerAskById(supabase, askId);
      if (!ask) {
        return NextResponse.json({ error: "Volunteer ask not found" }, { status: 404 });
      }
      const result = await syncVolunteerAskToWebflow(ask);
      return NextResponse.json({ ok: true, results: [result] });
    }

    const asks = await fetchAllVolunteerAsks(supabase);
    const results = [];
    for (const ask of asks) {
      results.push(await syncVolunteerAskToWebflow(ask));
    }
    return NextResponse.json({ ok: true, count: results.length, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

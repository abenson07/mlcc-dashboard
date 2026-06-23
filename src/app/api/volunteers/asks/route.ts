import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { ensureSupabaseEventFromWebflow } from "@/lib/volunteers/ensureSupabaseEventFromWebflow";
import { fetchVolunteerAskById } from "@/lib/volunteers/fetchVolunteerAsk";
import { getSupabaseForVolunteerRoutes } from "@/lib/volunteers/supabaseForVolunteerRoutes";
import {
  getVolunteerAskWebflowConfigIssues,
  isVolunteerAsksWebflowConfigured,
  syncVolunteerAskToWebflow,
} from "@/lib/webflow/volunteerAsks";
import type { VolunteerAsksInsert } from "@/types/database";
import { parseVolunteerAskBody } from "@/lib/volunteers/parseVolunteerAskBody";

type CreateVolunteerAskBody = VolunteerAsksInsert & {
  webflowEventItemId?: string | null;
};

/** Create a volunteer ask in Supabase and sync to Webflow CMS. */
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseVolunteerAskBody(body);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid volunteer ask payload" }, { status: 400 });
  }

  const supabase = await getSupabaseForVolunteerRoutes();
  const { webflowEventItemId, event_id: directEventId, ...fields } = parsed;
  const insertPayload: CreateVolunteerAskBody = { ...fields, event_id: null };

  try {
    if (directEventId) {
      insertPayload.event_id = directEventId;
    } else if (webflowEventItemId) {
      insertPayload.event_id = await ensureSupabaseEventFromWebflow(
        supabase,
        webflowEventItemId
      );
    }

    const { data: created, error: insertError } = await supabase
      .from("volunteer_asks")
      .insert(insertPayload)
      .select()
      .single();

    if (insertError || !created) {
      return NextResponse.json(
        { error: insertError?.message ?? "Failed to create volunteer ask" },
        { status: 500 }
      );
    }

    let webflow: Awaited<ReturnType<typeof syncVolunteerAskToWebflow>> | null = null;
    let webflowError: string | null = null;

    if (isVolunteerAsksWebflowConfigured()) {
      const full = await fetchVolunteerAskById(supabase, created.id);
      if (full) {
        try {
          webflow = await syncVolunteerAskToWebflow(full);
        } catch (err) {
          webflowError = err instanceof Error ? err.message : "Webflow sync failed";
        }
      }
    } else {
      webflowError = `Webflow not configured. Set: ${getVolunteerAskWebflowConfigIssues().join(", ")}`;
    }

    return NextResponse.json({
      ok: true,
      ask: created,
      webflow,
      webflowError,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create volunteer ask";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

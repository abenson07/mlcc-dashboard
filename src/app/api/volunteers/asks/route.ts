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
import type {
  VolunteerAsksInsert,
  VolunteerCommitmentType,
  VolunteerCommitmentUnit,
} from "@/types/database";

type CreateVolunteerAskBody = VolunteerAsksInsert & {
  webflowEventItemId?: string | null;
};

function parseBody(raw: unknown): CreateVolunteerAskBody | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) return null;

  const commitment_type = b.commitment_type as VolunteerCommitmentType;
  const commitment_unit = b.commitment_unit as VolunteerCommitmentUnit;
  if (commitment_type !== "one_off" && commitment_type !== "ongoing") return null;
  if (commitment_unit !== "hours" && commitment_unit !== "minutes") return null;

  const commitment_quantity = Number(b.commitment_quantity);
  const quantity = Number.parseInt(String(b.quantity), 10);
  if (!Number.isFinite(commitment_quantity) || commitment_quantity <= 0) return null;
  if (!Number.isFinite(quantity) || quantity < 1) return null;

  const webflowEventItemId =
    typeof b.webflowEventItemId === "string" ? b.webflowEventItemId.trim() : "";

  return {
    title,
    description:
      typeof b.description === "string" && b.description.trim()
        ? b.description.trim()
        : null,
    commitment_type,
    commitment_unit,
    commitment_quantity,
    quantity,
    event_id: null,
    webflowEventItemId: webflowEventItemId || null,
  };
}

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

  const parsed = parseBody(body);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid volunteer ask payload" }, { status: 400 });
  }

  const supabase = await getSupabaseForVolunteerRoutes();
  const { webflowEventItemId, ...insertPayload } = parsed;

  try {
    if (webflowEventItemId) {
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

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { ensureSupabaseEventFromWebflow } from "@/lib/volunteers/ensureSupabaseEventFromWebflow";
import { fetchVolunteerAskById } from "@/lib/volunteers/fetchVolunteerAsk";
import { parseVolunteerAskBody } from "@/lib/volunteers/parseVolunteerAskBody";
import { getSupabaseForVolunteerRoutes } from "@/lib/volunteers/supabaseForVolunteerRoutes";
import {
  archiveVolunteerAskOnWebflow,
  getVolunteerAskWebflowConfigIssues,
  isVolunteerAsksWebflowConfigured,
  syncVolunteerAskToWebflow,
} from "@/lib/webflow/volunteerAsks";

type RouteContext = { params: Promise<{ id: string }> };

/** Update a volunteer ask in Supabase and sync to Webflow CMS. */
export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing volunteer ask id" }, { status: 400 });
  }

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

  try {
    const existing = await fetchVolunteerAskById(supabase, id);
    if (!existing) {
      return NextResponse.json({ error: "Volunteer ask not found" }, { status: 404 });
    }

    if (parsed.quantity < existing.signup_count) {
      return NextResponse.json(
        {
          error: `Cannot set volunteers needed below current signups (${existing.signup_count}).`,
        },
        { status: 400 }
      );
    }

    let event_id: string | null = null;
    if (parsed.event_id) {
      event_id = parsed.event_id;
    } else if (parsed.webflowEventItemId) {
      event_id = await ensureSupabaseEventFromWebflow(supabase, parsed.webflowEventItemId);
    }

    const updatePayload: Record<string, unknown> = {
      title: parsed.title,
      description: parsed.description,
      commitment_type: parsed.commitment_type,
      commitment_unit: parsed.commitment_unit,
      commitment_quantity: parsed.commitment_quantity,
      quantity: parsed.quantity,
      event_id,
    };
    if (parsed.committee) updatePayload.committee = parsed.committee;
    if (parsed.auto_accept_provided) {
      updatePayload.auto_accept = parsed.auto_accept;
      updatePayload.auto_response_body = parsed.auto_response_body;
    }

    const { data: updated, error: updateError } = await supabase
      .from("volunteer_asks")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: updateError?.message ?? "Failed to update volunteer ask" },
        { status: 500 }
      );
    }

    let webflow: Awaited<ReturnType<typeof syncVolunteerAskToWebflow>> | null = null;
    let webflowError: string | null = null;

    if (isVolunteerAsksWebflowConfigured()) {
      const full = await fetchVolunteerAskById(supabase, id);
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
      ask: updated,
      webflow,
      webflowError,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update volunteer ask";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Delete a volunteer ask from Supabase and archive its Webflow CMS item. */
export async function DELETE(_request: NextRequest, ctx: RouteContext) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing volunteer ask id" }, { status: 400 });
  }

  const supabase = await getSupabaseForVolunteerRoutes();

  try {
    const existing = await fetchVolunteerAskById(supabase, id);
    if (!existing) {
      return NextResponse.json({ error: "Volunteer ask not found" }, { status: 404 });
    }

    let webflow: Awaited<ReturnType<typeof archiveVolunteerAskOnWebflow>> | null = null;
    let webflowError: string | null = null;

    if (isVolunteerAsksWebflowConfigured()) {
      try {
        webflow = await archiveVolunteerAskOnWebflow(id);
      } catch (err) {
        webflowError = err instanceof Error ? err.message : "Webflow archive failed";
      }
    }

    const { error: deleteError } = await supabase.from("volunteer_asks").delete().eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message ?? "Failed to delete volunteer ask" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      webflow,
      webflowError,
      signupCount: existing.signup_count,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete volunteer ask";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  applyReviewedResponse,
  completeAllDeliveriesForPerson,
  confirmAllDeliveriesForPerson,
  loadRespondContext,
  type RespondDeliveryRow,
} from "@/lib/leaflets/handleDelivererResponse";
import {
  decodeEdits,
  defaultEdits,
  type EditsMap,
  renderCompleteHome,
  renderCompleteThankYou,
  renderRespondConfirmed,
  renderRespondError,
  renderRespondExpiredLink,
  renderRespondFarewellAllRemoved,
  renderRespondHome,
  renderRespondInvalidLink,
  renderRespondReview,
} from "@/lib/leaflets/respondHtml";
import { verifyRespondToken, type RespondMode } from "@/lib/leaflets/signRespondUrl";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

const HTML_HEADERS = { "Content-Type": "text/html; charset=utf-8" } as const;

function parseToken(request: NextRequest) {
  const p = request.nextUrl.searchParams.get("p");
  const sig = request.nextUrl.searchParams.get("sig");
  if (!p || !sig) return null;
  const payload = verifyRespondToken(p, sig);
  if (!payload) return { invalid: true as const };
  return { p, sig, payload };
}

function parseEditsFromForm(form: FormData, deliveries: RespondDeliveryRow[]): EditsMap {
  const edits: EditsMap = {};
  for (const d of deliveries) {
    const countRaw = form.get(`count_${d.id}`);
    const actionRaw = form.get(`action_${d.id}`);
    const count = countRaw != null ? Math.max(0, Math.round(Number(countRaw))) : (d.leaflet_count ?? 0);
    const action =
      actionRaw === "skip" || actionRaw === "remove" ? actionRaw : ("keep" as const);
    edits[d.id] = {
      count: Number.isFinite(count) ? count : (d.leaflet_count ?? 0),
      action,
    };
  }
  return edits;
}

export async function GET(request: NextRequest) {
  const token = parseToken(request);
  if (!token) {
    return new NextResponse(renderRespondInvalidLink(), { headers: HTML_HEADERS, status: 400 });
  }
  if ("invalid" in token) {
    return new NextResponse(renderRespondExpiredLink(), { headers: HTML_HEADERS, status: 403 });
  }

  const panel = request.nextUrl.searchParams.get("panel");
  const editsParam = request.nextUrl.searchParams.get("edits");
  const { payload, p, sig } = token;
  const mode: RespondMode = payload.mode ?? "confirm";

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const ctx = await loadRespondContext(supabase, payload.leafletId, payload.personId);

    if (ctx.deliveries.length === 0) {
      return new NextResponse(renderRespondFarewellAllRemoved(), { headers: HTML_HEADERS });
    }

    if (mode === "complete") {
      return new NextResponse(
        renderCompleteHome({
          token: { p, sig },
          delivererName: ctx.person.full_name,
          leafletTitle: ctx.leaflet.title,
          distributionDate: ctx.leaflet.distribution_date,
          deliveries: ctx.deliveries,
        }),
        { headers: HTML_HEADERS },
      );
    }

    if (panel === "review") {
      const edits = editsParam ? decodeEdits(editsParam) : defaultEdits(ctx.deliveries);
      return new NextResponse(
        renderRespondReview({ token: { p, sig }, deliveries: ctx.deliveries, edits }),
        { headers: HTML_HEADERS },
      );
    }

    const edits = editsParam ? decodeEdits(editsParam) : undefined;

    return new NextResponse(
      renderRespondHome({
        token: { p, sig },
        delivererName: ctx.person.full_name,
        leafletTitle: ctx.leaflet.title,
        distributionDate: ctx.leaflet.distribution_date,
        deliveries: ctx.deliveries,
        edits,
        openChangesPanel: panel === "changes",
      }),
      { headers: HTML_HEADERS },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load response page";
    return new NextResponse(renderRespondError(message), { headers: HTML_HEADERS, status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const p = String(form.get("p") ?? "");
  const sig = String(form.get("sig") ?? "");
  const action = String(form.get("action") ?? "");

  const payload = verifyRespondToken(p, sig);
  if (!payload) {
    return new NextResponse(renderRespondExpiredLink(), { headers: HTML_HEADERS, status: 403 });
  }

  const token = { p, sig };
  const supabase = await getSupabaseForLeafletRoutes();

  try {
    if (action === "confirm_all") {
      const confirmed = await confirmAllDeliveriesForPerson(
        supabase,
        payload.leafletId,
        payload.personId,
      );
      return new NextResponse(
        renderRespondConfirmed({ committedCount: confirmed.length, hasChanges: false }),
        { headers: HTML_HEADERS },
      );
    }

    if (action === "mark_complete_all") {
      const completed = await completeAllDeliveriesForPerson(
        supabase,
        payload.leafletId,
        payload.personId,
      );
      return new NextResponse(renderCompleteThankYou(completed.length), { headers: HTML_HEADERS });
    }

    if (action === "review") {
      const ctx = await loadRespondContext(supabase, payload.leafletId, payload.personId);
      const edits = parseEditsFromForm(form, ctx.deliveries);
      return new NextResponse(
        renderRespondReview({ token, deliveries: ctx.deliveries, edits }),
        { headers: HTML_HEADERS },
      );
    }

    if (action === "confirm_reviewed") {
      const ctx = await loadRespondContext(supabase, payload.leafletId, payload.personId);
      const edits = parseEditsFromForm(form, ctx.deliveries);
      const { committedCount, hasChanges } = await applyReviewedResponse(supabase, {
        leafletId: payload.leafletId,
        personId: payload.personId,
        edits,
      });
      return new NextResponse(renderRespondConfirmed({ committedCount, hasChanges }), {
        headers: HTML_HEADERS,
      });
    }

    return new NextResponse(renderRespondError("Unknown action."), { headers: HTML_HEADERS, status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save response";
    return new NextResponse(renderRespondError(message), { headers: HTML_HEADERS, status: 500 });
  }
}

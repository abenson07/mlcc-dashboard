import { NextRequest, NextResponse } from "next/server";
import {
  completeAllDeliveriesForPerson,
  confirmAllDeliveriesForPerson,
  loadRespondContext,
  removeDeliveriesForPerson,
  skipDeliveriesForPerson,
} from "@/lib/leaflets/handleDelivererResponse";
import {
  renderCompleteHome,
  renderCompleteThankYou,
  renderRespondChanges,
  renderRespondConfirmed,
  renderRespondError,
  renderRespondExpiredLink,
  renderRespondFarewellAllRemoved,
  renderRespondHome,
  renderRespondInvalidLink,
  renderRespondSkipFarewell,
  respondUrl,
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

function parseDeliveryIds(form: FormData) {
  return form
    .getAll("delivery_id")
    .map((v) => String(v).trim())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  const token = parseToken(request);
  if (!token) {
    return new NextResponse(renderRespondInvalidLink(), { headers: HTML_HEADERS, status: 400 });
  }
  if ("invalid" in token) {
    return new NextResponse(renderRespondExpiredLink(), { headers: HTML_HEADERS, status: 403 });
  }

  const view = request.nextUrl.searchParams.get("view");
  const { payload, p, sig } = token;
  const mode: RespondMode = payload.mode ?? "confirm";

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const ctx = await loadRespondContext(supabase, payload.leafletId, payload.personId);

    if (view === "changes") {
      return new NextResponse(
        renderRespondChanges({ token: { p, sig }, deliveries: ctx.deliveries }),
        { headers: HTML_HEADERS },
      );
    }

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

    return new NextResponse(
      renderRespondHome({
        token: { p, sig },
        delivererName: ctx.person.full_name,
        leafletTitle: ctx.leaflet.title,
        distributionDate: ctx.leaflet.distribution_date,
        deliveries: ctx.deliveries,
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
      return new NextResponse(renderRespondConfirmed(confirmed.length), { headers: HTML_HEADERS });
    }

    if (action === "mark_complete_all") {
      const completed = await completeAllDeliveriesForPerson(
        supabase,
        payload.leafletId,
        payload.personId,
      );
      return new NextResponse(renderCompleteThankYou(completed.length), { headers: HTML_HEADERS });
    }

    if (action === "skip_selected") {
      const deliveryIds = parseDeliveryIds(form);
      const { remainingCount } = await skipDeliveriesForPerson(supabase, {
        leafletId: payload.leafletId,
        personId: payload.personId,
        deliveryIds,
      });

      if (remainingCount === 0) {
        return new NextResponse(renderRespondSkipFarewell(), { headers: HTML_HEADERS });
      }

      return NextResponse.redirect(new URL(respondUrl(token), request.url), 303);
    }

    if (action === "remove_selected") {
      const deliveryIds = parseDeliveryIds(form);
      const { remainingCount } = await removeDeliveriesForPerson(supabase, {
        leafletId: payload.leafletId,
        personId: payload.personId,
        deliveryIds,
      });

      if (remainingCount === 0) {
        return new NextResponse(renderRespondFarewellAllRemoved(), { headers: HTML_HEADERS });
      }

      return NextResponse.redirect(new URL(respondUrl(token), request.url), 303);
    }

    return new NextResponse(renderRespondError("Unknown action."), { headers: HTML_HEADERS, status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save response";
    return new NextResponse(renderRespondError(message), { headers: HTML_HEADERS, status: 500 });
  }
}

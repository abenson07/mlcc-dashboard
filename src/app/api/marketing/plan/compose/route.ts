import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import {
  composePlanCopy,
  composePlanVerbatim,
} from "@/lib/marketing/composePlanCopy";
import { CaptionTooLongError } from "@/lib/marketing/composeSocialCopy";
import { loadEventContext } from "@/lib/marketing/eventContext";
import {
  buildPlan,
  toPacificDay,
  type PlanChannel,
  type PlanIntensity,
} from "@/lib/marketing/planSchedule";
import { getEventVoiceToneMarkdown } from "@/lib/marketing/eventVoiceTone";

export const runtime = "nodejs";

const CHANNELS = new Set<PlanChannel>(["facebook", "instagram", "email"]);
const INTENSITIES = new Set<PlanIntensity>(["light", "standard", "heavy"]);
const MAX_CONTEXT = 6000;

/**
 * Builds the touch schedule for an event, and (unless `previewOnly`) writes copy for every touch.
 * `previewOnly` is cheap and powers the "9 days out -> ~6 touches" readout.
 */
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  let body: {
    eventId?: unknown;
    channels?: unknown;
    intensity?: unknown;
    context?: unknown;
    verbatim?: unknown;
    previewOnly?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";
  if (!eventId) return NextResponse.json({ error: "eventId is required." }, { status: 400 });

  const channels = Array.isArray(body.channels)
    ? [...new Set(body.channels.filter((c): c is PlanChannel => CHANNELS.has(c as PlanChannel)))]
    : [];
  if (channels.length === 0) {
    return NextResponse.json({ error: "Choose at least one channel." }, { status: 400 });
  }
  const intensity = INTENSITIES.has(body.intensity as PlanIntensity)
    ? (body.intensity as PlanIntensity)
    : "standard";

  const event = await loadEventContext(eventId);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const plan = buildPlan({
    eventDay: toPacificDay(event.startsAt),
    today: toPacificDay(new Date()),
    intensity,
    channels,
  });

  if (body.previewOnly === true) {
    return NextResponse.json({ daysOut: plan.daysOut, touches: plan.touches });
  }
  if (plan.touches.length === 0) {
    return NextResponse.json(
      { error: "That event has already happened, so there is nothing to schedule." },
      { status: 422 },
    );
  }

  const context = typeof body.context === "string" ? body.context.trim() : "";
  if (context.length > MAX_CONTEXT) {
    return NextResponse.json(
      { error: `context must be ${MAX_CONTEXT} characters or fewer.` },
      { status: 400 },
    );
  }
  if (body.verbatim === true && !context) {
    return NextResponse.json({ error: "Write the text to use as written." }, { status: 400 });
  }

  try {
    const copy =
      body.verbatim === true
        ? composePlanVerbatim(context, plan.touches, event.name)
        : await composePlanCopy({
            context,
            event,
            touches: plan.touches,
            voiceToneMarkdown: getEventVoiceToneMarkdown(),
          });
    const copyById = new Map(copy.map((c) => [c.id, c]));
    return NextResponse.json({
      daysOut: plan.daysOut,
      event: { id: event.id, name: event.name, startsAt: event.startsAt, url: event.url ?? null },
      touches: plan.touches.map((t) => ({ ...t, ...copyById.get(t.id) })),
    });
  } catch (e) {
    if (e instanceof CaptionTooLongError) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }
    console.error("[marketing/plan/compose]", e);
    const message = e instanceof Error ? e.message : "Compose failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

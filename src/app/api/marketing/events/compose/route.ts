import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { composeEventMarketingCopy } from "@/lib/marketing/composeEventCopy";
import { getEventVoiceToneMarkdown } from "@/lib/marketing/eventVoiceTone";

export const runtime = "nodejs";

const MAX_STR = 2000;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
      eventName?: unknown;
      startsAt?: unknown;
      endsAt?: unknown;
      locationLabel?: unknown;
      committeeName?: unknown;
      isExternal?: unknown;
      externalEventUrl?: unknown;
      externalOrgName?: unknown;
      externalOrgUrl?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const eventName =
      typeof body.eventName === "string" ? body.eventName.trim().slice(0, 200) : "";
    if (!eventName) {
      return NextResponse.json({ error: "eventName is required." }, { status: 400 });
    }
    const startsAt =
      typeof body.startsAt === "string" ? body.startsAt.trim().slice(0, MAX_STR) : "";
    if (!startsAt) {
      return NextResponse.json({ error: "startsAt is required." }, { status: 400 });
    }

    const slice = (v: unknown) =>
      typeof v === "string" ? v.trim().slice(0, MAX_STR) : undefined;

    const { shortDescription, body: longBody } = await composeEventMarketingCopy({
      eventName,
      startsAt,
      endsAt: slice(body.endsAt),
      locationLabel: slice(body.locationLabel),
      committeeName: slice(body.committeeName),
      isExternal: Boolean(body.isExternal),
      externalEventUrl: slice(body.externalEventUrl),
      externalOrgName: slice(body.externalOrgName),
      externalOrgUrl: slice(body.externalOrgUrl),
      voiceToneMarkdown: getEventVoiceToneMarkdown(),
    });

    return NextResponse.json({
      shortDescription,
      body: longBody,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Compose failed.";
    console.error("[marketing/events/compose]", e);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

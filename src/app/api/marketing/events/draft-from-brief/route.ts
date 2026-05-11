import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { composeEventDraftFromBrief } from "@/lib/marketing/composeEventCopy";
import { getEventVoiceToneMarkdown } from "@/lib/marketing/eventVoiceTone";

export const runtime = "nodejs";

const MAX_BRIEF = 8000;
const MAX_ISO = 2000;

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
      userBrief?: unknown;
      startsAt?: unknown;
      endsAt?: unknown;
      locationLabel?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const userBriefRaw =
      typeof body.userBrief === "string" ? body.userBrief.trim() : "";
    if (userBriefRaw.length < 8) {
      return NextResponse.json(
        { error: "Brief must be at least a few words (8+ characters)." },
        { status: 400 }
      );
    }
    const userBrief = userBriefRaw.slice(0, MAX_BRIEF);

    const startsAt =
      typeof body.startsAt === "string" ? body.startsAt.trim().slice(0, MAX_ISO) : "";
    if (!startsAt) {
      return NextResponse.json({ error: "startsAt is required." }, { status: 400 });
    }

    const slice = (v: unknown) =>
      typeof v === "string" ? v.trim().slice(0, MAX_ISO) : undefined;

    const voiceToneMarkdown = getEventVoiceToneMarkdown();

    const draft = await composeEventDraftFromBrief({
      userBrief,
      startsAt,
      endsAt: slice(body.endsAt),
      locationLabel: slice(body.locationLabel),
      voiceToneMarkdown,
    });

    return NextResponse.json(draft);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Draft failed.";
    console.error("[marketing/events/draft-from-brief]", e);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

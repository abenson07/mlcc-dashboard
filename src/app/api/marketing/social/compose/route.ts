import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { isSupportedSocialService } from "@/lib/buffer/services";
import type { SupportedSocialService } from "@/lib/buffer/types";
import {
  CaptionTooLongError,
  composeSocialCopy,
} from "@/lib/marketing/composeSocialCopy";
import { loadEventContext } from "@/lib/marketing/eventContext";
import { getVoiceToneMarkdown } from "@/lib/marketing/voiceTone";

export const runtime = "nodejs";

const MAX_CONTEXT = 6000;

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  let body: {
    context?: unknown;
    verbatim?: unknown;
    platforms?: unknown;
    eventId?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const context = typeof body.context === "string" ? body.context.trim() : "";
  if (!context) {
    return NextResponse.json({ error: "context is required." }, { status: 400 });
  }
  if (context.length > MAX_CONTEXT) {
    return NextResponse.json(
      { error: `context must be ${MAX_CONTEXT} characters or fewer.` },
      { status: 400 },
    );
  }

  const platforms = Array.isArray(body.platforms)
    ? (body.platforms.filter(
        (p): p is SupportedSocialService =>
          typeof p === "string" && isSupportedSocialService(p),
      ) as SupportedSocialService[])
    : [];
  if (platforms.length === 0) {
    return NextResponse.json(
      { error: "platforms must include instagram and/or facebook." },
      { status: 400 },
    );
  }

  try {
    let event;
    if (typeof body.eventId === "string" && body.eventId.trim()) {
      const loaded = await loadEventContext(body.eventId.trim());
      if (!loaded) {
        return NextResponse.json({ error: "Event not found." }, { status: 404 });
      }
      event = loaded;
    }

    const captions = await composeSocialCopy({
      context,
      verbatim: body.verbatim === true,
      platforms: [...new Set(platforms)],
      event,
      voiceToneMarkdown: getVoiceToneMarkdown(),
    });
    return NextResponse.json({ captions });
  } catch (e) {
    if (e instanceof CaptionTooLongError) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }
    console.error("[marketing/social/compose]", e);
    const message = e instanceof Error ? e.message : "Compose failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

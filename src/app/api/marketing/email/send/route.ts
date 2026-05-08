import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResendFromEmail } from "@/lib/resend";
import { sanitizeEmailHtml } from "@/lib/marketing/sanitizeEmailHtml";
import {
  createResendBroadcast,
  getResendMarketingSegmentId,
} from "@/lib/resendBroadcast";

export const runtime = "nodejs";

const MAX_SUBJECT = 200;

function isValidIsoOrEmpty(s: string): boolean {
  if (!s) return true;
  const t = Date.parse(s);
  return !Number.isNaN(t);
}

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
      subject?: unknown;
      html?: unknown;
      scheduledAt?: unknown;
      sendNow?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim().slice(0, MAX_SUBJECT)
        : "";
    const htmlRaw = typeof body.html === "string" ? body.html : "";
    if (!subject) {
      return NextResponse.json(
        { error: "subject is required (non-empty string)." },
        { status: 400 }
      );
    }
    if (!htmlRaw.trim()) {
      return NextResponse.json(
        { error: "html is required (non-empty string)." },
        { status: 400 }
      );
    }

    const sendNow = body.sendNow === true;
    const scheduledAtIso =
      typeof body.scheduledAt === "string" ? body.scheduledAt.trim() : "";

    if (!sendNow && !scheduledAtIso) {
      return NextResponse.json(
        { error: "Either sendNow: true or scheduledAt (ISO 8601 string) is required." },
        { status: 400 }
      );
    }
    if (!sendNow && !isValidIsoOrEmpty(scheduledAtIso)) {
      return NextResponse.json(
        { error: "scheduledAt must be a valid ISO 8601 datetime string." },
        { status: 400 }
      );
    }

    const segmentId = getResendMarketingSegmentId();
    if (!segmentId) {
      return NextResponse.json(
        { error: "RESEND_MARKETING_SEGMENT_ID is not configured." },
        { status: 503 }
      );
    }

    const from = getResendFromEmail();
    if (!from) {
      return NextResponse.json(
        { error: "RESEND_FROM_EMAIL is not configured." },
        { status: 503 }
      );
    }

    const html = sanitizeEmailHtml(htmlRaw);
    if (!html.includes("{{{RESEND_UNSUBSCRIBE_URL}}}")) {
      return NextResponse.json(
        {
          error:
            "HTML must include the Resend unsubscribe merge tag: {{{RESEND_UNSUBSCRIBE_URL}}}",
        },
        { status: 400 }
      );
    }

    const result = await createResendBroadcast({
      segmentId,
      from,
      subject,
      html,
      send: true,
      scheduledAt: sendNow ? undefined : scheduledAtIso,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status >= 400 && result.status < 600 ? result.status : 502 }
      );
    }

    return NextResponse.json({ id: result.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Send failed.";
    console.error("[marketing/email/send]", e);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

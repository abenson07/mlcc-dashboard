import { NextRequest, NextResponse } from "next/server";
import { isValidTwilioRequest } from "@/lib/twilio";
import { postSmsToSlack } from "@/lib/slack";

export const runtime = "nodejs";

const EMPTY_TWIML = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

function twimlResponse() {
  return new NextResponse(EMPTY_TWIML, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

function getWebhookUrl(request: NextRequest): string {
  // Twilio signs the exact public URL configured on the phone number. Behind a
  // proxy / mount path (see docs/API-ROUTES-PRODUCTION.md) request.url can differ
  // from that, so allow an explicit override to match the Console setting.
  return process.env.TWILIO_WEBHOOK_URL?.trim() || request.url;
}

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!authToken) {
    console.error("[twilio webhook] TWILIO_AUTH_TOKEN is not configured");
    return NextResponse.json({ error: "Twilio webhook is not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-twilio-signature");
  const url = getWebhookUrl(request);

  if (!signature || !isValidTwilioRequest(authToken, signature, url, new URLSearchParams(rawBody))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const params = new URLSearchParams(rawBody);
  const from = params.get("From") ?? "unknown";
  const body = params.get("Body")?.trim() ?? "";
  const mediaCount = Number(params.get("NumMedia") ?? "0");

  const lines = [`📱 New SMS from ${from}`, body || "_(no text)_"];
  if (mediaCount > 0) {
    lines.push(`_${mediaCount} attachment${mediaCount === 1 ? "" : "s"} (not shown)_`);
  }

  await postSmsToSlack(lines.join("\n"));

  return twimlResponse();
}

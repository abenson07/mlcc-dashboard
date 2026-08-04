import { NextRequest, NextResponse } from "next/server";
import { postTwilioSmsToSlack } from "@/lib/slack";
import { validateTwilioSignature } from "@/lib/twilio/validateWebhook";

export const runtime = "nodejs";

function emptyTwiml(): NextResponse {
  return new NextResponse("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

function webhookUrl(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return request.url;
  return `${proto}://${host}${request.nextUrl.pathname}${request.nextUrl.search}`;
}

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!authToken) {
    return NextResponse.json({ error: "Twilio webhook is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("x-twilio-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const form = await request.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") params[key] = value;
  }

  const url = webhookUrl(request);
  if (!validateTwilioSignature(authToken, url, params, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const from = params.From?.trim() || "unknown";
  const to = params.To?.trim() || "unknown";
  const body = params.Body?.trim() || "(empty)";
  const numMedia = Number(params.NumMedia || "0");

  let text =
    `:speech_balloon: Inbound SMS\n` +
    `*From:* ${from}\n` +
    `*To:* ${to}\n` +
    `*Message:* ${body}`;

  if (numMedia > 0) {
    const mediaUrls: string[] = [];
    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = params[`MediaUrl${i}`];
      if (mediaUrl) mediaUrls.push(mediaUrl);
    }
    if (mediaUrls.length) {
      text += `\n*Media:* ${mediaUrls.join(" ")}`;
    }
  }

  try {
    await postTwilioSmsToSlack(text);
  } catch (e) {
    console.error("[twilio sms webhook] Slack post failed:", e);
    return NextResponse.json({ error: "Failed to post to Slack" }, { status: 500 });
  }

  return emptyTwiml();
}

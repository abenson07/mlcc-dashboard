import { NextRequest, NextResponse } from "next/server";
import { corsPreflightResponse, withCors } from "@/lib/stripe/cors";
import { postContactToSlack } from "@/lib/slack";

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(request, NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  const { email, message } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim() || typeof message !== "string" || !message.trim()) {
    return withCors(
      request,
      NextResponse.json({ error: "Email and message are required" }, { status: 400 }),
    );
  }

  const text =
    `:incoming_envelope: New contact form message\n` +
    `*From:* ${email.trim()}\n` +
    `*Message:* ${message.trim()}`;

  await postContactToSlack(text);

  return withCors(request, NextResponse.json({ ok: true }));
}

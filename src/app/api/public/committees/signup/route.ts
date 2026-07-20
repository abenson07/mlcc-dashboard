import { NextRequest, NextResponse } from "next/server";
import { corsPreflightResponse, withCors } from "@/lib/stripe/cors";
import { postToSlack } from "@/lib/slack";

type SignupSource = "join-card" | "meeting-signup";

const SOURCE_LABELS: Record<SignupSource, string> = {
  "join-card": "Join the committee",
  "meeting-signup": "Meeting RSVP",
};

function isSignupSource(value: unknown): value is SignupSource {
  return value === "join-card" || value === "meeting-signup";
}

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

  const { name, contact, committeeName, source } = (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim() || typeof contact !== "string" || !contact.trim()) {
    return withCors(
      request,
      NextResponse.json({ error: "Name and contact are required" }, { status: 400 }),
    );
  }

  const sourceLabel = isSignupSource(source) ? SOURCE_LABELS[source] : "Committee page";
  const committeeLine = typeof committeeName === "string" && committeeName.trim()
    ? `*Committee:* ${committeeName.trim()}\n`
    : "";

  const text =
    `:wave: New committee signup (${sourceLabel})\n` +
    committeeLine +
    `*Name:* ${name.trim()}\n` +
    `*Contact:* ${contact.trim()}`;

  await postToSlack(text);

  return withCors(request, NextResponse.json({ ok: true }));
}

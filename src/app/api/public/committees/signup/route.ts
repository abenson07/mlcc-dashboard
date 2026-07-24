import { NextRequest, NextResponse } from "next/server";
import { corsPreflightResponse, withCors } from "@/lib/stripe/cors";
import { postToSlack } from "@/lib/slack";

type SignupSource = "join-card" | "meeting-signup" | "zoning-workshop" | "volunteer-opportunity";

const SOURCE_LABELS: Record<SignupSource, string> = {
  "join-card": "Join the committee",
  "meeting-signup": "Meeting RSVP",
  "zoning-workshop": "Would like to attend a zoning workshop",
  "volunteer-opportunity": "Volunteer opportunity",
};

function isSignupSource(value: unknown): value is SignupSource {
  return (
    value === "join-card" ||
    value === "meeting-signup" ||
    value === "zoning-workshop" ||
    value === "volunteer-opportunity"
  );
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

  const { name, contact, committeeName, source, opportunityTitle, website } = (body ?? {}) as Record<
    string,
    unknown
  >;

  // Honeypot: "website" is a hidden field real users never see or fill in.
  // Bots that blindly fill every field trip it — pretend success without notifying Slack.
  if (typeof website === "string" && website.trim()) {
    return withCors(request, NextResponse.json({ ok: true }));
  }

  if (typeof name !== "string" || !name.trim() || typeof contact !== "string" || !contact.trim()) {
    return withCors(
      request,
      NextResponse.json({ error: "Name and contact are required" }, { status: 400 }),
    );
  }

  const isVolunteerOpportunity = source === "volunteer-opportunity";
  const sourceLabel = isSignupSource(source) ? SOURCE_LABELS[source] : "Committee page";
  const roleLine =
    typeof opportunityTitle === "string" && opportunityTitle.trim()
      ? `*Role:* ${opportunityTitle.trim()}\n`
      : "";
  const committeeLine =
    typeof committeeName === "string" && committeeName.trim()
      ? `*Committee:* ${committeeName.trim()}\n`
      : isVolunteerOpportunity
        ? `*Committee:* Steering\n`
        : "";

  const headline = isVolunteerOpportunity
    ? `:wave: New volunteer interest (${sourceLabel})\n`
    : `:wave: New committee signup (${sourceLabel})\n`;

  const text =
    headline + roleLine + committeeLine + `*Name:* ${name.trim()}\n` + `*Contact:* ${contact.trim()}`;

  await postToSlack(text, typeof committeeName === "string" ? committeeName.trim() : undefined);

  return withCors(request, NextResponse.json({ ok: true }));
}

import { NextRequest, NextResponse } from "next/server";
import { corsPreflightResponse, withCors } from "@/lib/stripe/cors";
import { postToSlack } from "@/lib/slack";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { committeeSlugFromName } from "@/lib/committees/committeeSlug";
import {
  findOrCreatePersonFromContact,
  looksLikeEmail,
} from "@/lib/committees/findOrCreatePersonFromContact";
import { sendVolunteerAutoAcceptEmail } from "@/lib/committees/sendCommitteeEmail";
import type { CommitteeInterestSource, CommitteeSlug } from "@/types/database";

type SignupSource = "join-card" | "meeting-signup" | "zoning-workshop" | "volunteer-opportunity";

const SOURCE_LABELS: Record<SignupSource, string> = {
  "join-card": "Join the committee",
  "meeting-signup": "Meeting RSVP",
  "zoning-workshop": "Would like to attend a zoning workshop",
  "volunteer-opportunity": "Volunteer opportunity",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isSignupSource(value: unknown): value is SignupSource {
  return (
    value === "join-card" ||
    value === "meeting-signup" ||
    value === "zoning-workshop" ||
    value === "volunteer-opportunity"
  );
}

function toInterestSource(source: unknown): CommitteeInterestSource {
  if (isSignupSource(source)) return source;
  return "other";
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

  const {
    name,
    contact,
    committeeName,
    source,
    opportunityTitle,
    website,
    volunteerAskId,
  } = (body ?? {}) as Record<string, unknown>;

  // Honeypot: bots that fill every field trip it — pretend success without side effects.
  if (typeof website === "string" && website.trim()) {
    return withCors(request, NextResponse.json({ ok: true }));
  }

  if (typeof name !== "string" || !name.trim() || typeof contact !== "string" || !contact.trim()) {
    return withCors(
      request,
      NextResponse.json({ error: "Name and contact are required" }, { status: 400 }),
    );
  }

  const trimmedName = name.trim();
  const trimmedContact = contact.trim();
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
    headline + roleLine + committeeLine + `*Name:* ${trimmedName}\n` + `*Contact:* ${trimmedContact}`;

  await postToSlack(text, typeof committeeName === "string" ? committeeName.trim() : undefined);

  let committee: CommitteeSlug = committeeSlugFromName(
    typeof committeeName === "string" ? committeeName : undefined,
  );
  const askIdRaw = typeof volunteerAskId === "string" ? volunteerAskId.trim() : "";
  const askId = askIdRaw && UUID_RE.test(askIdRaw) ? askIdRaw : null;

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return withCors(request, NextResponse.json({ ok: true, persisted: false }));
  }

  let eventId: string | null = null;
  let autoAccepted = false;
  let interestStatus: "pending" | "auto_accepted" = "pending";
  let responseEmailId: string | null = null;
  let resolvedAskId: string | null = null;
  let opportunity =
    typeof opportunityTitle === "string" && opportunityTitle.trim()
      ? opportunityTitle.trim()
      : null;

  if (askId) {
    const { data: ask } = await admin
      .from("volunteer_asks")
      .select("id, title, event_id, committee, auto_accept, auto_response_body")
      .eq("id", askId)
      .maybeSingle();

    if (ask) {
      resolvedAskId = ask.id as string;
      eventId = (ask.event_id as string | null) ?? null;
      if (ask.committee) committee = ask.committee as CommitteeSlug;
      if (!opportunity) opportunity = (ask.title as string) ?? null;

      const personResult = await findOrCreatePersonFromContact(admin, {
        name: trimmedName,
        contact: trimmedContact,
      });

      if ("personId" in personResult) {
        const canAutoAccept =
          Boolean(ask.auto_accept) &&
          typeof ask.auto_response_body === "string" &&
          Boolean(ask.auto_response_body.trim()) &&
          looksLikeEmail(trimmedContact);

        if (canAutoAccept) {
          const now = new Date().toISOString();
          const { error: signupError } = await admin.from("volunteers").upsert(
            {
              volunteer_ask_id: ask.id,
              person_id: personResult.personId,
              status: "accepted",
              accepted_at: now,
            },
            { onConflict: "volunteer_ask_id,person_id" },
          );

          if (!signupError) {
            const emailResult = await sendVolunteerAutoAcceptEmail({
              to: trimmedContact,
              volunteerName: trimmedName,
              askTitle: (ask.title as string) || "volunteer opportunity",
              responseBody: ask.auto_response_body as string,
            });
            autoAccepted = true;
            interestStatus = "auto_accepted";
            responseEmailId = emailResult.id ?? null;
          }
        } else {
          await admin.from("volunteers").upsert(
            {
              volunteer_ask_id: ask.id,
              person_id: personResult.personId,
              status: "pending",
            },
            { onConflict: "volunteer_ask_id,person_id" },
          );
        }
      }
    }
  }

  const { error: insertError } = await admin.from("committee_interests").insert({
    name: trimmedName,
    contact: trimmedContact,
    committee,
    source: toInterestSource(source),
    opportunity_title: opportunity,
    volunteer_ask_id: resolvedAskId,
    event_id: eventId,
    status: interestStatus,
    responded_at: autoAccepted ? new Date().toISOString() : null,
    response_email_id: responseEmailId,
  });

  if (insertError) {
    console.error("[committees/signup] failed to persist interest", insertError.message);
    return withCors(
      request,
      NextResponse.json({ ok: true, persisted: false, error: insertError.message }),
    );
  }

  return withCors(request, NextResponse.json({ ok: true, persisted: true, autoAccepted }));
}

import { NextRequest, NextResponse } from "next/server";
import { corsPreflightResponse, withCors } from "@/lib/stripe/cors";
import { postToSlack } from "@/lib/slack";
import { claimOpenRoute } from "@/lib/leaflets/claimOpenRoute";
import { sendOpenRouteSignupEmail } from "@/lib/leaflets/sendOpenRouteSignupEmail";

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

  const { deliveryId, name, email, address, website } = (body ?? {}) as Record<string, unknown>;

  if (typeof website === "string" && website.trim()) {
    return withCors(request, NextResponse.json({ ok: true }));
  }

  const result = await claimOpenRoute({
    deliveryId: typeof deliveryId === "string" ? deliveryId : "",
    name: typeof name === "string" ? name : "",
    email: typeof email === "string" ? email : "",
    address: typeof address === "string" ? address : "",
  });

  if (!result.ok) {
    return withCors(request, NextResponse.json({ error: result.error }, { status: result.status }));
  }

  const emailResult = await sendOpenRouteSignupEmail({
    to: String(email).trim(),
    volunteerName: String(name).trim(),
    routeName: result.routeName,
    leafletTitle: result.leafletTitle,
  });

  if (!emailResult.sent) {
    console.error("[open-routes/signup] confirmation email failed", emailResult.error);
  }

  const slackText =
    `:mailbox: New Leaflet route signup\n` +
    `*Route:* ${result.routeName}\n` +
    `*Leaflet:* ${result.leafletTitle}\n` +
    `*Name:* ${String(name).trim()}\n` +
    `*Email:* ${String(email).trim()}\n` +
    `*Address:* ${String(address).trim()}`;

  await postToSlack(slackText, "Newsletter").catch((error) => {
    console.error("[open-routes/signup] slack failed", error);
  });

  return withCors(
    request,
    NextResponse.json({
      ok: true,
      emailed: emailResult.sent,
      createdPerson: result.createdPerson,
    }),
  );
}

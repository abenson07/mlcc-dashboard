import { NextRequest, NextResponse } from "next/server";
import { createMembershipCheckoutSession } from "@/lib/commerce/createMembershipCheckout";
import { parseMembershipTier, parseBillingMode } from "@/lib/commerce/membershipTiers";
import { corsPreflightResponse, withCors } from "@/lib/stripe/cors";

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

  const payload = body as Record<string, unknown>;
  // The checkout page lives same-origin with this API, so the redirect base
  // comes from the request itself rather than a client-supplied origin.
  const returnOrigin = request.nextUrl.origin;

  const tier = parseMembershipTier(payload.tier);
  if (!tier) {
    return withCors(request, NextResponse.json({ error: "Invalid membership tier" }, { status: 400 }));
  }
  const billingMode = parseBillingMode(payload.billingMode);

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  if (!name || !email) {
    return withCors(
      request,
      NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    );
  }

  const optIns = (payload.optIns ?? {}) as Record<string, unknown>;

  try {
    const session = await createMembershipCheckoutSession({
      tier,
      billingMode,
      customer: { name, email },
      optIns: {
        newsletter: optIns.newsletter === true,
        digest: optIns.digest === true,
        volunteer: optIns.volunteer === true,
      },
      returnOrigin,
    });

    if (!session.url) {
      return withCors(
        request,
        NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
      );
    }

    return withCors(request, NextResponse.json({ url: session.url, sessionId: session.id }));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return withCors(request, NextResponse.json({ error: message }, { status: 500 }));
  }
}

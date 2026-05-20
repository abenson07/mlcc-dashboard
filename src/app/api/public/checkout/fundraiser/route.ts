import { NextRequest, NextResponse } from "next/server";
import { createFundraiserCheckoutSession } from "@/lib/commerce/createFundraiserCheckout";
import { parseDonationTier } from "@/lib/commerce/fundraiserTiers";
import {
  corsPreflightResponse,
  validateReturnOrigin,
  withCors,
} from "@/lib/stripe/cors";

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    );
  }

  const payload = body as Record<string, unknown>;
  const returnOrigin = validateReturnOrigin(
    typeof payload.returnOrigin === "string" ? payload.returnOrigin : undefined
  );
  if (!returnOrigin) {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid return origin" }, { status: 400 })
    );
  }

  const tier = parseDonationTier(payload.tier);
  if (!tier) {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid donation tier" }, { status: 400 })
    );
  }

  const amountCents =
    typeof payload.amountCents === "number"
      ? payload.amountCents
      : typeof payload.amountCents === "string"
        ? Number.parseInt(payload.amountCents, 10)
        : undefined;

  const email =
    typeof payload.email === "string" ? payload.email.trim() : undefined;

  try {
    const session = await createFundraiserCheckoutSession({
      tier,
      amountCents:
        tier === "custom" && Number.isFinite(amountCents)
          ? amountCents
          : undefined,
      email: email || undefined,
      returnOrigin,
    });

    if (!session.url) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Failed to create checkout session" },
          { status: 500 }
        )
      );
    }

    return withCors(
      request,
      NextResponse.json({ url: session.url, sessionId: session.id })
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return withCors(
      request,
      NextResponse.json({ error: message }, { status: 500 })
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillCheckoutSession } from "@/lib/commerce/fulfillCheckoutSession";
import { getStripe } from "@/lib/stripe/server";
import { COMMERCE_METADATA_KEYS } from "@/lib/stripe/commerceMetadata";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { syncSingleSubscription } from "@/lib/stripe/subscriptionSync";
import { isSubscriptionEvent, syncSubscriptionEvent } from "@/lib/memberships/syncSubscriptionEvent";

export const runtime = "nodejs";

function getWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

export async function POST(request: NextRequest) {
  const secret = getWebhookSecret();
  const stripe = getStripe();
  if (!secret || !stripe) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Payment links and dashboard-created checkouts carry no commerce metadata.
    // Those used to fail with "Unknown commerce flow" (and Stripe retried them
    // for days); a subscription checkout is handled by the subscription sync.
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    if (!session.metadata?.[COMMERCE_METADATA_KEYS.flow] && subscriptionId) {
      const supabase = createAdminSupabaseClient();
      if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
      try {
        await syncSingleSubscription(stripe, supabase, subscriptionId);
        return NextResponse.json({ received: true, flow: "subscription-sync" });
      } catch (e) {
        const message = e instanceof Error ? e.message : "subscription sync failed";
        console.error("[stripe webhook] subscription checkout sync failed:", message);
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    const result = await fulfillCheckoutSession(session);
    if (!result.ok) {
      console.error("[stripe webhook] fulfill failed:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      received: true,
      flow: result.flow,
      alreadyFulfilled: result.alreadyFulfilled ?? false,
    });
  }

  if (isSubscriptionEvent(event.type)) {
    const result = await syncSubscriptionEvent(event);
    if (!result.ok) {
      console.error(`[stripe webhook] ${event.type} sync failed:`, result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ received: true, handled: result.handled, note: result.note });
  }

  return NextResponse.json({ received: true, skipped: true });
}

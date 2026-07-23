/**
 * One-off: pretend Stripe checkout.session.completed for a shop shirt order.
 * Usage: npx tsx scripts/test-shirt-preorder-fulfill.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import type Stripe from "stripe";
import { fulfillCheckoutSession } from "../src/lib/commerce/fulfillCheckoutSession";
import { createAdminSupabaseClient } from "../src/lib/supabase/admin";
import {
  COMMERCE_FLOW,
  COMMERCE_METADATA_KEYS,
} from "../src/lib/stripe/commerceMetadata";

async function main() {
  const sessionId = `cs_test_manual_${Date.now()}`;
  const paymentIntentId = `pi_test_manual_${Date.now()}`;

  const session = {
    id: sessionId,
    object: "checkout.session",
    payment_status: "paid",
    status: "complete",
    amount_total: 4000,
    currency: "usd",
    payment_intent: paymentIntentId,
    customer_email: "preorder-test@example.com",
    customer_details: {
      name: "Test Preorder Person",
      email: "preorder-test@example.com",
    },
    metadata: {
      [COMMERCE_METADATA_KEYS.flow]: COMMERCE_FLOW.SHOP,
      [COMMERCE_METADATA_KEYS.customerName]: "Test Preorder Person",
      [COMMERCE_METADATA_KEYS.customerEmail]: "preorder-test@example.com",
      [COMMERCE_METADATA_KEYS.shippingLine1]: "123 Maple St",
      [COMMERCE_METADATA_KEYS.shippingLine2]: "",
      [COMMERCE_METADATA_KEYS.shippingCity]: "Seattle",
      [COMMERCE_METADATA_KEYS.shippingState]: "Washington",
      [COMMERCE_METADATA_KEYS.shippingPostalCode]: "98115",
      [COMMERCE_METADATA_KEYS.lineItems]: JSON.stringify([
        {
          product_slug: "2026-summer-social-shirt",
          product_name: "2026 Summer Social Shirt",
          variant: "Adult L",
          quantity: 2,
          unit_amount_cents: 2000,
          fulfillment: "preorder",
        },
      ]),
    },
  } as unknown as Stripe.Checkout.Session;

  const result = await fulfillCheckoutSession(session);
  console.log("fulfill result:", result);

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    console.error("No supabase admin client (check SUPABASE_SERVICE_ROLE_KEY)");
    process.exit(1);
  }

  const { data: person, error: personErr } = await supabase
    .from("people")
    .select("id, full_name, email, source")
    .eq("email", "preorder-test@example.com")
    .maybeSingle();
  console.log("person:", person, personErr?.message ?? "");

  const { data: items, error: itemsErr } = await supabase
    .from("shirt_preorder_items")
    .select("id, person_id, variant, status, unit_amount_cents, product_slug")
    .eq("stripe_checkout_session_id", sessionId);
  console.log("shirt_preorder_items:", items, itemsErr?.message ?? "");

  const { data: order, error: orderErr } = await supabase
    .from("shop_orders")
    .select("id, customer_name, customer_email, status, amount_cents")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  console.log("shop_orders:", order, orderErr?.message ?? "");

  if (!result.ok || !person || !items?.length) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

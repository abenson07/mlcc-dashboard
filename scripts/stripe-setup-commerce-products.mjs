#!/usr/bin/env node
/**
 * Creates Stripe products/prices for Maple Leaf landings.
 * Run: STRIPE_SECRET_KEY=sk_... node scripts/stripe-setup-commerce-products.mjs
 *
 * Prints env lines to add to .env.local and Vercel.
 */
import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY?.trim();
if (!secret) {
  console.error("Set STRIPE_SECRET_KEY");
  process.exit(1);
}

const stripe = new Stripe(secret);

const tshirtCents = Number.parseInt(
  process.env.STRIPE_TSHIRT_PRICE_CENTS ?? "2500",
  10
);

async function main() {
  const donationProduct = await stripe.products.create({
    name: "Help save Summer in Maple Leaf",
    metadata: { flow: "fundraiser" },
  });

  const price10 = await stripe.prices.create({
    product: donationProduct.id,
    currency: "usd",
    unit_amount: 1000,
  });
  const price40 = await stripe.prices.create({
    product: donationProduct.id,
    currency: "usd",
    unit_amount: 4000,
  });
  const price100 = await stripe.prices.create({
    product: donationProduct.id,
    currency: "usd",
    unit_amount: 10000,
  });

  const tshirtProduct = await stripe.products.create({
    name: "Summer Social T-Shirt Preorder",
    metadata: { flow: "tshirt_preorder" },
  });

  const tshirtPrice = await stripe.prices.create({
    product: tshirtProduct.id,
    currency: "usd",
    unit_amount: tshirtCents,
  });

  console.log("\n# Add to .env.local (dashboard app):\n");
  console.log(`STRIPE_DONATION_PRODUCT_ID=${donationProduct.id}`);
  console.log(`STRIPE_PRICE_DONATION_10=${price10.id}`);
  console.log(`STRIPE_PRICE_DONATION_40=${price40.id}`);
  console.log(`STRIPE_PRICE_DONATION_100=${price100.id}`);
  console.log(`STRIPE_TSHIRT_PRODUCT_ID=${tshirtProduct.id}`);
  console.log(`STRIPE_TSHIRT_PRICE_ID=${tshirtPrice.id}`);
  console.log(`STRIPE_TSHIRT_PRICE_CENTS=${tshirtCents}`);
  console.log(`FUNDRAISER_GOAL_CENTS=2500000`);
  console.log(
    `MLCC_LANDING_ORIGINS=https://give.mapleleafcommunity.org,https://shop.mapleleafcommunity.org`
  );
  console.log("\n# Stripe webhook: checkout.session.completed → /api/webhooks/stripe\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

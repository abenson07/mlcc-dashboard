#!/usr/bin/env node
/**
 * Live Stripe totals for "Help save Summer in Maple Leaf" fundraiser checkouts.
 *
 * Run: npm run stripe:fundraiser-totals
 * Or:  STRIPE_SECRET_KEY=sk_... node scripts/stripe-fundraiser-totals.mjs
 */
import { readFileSync, existsSync } from "fs";
import Stripe from "stripe";

const DEFAULT_PRODUCT_ID = "prod_UY5ikFz5s0CtbV";
const DONATION_TIER_KEY = "donation_tier";

function loadEnvFile(name) {
  if (!existsSync(name)) return;
  for (const raw of readFileSync(name, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function median(amounts) {
  if (amounts.length === 0) return 0;
  const sorted = [...amounts].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const secret = process.env.STRIPE_SECRET_KEY?.trim();
if (!secret) {
  console.error("Set STRIPE_SECRET_KEY in .env.local or the environment");
  process.exit(1);
}

const stripe = new Stripe(secret);
const productId =
  process.env.STRIPE_DONATION_PRODUCT_ID?.trim() || DEFAULT_PRODUCT_ID;

const product = await stripe.products.retrieve(productId);
const prices = await stripe.prices.list({ product: productId, limit: 100 });
const priceIds = new Set(prices.data.map((price) => price.id));

const amounts = [];
const byTier = {};

let hasMore = true;
let startingAfter;

while (hasMore) {
  const sessions = await stripe.checkout.sessions.list({
    status: "complete",
    limit: 100,
    starting_after: startingAfter,
    expand: ["data.line_items"],
  });

  for (const session of sessions.data) {
    if (session.payment_status !== "paid") continue;

    const items = session.line_items?.data ?? [];
    const matches = items.some((item) => {
      const price = item.price;
      if (!price) return false;
      const pid =
        typeof price.product === "string" ? price.product : price.product?.id;
      return pid === productId || priceIds.has(price.id);
    });
    if (!matches) continue;

    const cents = session.amount_total ?? 0;
    amounts.push(cents);

    const tier = session.metadata?.[DONATION_TIER_KEY] ?? "unknown";
    byTier[tier] = (byTier[tier] ?? 0) + 1;
  }

  hasMore = sessions.has_more;
  if (sessions.data.length > 0) {
    startingAfter = sessions.data[sessions.data.length - 1].id;
  }
}

const count = amounts.length;
const totalCents = amounts.reduce((sum, amount) => sum + amount, 0);
const averageCents = count ? Math.round(totalCents / count) : 0;

const result = {
  productId,
  productName: product.name,
  count,
  totalCents,
  totalUsd: (totalCents / 100).toFixed(2),
  averageUsd: (averageCents / 100).toFixed(2),
  medianUsd: (median(amounts) / 100).toFixed(2),
  minUsd: count ? (Math.min(...amounts) / 100).toFixed(2) : "0.00",
  maxUsd: count ? (Math.max(...amounts) / 100).toFixed(2) : "0.00",
  byTier,
  queriedAt: new Date().toISOString(),
};

console.log(JSON.stringify(result, null, 2));

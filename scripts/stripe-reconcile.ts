#!/usr/bin/env npx tsx
/**
 * Reconcile every Stripe subscription into the dashboard database.
 *
 *   npm run stripe:reconcile              # dry run: prints what would change, writes nothing
 *   npm run stripe:reconcile -- --apply   # writes the changes
 *
 * Needs both migrations applied: 20260930120000_business_membership_stripe_sync.sql
 * and 20260930120100_membership_status_review.sql.
 * Never deletes. Business members with no Stripe subscription are flagged "Review"
 * (status only; they stay members). The nightly job does not do that flagging.
 * The same logic runs nightly from /api/cron/stripe-reconcile.
 */
import fs from "node:fs";

// Load .env.local before the libs below read process.env (dotenv isn't a dependency).
for (const line of fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8").split("\n") : []) {
  const eq = line.indexOf("=");
  if (eq > 0 && !line.trimStart().startsWith("#")) {
    process.env[line.slice(0, eq).trim()] ??= line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
  }
}

import { getStripe } from "../src/lib/stripe/server";
import { createAdminSupabaseClient } from "../src/lib/supabase/admin";
import { flagUnmatchedBusinessMembers, reconcileSubscriptions } from "../src/lib/stripe/subscriptionSync";

/**
 * First-run seed only. These paying businesses exist in the dashboard with no
 * email, so they can't be matched automatically. Once linked, Stripe ids take over.
 */
const EMAIL_TO_BUSINESS_NAME: Record<string, string> = {
  "notjulie@comcast.net": "Sharp Dogs Seattle",
  "rjnel@acehandymanservices.com": "Ace Handyman Services North Seattle",
  "nate@greenlakestrength.com": "Green Lake Strength & Conditioning",
  "info@montessorigarden.net": "Montessori Garden",
  "stefanh@windermere.com": "Windermere Real Estate Co, Stefan Hoerschelmann and Marian Gibbs",
  "colin@perdigonroofing.com": "Perdigon Roofing",
  "info@mathnificent.com": "Math n' Stuff",
  "kelly@thegrowlerguys.com": "The Growler Guys",
  "liz@watershedpub.com": "Watershed Pub & Kitchen",
  "kit@mapleleafmgt.com": "Maple Leaf Real Estate Management",
  "scott@macrinabakery.com": "Macrina Bakery",
};

/** Names for paying customers with no existing business record (Stripe only has a person's name). */
const NEW_BUSINESS_NAMES: Record<string, string> = {
  "admin@mapleleafmentalhealth.com": "Maple Leaf Mental Health",
  "hello@homecakedecorating.com": "Home Cake Decorating",
  "girafdesign@gmail.com": "Giraf Design",
  "taylor@mstracing.net": "MS Tracing",
};

async function main() {
  const apply = process.argv.includes("--apply");
  const stripe = getStripe();
  const supabase = createAdminSupabaseClient();
  if (!stripe || !supabase) throw new Error("STRIPE_SECRET_KEY and Supabase service role must be set in .env.local");

  const report = await reconcileSubscriptions({
    stripe,
    supabase,
    apply,
    emailToBusinessName: EMAIL_TO_BUSINESS_NAME,
    newBusinessNames: NEW_BUSINESS_NAMES,
  });

  const flagged = await flagUnmatchedBusinessMembers({
    supabase,
    apply,
    excludeBusinessIds: report.stripeBusinessIds,
  });

  console.log(apply ? "APPLIED\n" : "DRY RUN — nothing written. Re-run with --apply.\n");
  console.log(
    `Individuals: ${report.individuals.checked} checked, ${report.individuals.unchanged} already correct`,
  );
  console.log(`Businesses:  ${report.businesses.checked} checked, ${report.businesses.unchanged} already correct\n`);

  for (const area of ["business", "individual"] as const) {
    const actions = report.actions.filter((action) => action.area === area);
    console.log(`--- ${area} changes (${actions.length}) ---`);
    for (const action of actions) console.log(`${action.type.padEnd(6)} ${action.label} [${action.subscriptionId}]\n       ${action.detail}`);
    console.log();
  }
  console.log(`--- business members with no Stripe subscription → status "Review" (${flagged.length}) ---`);
  for (const item of flagged) console.log(`review ${item.businessName}`);
  console.log();
  console.log(`--- needs a human (${report.issues.length}) ---`);
  for (const issue of report.issues) console.log(`${issue.type}: ${issue.label}\n       ${issue.detail}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

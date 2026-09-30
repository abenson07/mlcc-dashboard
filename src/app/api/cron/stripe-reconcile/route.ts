import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { reconcileSubscriptions } from "@/lib/stripe/subscriptionSync";
import { postToSlack } from "@/lib/slack";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Nightly: pull every Stripe subscription and bring `memberships` and
 * `business_memberships` in line. Safety net for missed or failed webhooks.
 * Never deletes. Posts to Slack only when something needs a human.
 * Protect with Authorization: Bearer $CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  const supabase = createAdminSupabaseClient();
  if (!stripe || !supabase) {
    return NextResponse.json({ error: "Stripe or Supabase is not configured" }, { status: 500 });
  }

  try {
    const report = await reconcileSubscriptions({ stripe, supabase, apply: true });

    if (report.actions.length > 0 || report.issues.length > 0) {
      console.log("[stripe-reconcile]", JSON.stringify({ actions: report.actions, issues: report.issues }));
    }
    if (report.issues.length > 0) {
      const lines = report.issues.slice(0, 10).map((issue) => `• ${issue.label}: ${issue.detail}`);
      await postToSlack(
        `Stripe ↔ dashboard sync needs a look (${report.issues.length}):\n${lines.join("\n")}${
          report.issues.length > 10 ? `\n…and ${report.issues.length - 10} more (see logs)` : ""
        }`,
      );
    }

    return NextResponse.json({
      ok: true,
      individuals: report.individuals,
      businesses: report.businesses,
      changed: report.actions.length,
      issues: report.issues.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reconcile failed";
    console.error("[stripe-reconcile] failed:", message);
    await postToSlack(`Nightly Stripe ↔ dashboard sync failed: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

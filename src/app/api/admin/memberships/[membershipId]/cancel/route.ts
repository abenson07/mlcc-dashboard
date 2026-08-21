import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { postToSlack } from "@/lib/slack";
import { cancelMembership, isCancelMode } from "@/lib/memberships/cancelMembership";

/**
 * Cancel a membership. This must be a server route rather than a browser
 * Supabase write because it holds the Stripe secret — and because cancelling is
 * a Stripe action, not a status label.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ membershipId: string }> },
) {
  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: callerRole } = await session
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (callerRole?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { mode } = (body ?? {}) as Record<string, unknown>;
  if (!isCancelMode(mode)) {
    return NextResponse.json(
      { error: 'mode must be "at_period_end" or "immediate_refund"' },
      { status: 400 },
    );
  }

  const { membershipId } = await params;
  const outcome = await cancelMembership(membershipId, mode);

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: outcome.status });
  }

  // There is no audit log in this app, and cancelling moves real money.
  // Slack is the closest thing to a record of who did what.
  const { memberName, endsOn, refundAmount, warning } = outcome.result;
  const who = memberName ?? "A member";
  const summary =
    mode === "at_period_end"
      ? `:no_bell: ${who}'s membership was cancelled by ${user.email} — it will not renew${
          endsOn ? ` and ends ${endsOn}` : ""
        }.`
      : `:money_with_wings: ${who}'s membership was cancelled immediately by ${user.email}${
          refundAmount != null ? ` with a $${refundAmount.toFixed(2)} refund` : ""
        }.${warning ? ` :warning: ${warning}` : ""}`;
  await postToSlack(summary).catch(() => {
    // Never fail the cancellation because Slack is down.
  });

  return NextResponse.json({ ok: true, ...outcome.result });
}

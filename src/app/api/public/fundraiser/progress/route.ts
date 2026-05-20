import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  corsPreflightResponse,
  withCors,
} from "@/lib/stripe/cors";

function getGoalCents(): number {
  const raw = process.env.FUNDRAISER_GOAL_CENTS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 2_500_000;
  return Number.isFinite(n) && n > 0 ? n : 2_500_000;
}

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function GET(request: NextRequest) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return withCors(
      request,
      NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      )
    );
  }

  const { data, error } = await supabase
    .from("fundraising_donations")
    .select("amount_cents")
    .eq("status", "paid");

  if (error) {
    return withCors(
      request,
      NextResponse.json({ error: error.message }, { status: 500 })
    );
  }

  const raisedCents = (data ?? []).reduce(
    (sum, row) => sum + (row.amount_cents ?? 0),
    0
  );
  const goalCents = getGoalCents();
  const percent =
    goalCents > 0
      ? Math.min(100, Math.round((raisedCents / goalCents) * 100))
      : 0;

  return withCors(
    request,
    NextResponse.json({
      goalCents,
      raisedCents,
      percent,
    })
  );
}

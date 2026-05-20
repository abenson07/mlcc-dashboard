import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createClient } from "@/lib/supabase/server";

function getGoalCents(): number {
  const raw = process.env.FUNDRAISER_GOAL_CENTS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 2_500_000;
  return Number.isFinite(n) && n > 0 ? n : 2_500_000;
}

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fundraising_donations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = data ?? [];
  const paid = items.filter((r) => r.status === "paid");
  const raisedCents = paid.reduce((s, r) => s + (r.amount_cents ?? 0), 0);
  const goalCents = getGoalCents();

  return NextResponse.json({
    items,
    stats: {
      raisedCents,
      goalCents,
      count: paid.length,
      percent:
        goalCents > 0
          ? Math.min(100, Math.round((raisedCents / goalCents) * 100))
          : 0,
    },
  });
}

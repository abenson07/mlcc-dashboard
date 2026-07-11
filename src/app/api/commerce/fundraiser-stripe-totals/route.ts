import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getFundraiserStripeTotals } from "@/lib/commerce/getFundraiserStripeTotals";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    const totals = await getFundraiserStripeTotals();
    return NextResponse.json(totals);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to query Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

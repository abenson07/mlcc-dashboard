import { requireSession } from "@/lib/auth/require-session";
import { listDashboardInvoices } from "@/lib/stripe/listDashboardInvoices";
import { getStripe } from "@/lib/stripe/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

function stripeErrorResponse(e: unknown): NextResponse {
  if (e instanceof Stripe.errors.StripeError) {
    const status =
      typeof e.statusCode === "number" &&
      e.statusCode >= 400 &&
      e.statusCode < 600
        ? e.statusCode
        : 400;
    return NextResponse.json({ error: e.message }, { status });
  }
  console.error(e);
  return NextResponse.json(
    { error: "Unexpected error listing invoices." },
    { status: 500 }
  );
}

/** GET — recent Stripe invoices for the dashboard table (filtered by product IDs; see env). */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured." },
      { status: 500 }
    );
  }

  try {
    const invoices = await listDashboardInvoices(stripe);
    return NextResponse.json({ invoices });
  } catch (e: unknown) {
    return stripeErrorResponse(e);
  }
}

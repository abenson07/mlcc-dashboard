import { requireSession } from "@/lib/auth/require-session";
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
    { error: "Unexpected error sending invoice reminder." },
    { status: 500 }
  );
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ invoiceId: string }> }
) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured." },
      { status: 500 }
    );
  }

  const { invoiceId } = await ctx.params;

  try {
    const current = await stripe.invoices.retrieve(invoiceId);

    if (current.status !== "open") {
      return NextResponse.json(
        {
          error: `Reminder only works for unpaid open invoices (current status: ${current.status ?? "unknown"}).`,
        },
        { status: 400 }
      );
    }

    const invoice = await stripe.invoices.sendInvoice(invoiceId);

    return NextResponse.json({
      id: invoice.id,
      status: invoice.status,
      hosted_invoice_url: invoice.hosted_invoice_url,
    });
  } catch (e: unknown) {
    return stripeErrorResponse(e);
  }
}

import { requireSession } from "@/lib/auth/require-session";
import { METADATA_KEYS } from "@/lib/stripe/invoiceDashboardMetadata";
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
    { error: "Unexpected error loading invoice." },
    { status: 500 }
  );
}

function customerEmailFromInvoice(inv: Stripe.Invoice): string | null {
  const c = inv.customer;
  if (typeof c === "string") return null;
  if (!c || ("deleted" in c && c.deleted)) return null;
  return c.email ?? null;
}

export async function GET(
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
    const invoice = await stripe.invoices.retrieve(invoiceId, {
      expand: ["customer"],
    });

    const meta = invoice.metadata ?? {};
    return NextResponse.json({
      id: invoice.id,
      number: invoice.number ?? null,
      status: invoice.status,
      customer_email: customerEmailFromInvoice(invoice),
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      due_date: invoice.due_date,
      hosted_invoice_url: invoice.hosted_invoice_url,
      sponsorship_category: meta[METADATA_KEYS.category]?.trim() ?? null,
      event_id: meta[METADATA_KEYS.eventId]?.trim() ?? null,
      event_name: meta[METADATA_KEYS.eventName]?.trim() ?? null,
      created_by_name: meta[METADATA_KEYS.createdBy]?.trim() ?? null,
    });
  } catch (e: unknown) {
    return stripeErrorResponse(e);
  }
}

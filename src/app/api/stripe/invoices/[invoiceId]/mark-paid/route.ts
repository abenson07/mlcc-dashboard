import { requireSession } from "@/lib/auth/require-session";
import { getStripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { METADATA_KEYS } from "@/lib/stripe/invoiceDashboardMetadata";
import { NextResponse } from "next/server";
import Stripe from "stripe";

type ManualPaymentMethod = "cash" | "check";

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
    { error: "Unexpected error recording manual payment." },
    { status: 500 }
  );
}

function parseDate(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const date = (body as Record<string, unknown>).date;
  return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function parseAmountCents(body: unknown): number | null {
  if (typeof body !== "object" || body === null) return null;
  const v = (body as Record<string, unknown>).amountCents;
  return typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null;
}

function parseMethod(body: unknown): ManualPaymentMethod | null {
  if (typeof body !== "object" || body === null) return null;
  const method = (body as Record<string, unknown>).method;
  return method === "cash" || method === "check" ? method : null;
}

export async function POST(
  req: Request,
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const method = parseMethod(body);
  if (!method) {
    return NextResponse.json(
      { error: 'Body must include method: "cash" or "check".' },
      { status: 400 }
    );
  }

  const paymentDate = parseDate(body);
  const amountCents = parseAmountCents(body);
  const { invoiceId } = await ctx.params;

  try {
    const current = await stripe.invoices.retrieve(invoiceId);

    if (current.status !== "open") {
      return NextResponse.json(
        {
          error: `Can only record a manual payment for an unpaid open invoice (current status: ${current.status ?? "unknown"}).`,
        },
        { status: 400 }
      );
    }

    // A check for less than the balance can't be applied partially out of band, so leave the
    // invoice open and record the money received; staff finish it when the rest arrives.
    if (amountCents != null && amountCents < current.amount_due) {
      const received =
        Number(current.metadata?.[METADATA_KEYS.checkReceivedCents] ?? 0) + amountCents;
      const partial = await stripe.invoices.update(invoiceId, {
        metadata: {
          ...current.metadata,
          manual_payment_method: method,
          [METADATA_KEYS.checkReceivedCents]: String(received),
          ...(paymentDate ? { [METADATA_KEYS.manualPaymentDate]: paymentDate } : {}),
        },
      });
      return NextResponse.json({
        id: partial.id,
        status: partial.status,
        hosted_invoice_url: partial.hosted_invoice_url,
        partial: true,
      });
    }

    await stripe.invoices.pay(invoiceId, { paid_out_of_band: true });

    const invoice = await stripe.invoices.update(invoiceId, {
      metadata: {
        ...current.metadata,
        manual_payment_method: method,
        ...(amountCents != null
          ? { [METADATA_KEYS.checkReceivedCents]: String(amountCents) }
          : {}),
        ...(paymentDate ? { [METADATA_KEYS.manualPaymentDate]: paymentDate } : {}),
      },
    });

    const sponsorshipId = invoice.metadata?.[METADATA_KEYS.sponsorshipId];
    if (sponsorshipId) {
      const supabase = await createClient();
      await supabase
        .from("sponsorships")
        .update({
          status: "paid",
          paid_date: paymentDate ?? new Date().toISOString().slice(0, 10),
        })
        .eq("id", sponsorshipId);
    }

    return NextResponse.json({
      id: invoice.id,
      status: invoice.status,
      hosted_invoice_url: invoice.hosted_invoice_url,
    });
  } catch (e: unknown) {
    return stripeErrorResponse(e);
  }
}

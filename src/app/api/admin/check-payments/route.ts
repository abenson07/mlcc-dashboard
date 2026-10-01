import { requireSession } from "@/lib/auth/require-session";
import { isPersonTier, tierCents, type CheckTierKey } from "@/lib/memberships/tierPricing";
import {
  DASHBOARD_CREATED_VALUE,
  INVOICE_CATEGORY_LABEL,
  METADATA_KEYS,
} from "@/lib/stripe/invoiceDashboardMetadata";
import { getStripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  BUSINESS_MEMBERSHIP_ANNUAL_DUES,
  BUSINESS_MEMBERSHIP_TIER,
} from "schemas/business_memberships";

type Body = {
  payerType: "person" | "business";
  payerId: string;
  tier: CheckTierKey;
  membershipCents: number;
  donationCents: number;
  checkDate: string;
  checkNumber?: string;
};

const USD = "usd" as const;

function parseBody(raw: unknown): { ok: true; data: Body } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null) return { ok: false, error: "Expected JSON object body." };
  const o = raw as Record<string, unknown>;
  const payerType = o.payerType;
  if (payerType !== "person" && payerType !== "business") {
    return { ok: false, error: 'payerType must be "person" or "business".' };
  }
  const payerId = typeof o.payerId === "string" ? o.payerId.trim() : "";
  if (!payerId) return { ok: false, error: "payerId is required." };

  const tier = o.tier;
  if (payerType === "business" ? tier !== "Business" : !isPersonTier(tier)) {
    return { ok: false, error: "tier does not match payerType." };
  }
  const membershipCents = o.membershipCents;
  if (typeof membershipCents !== "number" || !Number.isInteger(membershipCents) || membershipCents <= 0) {
    return { ok: false, error: "membershipCents must be a positive integer." };
  }
  const donationCents = o.donationCents ?? 0;
  if (typeof donationCents !== "number" || !Number.isInteger(donationCents) || donationCents < 0) {
    return { ok: false, error: "donationCents must be a non-negative integer." };
  }
  const checkDate = typeof o.checkDate === "string" ? o.checkDate.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkDate)) return { ok: false, error: "checkDate must be YYYY-MM-DD." };
  const checkNumber =
    typeof o.checkNumber === "string" && o.checkNumber.trim() ? o.checkNumber.trim() : undefined;

  return {
    ok: true,
    data: {
      payerType,
      payerId,
      tier: tier as CheckTierKey,
      membershipCents,
      donationCents,
      checkDate,
      checkNumber,
    },
  };
}

function addOneYear(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

/** Renewals stack onto an unexpired period instead of shortening it. */
function nextPeriodEnd(checkDate: string, existingEnd: string | null | undefined): string {
  const base = existingEnd && existingEnd > checkDate ? existingEnd : checkDate;
  return addOneYear(base);
}

async function resolveCustomerId(
  stripe: Stripe,
  input: { email: string | null; name: string; payerType: string; payerId: string },
): Promise<string> {
  if (input.email) {
    const list = await stripe.customers.list({ email: input.email, limit: 1 });
    if (list.data.length > 0) return list.data[0]!.id;
  }
  const created = await stripe.customers.create({
    name: input.name,
    ...(input.email ? { email: input.email } : {}),
    metadata: { [METADATA_KEYS.payerType]: input.payerType, [METADATA_KEYS.payerId]: input.payerId },
  });
  return created.id;
}

function errorResponse(e: unknown, invoiceId?: string): NextResponse {
  if (e instanceof Stripe.errors.StripeError) {
    const status =
      typeof e.statusCode === "number" && e.statusCode >= 400 && e.statusCode < 600 ? e.statusCode : 400;
    return NextResponse.json({ error: e.message, invoiceId }, { status });
  }
  console.error(e);
  const message = e instanceof Error ? e.message : "Unexpected error logging check payment.";
  return NextResponse.json({ error: message, invoiceId }, { status: 500 });
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY is not configured." }, { status: 500 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = parseBody(raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.data;

  const supabase = await createClient();

  // Payer facts come from the database, not the client.
  type Payer = { name: string; email: string | null; membershipId: string | null };
  let payer: Payer;
  if (input.payerType === "person") {
    const { data, error } = await supabase
      .from("people")
      .select("id, full_name, email, membership_id")
      .eq("id", input.payerId)
      .maybeSingle();
    if (error || !data) return NextResponse.json({ error: "Person not found." }, { status: 404 });
    payer = {
      name: data.full_name ?? "Member",
      email: data.email ?? null,
      membershipId: data.membership_id ?? null,
    };
  } else {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, business_name, email, membership_id")
      .eq("id", input.payerId)
      .maybeSingle();
    if (error || !data) return NextResponse.json({ error: "Business not found." }, { status: 404 });
    payer = {
      name: data.business_name ?? "Business",
      email: data.email ?? null,
      membershipId: data.membership_id ?? null,
    };
  }

  const tierLabel = input.tier === "Business" ? BUSINESS_MEMBERSHIP_TIER : `${input.tier} membership`;
  let invoiceId: string | undefined;

  try {
    const customerId = await resolveCustomerId(stripe, {
      email: payer.email,
      name: payer.name,
      payerType: input.payerType,
      payerId: input.payerId,
    });

    const created = await stripe.invoices.create({
      customer: customerId,
      collection_method: "send_invoice",
      currency: USD,
      auto_advance: false,
      days_until_due: 30,
      description: `Check payment dated ${input.checkDate}${input.checkNumber ? ` (#${input.checkNumber})` : ""}`,
      metadata: {
        [METADATA_KEYS.category]: INVOICE_CATEGORY_LABEL.MEMBERSHIP,
        [METADATA_KEYS.created]: DASHBOARD_CREATED_VALUE,
        [METADATA_KEYS.createdBy]: auth.user.displayName,
        [METADATA_KEYS.payerType]: input.payerType,
        [METADATA_KEYS.payerId]: input.payerId,
        [METADATA_KEYS.checkDate]: input.checkDate,
        [METADATA_KEYS.donationCents]: String(input.donationCents),
        [METADATA_KEYS.manualPaymentMethod]: "check",
      },
    });
    invoiceId = created.id;

    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoiceId,
      amount: input.membershipCents,
      currency: USD,
      description: `${tierLabel} (check)`,
    });
    if (input.donationCents > 0) {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoiceId,
        amount: input.donationCents,
        currency: USD,
        description: "Donation (check)",
      });
    }

    await stripe.invoices.finalizeInvoice(invoiceId);
    const paid = await stripe.invoices.pay(invoiceId, { paid_out_of_band: true });

    // Stripe is done; mirror into Supabase. A failure here leaves a paid invoice, so surface its id.
    const periodEndFor = (existing: string | null | undefined) => nextPeriodEnd(input.checkDate, existing);

    if (input.payerType === "person") {
      let membershipId = payer.membershipId;
      if (membershipId) {
        const { data: existing } = await supabase
          .from("memberships")
          .select("current_period_end")
          .eq("id", membershipId)
          .maybeSingle();
        const { error } = await supabase
          .from("memberships")
          .update({
            tier: input.tier as "Individual" | "Household" | "Senior" | "Student",
            status: "Active",
            payment_method: "check",
            last_renewal: input.checkDate,
            current_period_end: periodEndFor(existing?.current_period_end),
            cancel_at_period_end: false,
            canceled_at: null,
          })
          .eq("id", membershipId);
        if (error) throw new Error(`Membership update failed: ${error.message}`);
      } else {
        const { data: inserted, error } = await supabase
          .from("memberships")
          .insert({
            tier: input.tier as "Individual" | "Household" | "Senior" | "Student",
            status: "Active",
            payment_method: "check",
            is_subscription: false,
            start_date: input.checkDate,
            last_renewal: input.checkDate,
            current_period_end: periodEndFor(null),
            stripe_customer_id: customerId,
            customer_email: payer.email,
          })
          .select("id")
          .single();
        if (error || !inserted) throw new Error(`Membership create failed: ${error?.message ?? "unknown"}`);
        membershipId = inserted.id as string;
        const { error: linkError } = await supabase
          .from("people")
          .update({ membership_id: membershipId })
          .eq("id", input.payerId);
        if (linkError) throw new Error(`Linking membership failed: ${linkError.message}`);
      }

      const memo = `Check${input.checkNumber ? ` #${input.checkNumber}` : ""} · invoice ${paid.number ?? invoiceId}`;
      const rows = [
        {
          person_id: input.payerId,
          membership_id: membershipId,
          amount: input.membershipCents / 100,
          date: input.checkDate,
          memo,
          type: "membership" as const,
          method: "check" as const,
          stripe_transaction_id: invoiceId,
        },
        ...(input.donationCents > 0
          ? [
              {
                person_id: input.payerId,
                membership_id: membershipId,
                amount: input.donationCents / 100,
                date: input.checkDate,
                memo,
                type: "donation" as const,
                method: "check" as const,
                stripe_transaction_id: `${invoiceId}#donation`,
              },
            ]
          : []),
      ];
      const { error: payError } = await supabase.from("payments").insert(rows);
      if (payError) throw new Error(`Recording payment failed: ${payError.message}`);
    } else {
      // `payments` has no business FK; the paid Stripe invoice is the business's history.
      if (payer.membershipId) {
        const { data: existing } = await supabase
          .from("business_memberships")
          .select("current_period_end")
          .eq("id", payer.membershipId)
          .maybeSingle();
        const { error } = await supabase
          .from("business_memberships")
          .update({
            status: "Active",
            payment_method: "check",
            last_renewal: input.checkDate,
            current_period_end: periodEndFor(existing?.current_period_end),
            cancel_at_period_end: false,
            canceled_at: null,
          })
          .eq("id", payer.membershipId);
        if (error) throw new Error(`Business membership update failed: ${error.message}`);
      } else {
        const { data: inserted, error } = await supabase
          .from("business_memberships")
          .insert({
            status: "Active",
            payment_method: "check",
            is_subscription: false,
            last_renewal: input.checkDate,
            current_period_end: periodEndFor(null),
            tier: BUSINESS_MEMBERSHIP_TIER,
            annual_dues: BUSINESS_MEMBERSHIP_ANNUAL_DUES,
            stripe_customer_id: customerId,
            customer_email: payer.email,
          })
          .select("id")
          .single();
        if (error || !inserted) {
          throw new Error(`Business membership create failed: ${error?.message ?? "unknown"}`);
        }
        const { error: linkError } = await supabase
          .from("businesses")
          .update({ membership_id: inserted.id as string })
          .eq("id", input.payerId);
        if (linkError) throw new Error(`Linking business membership failed: ${linkError.message}`);
      }
      await supabase.from("businesses").update({ is_member: true }).eq("id", input.payerId);
    }

    return NextResponse.json({
      id: paid.id,
      number: paid.number,
      status: paid.status,
      hosted_invoice_url: paid.hosted_invoice_url,
      amountCents: input.membershipCents + input.donationCents,
    });
  } catch (e: unknown) {
    return errorResponse(e, invoiceId);
  }
}

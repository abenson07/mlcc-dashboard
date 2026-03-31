import Stripe from "stripe";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

type MembershipRow = {
  id: string;
  status: string | null;
  last_renewal: string | null;
  start_date: string | null;
  stripe_subscription_id: string | null;
  customer_email: string | null;
};

type PersonRow = {
  id: string;
  membership_id: string | null;
  full_name: string | null;
  email: string | null;
};

type PaymentRow = {
  amount: number;
  date: string;
  type: string;
  memo: string | null;
  method: string;
};

type ProcessRunOptions = {
  dryRun?: boolean;
  limit?: number;
};

export type MembershipThankYouRunSummary = {
  runId: string;
  dryRun: boolean;
  evaluated: number;
  eligible: number;
  sent: number;
  skipped: number;
  failed: number;
  errors: Array<{ membershipId: string; error: string }>;
};

function toIsoDateUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addYears(date: Date, years: number): Date {
  const next = new Date(date.getTime());
  next.setUTCFullYear(next.getUTCFullYear() + years);
  return next;
}

function parseIsoDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function getStripeRenewalDate(
  stripe: Stripe,
  subscriptionId: string
): Promise<Date | null> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const maybeEnd = (subscription as Record<string, unknown>).current_period_end;
  const end = typeof maybeEnd === "number" ? maybeEnd : null;
  if (!end || Number.isNaN(end)) return null;
  return new Date(end * 1000);
}

function getFallbackRenewalDate(membership: MembershipRow): Date | null {
  if (membership.last_renewal) {
    return addYears(parseIsoDate(membership.last_renewal), 1);
  }
  if (membership.start_date) {
    return addYears(parseIsoDate(membership.start_date), 1);
  }
  return null;
}

function isActiveStatus(status: string | null): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase();
  return !["inactive", "cancelled", "expired"].includes(normalized);
}

function buildEmailHtml(params: {
  recipientName: string;
  renewalDate: string;
  periodStart: string;
  periodEnd: string;
  receiptTotal: number;
  lineItems: PaymentRow[];
}): string {
  const rows = params.lineItems
    .map((item) => {
      const memo = item.memo ? ` - ${escapeHtml(item.memo)}` : "";
      return `<tr>
        <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(item.date)}</td>
        <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(item.type)}${memo}</td>
        <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(item.method)}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${item.amount.toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
    <p>Hi ${escapeHtml(params.recipientName)},</p>
    <p>Thank you for supporting Midwestern Local Community Cooperative. Your membership renews on <strong>${escapeHtml(params.renewalDate)}</strong>.</p>
    <p>Below is your year-end receipt from <strong>${escapeHtml(params.periodStart)}</strong> through <strong>${escapeHtml(params.periodEnd)}</strong>, including membership and donation payments.</p>
    <table style="border-collapse:collapse;width:100%;margin-top:12px;">
      <thead>
        <tr>
          <th style="padding:8px;border:1px solid #ddd;text-align:left;">Date</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left;">Description</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left;">Method</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="4" style="padding:8px;border:1px solid #ddd;">No payments recorded for this period.</td></tr>`}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:8px;border:1px solid #ddd;text-align:right;"><strong>Total</strong></td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;"><strong>$${params.receiptTotal.toFixed(2)}</strong></td>
        </tr>
      </tfoot>
    </table>
    <p style="margin-top:16px;">With gratitude,<br/>Midwestern Local Community Cooperative</p>
  </div>`;
}

export async function processMembershipThankYouEmails(
  options: ProcessRunOptions = {}
): Promise<MembershipThankYouRunSummary> {
  const dryRun = options.dryRun ?? false;
  const limit = options.limit ?? 50;
  const runId = `run_${Date.now()}`;
  const today = new Date();
  const todayIso = toIsoDateUTC(today);
  const targetDate = addDays(today, 30);
  const targetIso = toIsoDateUTC(targetDate);

  const supabase = createAdminClient();
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!stripeKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  if (!dryRun && (!resendKey || !fromEmail)) {
    throw new Error("Missing RESEND_API_KEY or RESEND_FROM_EMAIL");
  }

  const stripe = new Stripe(stripeKey);
  const resend = resendKey ? new Resend(resendKey) : null;

  const { data: memberships, error: membershipsError } = await supabase
    .from("memberships")
    .select(
      "id, status, last_renewal, start_date, stripe_subscription_id, customer_email"
    )
    .limit(limit * 4);

  if (membershipsError) throw membershipsError;
  if (!memberships || memberships.length === 0) {
    return {
      runId,
      dryRun,
      evaluated: 0,
      eligible: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };
  }

  const membershipRows = memberships as MembershipRow[];
  const membershipIds = membershipRows.map((m) => m.id);
  const { data: people, error: peopleError } = await supabase
    .from("people")
    .select("id, membership_id, full_name, email")
    .in("membership_id", membershipIds);

  if (peopleError) throw peopleError;
  const peopleByMembershipId = new Map<string, PersonRow>();
  for (const person of (people ?? []) as PersonRow[]) {
    if (person.membership_id && !peopleByMembershipId.has(person.membership_id)) {
      peopleByMembershipId.set(person.membership_id, person);
    }
  }

  const summary: MembershipThankYouRunSummary = {
    runId,
    dryRun,
    evaluated: membershipRows.length,
    eligible: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (const membership of membershipRows) {
    if (!isActiveStatus(membership.status)) {
      summary.skipped += 1;
      continue;
    }

    let renewalDate: Date | null = null;
    try {
      renewalDate = membership.stripe_subscription_id
        ? await getStripeRenewalDate(stripe, membership.stripe_subscription_id)
        : getFallbackRenewalDate(membership);
    } catch (error) {
      summary.failed += 1;
      summary.errors.push({
        membershipId: membership.id,
        error: error instanceof Error ? error.message : "Failed to resolve renewal date",
      });
      continue;
    }

    if (!renewalDate) {
      summary.skipped += 1;
      continue;
    }

    const renewalIso = toIsoDateUTC(renewalDate);
    if (renewalIso !== targetIso || renewalIso < todayIso) {
      summary.skipped += 1;
      continue;
    }

    const person = peopleByMembershipId.get(membership.id);
    const toEmail = person?.email ?? membership.customer_email;
    if (!toEmail) {
      summary.failed += 1;
      summary.errors.push({
        membershipId: membership.id,
        error: "No recipient email found",
      });
      continue;
    }

    const periodStartDate = addYears(renewalDate, -1);
    const periodStartIso = toIsoDateUTC(periodStartDate);

    const { data: existingLog, error: existingLogError } = await supabase
      .from("membership_thank_you_email_logs")
      .select("id")
      .eq("membership_id", membership.id)
      .eq("renewal_date", renewalIso)
      .maybeSingle();
    if (existingLogError) {
      summary.failed += 1;
      summary.errors.push({
        membershipId: membership.id,
        error: existingLogError.message,
      });
      continue;
    }
    if (existingLog?.id) {
      summary.skipped += 1;
      continue;
    }

    const personId = person?.id ?? null;
    let lineItems: PaymentRow[] = [];
    if (personId) {
      const { data: paymentRows, error: paymentError } = await supabase
        .from("payments")
        .select("amount, date, type, memo, method")
        .eq("person_id", personId)
        .gte("date", periodStartIso)
        .lt("date", renewalIso)
        .order("date", { ascending: true });
      if (paymentError) {
        summary.failed += 1;
        summary.errors.push({
          membershipId: membership.id,
          error: paymentError.message,
        });
        continue;
      }
      lineItems = (paymentRows ?? []) as PaymentRow[];
    }

    const receiptTotal = lineItems.reduce((acc, row) => acc + Number(row.amount ?? 0), 0);
    const recipientName = person?.full_name?.trim() || "neighbor";

    const { data: insertedLog, error: insertError } = await supabase
      .from("membership_thank_you_email_logs")
      .insert({
        membership_id: membership.id,
        person_id: personId,
        renewal_date: renewalIso,
        email: toEmail,
        receipt_period_start: periodStartIso,
        receipt_period_end: renewalIso,
        receipt_total: Number(receiptTotal.toFixed(2)),
        receipt_line_items: lineItems,
        status: dryRun ? "skipped" : "pending",
        attempt_count: 1,
        run_id: runId,
      })
      .select("id")
      .single();
    if (insertError) {
      summary.failed += 1;
      summary.errors.push({
        membershipId: membership.id,
        error: insertError.message,
      });
      continue;
    }

    summary.eligible += 1;

    if (dryRun) {
      summary.skipped += 1;
      continue;
    }

    try {
      const html = buildEmailHtml({
        recipientName,
        renewalDate: renewalIso,
        periodStart: periodStartIso,
        periodEnd: renewalIso,
        receiptTotal,
        lineItems,
      });

      if (!resend || !fromEmail) {
        throw new Error("Resend is not configured");
      }

      const response = await resend.emails.send({
        from: fromEmail ?? "",
        to: toEmail,
        subject: "Thank you for your MLCC membership",
        html,
      });

      const providerMessageId =
        typeof response.data?.id === "string" ? response.data.id : null;

      await supabase
        .from("membership_thank_you_email_logs")
        .update({
          status: "sent",
          provider_message_id: providerMessageId,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", insertedLog.id);

      summary.sent += 1;
    } catch (error) {
      await supabase
        .from("membership_thank_you_email_logs")
        .update({
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown send failure",
          updated_at: new Date().toISOString(),
        })
        .eq("id", insertedLog.id);

      summary.failed += 1;
      summary.errors.push({
        membershipId: membership.id,
        error: error instanceof Error ? error.message : "Unknown send failure",
      });
    }
  }

  return summary;
}

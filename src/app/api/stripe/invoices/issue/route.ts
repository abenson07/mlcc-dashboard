import { requireSession } from "@/lib/auth/require-session";
import {
  categorySlugToLabel,
  DASHBOARD_CREATED_VALUE,
  METADATA_KEYS,
  type InvoiceCategorySlug,
} from "@/lib/stripe/invoiceDashboardMetadata";
import { resolveInvoiceEventById } from "@/lib/stripe/resolveInvoiceEvent";
import { getStripe } from "@/lib/stripe/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

type LineItem = { description: string; amountCents: number };

type ParsedIssue = {
  email: string;
  name?: string;
  lineItems: LineItem[];
  dueDate: string | null;
  categorySlug: InvoiceCategorySlug;
  eventId?: string;
  memo?: string;
};

const USD = "usd" as const;

function parseIssueBody(body: unknown): { ok: true; data: ParsedIssue } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Expected JSON object body." };
  }
  const o = body as Record<string, unknown>;

  const email =
    typeof o.email === "string" && o.email.trim() ? o.email.trim() : "";
  const name =
    typeof o.name === "string" && o.name.trim() ? o.name.trim() : undefined;

  if (!email) {
    return { ok: false, error: "email is required." };
  }

  const rawCat = o.category;
  let categorySlug: InvoiceCategorySlug | null = null;
  if (rawCat === "event" || rawCat === "leaflet") {
    categorySlug = rawCat;
  } else {
    return {
      ok: false,
      error: 'category is required: use "event" or "leaflet".',
    };
  }

  const rawItems = o.lineItems;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { ok: false, error: "lineItems must be a non-empty array." };
  }
  const lineItems: LineItem[] = [];
  for (let i = 0; i < rawItems.length; i++) {
    const row = rawItems[i];
    if (typeof row !== "object" || row === null) {
      return { ok: false, error: `lineItems[${String(i)}] must be an object.` };
    }
    const r = row as Record<string, unknown>;
    const description =
      typeof r.description === "string" ? r.description.trim() : "";
    const amountCents = r.amountCents;
    if (!description) {
      return {
        ok: false,
        error: `lineItems[${String(i)}].description is required.`,
      };
    }
    if (
      typeof amountCents !== "number" ||
      !Number.isInteger(amountCents) ||
      amountCents <= 0
    ) {
      return {
        ok: false,
        error: `lineItems[${String(i)}].amountCents must be a positive integer.`,
      };
    }
    lineItems.push({ description, amountCents });
  }

  let dueDate: string | null = null;
  if (typeof o.dueDate === "string" && o.dueDate.trim()) {
    dueDate = o.dueDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return { ok: false, error: "dueDate must be YYYY-MM-DD." };
    }
  }

  const memo =
    typeof o.memo === "string" && o.memo.trim() ? o.memo.trim() : undefined;

  const eventId =
    typeof o.eventId === "string" && o.eventId.trim()
      ? o.eventId.trim()
      : undefined;

  if (categorySlug === "event" && !eventId) {
    return {
      ok: false,
      error: "eventId is required when category is event.",
    };
  }

  if (categorySlug === "leaflet" && eventId) {
    return {
      ok: false,
      error: "eventId must not be set for leaflet sponsorship invoices.",
    };
  }

  return {
    ok: true,
    data: {
      email,
      name,
      lineItems,
      dueDate,
      categorySlug,
      eventId,
      memo,
    },
  };
}

/** End of selected calendar day, UTC — matches common “due on this date” semantics. */
function dueDateToUnixEndOfDayUtc(ymd: string): number {
  const parts = ymd.split("-").map(Number);
  const y = parts[0]!;
  const month = parts[1]!;
  const day = parts[2]!;
  return Math.floor(Date.UTC(y, month - 1, day, 23, 59, 59, 999) / 1000);
}

async function resolveCustomerId(stripe: Stripe, input: ParsedIssue): Promise<string> {
  const email = input.email;
  const list = await stripe.customers.list({ email, limit: 1 });
  if (list.data.length > 0) {
    return list.data[0]!.id;
  }
  const created = await stripe.customers.create({
    email,
    ...(input.name ? { name: input.name } : {}),
  });
  return created.id;
}

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
    { error: "Unexpected error creating invoice." },
    { status: 500 }
  );
}

export async function POST(req: Request) {
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

  const parsed = parseIssueBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const input = parsed.data;

  let eventMetadata: Record<string, string> = {};
  if (input.categorySlug === "event" && input.eventId) {
    const resolved = await resolveInvoiceEventById(input.eventId);
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }
    eventMetadata = {
      [METADATA_KEYS.eventId]: resolved.event.eventId,
      [METADATA_KEYS.eventName]: resolved.event.eventName,
    };
  }

  try {
    const customerId = await resolveCustomerId(stripe, input);

    const invoiceCreateParams: Stripe.InvoiceCreateParams = {
      customer: customerId,
      collection_method: "send_invoice",
      currency: USD,
      ...(input.memo ? { description: input.memo } : {}),
      metadata: {
        [METADATA_KEYS.category]: categorySlugToLabel(input.categorySlug),
        [METADATA_KEYS.created]: DASHBOARD_CREATED_VALUE,
        [METADATA_KEYS.createdBy]: auth.user.displayName,
        ...eventMetadata,
      },
      ...(input.dueDate
        ? { due_date: dueDateToUnixEndOfDayUtc(input.dueDate) }
        : { days_until_due: 30 }),
    };

    let invoice = await stripe.invoices.create(invoiceCreateParams);

    for (const line of input.lineItems) {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        amount: line.amountCents,
        currency: USD,
        description: line.description,
      });
    }

    invoice = await stripe.invoices.finalizeInvoice(invoice.id);
    invoice = await stripe.invoices.sendInvoice(invoice.id);

    return NextResponse.json({
      id: invoice.id,
      status: invoice.status,
      hosted_invoice_url: invoice.hosted_invoice_url,
      due_date: invoice.due_date,
    });
  } catch (e: unknown) {
    return stripeErrorResponse(e);
  }
}

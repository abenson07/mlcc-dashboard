import { requireSession } from "@/lib/auth/require-session";
import {
  invoiceHasDashboardTags,
  METADATA_KEYS,
} from "@/lib/stripe/invoiceDashboardMetadata";
import {
  catalogProductIdsForInvoice,
  expandIdSetToProductIds,
  invoiceMatchesProductFilterAsync,
  parseStripeIdSet,
} from "@/lib/stripe/invoiceProductFilter";
import { getStripe } from "@/lib/stripe/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

type StripeInvoiceListRow = {
  id: string;
  /** Stripe-hosted sequence e.g. `ABC-0001`; may be null pre-finalize legacy rows */
  number: string | null;
  status: string | null;
  customer_email: string | null;
  amount_due: number;
  due_date: number | null;
  /** Unix seconds Stripe created at */
  created: number;
  hosted_invoice_url: string | null;
  /** Unique `prod_…` ids from invoice lines (for env filters). */
  catalog_product_ids: string[];
  /** `invoice.metadata.category` — Event vs Leaflet sponsorship. */
  sponsorship_category: string | null;
  /** `invoice.metadata.created_by` — dashboard user display name. */
  created_by_name: string | null;
  /** `invoice.metadata.event_id` — Webflow Events CMS item id. */
  event_id: string | null;
  /** `invoice.metadata.event_name` — event title at issue time. */
  event_name: string | null;
  /** `invoice.metadata.leaflet_id` */
  leaflet_id: string | null;
};

function customerEmail(inv: Stripe.Invoice): string | null {
  const c = inv.customer;
  if (typeof c === "string") return null;
  if (!c || ("deleted" in c && c.deleted)) return null;
  return c.email ?? null;
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
    const rawExclude = parseStripeIdSet(
      process.env.STRIPE_INVOICE_EXCLUDE_PRODUCT_IDS
    );
    const rawInclude = parseStripeIdSet(
      process.env.STRIPE_INVOICE_INCLUDE_PRODUCT_IDS
    );

    const [excludeProducts, includeProducts] = await Promise.all([
      expandIdSetToProductIds(stripe, rawExclude),
      expandIdSetToProductIds(stripe, rawInclude),
    ]);

    const res = await stripe.invoices.list({
      limit: 100,
      expand: [
        "data.customer",
        "data.lines.data",
        "data.lines.data.pricing.price_details.price",
      ],
    });

    const lineCaches = {
      prices: new Map<string, string | null>(),
      plans: new Map<string, string | null>(),
    };

    const filterCfg = { excludeProducts, includeProducts };

    const filtered: Stripe.Invoice[] = [];
    for (const inv of res.data) {
      if (!invoiceHasDashboardTags(inv.metadata)) continue;
      if (
        await invoiceMatchesProductFilterAsync(
          stripe,
          inv,
          filterCfg,
          lineCaches
        )
      ) {
        filtered.push(inv);
      }
    }

    const invoices: StripeInvoiceListRow[] = await Promise.all(
      filtered.map(async (inv) => ({
        id: inv.id,
        number: inv.number ?? null,
        status: inv.status,
        customer_email: customerEmail(inv),
        amount_due: inv.amount_due,
        due_date: inv.due_date,
        created: inv.created,
        hosted_invoice_url: inv.hosted_invoice_url ?? null,
        catalog_product_ids: await catalogProductIdsForInvoice(
          stripe,
          inv,
          lineCaches
        ),
        sponsorship_category:
          inv.metadata?.[METADATA_KEYS.category]?.trim() ?? null,
        created_by_name:
          inv.metadata?.[METADATA_KEYS.createdBy]?.trim() ?? null,
        event_id: inv.metadata?.[METADATA_KEYS.eventId]?.trim() ?? null,
        event_name: inv.metadata?.[METADATA_KEYS.eventName]?.trim() ?? null,
        leaflet_id: inv.metadata?.[METADATA_KEYS.leafletId]?.trim() ?? null,
      }))
    );

    return NextResponse.json({ invoices });
  } catch (e: unknown) {
    return stripeErrorResponse(e);
  }
}

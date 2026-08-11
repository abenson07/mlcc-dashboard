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
import type Stripe from "stripe";

export type DashboardInvoiceRow = {
  id: string;
  number: string | null;
  status: string | null;
  customer_email: string | null;
  amount_due: number;
  due_date: number | null;
  created: number;
  hosted_invoice_url: string | null;
  catalog_product_ids: string[];
  sponsorship_category: string | null;
  created_by_name: string | null;
  event_id: string | null;
  event_name: string | null;
  leaflet_id: string | null;
  sponsorship_id: string | null;
};

function customerEmail(inv: Stripe.Invoice): string | null {
  const c = inv.customer;
  if (typeof c === "string") return null;
  if (!c || ("deleted" in c && c.deleted)) return null;
  return c.email ?? null;
}

export async function listDashboardInvoices(
  stripe: Stripe,
): Promise<DashboardInvoiceRow[]> {
  const rawExclude = parseStripeIdSet(process.env.STRIPE_INVOICE_EXCLUDE_PRODUCT_IDS);
  const rawInclude = parseStripeIdSet(process.env.STRIPE_INVOICE_INCLUDE_PRODUCT_IDS);

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
    if (await invoiceMatchesProductFilterAsync(stripe, inv, filterCfg, lineCaches)) {
      filtered.push(inv);
    }
  }

  return Promise.all(
    filtered.map(async (inv) => ({
      id: inv.id,
      number: inv.number ?? null,
      status: inv.status,
      customer_email: customerEmail(inv),
      amount_due: inv.amount_due,
      due_date: inv.due_date,
      created: inv.created,
      hosted_invoice_url: inv.hosted_invoice_url ?? null,
      catalog_product_ids: await catalogProductIdsForInvoice(stripe, inv, lineCaches),
      sponsorship_category: inv.metadata?.[METADATA_KEYS.category]?.trim() ?? null,
      created_by_name: inv.metadata?.[METADATA_KEYS.createdBy]?.trim() ?? null,
      event_id: inv.metadata?.[METADATA_KEYS.eventId]?.trim() ?? null,
      event_name: inv.metadata?.[METADATA_KEYS.eventName]?.trim() ?? null,
      leaflet_id: inv.metadata?.[METADATA_KEYS.leafletId]?.trim() ?? null,
      sponsorship_id: inv.metadata?.[METADATA_KEYS.sponsorshipId]?.trim() ?? null,
    })),
  );
}

import type Stripe from "stripe";

/**
 * Stripe invoice.metadata for sponsorship invoices created from this dashboard.
 * Values are stored on the Invoice object at creation time.
 */
export const DASHBOARD_CREATED_VALUE = "Dashboard";

export const INVOICE_CATEGORY_LABEL = {
  EVENT: "Event Sponsorship",
  LEAFLET: "Leaflet Sponsorship",
  MEMBERSHIP: "Membership",
} as const;

export type InvoiceCategorySlug = "event" | "leaflet" | "membership";

export const METADATA_KEYS = {
  category: "category",
  created: "created",
  createdBy: "created_by",
  /** Supabase events.id when category is event sponsorship. Legacy invoices may still hold an imported CMS item id. */
  eventId: "event_id",
  /** Display name at issue time (from the events table). */
  eventName: "event_name",
  leafletId: "leaflet_id",
  sponsorshipId: "sponsorship_id",
  /** Check-entry invoices: "person" | "business", plus the Supabase row id. */
  payerType: "payer_type",
  payerId: "payer_id",
  /** Date written on the check (YYYY-MM-DD); Stripe cannot backdate paid_out_of_band. */
  checkDate: "check_date",
  /** Cents of the invoice that is a donation rather than membership dues. */
  donationCents: "donation_cents",
  manualPaymentMethod: "manual_payment_method",
  manualPaymentDate: "manual_payment_date",
  /** Running total of check money received against this invoice, in cents. */
  checkReceivedCents: "check_received_cents",
} as const;

export function categorySlugToLabel(slug: InvoiceCategorySlug): string {
  if (slug === "event") return INVOICE_CATEGORY_LABEL.EVENT;
  if (slug === "membership") return INVOICE_CATEGORY_LABEL.MEMBERSHIP;
  return INVOICE_CATEGORY_LABEL.LEAFLET;
}

function isKnownCategory(value: string | undefined): boolean {
  if (!value) return false;
  return (
    value === INVOICE_CATEGORY_LABEL.EVENT ||
    value === INVOICE_CATEGORY_LABEL.LEAFLET ||
    value === INVOICE_CATEGORY_LABEL.MEMBERSHIP
  );
}

/** Only invoices created through this flow (full tag set) appear in the billing list. */
export function invoiceHasDashboardTags(
  metadata: Stripe.Metadata | null | undefined
): boolean {
  if (!metadata) return false;
  if (metadata[METADATA_KEYS.created] !== DASHBOARD_CREATED_VALUE)
    return false;
  if (!metadata[METADATA_KEYS.createdBy]?.trim()) return false;
  return isKnownCategory(metadata[METADATA_KEYS.category]?.trim());
}

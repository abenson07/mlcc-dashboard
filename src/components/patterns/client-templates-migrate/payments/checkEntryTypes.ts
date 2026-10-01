import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import type { CheckTierKey } from "@/lib/memberships/tierPricing";

export type Payer = {
  kind: "person" | "business";
  id: string;
  name: string;
  email: string | null;
  subtitle: string;
  /** Only set when the payer has an Active membership. */
  activeMembership: { tier: CheckTierKey; periodEnd: string | null } | null;
};

export type MembershipEntry = {
  kind: "membership";
  key: string;
  payer: Payer;
  /** YYYY-MM-DD */
  date: string;
  tier: CheckTierKey;
  membershipCents: number;
  donationCents: number;
};

export type InvoiceEntry = {
  kind: "invoice";
  key: string;
  invoice: StripeInvoiceTableRow;
  date: string;
  /** What the check was actually for; may be under or over `invoice.amount_due`. */
  amountCents: number;
};

export type CheckEntry = MembershipEntry | InvoiceEntry;

export type RowState = { status: "pending" | "submitting" | "error"; error?: string };

import { NextResponse } from "next/server";
import Stripe from "stripe";

export type DuplicateMatchType = "email" | "address";

export interface DuplicateMemberSubscription {
  customerId: string;
  customerName: string;
  customerEmail: string;
  normalizedAddress: string | null;
  id: string;
  status: string;
  productId: string;
  productName: string;
  priceId: string;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
}

export interface DuplicateMember {
  id: string;
  matchType: DuplicateMatchType;
  matchValue: string;
  productId: string;
  productName: string;
  subscriptions: DuplicateMemberSubscription[];
}

async function fetchAllActiveSubscriptions(stripe: Stripe): Promise<Stripe.Subscription[]> {
  const subscriptions: Stripe.Subscription[] = [];
  let startingAfter: string | undefined;
  const limit = 100;

  do {
    const response = await stripe.subscriptions.list({
      status: "active",
      limit,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
      expand: ["data.customer", "data.items.data.price", "data.items.data.price.product", "data.latest_invoice"],
    });

    subscriptions.push(...response.data);
    if (!response.has_more || response.data.length === 0) break;
    startingAfter = response.data[response.data.length - 1]?.id;
  } while (true);

  return subscriptions;
}

function getCustomerEmail(
  customer: Stripe.Customer | Stripe.DeletedCustomer | string
): string | null {
  if (typeof customer === "string") return null;
  if ("deleted" in customer && customer.deleted) return null;
  const email = customer.email?.trim();
  return email ?? null;
}

function getCustomerName(
  customer: Stripe.Customer | Stripe.DeletedCustomer | string
): string {
  if (typeof customer === "string") return "—";
  if ("deleted" in customer && customer.deleted) return "—";
  const name = customer.name?.trim();
  return name ?? "—";
}

function normalizeEmail(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function normalizeAddress(
  customer: Stripe.Customer | Stripe.DeletedCustomer | string
): string | null {
  if (typeof customer === "string") return null;
  if ("deleted" in customer && customer.deleted) return null;
  const address = customer.address;
  if (!address) return null;

  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ]
    .map((part) => String(part ?? "").trim().toLowerCase())
    .filter(Boolean);

  if (parts.length === 0) return null;
  return parts.join("|");
}

function getMembershipProductIds(): Set<string> {
  const raw = process.env.STRIPE_MEMBERSHIP_PRODUCT_IDS ?? process.env.MEMBERSHIP_PRODUCT_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

export async function GET() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured." },
      { status: 500 }
    );
  }

  const membershipProductIds = getMembershipProductIds();
  if (membershipProductIds.size === 0) {
    return NextResponse.json(
      {
        error:
          "Membership product IDs are not configured. Set STRIPE_MEMBERSHIP_PRODUCT_IDS as a comma-separated list.",
      },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secret);

  try {
    const subscriptions = await fetchAllActiveSubscriptions(stripe);

    type Group = {
      id: string;
      matchType: DuplicateMatchType;
      matchValue: string;
      productId: string;
      productName: string;
      subscriptions: DuplicateMemberSubscription[];
    };

    type Candidate = {
      key: string;
      matchType: DuplicateMatchType;
      matchValue: string;
      productId: string;
      productName: string;
      subscription: DuplicateMemberSubscription;
    };

    const candidates: Candidate[] = [];

    for (const sub of subscriptions) {
      const customer = sub.customer;
      const customerEmail = getCustomerEmail(customer) ?? "—";
      const normalizedEmail = normalizeEmail(customerEmail);
      const normalizedAddr = normalizeAddress(customer);
      const customerName = getCustomerName(customer);
      const customerId = typeof customer === "string" ? customer : customer.id;

      const subStart = (sub as Record<string, unknown>).current_period_start as number | undefined;
      const subEnd = (sub as Record<string, unknown>).current_period_end as number | undefined;
      const inv = sub.latest_invoice;
      const invStart =
        typeof inv === "object" && inv !== null && "period_start" in inv
          ? Number((inv as { period_start: number }).period_start)
          : undefined;
      const invEnd =
        typeof inv === "object" && inv !== null && "period_end" in inv
          ? Number((inv as { period_end: number }).period_end)
          : undefined;
      const periodStart = typeof subStart === "number" && subStart > 0 ? subStart : invStart;
      const periodEnd = typeof subEnd === "number" && subEnd > 0 ? subEnd : invEnd;
      const validStart = typeof periodStart === "number" && !Number.isNaN(periodStart) && periodStart > 0;
      const validEnd = typeof periodEnd === "number" && !Number.isNaN(periodEnd) && periodEnd > 0;

      for (const item of sub.items.data) {
        const price = item.price;
        const productId =
          typeof price?.product === "string"
            ? price.product
            : (price?.product?.id ?? null);
        if (!productId || !membershipProductIds.has(productId)) continue;

        const priceProduct =
          typeof price?.product === "string" ? null : (price?.product ?? null);
        const productName =
          priceProduct?.name ??
          price?.nickname ??
          productId;

        const subscription: DuplicateMemberSubscription = {
          customerId,
          customerName,
          customerEmail,
          normalizedAddress: normalizedAddr,
          id: sub.id,
          status: sub.status ?? "—",
          productId,
          productName,
          priceId: price?.id ?? "—",
          currentPeriodStart: validStart ? periodStart : null,
          currentPeriodEnd: validEnd ? periodEnd : null,
        };

        if (normalizedEmail) {
          candidates.push({
            key: `email:${productId}:${normalizedEmail}`,
            matchType: "email",
            matchValue: normalizedEmail,
            productId,
            productName,
            subscription,
          });
        }
        if (normalizedAddr) {
          candidates.push({
            key: `address:${productId}:${normalizedAddr}`,
            matchType: "address",
            matchValue: normalizedAddr,
            productId,
            productName,
            subscription,
          });
        }
      }
    }

    const grouped = new Map<string, Group>();
    for (const candidate of candidates) {
      const existing = grouped.get(candidate.key);
      if (!existing) {
        grouped.set(candidate.key, {
          id: candidate.key,
          matchType: candidate.matchType,
          matchValue: candidate.matchValue,
          productId: candidate.productId,
          productName: candidate.productName,
          subscriptions: [candidate.subscription],
        });
      } else if (!existing.subscriptions.some((sub) => sub.id === candidate.subscription.id)) {
        existing.subscriptions.push(candidate.subscription);
      }
    }

    const duplicateMembers = [...grouped.values()]
      .filter((group) => group.subscriptions.length >= 2)
      .sort((a, b) => {
        const product = a.productName.localeCompare(b.productName);
        if (product !== 0) return product;
        return a.matchValue.localeCompare(b.matchValue);
      });

    return NextResponse.json({ duplicateMembers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

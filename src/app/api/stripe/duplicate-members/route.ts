import { NextResponse } from "next/server";
import Stripe from "stripe";

export interface DuplicateMemberSubscription {
  id: string;
  status: string;
  productName: string;
  priceId: string;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
}

export interface DuplicateMember {
  customerId: string;
  name: string;
  email: string;
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
      expand: ["data.customer", "data.items.data.price", "data.latest_invoice"],
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

export async function GET() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secret);

  try {
    const subscriptions = await fetchAllActiveSubscriptions(stripe);

    // Group by customer email (lowercase). Each group keeps full subscription list per customer.
    type Group = { customerId: string; name: string; email: string; subscriptions: Stripe.Subscription[] };
    const byEmail = new Map<string, Group>();

    for (const sub of subscriptions) {
      const customer = sub.customer;
      const email = getCustomerEmail(customer);
      const emailKey = (email ?? "").toLowerCase();
      if (!emailKey) continue;

      const name = getCustomerName(customer);
      const customerId = typeof customer === "string" ? customer : customer.id;

      const existing = byEmail.get(emailKey);
      if (existing) {
        // Same email can be different Stripe customer IDs (duplicate accounts)
        // We want to group by email and show all subscriptions for that email.
        existing.subscriptions.push(sub);
        // Prefer a name if we have one
        if (name !== "—") existing.name = name;
      } else {
        byEmail.set(emailKey, {
          customerId,
          name,
          email: email!,
          subscriptions: [sub],
        });
      }
    }

    // Only keep emails with 2+ active subscriptions
    const duplicateMembers: DuplicateMember[] = [];
    for (const [, group] of byEmail) {
      if (group.subscriptions.length < 2) continue;
      duplicateMembers.push({
        customerId: group.customerId,
        name: group.name,
        email: group.email,
        subscriptions: group.subscriptions.map((sub) => {
          const items = sub.items.data;
          const first = items[0];
          const price = first?.price;
          // Product is not expanded (Stripe allows max 4 levels); use price nickname or id for display
          const productName =
            price && typeof price === "object" && "nickname" in price && price.nickname
              ? String(price.nickname)
              : price?.id ?? "—";
          const extra = items.length > 1 ? ` (+${items.length - 1} more)` : "";
          // Use subscription's current_period_* (the period you're in right now). Fall back to
          // latest invoice period only when subscription period is missing (e.g. list API quirk).
          const subRec = sub as unknown as Record<string, unknown>;
          const subStart = subRec.current_period_start as number | undefined;
          const subEnd = subRec.current_period_end as number | undefined;
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
          return {
            id: sub.id,
            status: sub.status ?? "—",
            productName: productName + extra,
            priceId: price?.id ?? "—",
            currentPeriodStart: validStart ? periodStart : null,
            currentPeriodEnd: validEnd ? periodEnd : null,
          };
        }),
      });
    }

    // Sort by email
    duplicateMembers.sort((a, b) => a.email.localeCompare(b.email));

    return NextResponse.json({ duplicateMembers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

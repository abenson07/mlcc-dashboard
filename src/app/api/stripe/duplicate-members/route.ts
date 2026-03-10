import { NextResponse } from "next/server";
import Stripe from "stripe";

export interface DuplicateMemberSubscription {
  id: string;
  status: string;
  productName: string;
  priceId: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
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
      expand: ["data.customer", "data.items.data.price.product"],
    });

    subscriptions.push(...response.data);
    if (!response.has_more || response.data.length === 0) break;
    startingAfter = response.data[response.data.length - 1]?.id;
  } while (true);

  return subscriptions;
}

function getCustomerEmail(customer: Stripe.Customer | string): string | null {
  if (typeof customer === "string") return null;
  const email = customer.email?.trim();
  return email ?? null;
}

function getCustomerName(customer: Stripe.Customer | string): string {
  if (typeof customer === "string") return "—";
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
          const product = price && typeof price.product !== "string" ? price.product : null;
          const productName =
            product && typeof product === "object" && "name" in product
              ? String((product as { name?: string }).name ?? "—")
              : "—";
          const extra = items.length > 1 ? ` (+${items.length - 1} more)` : "";
          return {
            id: sub.id,
            status: sub.status ?? "—",
            productName: productName + extra,
            priceId: price?.id ?? "—",
            currentPeriodStart: sub.current_period_start,
            currentPeriodEnd: sub.current_period_end,
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

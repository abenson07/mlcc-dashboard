// Membership tier catalog. Framework-agnostic (no supabase-js/stripe deps) so it
// works unmodified in both the mlcc-website preview app and the root Next.js app.
// Single source of truth for pricing/copy shown on the pricing cards, the per-tier
// pages, and the /membership/join checkout — and for the checkout's Stripe amounts.

export type MembershipTierSlug = "household" | "individual" | "senior" | "student";

export type MembershipTier = {
  slug: MembershipTierSlug;
  name: string;
  priceCents: number; // per year, same amount whether billed recurring or one-time
  description: string;
  discounted: boolean;
};

export const membershipTiers: MembershipTier[] = [
  {
    slug: "household",
    name: "Household",
    priceCents: 4000,
    description:
      "One membership for everyone you live with—partners, roommates, or chosen family. Simple and supportive.",
    discounted: false,
  },
  {
    slug: "individual",
    name: "Individual",
    priceCents: 2500,
    description:
      "Perfect for solo neighbors who want to stay involved and support local events and projects.",
    discounted: false,
  },
  {
    slug: "senior",
    name: "Senior",
    priceCents: 500,
    description:
      "A discounted option for neighbors 65+ who want to stay connected and lend support.",
    discounted: true,
  },
  {
    slug: "student",
    name: "Student",
    priceCents: 500,
    description: "An affordable way for students to get involved and support their community.",
    discounted: true,
  },
];

export function findMembershipTier(slug: string | null | undefined): MembershipTier | undefined {
  return membershipTiers.find((t) => t.slug === slug);
}

export function formatMembershipPrice(cents: number): string {
  return `$${Math.round(cents / 100)}`;
}

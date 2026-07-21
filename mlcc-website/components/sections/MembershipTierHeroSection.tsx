import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { findMembershipTier, formatMembershipPrice, type MembershipTierSlug } from "@marketing/data/membership-tiers";

export function MembershipTierHeroSection({ tier: slug }: { tier: MembershipTierSlug }) {
  const tier = findMembershipTier(slug);
  if (!tier) return null;

  return (
    <section className="bg-sparkles-cream">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px] py-32 max-[767px]:py-16">
          <div className="mx-auto flex max-w-[36rem] flex-col items-center gap-6 text-center">
            <SectionLabel>{tier.discounted ? "Discounted membership" : "Membership"}</SectionLabel>
            <h1 className="m-0 font-display text-[3.75rem] font-bold leading-16 tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
              {tier.name} Membership
            </h1>
            <p className="m-0 font-display text-[2rem] font-bold leading-9 text-sparkles-navy">
              {formatMembershipPrice(tier.priceCents)}
              <span className="font-body text-base font-normal text-sparkles-muted"> / year</span>
            </p>
            <p className="m-0 font-body text-base leading-6 text-sparkles-muted">
              {tier.description}
            </p>
            <Link
              href={`/membership/join?tier=${tier.slug}`}
              className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-6 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream uppercase transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
            >
              Join as {tier.name}
            </Link>
            <p className="m-0 font-body text-xs leading-4 text-sparkles-muted">
              Memberships renew automatically each year by default — you can choose a one-time
              payment instead at checkout. Want a custom arrangement? Contact us at{" "}
              <a href="mailto:hello@mapleleafcommunity.org" className="font-bold underline underline-offset-2">
                hello@mapleleafcommunity.org
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MembershipTierHeroSection;

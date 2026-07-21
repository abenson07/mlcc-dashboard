"use client";

import * as React from "react";
import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { formatMembershipPrice, membershipTiers } from "@marketing/data/membership-tiers";

interface MembershipCardProps {
  title: string;
  description: string;
  price: string;
  href: string;
  stripeHref: string;
}

function MembershipCard({ title, description, price, href, stripeHref }: MembershipCardProps) {
  return (
    <div className="relative flex h-full flex-col rounded-[1.75rem] border-[3px] border-sparkles-navy bg-sparkles-cream p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-sparkles-navy">{title}</div>
        <div className="whitespace-nowrap font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-sparkles-navy">{price}</div>
      </div>

      <p className="m-0 mt-2 font-body text-sm leading-5 text-sparkles-muted">{description}</p>

      <div className="mt-4 flex items-center justify-between gap-4">
        <Link href={href} className="font-body text-sm font-bold text-sparkles-navy underline underline-offset-2">
          Learn more
        </Link>
        <a
          href={stripeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-sparkles-navy py-2.5 px-5 text-center font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300 hover:bg-sparkles-navy/90"
        >
          Support
        </a>
      </div>
    </div>
  );
}

const STRIPE_PAYMENT_LINKS: Record<string, string> = {
  household: "https://buy.stripe.com/cNidRa2aHesdfIWdNw3sI0E",
  individual: "https://buy.stripe.com/00gdT37PPae95DGdQS",
  senior: "https://buy.stripe.com/aEUeX7fihfyt5DGdQT",
  student: "https://buy.stripe.com/aEUeX7fihfyt5DGdQT",
};

const membershipCards: MembershipCardProps[] = membershipTiers.map((tier) => ({
  title: tier.name,
  description: tier.description,
  price: formatMembershipPrice(tier.priceCents),
  href: `/membership/${tier.slug}`,
  stripeHref: STRIPE_PAYMENT_LINKS[tier.slug] ?? "/membership",
}));

interface MembershipPricingSectionProps {
  editableId?: string;
  editableLabel?: string;
}

export function MembershipPricingSection({
  editableId = "home.membership-pricing",
  editableLabel = "Membership Pricing",
}: MembershipPricingSectionProps = {}) {
  const headingRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = React.useState(false);
  const [gridVisible, setGridVisible] = React.useState(false);

  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];

    [
      { el: headingRef.current, setVisible: setHeadingVisible },
      { el: gridRef.current, setVisible: setGridVisible },
    ].forEach(({ el, setVisible }) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <section
      className="bg-sparkles-cream py-[7.5rem] max-[767px]:py-20"
      data-editable="true"
      data-editable-type="section"
      data-editable-id={editableId}
      data-editable-label={editableLabel}
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="grid grid-cols-[1fr_1.5fr] gap-12 max-[991px]:grid-cols-1 max-[991px]:gap-8">
            <div
              ref={headingRef}
              className={`flex max-w-[42.5rem] flex-col items-start gap-8 self-start transition-all duration-700 ease-out max-[767px]:gap-6 ${
                headingVisible ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-[12px] translate-y-5"
              }`}
            >
              <SectionLabel>Membership</SectionLabel>
              <h2 className="m-0 font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                Support your neighborhood at any level
              </h2>
              <p className="m-0 font-body text-base leading-6 text-sparkles-muted">
                Choose the membership level that fits your household and help sustain Maple Leaf&apos;s events and programs.
              </p>
              <Link
                href="/membership"
                className="font-body text-base font-bold text-sparkles-navy underline underline-offset-2"
              >
                Learn More
              </Link>
            </div>

            <div
              ref={gridRef}
              className={`grid grid-cols-2 gap-4 max-[767px]:grid-cols-1 transition-all duration-700 ease-out delay-150 ${
                gridVisible ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-[12px] translate-y-5"
              }`}
            >
              {membershipCards.map((card) => (
                <MembershipCard key={card.title} {...card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MembershipPricingSection;

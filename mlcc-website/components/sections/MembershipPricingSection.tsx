"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";

interface MembershipCardProps {
  title: string;
  description: string;
  price: string;
  isHighlighted?: boolean;
}

function MembershipCard({ title, description, price, isHighlighted = false }: MembershipCardProps) {
  return (
    <div
      className={`flex h-full flex-col gap-6 rounded-3xl p-6 ${
        isHighlighted ? "bg-sparkles-navy text-sparkles-cream" : "bg-sparkles-warm text-sparkles-navy"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="font-display text-[1.75rem] leading-8 font-normal tracking-[-0.0625rem]">{title}</div>
        <p className="m-0 font-body text-sm leading-4">{description}</p>
      </div>

      <div className={`h-0 w-full border-b ${isHighlighted ? "border-sparkles-cream/30" : "border-sparkles-navy/30"}`} />

      <div className="flex flex-col gap-5">
        <div className="font-display text-[2.5rem] leading-[2.75rem] font-normal tracking-[-0.0625rem]">{price}</div>
        <a
          href="/membership"
          className={`block rounded-[2rem] border py-3 px-4 text-center font-display text-sm font-bold leading-5 no-underline transition-all duration-300 ${
            isHighlighted
              ? "border-sparkles-cream bg-sparkles-cream text-sparkles-navy hover:border-sparkles-cream/80 hover:bg-sparkles-cream/90"
              : "border-sparkles-navy bg-sparkles-navy text-sparkles-cream hover:border-sparkles-navy/80 hover:bg-sparkles-navy/90"
          }`}
        >
          Become a member
        </a>
      </div>
    </div>
  );
}

const membershipCards: MembershipCardProps[] = [
  {
    title: "Household",
    description: "One membership for everyone at home.",
    price: "$40/yr",
  },
  {
    title: "Individual",
    description: "Support MLCC as a single neighbor.",
    price: "$25/yr",
    isHighlighted: true,
  },
  {
    title: "Senior/Student",
    description: "A discounted rate for seniors and students.",
    price: "$5/yr",
  },
];

export function MembershipPricingSection() {
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
      data-editable-id="home.membership-pricing"
      data-editable-label="Membership Pricing"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div
            ref={headingRef}
            className={`mx-auto mb-12 flex max-w-[640px] flex-col items-center gap-4 text-center transition-all duration-700 ease-out ${
              headingVisible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"
            }`}
          >
            <SectionLabel>Membership</SectionLabel>
            <h2 className="m-0 font-display text-[3.75rem] font-normal leading-[4rem] tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-[2.75rem]">
              Simple pricing for every neighbor
            </h2>
            <p className="m-0 font-body text-base leading-6 text-sparkles-muted">
              Choose the membership level that fits your household and help sustain Maple Leaf&apos;s events and programs.
            </p>
          </div>

          <div
            ref={gridRef}
            className={`grid grid-cols-3 gap-3 max-[991px]:grid-cols-2 max-[767px]:grid-cols-1 transition-all duration-700 ease-out delay-150 ${
              gridVisible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"
            }`}
          >
            {membershipCards.map((card) => (
              <MembershipCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MembershipPricingSection;

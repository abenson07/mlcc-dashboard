"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";

function CheckIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

interface PricingCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  price: string;
  buttonText: string;
  href: string;
  isHighlighted?: boolean;
  features: string[];
  labelText: string;
  bottomText: string;
}

function PricingCard({
  icon,
  title,
  description,
  price,
  buttonText,
  href,
  isHighlighted = false,
  features,
  labelText,
  bottomText,
}: PricingCardProps) {
  return (
    <div
      className={`flex h-full flex-col gap-6 rounded-3xl p-6 ${
        isHighlighted ? "bg-sparkles-navy text-sparkles-cream" : "bg-sparkles-warm text-sparkles-navy"
      }`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 flex-none items-center justify-center">{icon}</div>
            <div className="font-display text-[1.75rem] leading-8 font-normal tracking-[-0.0625rem]">{title}</div>
          </div>
          <p className="m-0 font-body text-sm leading-4">{description}</p>
        </div>

        <div className={`h-0 w-full border-b ${isHighlighted ? "border-sparkles-cream/30" : "border-sparkles-navy/30"}`} />

        <div className="flex flex-col gap-5">
          <div className="font-display text-[2.5rem] leading-[2.75rem] font-normal tracking-[-0.0625rem]">{price}</div>
          <a
            href={href}
            className={`block rounded-[2rem] border py-3 px-4 text-center font-display text-sm font-bold leading-5 no-underline transition-all duration-300 ${
              isHighlighted
                ? "border-sparkles-cream bg-sparkles-cream text-sparkles-navy hover:border-sparkles-cream/80 hover:bg-sparkles-cream/90"
                : "border-sparkles-navy bg-sparkles-navy text-sparkles-cream hover:border-sparkles-navy/80 hover:bg-sparkles-navy/90"
            }`}
          >
            {buttonText}
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-4">
            <div
              className={`flex h-6 w-6 flex-none items-center justify-center overflow-hidden rounded-lg ${
                isHighlighted ? "bg-sparkles-cream/10 text-sparkles-cream" : "bg-sparkles-navy/10 text-sparkles-navy"
              }`}
            >
              <div className="flex h-4 w-4 items-center justify-center">
                <CheckIcon />
              </div>
            </div>
            <span className="font-body text-sm leading-4">{feature}</span>
          </div>
        ))}
      </div>

      <div className={`h-0 w-full border-b ${isHighlighted ? "border-sparkles-cream/30" : "border-sparkles-navy/30"}`} />

      <div className="flex flex-col gap-2">
        <div
          className={`font-body text-[0.625rem] font-normal uppercase leading-3 tracking-[0.0625rem] ${
            isHighlighted ? "text-sparkles-cream/60" : "text-sparkles-muted"
          }`}
        >
          {labelText}
        </div>
        <p className="m-0 font-body text-xs leading-4">{bottomText}</p>
      </div>
    </div>
  );
}

const monthlyCards: PricingCardProps[] = [
  {
    icon: <UserIcon />,
    title: "Individual",
    description: "Support MLCC as a single neighbor.",
    price: "$3/mo",
    buttonText: "Join now",
    href: "/membership/individual",
    features: ["Quarterly newsletter", "Event invitations", "Voting rights", "Community updates"],
    labelText: "Best for",
    bottomText: "Neighbors who want to stay connected and support local events.",
  },
  {
    icon: <HomeIcon />,
    title: "Household",
    description: "One membership for everyone at home.",
    price: "$5/mo",
    buttonText: "Join now",
    href: "/membership/household",
    features: ["All individual benefits", "Household voting rights", "Family event access", "Priority updates"],
    labelText: "Best for",
    bottomText: "Families and roommates who want to support Maple Leaf together.",
  },
  {
    icon: <BuildingIcon />,
    title: "Business",
    description: "Show your business supports the neighborhood.",
    price: "$200/yr",
    buttonText: "Join now",
    href: "/membership/business",
    isHighlighted: true,
    features: ["Business listing", "Event sponsorship", "Newsletter recognition", "Community partnership"],
    labelText: "Best for",
    bottomText: "Local businesses invested in Maple Leaf's future.",
  },
];

const annualCards: PricingCardProps[] = [
  {
    icon: <UserIcon />,
    title: "Individual",
    description: "Support MLCC as a single neighbor.",
    price: "$30/yr",
    buttonText: "Join now",
    href: "/membership/individual",
    features: ["Quarterly newsletter", "Event invitations", "Voting rights", "Community updates"],
    labelText: "Best for",
    bottomText: "Neighbors who want to stay connected and support local events.",
  },
  {
    icon: <HomeIcon />,
    title: "Household",
    description: "One membership for everyone at home.",
    price: "$50/yr",
    buttonText: "Join now",
    href: "/membership/household",
    features: ["All individual benefits", "Household voting rights", "Family event access", "Priority updates"],
    labelText: "Best for",
    bottomText: "Families and roommates who want to support Maple Leaf together.",
  },
  {
    icon: <BuildingIcon />,
    title: "Business",
    description: "Show your business supports the neighborhood.",
    price: "$200/yr",
    buttonText: "Join now",
    href: "/membership/business",
    isHighlighted: true,
    features: ["Business listing", "Event sponsorship", "Newsletter recognition", "Community partnership"],
    labelText: "Best for",
    bottomText: "Local businesses invested in Maple Leaf's future.",
  },
];

const logos = [
  { src: "https://byqsupply-components.netlify.app/skeletons/pricing/images/logo.svg", alt: "Monolith" },
  { src: "https://byqsupply-components.netlify.app/skeletons/pricing/images/logo-2.svg", alt: "Franco" },
  { src: "https://byqsupply-components.netlify.app/skeletons/pricing/images/logo-7.svg", alt: "Human.IN" },
  { src: "https://byqsupply-components.netlify.app/skeletons/pricing/images/logo-4.svg", alt: "Strobe" },
  { src: "https://byqsupply-components.netlify.app/skeletons/pricing/images/logo-1.svg", alt: "Terra-tory" },
];

export function Pricing3Section({ compactTop = false }: { compactTop?: boolean }) {
  const [activeTab, setActiveTab] = React.useState(0);
  const cards = activeTab === 0 ? monthlyCards : annualCards;

  return (
    <div
      id="pricing"
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="template.pricing-3"
      data-editable-label="Pricing 3 (Template)"
    >
      <style>{`
        @keyframes marquee-pricing-partners {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-pricing-partners {
          animation: marquee-pricing-partners 30s linear infinite;
        }
        .animate-marquee-pricing-partners:hover {
          animation-play-state: paused;
        }
      `}</style>

      <section className={`bg-sparkles-cream pb-0 ${compactTop ? "pt-20 max-[767px]:pt-16" : "pt-[7.5rem] max-[767px]:pt-20"}`}>
        <div className="px-8 max-[767px]:px-4">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="mx-auto mb-8 flex max-w-[640px] flex-col items-center gap-4 text-center">
              <SectionLabel>Support MLCC</SectionLabel>
              <h2 className="m-0 font-display text-[3.75rem] font-normal leading-[4rem] tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-[2.75rem]">
                Ways to support your neighborhood
              </h2>
            </div>

            <div className="flex w-full flex-col items-center">
              <div className="mb-8 flex rounded-[2rem] bg-sparkles-navy/30 p-1">
                {["Monthly", "Annual"].map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveTab(i)}
                    className={`cursor-pointer rounded-[2rem] border-none px-4 py-1 font-body text-sm font-normal text-sparkles-navy outline-none transition-colors duration-300 ${
                      activeTab === i ? "bg-sparkles-cream" : "bg-transparent"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="w-full">
                <div className="grid grid-cols-3 gap-3 max-[991px]:grid-cols-2 max-[767px]:grid-cols-1">
                  {cards.map((card) => (
                    <PricingCard key={`${activeTab}-${card.title}`} {...card} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sparkles-cream">
        <div className="px-8 max-[767px]:px-4">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="py-[7.5rem] max-[767px]:py-20">
              <div className="flex flex-col gap-16">
                <div className="flex flex-col items-center text-center">
                  <SectionLabel>Our partners</SectionLabel>
                </div>

                <div className="relative overflow-hidden max-[479px]:py-4">
                  <div className="animate-marquee-pricing-partners flex w-max items-center gap-[7.5rem] max-[479px]:gap-16">
                    {[0, 1, 2, 3].map((setIdx) => (
                      <div key={setIdx} className="flex flex-none items-center gap-[7.5rem] max-[479px]:gap-16">
                        {logos.map((logo) => (
                          <img key={`${setIdx}-${logo.alt}`} src={logo.src} alt={logo.alt} loading="lazy" className="h-8" />
                        ))}
                      </div>
                    ))}
                  </div>

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-16"
                    style={{ backgroundImage: "linear-gradient(90deg, var(--sparkles-cream), transparent)" }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 right-0 w-16"
                    style={{ backgroundImage: "linear-gradient(90deg, transparent, var(--sparkles-cream))" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Pricing3Section;

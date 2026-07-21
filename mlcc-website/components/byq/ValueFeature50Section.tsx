"use client";

import * as React from "react";

const cards = [
  {
    title: "Maintaining our tree canopy",
    text: "Preserving Maple Leaf's mature trees and green spaces as new development takes shape.",
    image: "/images/one-seattle/tree-canopy.jpeg",
    className: "bg-sparkles-warm text-sparkles-navy",
    href: "https://www.treeactionseattle.org/",
  },
  {
    title: "Developments at the government level",
    text: "Tracking how City of Seattle zoning decisions and comprehensive plan updates reach our neighborhood.",
    image: "/images/one-seattle/governemnt.png",
    className: "bg-sparkles-warm text-sparkles-navy",
    href: "https://www.seattle.gov/opcd/one-seattle-plan",
  },
  {
    title: "Maple Leaf Community Survey",
    text: "Tell us how long you've lived in Maple Leaf and what matters most as the neighborhood grows.",
    image: "/images/one-seattle/survey.png",
    className: "bg-sparkles-navy text-sparkles-cream",
    tooltip: "Survey results coming soon",
  },
];

function CardBody({ card }: { card: (typeof cards)[number] }) {
  return (
    <>
      <div className="flex flex-col items-start justify-start gap-6">
        <div className="font-display text-[2rem] leading-10 font-bold tracking-[-0.0625rem] max-[767px]:text-[1.75rem] max-[767px]:leading-8">
          {card.title}
        </div>
        <p className="m-0 font-body text-base leading-6 font-normal">{card.text}</p>
      </div>
      <div className="aspect-[3/2] w-full overflow-hidden rounded-xl">
        <img loading="lazy" alt="" src={card.image} className="h-full w-full object-cover" />
      </div>
    </>
  );
}

export function ValueFeature50Section() {
  const [tooltipOpen, setTooltipOpen] = React.useState(false);

  return (
    <section
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="one-seattle-plan.value-feature-1"
      data-editable-label="Value Feature 1"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-20 flex flex-col gap-6 max-[767px]:mb-12">
              <div className="w-full max-w-[42.5rem] max-[767px]:max-w-none">
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Where we&apos;re focusing our attention
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[991px]:grid-cols-2 max-[767px]:grid-cols-1">
              {cards.map((card) =>
                card.href ? (
                  <a
                    key={card.title}
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex w-full flex-col items-start justify-start gap-16 rounded-2xl p-8 no-underline transition-opacity hover:opacity-90 ${card.className}`}
                  >
                    <CardBody card={card} />
                  </a>
                ) : (
                  <div
                    key={card.title}
                    className={`relative flex w-full flex-col items-start justify-start gap-16 rounded-2xl p-8 ${card.className}`}
                    onMouseEnter={() => setTooltipOpen(true)}
                    onMouseLeave={() => setTooltipOpen(false)}
                    onFocus={() => setTooltipOpen(true)}
                    onBlur={() => setTooltipOpen(false)}
                    tabIndex={0}
                  >
                    {tooltipOpen ? (
                      <div className="absolute left-8 top-8 z-10 rounded-lg bg-sparkles-cream px-3 py-2 font-body text-sm font-normal text-sparkles-navy shadow-lg">
                        {card.tooltip}
                      </div>
                    ) : null}
                    <CardBody card={card} />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueFeature50Section;

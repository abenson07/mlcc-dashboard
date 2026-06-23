"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";

const tabs = ["Become a supporter", "Donate"];

const pricingData = [
  [
    { bedrooms: "1 Bedroom", price: "$89", desc: "Includes cleaning of one room, the kitchen, hallway and bathroom." },
    { bedrooms: "2 Bedrooms", price: "$105", desc: "Includes cleaning of two rooms, the kitchen, hallway and bathroom." },
    { bedrooms: "3 Bedrooms", price: "$119", desc: "Includes cleaning of three rooms, the kitchen, hallway and bathroom." },
  ],
  [
    { bedrooms: "1 Bedroom", price: "$92", desc: "Includes cleaning of one room, the kitchen, hallway and bathroom." },
    { bedrooms: "2 Bedrooms", price: "$110", desc: "Includes cleaning of two rooms, the kitchen, hallway and bathroom." },
    { bedrooms: "3 Bedrooms", price: "$130", desc: "Includes cleaning of three rooms, the kitchen, hallway and bathroom." },
  ],
];

function useInView(threshold = 0.1) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function ArrowIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookNowButton() {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-[2rem] cursor-pointer w-full transition-[padding,color] duration-300"
      style={{ padding: hovered ? "1rem 2.5rem 1rem 1.25rem" : "1rem 1.25rem" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute inset-0 rounded-[2rem] border border-transparent transition-colors duration-300"
        style={{ backgroundColor: hovered ? "#0d1526" : "#c1cb38" }}
      />
      <div className="relative z-10 flex items-center gap-2 pointer-events-none">
        <div
          className="absolute flex items-center justify-center overflow-hidden w-4 h-4 transition-colors duration-300"
          style={{ right: "-1.5rem", top: "50%", transform: "translateY(-50%)", color: hovered ? "#fdf8f1" : "#0d1526" }}
        >
          <ArrowIcon />
        </div>
        <span
          className="uppercase text-xl font-bold relative z-10 font-[family-name:var(--font-decalotype)] transition-colors duration-300"
          style={{ color: hovered ? "#fdf8f1" : "#0d1526" }}
        >
          Book now
        </span>
      </div>
    </div>
  );
}

function PricingCard({ bedrooms, price, desc }: { bedrooms: string; price: string; desc: string }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href="#"
      className="flex flex-col w-full bg-white no-underline p-8 gap-8 rounded-3xl text-[#0d1526] transition-transform duration-300"
      style={{
        transform: hovered ? "scale(1.05)" : "scale(1)",
        transitionTimingFunction: "cubic-bezier(0.445, 0.05, 0.55, 0.95)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="font-[family-name:var(--font-bricolage)] text-xl leading-7 font-semibold text-[#0d1526]">
        {bedrooms}
      </div>
      <div className="flex flex-col gap-6">
        <h2 className="m-0 font-[family-name:var(--font-decalotype)] text-[5rem] leading-[4rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[4rem] max-[767px]:leading-[3.25rem]">
          {price}
        </h2>
        <p className="m-0 font-[family-name:var(--font-bricolage)] text-xl leading-7 font-normal text-[#0d1526a3]">
          {desc}
        </p>
      </div>
      <div className="w-full">
        <BookNowButton />
      </div>
    </a>
  );
}

export function PricingSection() {
  const [activeTab, setActiveTab] = React.useState(0);
  const headlineAnim = useInView(0.1);
  const tabsAnim = useInView(0.1);

  return (
    <section className="w-full py-[7.5rem] bg-[#fdf8f1] max-[767px]:py-20">
      <div className="px-8 max-[767px]:px-4">
        <div className="w-full max-w-[1800px] mx-auto relative z-[2]">
          <div className="w-full py-[7.5rem] px-8 pb-20 rounded-3xl bg-[#f2ece5] max-[767px]:py-12 max-[767px]:px-4 max-[767px]:pb-12">
            <div
              ref={headlineAnim.ref}
              className={`
                flex flex-col items-center text-center mx-auto max-w-[42.5rem] gap-8 mb-12
                transition-all duration-700 ease-out
                ${headlineAnim.visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"}
              `}
            >
              <SectionLabel>Pricing</SectionLabel>
              <h2 className="m-0 font-[family-name:var(--font-decalotype)] text-[5rem] leading-[4rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[3rem] max-[767px]:leading-10">
                SIMPLE PRICING FOR EVERY HOME
              </h2>
              <div className="max-w-[28rem]">
                <p className="m-0 font-[family-name:var(--font-bricolage)] text-xl leading-7 font-normal text-[#0d1526]">
                  Choose how often you want your home cleaned — your price updates automatically.
                </p>
              </div>
            </div>

            <div
              ref={tabsAnim.ref}
              className={`
                flex flex-col items-center mb-20 transition-all duration-700 ease-out delay-150
                ${tabsAnim.visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"}
              `}
            >
              <div className="flex items-center justify-center mb-20 p-2 rounded-full bg-white max-[767px]:justify-start max-[767px]:w-full max-[767px]:overflow-x-auto">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(i)}
                    className={`
                      flex items-center justify-center cursor-pointer border-0 gap-2 px-5 py-3 rounded-3xl
                      transition-colors duration-300 outline-none
                      max-[479px]:shrink-0 max-[991px]:whitespace-nowrap
                      ${activeTab === i ? "bg-sparkles-blue text-[#0d1526]" : "bg-transparent text-[#0d1526] hover:bg-sparkles-blue"}
                    `}
                  >
                    <span className="font-[family-name:var(--font-decalotype)] text-xl leading-5 font-bold tracking-[0.031rem] uppercase">
                      {tab}
                    </span>
                  </button>
                ))}
              </div>

              <div className="w-full">
                {pricingData.map((cards, tabIdx) => (
                  <div key={tabIdx} className={activeTab === tabIdx ? "block" : "hidden"}>
                    <div className="grid grid-cols-3 gap-4 w-full max-[991px]:grid-cols-2 max-[479px]:grid-cols-1">
                      {cards.map((card) => (
                        <PricingCard key={card.bedrooms} {...card} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;

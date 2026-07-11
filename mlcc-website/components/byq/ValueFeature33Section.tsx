"use client";

import * as React from "react";
import Link from "next/link";

type MarqueeCard = {
  heading: string;
  text: string;
  href?: string;
};

const cardData: MarqueeCard[] = [
  {
    heading: "Newsletter",
    text: "Share neighborhood news, updates, and stories with the Magnuson community.",
    href: "/committees/newsletter",
  },
  {
    heading: "Events",
    text: "Plan gatherings that bring neighbors together across the park and community center.",
    href: "/committees/events",
  },
  {
    heading: "Emergency Hub",
    text: "Help neighbors prepare for emergencies and stay connected when it matters most.",
    href: "/committees/emergency-hub",
  },
  {
    heading: "Communications",
    text: "Keep members informed through email, social channels, and community outreach.",
    href: "/committees/communications",
  },
  {
    heading: "Advocacy",
    text: "Represent neighborhood priorities with city partners and local decision-makers.",
    href: "/committees/advocacy",
  },
  {
    heading: "Business Committee",
    text: "Support local businesses and strengthen connections across the Magnuson district.",
    href: "/committees/business-committee",
  },
  {
    heading: "Summer Social Planning",
    text: "Organize the season’s welcome-back gathering for families and neighbors.",
    href: "/volunteer",
  },
  {
    heading: "Movie Night Planning",
    text: "Coordinate an outdoor screening—from film picks to setup and promotion.",
    href: "/volunteer",
  },
  {
    heading: "Volunteer Day of",
    text: "Pitch in for a single day of hands-on projects that improve the community.",
    href: "/volunteer",
  },
  {
    heading: "Deliver a Leaflet",
    text: "Help distribute printed updates door to door across the neighborhood.",
    href: "/leaflet",
  },
  {
    heading: "Halloween Parade Planning",
    text: "Plan costumes, routes, and festivities for the annual neighborhood parade.",
    href: "/volunteer",
  },
];

const allCards = [...cardData, ...cardData];

function ParallaxImage() {
  const ref = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const parent = ref.current.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const progress = -rect.top / window.innerHeight;
      ref.current.style.transform = `translateY(${progress * 60}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <img
      ref={ref}
      loading="lazy"
      alt=""
      src="https://byqsupply-components.netlify.app/skeletons/value-features/images/vertical-pattern-2.svg"
      className="absolute inset-0 w-full object-cover z-[1] will-change-transform"
      style={{ height: "150%", top: "-25%" }}
    />
  );
}

export function ValueFeature33Section() {
  return (
    <section
      className="bg-sparkles-cream py-[7.5rem] max-[767px]:py-20"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="template.value-feature-33"
      data-editable-label="Value Feature 33 (Template)"
    >
      <style>{`
        @keyframes value-feature-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-value-feature-marquee {
          animation: value-feature-marquee 120s linear infinite;
        }
        .animate-value-feature-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="py-2 overflow-hidden">
        <div className="flex gap-4 w-max animate-value-feature-marquee max-[767px]:gap-3">
          {allCards.map((card, index) => {
            const cardInner = (
              <>
                <ParallaxImage />
                <div
                  className="absolute left-0 right-0 bottom-0 z-[2] flex h-1/2 flex-col items-start justify-end gap-4 p-6"
                  style={{
                    backgroundImage: "linear-gradient(0deg, rgba(253,248,241,0.72), rgba(253,248,241,0))",
                  }}
                >
                  <div className="font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-2xl max-[767px]:leading-7">
                    {card.heading}
                  </div>
                  <div className="font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                    {card.text}
                  </div>
                </div>
              </>
            );

            const cardClassName =
              "relative flex-none overflow-hidden rounded-2xl w-[35.75rem] h-[42.5rem] max-[991px]:w-[23rem] max-[991px]:h-[26rem] max-[767px]:w-[22rem] max-[767px]:h-[25rem] max-[479px]:w-[17rem] max-[479px]:h-[21rem]";

            if (card.href) {
              return (
                <Link
                  key={`${card.heading}-${index}`}
                  href={card.href}
                  className={`${cardClassName} block text-inherit no-underline`}
                >
                  {cardInner}
                </Link>
              );
            }

            return (
              <div key={`${card.heading}-${index}`} className={cardClassName}>
                {cardInner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ValueFeature33Section;

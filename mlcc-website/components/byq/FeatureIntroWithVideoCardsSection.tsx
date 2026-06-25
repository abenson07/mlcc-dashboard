"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import { COMMITTEE_CONTENT, COMMITTEE_LISTINGS } from "@marketing/data/committees";
import * as React from "react";

const committeeIcons: Record<string, React.ReactNode> = {
  newsletter: (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h6" />
    </svg>
  ),
  events: (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  "emergency-hub": (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  communications: (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v12H5.17L4 17.17V4z" />
      <path d="m8 9 2 2 4-4" />
    </svg>
  ),
  advocacy: (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M2 12h20" />
    </svg>
  ),
  "business-committee": (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
    </svg>
  ),
};

const committees = COMMITTEE_LISTINGS.map((listing) => ({
  label:
    listing.slug === "business-committee"
      ? "Business Committee"
      : COMMITTEE_CONTENT[listing.slug].title,
  href: `#${listing.slug}`,
  icon: committeeIcons[listing.slug],
}));

export function FeatureIntroWithVideoCardsSection() {
  const featuresRef = React.useRef<HTMLDivElement>(null);
  const [featuresVisible, setFeaturesVisible] = React.useState(false);

  React.useEffect(() => {
    const el = featuresRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const mediaCards = [
    {
      image:
        "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f1e1da163ec47328051_summer_social_2024-39.webp",
      alt: "Neighbors at the Maple Leaf Summer Social",
      caption: "Summer Social — the neighborhood gathering neighbors love most",
      staggered: false,
    },
    {
      image:
        "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69531455684e18c663a2a6b7_community-meeting3.webp",
      alt: "Neighbors at a Maple Leaf community meeting",
      caption: "Community meetings — where Maple Leaf learns and connects",
      staggered: true,
    },
  ] as const;

  return (
    <div className="w-full">
      <section
        className="bg-sparkles-cream pt-[7.5rem] pb-20 max-[767px]:pt-20 max-[767px]:pb-12"
        data-editable="true"
        data-editable-type="section"
        data-editable-id="home.mission"
        data-editable-label="Mission Section"
      >
        <div className="px-8 max-[767px]:px-4">
          <div className="z-[2] w-full max-w-[1800px] mx-auto">
            <div className="flex flex-col items-center gap-16 max-[767px]:gap-12">
              <div className="max-w-[57rem] w-full mx-auto flex flex-col items-center gap-6 max-[767px]:gap-5">
                <SectionLabel>Mission</SectionLabel>

                <div className="text-center">
                  <h2
                    className="m-0 text-puget-night font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]"
                    data-editable="true"
                    data-editable-type="text"
                    data-editable-id="home.mission.title"
                    data-editable-label="Mission headline"
                  >
                    Connecting neighbors to the people and things that matter most.
                  </h2>
                </div>
              </div>

              <div
                ref={featuresRef}
                className="grid w-full max-w-[57rem] grid-cols-3 gap-x-8 gap-y-10 max-[767px]:grid-cols-2 max-[479px]:flex max-[479px]:flex-col max-[479px]:gap-6 justify-center items-center mx-auto"
              >
                {committees.map((committee, i) => (
                  <a
                    key={committee.href}
                    href={committee.href}
                    className={`group flex max-w-[10.25rem] flex-col items-center gap-4 text-center text-inherit no-underline transition-all duration-700 ease-out hover:opacity-80 ${
                      featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${i * 120}ms` }}
                  >
                    <div className="flex h-8 w-8 flex-none items-center justify-center text-sparkles-navy opacity-50 transition-opacity group-hover:opacity-80">
                      {committee.icon}
                    </div>
                    <div className="font-body text-xl font-semibold leading-7 text-sparkles-navy group-hover:underline">
                      {committee.label}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sparkles-cream pt-0 pb-[7.5rem] max-[767px]:pb-20">
        <div className="px-8 max-[767px]:px-4">
          <div className="z-[2] w-full max-w-[1800px] mx-auto">
            <div className="flex gap-4 items-stretch justify-center max-[767px]:gap-3 max-[479px]:flex-col">
              {mediaCards.map((card) => (
                <div
                  key={card.alt}
                  className={`relative z-[1] w-full max-w-[28rem] h-[35rem] overflow-hidden rounded-3xl max-[767px]:h-[25rem] max-[767px]:rounded-[1.25rem] max-[479px]:h-[18.75rem] ${
                    card.staggered ? "mt-[4.75rem] max-[479px]:mt-0" : ""
                  }`}
                >
                  <img
                    src={card.image}
                    alt={card.alt}
                    loading="lazy"
                    className="absolute inset-0 z-[1] h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-0 z-[2]"
                    style={{
                      backgroundImage:
                        "linear-gradient(0deg, rgba(13, 21, 38, 0.72) 0%, rgba(13, 21, 38, 0.08) 55%, rgba(13, 21, 38, 0) 100%)",
                    }}
                  />
                  <div className="absolute inset-0 z-[3] flex items-end p-6">
                    <div className="max-w-[14rem] border-l border-sparkles-cream/30 pl-4">
                      <div className="font-body text-xs font-bold uppercase leading-4 tracking-[0.0625rem] text-sparkles-cream">
                        {card.caption}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FeatureIntroWithVideoCardsSection;

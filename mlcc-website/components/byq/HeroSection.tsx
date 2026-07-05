"use client";

import * as React from "react";
import Link from "next/link";

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const slides = [
  {
    image: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp",
    body: "We deliver 4,000 leaflets to Maple Leaf residents multiple times a year",
    linkText: "Learn more",
    href: "/committees/newsletter",
  },
  {
    image: "/images/events/summer-social.png",
    body: "Join us for the Summer Social on July 16th",
    linkText: "Learn more",
    href: "/events/2026-summer-social",
  },
  {
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530e8b1aadf47968a6eb09_summer_social_2024-62%20(1).webp",
    body: "Help us put on the Halloween Parade in October",
    linkText: "Learn more",
    href: "/committees/events",
  },
];

export function HeroSection() {
  const leftCardRef = React.useRef<HTMLDivElement>(null);
  const [leftCardVisible, setLeftCardVisible] = React.useState(false);

  const rightCardRef = React.useRef<HTMLDivElement>(null);
  const [rightCardVisible, setRightCardVisible] = React.useState(false);

  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const makeObs = (ref: React.RefObject<HTMLDivElement | null>, setter: (v: boolean) => void) => {
      const el = ref.current;
      if (!el) return;
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setter(true);
            obs.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      obs.observe(el);
      observers.push(obs);
    };

    makeObs(leftCardRef, setLeftCardVisible);
    makeObs(rightCardRef, setRightCardVisible);

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const [primaryHovered, setPrimaryHovered] = React.useState(false);
  const [secondaryHovered, setSecondaryHovered] = React.useState(false);

  return (
    <>
      <style>{`
        @keyframes hero-slide-fade {
          0%, 100% { opacity: 0; }
          0.33%, 33% { opacity: 1; }
          33.33% { opacity: 0; }
        }
        .hero-slide {
          animation: hero-slide-fade 60s linear infinite;
          opacity: 0;
        }
        .hero-slide-1 { animation-delay: 0s; }
        .hero-slide-2 { animation-delay: 20s; }
        .hero-slide-3 { animation-delay: 40s; }
      `}</style>

      <section className="bg-sparkles-cream" data-editable="true" data-editable-type="section" data-editable-id="home.hero" data-editable-label="Hero Section">
        <div className="px-8 max-[767px]:px-4">
          <div className="w-full max-w-[1800px] mx-auto">
            <div className="grid grid-cols-2 gap-4 py-8 min-h-[calc(100dvh-6.75rem)] max-[767px]:grid-cols-1 max-[767px]:gap-3 max-[767px]:py-6 max-[991px]:min-h-[calc(100dvh-6.25rem)]">
              {/* Left card */}
              <div
                ref={leftCardRef}
                className={`
                  flex w-full h-full flex-col items-start justify-between gap-16 rounded-[1.25rem] bg-sparkles-warm p-12
                  max-[767px]:gap-12 max-[767px]:rounded-2xl max-[767px]:p-8
                  transition-all duration-700 ease-out
                  ${leftCardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[50px]"}
                `}
              >
                <div className="max-w-[28rem]">
                  <h1
                    className="m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-sparkles-navy max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]"
                    data-editable="true"
                    data-editable-type="text"
                    data-editable-id="home.hero.title"
                    data-editable-label="Hero headline"
                  >
                    Connecting neighbors to the people and things that matter most.
                  </h1>
                </div>

                <div className="flex flex-col items-start justify-start gap-6 max-[767px]:gap-5">
                  <div className="max-w-[28rem]">
                    <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-muted max-[767px]:text-base max-[767px]:leading-6">
                      A community council keeping Maple Leaf informed, connected, and involved.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-start gap-2 max-[767px]:gap-2">
                    <Link
                      href="/membership"
                      className={`
                        inline-flex items-center justify-center gap-2 rounded-[2rem] px-5 py-4
                        font-display text-base leading-5 font-bold cursor-pointer no-underline
                        transition-all duration-300
                        max-[767px]:px-4 max-[767px]:py-3
                        ${primaryHovered ? "bg-sparkles-warm text-sparkles-navy" : "bg-sparkles-navy text-sparkles-cream"}
                      `}
                      onMouseEnter={() => setPrimaryHovered(true)}
                      onMouseLeave={() => setPrimaryHovered(false)}
                    >
                      <span>Become a member</span>
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden max-[767px]:h-3 max-[767px]:w-3">
                        <ArrowIcon />
                      </span>
                    </Link>

                    <Link
                      href="/volunteer"
                      className={`
                        inline-flex items-center justify-center gap-2 rounded-[2rem] px-5 py-4
                        font-display text-base leading-5 font-bold cursor-pointer no-underline text-sparkles-navy
                        transition-all duration-300
                        max-[767px]:px-4 max-[767px]:py-3
                        ${secondaryHovered ? "bg-sparkles-warm" : "bg-sparkles-navy-8"}
                      `}
                      onMouseEnter={() => setSecondaryHovered(true)}
                      onMouseLeave={() => setSecondaryHovered(false)}
                    >
                      <span>Volunteer</span>
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden max-[767px]:h-3 max-[767px]:w-3">
                        <ArrowIcon />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right card — 3-slide CSS crossfade */}
              <div
                ref={rightCardRef}
                className={`
                  relative z-[1] w-full h-full overflow-hidden rounded-[1.25rem]
                  max-[767px]:rounded-2xl max-[767px]:min-h-[400px]
                  transition-all duration-700 ease-out delay-150
                  ${rightCardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[50px]"}
                `}
              >
                {slides.map((slide, i) => (
                  <div key={i} className={`absolute inset-0 hero-slide hero-slide-${i + 1}`}>
                    <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="relative z-[2] flex h-full w-full items-end justify-end p-4 max-[767px]:p-3">
                      <div className="flex max-w-[20.75rem] flex-col items-start justify-between gap-8 rounded-[1.25rem] bg-sparkles-cream p-8 text-sparkles-navy max-[767px]:rounded-2xl max-[767px]:p-6">
                        <p className="m-0 font-body text-base leading-6 font-normal">{slide.body}</p>
                        <Link
                          href={slide.href}
                          className="inline-flex items-center gap-1 font-display text-base font-bold text-sparkles-navy no-underline"
                        >
                          <span>{slide.linkText}</span>
                          <span className="flex h-4 w-4 items-center justify-center overflow-hidden">
                            <ArrowIcon />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HeroSection;

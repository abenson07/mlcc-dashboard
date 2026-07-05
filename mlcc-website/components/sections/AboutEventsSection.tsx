"use client";

import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { membershipPrograms } from "@marketing/data/membership";
import * as React from "react";

const EVENT_CARDS = membershipPrograms.map((program) => ({
  title: program.title,
  image: program.image,
}));

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.9987 1.33594V10.6693M1.33203 6.0026H10.6654"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function AboutEventsSection() {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const [headingVisible, setHeadingVisible] = React.useState(false);

  React.useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadingVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      className="relative z-[2] bg-sparkles-cream py-20 text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="about.events"
      data-editable-label="About Events"
    >
      <style>{`
        @keyframes about-events-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-about-events-marquee {
          animation: about-events-marquee 45s linear infinite;
        }
      `}</style>

      <div className="mx-auto mb-20 w-full max-w-[1800px] px-8 max-[767px]:mb-16 max-[767px]:px-4">
        <div className="mx-auto flex max-w-[43.125rem] flex-col items-center gap-6 text-center">
          <SectionLabel>Events</SectionLabel>
          <h2
            ref={headingRef}
            className={`
              m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night
              transition-all duration-700 ease-out
              max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]
              ${headingVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
            `}
          >
            Traditions neighbors look forward to — and room for new ones
          </h2>
          <p className="m-0 max-w-[34rem] font-body text-base leading-6 text-sparkles-navy">
            More than 4,500 neighbors attend MLCC events each year. From decades-old gatherings to
            neighbor-led ideas that started just last summer, events are how Maple Leaf stays
            connected.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
          >
            See upcoming events
          </Link>
        </div>
      </div>

      <div className="overflow-hidden py-2">
        <div className="animate-about-events-marquee flex w-max gap-8 max-[479px]:gap-4">
          {[0, 1].map((set) => (
            <div key={set} className="flex flex-none flex-row gap-3 max-[479px]:gap-4">
              {EVENT_CARDS.map((event, i) => (
                <div
                  key={`${set}-${i}`}
                  className="relative h-[25rem] w-[21.5rem] flex-none overflow-hidden rounded-2xl max-[991px]:h-[20rem] max-[991px]:w-[18rem] max-[767px]:h-[17.5rem] max-[767px]:w-[15rem] max-[479px]:h-[15rem] max-[479px]:w-[13.75rem]"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    loading="lazy"
                    className="absolute inset-0 z-[1] h-full w-full object-cover"
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 z-[2] flex flex-col justify-end gap-1 pb-6 pl-6"
                    style={{
                      height: "50%",
                      backgroundImage:
                        "linear-gradient(0deg, color-mix(in srgb, var(--sparkles-navy) 65%, transparent), transparent)",
                    }}
                  >
                    <div className="flex flex-row items-center gap-3">
                      <span className="flex items-center justify-center text-sparkles-accent">
                        <PlusIcon />
                      </span>
                      <span className="font-body text-xs font-bold uppercase tracking-[0.0625rem] text-sparkles-cream">
                        {event.title}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutEventsSection;

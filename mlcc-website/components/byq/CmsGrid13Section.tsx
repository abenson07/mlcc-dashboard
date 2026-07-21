"use client";

import * as React from "react";
import Link from "next/link";
import { getUpcomingEvents } from "@marketing/data/events";
import { EventCard } from "@marketing/components/byq/EventCard";

function ArrowLeftIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none">
      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 border-0 cursor-pointer
        ${hovered ? "bg-sparkles-navy text-sparkles-cream" : "bg-sparkles-warm text-sparkles-navy"}
      `}
      aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
    >
      <span className="w-5 h-5 flex items-center justify-center">
        {direction === "prev" ? <ArrowLeftIcon /> : <ArrowRightIcon />}
      </span>
    </button>
  );
}

export function CmsGrid13Section() {
  const events = React.useMemo(() => getUpcomingEvents(), []);
  const [slide, setSlide] = React.useState(0);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [stepPx, setStepPx] = React.useState(0);

  React.useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const card = trackRef.current.firstElementChild as HTMLElement | null;
      if (!card) return;
      const gap = parseFloat(getComputedStyle(trackRef.current).gap) || 32;
      setStepPx(card.offsetWidth + gap);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const maxSlide = events.length - 1;
  const handlePrev = () => setSlide((prev) => Math.max(0, prev - 1));
  const handleNext = () => setSlide((prev) => Math.min(maxSlide, prev + 1));

  const touchStartX = React.useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (deltaX <= -SWIPE_THRESHOLD) {
      handleNext();
    } else if (deltaX >= SWIPE_THRESHOLD) {
      handlePrev();
    }
  };

  return (
    <section
      className="bg-sparkles-cream overflow-hidden"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="home.local-events"
      data-editable-label="Home CMS Grid"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="z-[2] w-full max-w-[1800px] mx-auto">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="flex items-center justify-between mb-12 pr-[8.75rem] max-[767px]:flex-col max-[767px]:items-start max-[767px]:gap-6 max-[767px]:pr-0">
              <div className="flex flex-col items-start gap-3">
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Local events
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <NavButton direction="prev" onClick={handlePrev} />
                <NavButton direction="next" onClick={handleNext} />
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div
                ref={trackRef}
                className="flex gap-8 max-[767px]:gap-4"
                style={{
                  transform: `translateX(-${slide * stepPx}px)`,
                  transition: "transform 700ms ease-out",
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {events.map((event) => (
                  <div
                    key={event.slug}
                    className="w-[31.3%] max-[991px]:w-[45%] max-[767px]:w-[95%] shrink-0"
                  >
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/events"
              className="mt-16 flex justify-start items-center gap-1 no-underline uppercase transition-colors duration-[350ms] font-[family-name:var(--font-decalotype)] text-lg leading-4 font-bold text-[#0d1526] hover:text-[#0d1526e0] max-[767px]:mt-10"
            >
              <span>See all events</span>
              <span className="flex items-center justify-center shrink-0 w-4 h-4">
                <ChevronRightIcon />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CmsGrid13Section;

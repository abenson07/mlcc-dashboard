"use client";

import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

const BOARD_IMAGE =
  "/images/community-photos/community-meeting-d.webp";

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AboutBoardSection() {
  const parallaxRef = React.useRef<HTMLImageElement>(null);
  const [btnHovered, setBtnHovered] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      if (!parallaxRef.current) return;
      const parent = parallaxRef.current.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const progress = -rect.top / window.innerHeight;
      parallaxRef.current.style.transform = `translateY(${progress * 60}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className="bg-sparkles-warm text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="about.board"
      data-editable-label="About Board"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="grid grid-cols-2 gap-16 max-[991px]:grid-cols-1">
              <div className="flex flex-col items-start justify-between gap-20 max-[991px]:gap-16">
                <div className="flex max-w-[35.25rem] flex-col items-start gap-6">
                  <SectionLabel>The board</SectionLabel>

                  <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                    Neighbors who steward the organization
                  </h2>

                  <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
                    The MLCC board is made up of Maple Leaf residents elected by members. They set
                    direction for the council, oversee finances, represent the neighborhood in city
                    processes, and support the committees doing the day-to-day work. Many current
                    board members started as volunteers, delivering the Leaflet, helping at an
                    event, or joining a committee conversation.
                  </p>

                  <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
                    Board meetings are open to the public. If you want to understand how decisions
                    get made, or you&apos;re curious about serving yourself, that&apos;s the best
                    place to start.
                  </p>

                  <Link
                    href="/board"
                    onMouseEnter={() => setBtnHovered(true)}
                    onMouseLeave={() => setBtnHovered(false)}
                    className={`
                      flex cursor-pointer flex-row items-center justify-center gap-2 rounded-[2rem] border px-4 py-3
                      font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300
                      ${btnHovered ? "border-sparkles-navy/90 bg-sparkles-navy/90" : "border-sparkles-navy bg-sparkles-navy"}
                    `}
                  >
                    <span>Meet the board</span>
                    <span className="flex h-4 w-4 items-center justify-center overflow-hidden">
                      <ArrowRightIcon />
                    </span>
                  </Link>
                </div>

                <div className="flex w-full flex-col gap-4 rounded-2xl bg-sparkles-cream p-6">
                  <p className="m-0 font-body text-base leading-6 italic text-sparkles-navy">
                    &ldquo;The Maple Leaf Community Council doesn&apos;t exist apart from the
                    neighborhood. It exists because of it, built by neighbors, sustained by
                    neighbors.&rdquo;
                  </p>
                  <p className="m-0 font-body text-xs font-bold uppercase tracking-[0.0625rem] text-sparkles-muted">
                    From the Leaflet
                  </p>
                </div>
              </div>

              <div className="relative min-h-[45rem] w-full overflow-hidden rounded-2xl max-[991px]:h-[28rem] max-[991px]:min-h-0 max-[479px]:h-[18.75rem]">
                <img
                  ref={parallaxRef}
                  loading="lazy"
                  alt="Neighbors gathered at a Maple Leaf community meeting"
                  src={BOARD_IMAGE}
                  className="absolute left-0 top-0 z-[1] h-[150%] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutBoardSection;

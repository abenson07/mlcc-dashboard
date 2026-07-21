"use client";

import Link from "next/link";
import { AboutFutureIntroSection } from "@marketing/components/sections/AboutFutureIntroSection";
import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

const BOOK_CLUB_IMAGE =
  "/images/community-photos/img-6862.jpg";
const MEETING_IMAGE =
  "/images/community-photos/community-meeting-d.webp";

const goals = [
  {
    title: "10% membership by 2026",
    description:
      "Growing from 5% to 10% of Maple Leaf households lets us sustain the Leaflet, core events, and emergency hub operations.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Keep traditions going",
    description:
      "The Halloween Parade, Summer Social, and printed Leaflet are worth protecting, and growing membership helps us say yes to what's next.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Stronger advocacy",
    description:
      "More voices at community meetings and deeper capacity on city policy, from zoning workshops to street safety.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21h18M5 21V7l7-4 7 4v14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Room for new ideas",
    description:
      "Neighbor-led traditions like Movies by the Tower and Silent Book Club started because someone asked a question. We want more of that.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const membershipUnlocks = [
  "Sustain the printed Leaflet",
  "Fund core neighborhood events",
  "Grow emergency hub operations",
  "Seed new neighbor-led traditions",
];

function CheckIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useDividerAnimation(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

export function AboutFutureSection() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [gridVisible, setGridVisible] = React.useState(false);
  const [divider1Ref, divider1Visible] = useDividerAnimation();
  const [divider2Ref, divider2Visible] = useDividerAnimation();

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGridVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="about.future"
      data-editable-label="About Future"
    >
      <AboutFutureIntroSection />

      {/* Two-column icon features grid */}
      <div ref={sectionRef} className="bg-sparkles-warm px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div
              className={`mb-16 max-w-[57rem] transition-all duration-700 ease-out max-[767px]:mb-10 ${gridVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <SectionLabel className="mb-4">Our goals</SectionLabel>
              <h3 className="m-0 mb-6 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                Building a council that can keep saying yes
              </h3>
              <p className="m-0 max-w-[42.5rem] font-body text-base leading-6 text-sparkles-navy">
                New families move in, longtime neighbors stay rooted, and the questions we face keep
                evolving. These are the priorities guiding us through 2026 and beyond.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 max-[767px]:grid-cols-1 max-[767px]:gap-6">
              {goals.map((goal, index) => (
                <div
                  key={goal.title}
                  className={`group rounded-2xl border border-sparkles-navy/10 bg-sparkles-cream p-8 transition-all duration-700 ease-out hover:border-sparkles-navy/20 hover:shadow-sm max-[767px]:p-6 ${gridVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                  style={{ transitionDelay: gridVisible ? `${index * 80 + 200}ms` : "0ms" }}
                >
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-sparkles-navy/5 text-sparkles-navy transition-colors duration-300 group-hover:bg-sparkles-navy/10">
                    {goal.icon}
                  </div>
                  <h4 className="m-0 mb-3 font-display text-xl font-bold leading-7 tracking-[-0.03125rem] text-puget-night">
                    {goal.title}
                  </h4>
                  <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
                    {goal.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features comparison — alternating rows */}
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div className="flex flex-col gap-40 max-[991px]:gap-20">
              <div className="grid grid-cols-2 items-start gap-[8.25rem] max-[991px]:grid-cols-1 max-[991px]:gap-20 max-[479px]:gap-12">
                <div className="flex h-full flex-col items-start justify-between gap-12">
                  <div className="flex flex-col items-start gap-8">
                    <div ref={divider1Ref} className="w-full">
                      <div
                        className="border-b border-sparkles-navy/20 transition-all duration-[800ms] ease-out"
                        style={{ width: divider1Visible ? "100%" : "0%" }}
                      />
                    </div>
                    <div className="flex flex-col items-start gap-6">
                      <SectionLabel>Membership</SectionLabel>
                      <h3 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                        Closing the gap between attendance and support
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <p className="m-0 font-body text-xl leading-7 text-sparkles-navy">
                      More than 4,500 neighbors attend MLCC events each year, roughly everyone who
                      lives here. Yet only about 5% financially support the council. Growing to 10%
                      by the end of 2026 lets us do more of what neighbors already love.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {membershipUnlocks.map((item) => (
                        <div key={item} className="flex items-center gap-4">
                          <div className="flex h-6 w-6 flex-none items-center justify-center text-sparkles-navy/60">
                            <CheckIcon />
                          </div>
                          <span className="font-body text-base font-bold leading-6 text-sparkles-navy">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative flex h-[38.75rem] items-center justify-center overflow-hidden rounded-2xl max-[767px]:h-[30rem] max-[479px]:h-80">
                  <img
                    loading="lazy"
                    alt="Neighbors at Silent Book Club"
                    src={BOOK_CLUB_IMAGE}
                    className="absolute inset-0 z-[0] h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 items-start gap-[8.25rem] max-[991px]:grid-cols-1 max-[991px]:gap-20 max-[479px]:gap-12">
                <div className="relative flex h-[38.75rem] items-center justify-center overflow-hidden rounded-2xl max-[991px]:order-2 max-[767px]:h-[30rem] max-[479px]:h-80">
                  <img
                    loading="lazy"
                    alt="Neighbors at a Maple Leaf community meeting"
                    src={MEETING_IMAGE}
                    className="absolute inset-0 z-[0] h-full w-full object-cover"
                  />
                </div>

                <div className="flex h-full flex-col items-start justify-between gap-12 max-[991px]:order-1">
                  <div className="flex flex-col items-start gap-8">
                    <div ref={divider2Ref} className="w-full">
                      <div
                        className="border-b border-sparkles-navy/20 transition-all duration-[800ms] ease-out"
                        style={{ width: divider2Visible ? "100%" : "0%" }}
                      />
                    </div>
                    <div className="flex flex-col items-start gap-6">
                      <SectionLabel>Your role</SectionLabel>
                      <h3 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                        The future gets written by neighbors who show up
                      </h3>
                    </div>
                  </div>

                  <p className="m-0 font-body text-xl leading-7 text-sparkles-navy">
                    That future isn&apos;t written yet. It gets written at a committee meeting, on a
                    Leaflet route, behind a membership, or with a new event proposal. However you
                    want to be involved, there&apos;s a place for you here.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/volunteer"
                      className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
                    >
                      Volunteer
                    </Link>
                    <Link
                      href="/membership"
                      className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy/30 bg-white/50 px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-navy no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90 hover:text-sparkles-cream"
                    >
                      Become a member
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutFutureSection;

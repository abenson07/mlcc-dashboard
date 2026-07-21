"use client";

import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

const MEETING_IMAGE =
  "/images/community-photos/community-meeting-a.webp";
const NEIGHBORHOOD_IMAGE =
  "/images/community-photos/maple-leaf.jpg";
const LEAFLET_IMAGE =
  "/images/leaflet/leaflet.webp";
const EVENTS_IMAGE =
  "/images/community-photos/summer-social-2024-39.webp";

const workAreas = [
  {
    title: "Publish the Leaflet",
    description:
      "Seattle's last printed neighborhood newsletter, written, designed, and delivered door to door by volunteers across Maple Leaf.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Host neighborhood events",
    description:
      "From the Summer Social and Halloween Parade to Movies by the Tower and Silent Book Club, gatherings that keep neighbors connected.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Advocate for Maple Leaf",
    description:
      "Through relationships with city partners, volunteers raise awareness on zoning, transportation, public safety, and other issues neighbors care about.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21h18M5 21V7l7-4 7 4v14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Prepare for emergencies",
    description:
      "The Emergency Hub committee helps neighbors get ready for earthquakes and stay connected when disasters strike.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const civicFocus = ["Zoning & land use", "Transportation", "Public safety", "City budget priorities"];

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

export function AboutWhatWeDoSection() {
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
      className="bg-sparkles-warm text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="about.what-we-do"
      data-editable-label="About What We Do"
    >
      {/* Two-column hero layout */}
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div className="grid gap-12 max-[991px]:grid-cols-1 [grid-template-columns:1.5fr_1fr]">
              <div className="max-w-[42.5rem] max-[767px]:max-w-none">
                <div className="flex flex-col items-start gap-6">
                  <SectionLabel>What we do</SectionLabel>
                  <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                    A neighborhood organization run by the people who live here
                  </h2>
                </div>

                <div className="mt-20 h-[22.5rem] w-full max-w-[35.25rem] overflow-hidden rounded-2xl max-[991px]:mt-16 max-[991px]:mb-20 max-[479px]:mt-12 max-[479px]:mb-12 max-[479px]:h-[18.75rem]">
                  <img
                    loading="lazy"
                    alt="Neighbors gathered at a Maple Leaf community meeting"
                    src={MEETING_IMAGE}
                    className="z-[1] h-full w-full object-cover"
                  />
                </div>

                <p className="m-0 max-w-[28rem] font-body text-xl leading-7 text-sparkles-navy max-[991px]:max-w-none">
                  The Maple Leaf Community Council is a registered nonprofit and a recognized
                  community council under Seattle&apos;s neighborhood engagement system, not a
                  government agency, and not a staff office. Just neighbors who care about this
                  place.
                </p>
              </div>

              <div>
                <div className="h-[38.75rem] w-full overflow-hidden rounded-2xl max-[767px]:h-[35rem] max-[479px]:h-[25rem]">
                  <img
                    loading="lazy"
                    alt="Aerial view of the Maple Leaf neighborhood in Seattle"
                    src={NEIGHBORHOOD_IMAGE}
                    className="z-[1] h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column icon features grid */}
      <div ref={sectionRef} className="bg-sparkles-cream px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div
              className={`mb-16 max-w-[57rem] transition-all duration-700 ease-out max-[767px]:mb-10 ${gridVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <SectionLabel className="mb-4">How we serve Maple Leaf</SectionLabel>
              <h3 className="m-0 mb-6 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                Four ways neighbors experience the council
              </h3>
              <p className="m-0 max-w-[42.5rem] font-body text-base leading-6 text-sparkles-navy">
                Most people know us through everyday life: a newsletter on the doorstep, a parade
                in October, a summer gathering in the park. Committees handle the day-to-day; the
                board sets direction.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 max-[767px]:grid-cols-1 max-[767px]:gap-6">
              {workAreas.map((area, index) => (
                <div
                  key={area.title}
                  className={`group rounded-2xl border border-sparkles-navy/10 bg-sparkles-warm p-8 transition-all duration-700 ease-out hover:border-sparkles-navy/20 hover:shadow-sm max-[767px]:p-6 ${gridVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                  style={{ transitionDelay: gridVisible ? `${index * 80 + 200}ms` : "0ms" }}
                >
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-sparkles-navy/5 text-sparkles-navy transition-colors duration-300 group-hover:bg-sparkles-navy/10">
                    {area.icon}
                  </div>
                  <h4 className="m-0 mb-3 font-display text-xl font-bold leading-7 tracking-[-0.03125rem] text-puget-night">
                    {area.title}
                  </h4>
                  <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
                    {area.description}
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
                      <SectionLabel>Advocacy</SectionLabel>
                      <h3 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                        Raising awareness where it counts
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <p className="m-0 font-body text-xl leading-7 text-sparkles-navy">
                      When Seattle makes decisions that shape Maple Leaf, we lean on relationships
                      we&apos;ve built to share what neighbors care about and help keep our
                      community in the conversation. We listen, show up prepared, and work to raise
                      awareness, knowing outcomes are never guaranteed.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {civicFocus.map((item) => (
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
                    alt="Neighbors at a Maple Leaf advocacy workshop"
                    src={LEAFLET_IMAGE}
                    className="absolute inset-0 z-[0] h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 items-start gap-[8.25rem] max-[991px]:grid-cols-1 max-[991px]:gap-20 max-[479px]:gap-12">
                <div className="relative flex h-[38.75rem] items-center justify-center overflow-hidden rounded-2xl max-[991px]:order-2 max-[767px]:h-[30rem] max-[479px]:h-80">
                  <img
                    loading="lazy"
                    alt="Families enjoying the Summer Social in Maple Leaf"
                    src={EVENTS_IMAGE}
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
                      <SectionLabel>On the ground</SectionLabel>
                      <h3 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                        Run by volunteers who show up
                      </h3>
                    </div>
                  </div>

                  <p className="m-0 font-body text-xl leading-7 text-sparkles-navy">
                    Board members, committee volunteers, Leaflet deliverers, and event planners,
                    every role matters, and there&apos;s room for however much time you have to give.
                    Those traditions don&apos;t happen on their own. They&apos;re planned, funded,
                    and carried out by people who live here.
                  </p>

                  <Link
                    href="/committees"
                    className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
                  >
                    Explore committees
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutWhatWeDoSection;

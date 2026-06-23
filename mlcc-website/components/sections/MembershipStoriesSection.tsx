"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { membershipStories } from "@marketing/data/membership";

function StoryCard({
  quote,
  name,
  attribution,
  image,
}: {
  quote: string;
  name: string;
  attribution: string;
  image?: string;
}) {
  return (
    <div className="flex h-[26rem] w-[26rem] shrink-0 flex-col justify-between rounded-xl bg-sparkles-warm p-8 text-sparkles-navy max-[479px]:h-[21.25rem] max-[479px]:w-[20rem] max-[479px]:p-6">
      <blockquote className="m-0 font-body text-[1.75rem] font-normal leading-8 tracking-[-0.0625rem] max-[479px]:text-xl max-[479px]:leading-7">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <div className="flex items-center gap-4">
        {image ? (
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
            <img loading="lazy" src={image} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div>
          <div className="font-display text-base font-bold leading-5 text-puget-night">{name}</div>
          <div className="font-body text-[0.625rem] font-bold uppercase leading-3 tracking-[0.0625rem] text-sparkles-muted">
            {attribution}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MembershipStoriesSection() {
  const headlineRef = React.useRef<HTMLDivElement>(null);
  const [headlineVisible, setHeadlineVisible] = React.useState(false);

  React.useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadlineVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const storySets = [membershipStories, membershipStories];

  return (
    <section className="bg-sparkles-cream py-[7.5rem] max-[767px]:py-20">
      <style>{`
        @keyframes marquee-membership-stories {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-membership-stories {
          animation: marquee-membership-stories 50s linear infinite;
        }
        .animate-marquee-membership-stories:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div
            ref={headlineRef}
            className={`mx-auto mb-16 flex max-w-[42.5rem] flex-col items-center gap-6 text-center transition-all duration-700 ease-out max-[767px]:mb-12 max-[991px]:max-w-[30rem] ${
              headlineVisible ? "translate-y-0 opacity-100 blur-0" : "translate-y-5 opacity-0 blur-[12px]"
            }`}
          >
            <SectionLabel>Neighbor voices</SectionLabel>
            <h2 className="m-0 font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
              Why neighbors support Maple Leaf
            </h2>
            <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
              Stories and reflections from the Leaflet and neighbors who help keep this community going.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="animate-marquee-membership-stories flex w-max gap-4">
          {storySets.map((set, setIdx) => (
            <div key={setIdx} className="flex shrink-0 gap-4">
              {set.map((story, i) => (
                <StoryCard key={`${setIdx}-${i}`} {...story} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MembershipStoriesSection;

"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { MEMBERSHIP_GOAL, membershipMilestones } from "@marketing/data/membership";

function useInView(threshold = 0.1) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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

export function MembershipGoalSection() {
  const headline = useInView();
  const tracker = useInView();
  const progressPercent = (MEMBERSHIP_GOAL.currentPercent / MEMBERSHIP_GOAL.targetPercent) * 100;

  return (
    <section className="bg-sparkles-warm text-sparkles-navy">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div
              ref={headline.ref}
              className={`mx-auto mb-16 flex max-w-[42.5rem] flex-col items-center gap-6 text-center transition-all duration-700 ease-out max-[767px]:mb-12 ${
                headline.visible ? "translate-y-0 opacity-100 blur-0" : "translate-y-5 opacity-0 blur-[12px]"
              }`}
            >
              <SectionLabel>Our goal</SectionLabel>
              <h2 className="m-0 font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                {MEMBERSHIP_GOAL.headline}
              </h2>
              <p className="m-0 font-body text-base leading-6 text-sparkles-navy">{MEMBERSHIP_GOAL.summary}</p>
            </div>

            <div
              ref={tracker.ref}
              className={`mx-auto flex max-w-[56rem] flex-col gap-12 transition-all delay-150 duration-700 ease-out ${
                tracker.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <div className="rounded-3xl bg-sparkles-cream p-8 max-[767px]:p-6">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="font-display text-[3rem] font-bold leading-none tracking-[-0.125rem] text-puget-night max-[767px]:text-[2.5rem]">
                      {MEMBERSHIP_GOAL.currentPercent}%
                    </div>
                    <div className="mt-1 font-body text-sm leading-5 text-sparkles-muted">neighbors supporting today</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-[2rem] font-bold leading-none tracking-[-0.0625rem] text-puget-night max-[767px]:text-[1.75rem]">
                      {MEMBERSHIP_GOAL.targetPercent}%
                    </div>
                    <div className="mt-1 font-body text-sm leading-5 text-sparkles-muted">goal by {MEMBERSHIP_GOAL.targetDate}</div>
                  </div>
                </div>

                <div className="relative h-4 overflow-hidden rounded-full bg-sparkles-navy/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-sparkles-navy transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                  {membershipMilestones.map((milestone) => {
                    const position = (milestone.percent / MEMBERSHIP_GOAL.targetPercent) * 100;

                    return (
                      <div
                        key={milestone.percent}
                        className="absolute top-1/2 z-[1] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sparkles-cream bg-sparkles-navy"
                        style={{ left: `${position}%` }}
                        title={`${milestone.percent}%`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MembershipGoalSection;

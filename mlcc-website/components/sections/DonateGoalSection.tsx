"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { DONATION_GOAL } from "@marketing/data/donate";

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DonateGoalSection() {
  const headline = useInView();
  const tracker = useInView();
  const progressPercent = Math.min(100, (DONATION_GOAL.raised / DONATION_GOAL.target) * 100);
  const remaining = DONATION_GOAL.target - DONATION_GOAL.raised;

  return (
    <section
      className="bg-sparkles-warm text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="donate.goal"
      data-editable-label="Donate Goal"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div
              ref={headline.ref}
              className={`mx-auto mb-16 flex max-w-[42.5rem] flex-col items-center gap-6 text-center transition-all duration-700 ease-out max-[767px]:mb-12 ${
                headline.visible ? "translate-y-0 opacity-100 blur-0" : "translate-y-5 opacity-0 blur-[12px]"
              }`}
            >
              <SectionLabel>{DONATION_GOAL.label}</SectionLabel>
              <h2 className="m-0 font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                {DONATION_GOAL.headline}
              </h2>
              <p className="m-0 font-body text-base leading-6 text-sparkles-navy">{DONATION_GOAL.summary}</p>
            </div>

            <div
              ref={tracker.ref}
              className={`mx-auto max-w-[56rem] transition-all delay-150 duration-700 ease-out ${
                tracker.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <div className="rounded-3xl bg-sparkles-cream p-8 max-[767px]:p-6">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="font-display text-[3rem] font-bold leading-none tracking-[-0.125rem] text-puget-night max-[767px]:text-[2.5rem]">
                      {formatCurrency(DONATION_GOAL.raised)}
                    </div>
                    <div className="mt-1 font-body text-sm leading-5 text-sparkles-muted">raised so far</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-[2rem] font-bold leading-none tracking-[-0.0625rem] text-puget-night max-[767px]:text-[1.75rem]">
                      {formatCurrency(DONATION_GOAL.target)}
                    </div>
                    <div className="mt-1 font-body text-sm leading-5 text-sparkles-muted">2026 goal</div>
                  </div>
                </div>

                <div className="relative mb-6 h-4 overflow-hidden rounded-full bg-sparkles-navy/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-sparkles-navy transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="m-0 font-body text-sm leading-5 text-sparkles-navy">
                    <span className="font-semibold">{Math.round(progressPercent)}%</span> of the way there
                  </p>
                  <p className="m-0 font-body text-sm leading-5 text-sparkles-muted">
                    {formatCurrency(remaining)} to go
                  </p>
                </div>
              </div>

              <p className="mx-auto mt-8 max-w-[36rem] text-center font-body text-sm leading-5 text-sparkles-muted">
                Every one-time gift counts toward this goal. Membership dues and business sponsorships
                are tracked separately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DonateGoalSection;

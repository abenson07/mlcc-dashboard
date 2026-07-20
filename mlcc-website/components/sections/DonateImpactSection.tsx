"use client";

import * as React from "react";
import { donationImpacts } from "@marketing/data/donate";

export function DonateImpactSection() {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const [headingVisible, setHeadingVisible] = React.useState(false);

  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [itemsVisible, setItemsVisible] = React.useState<boolean[]>(
    new Array(donationImpacts.length).fill(false),
  );

  React.useEffect(() => {
    const headingEl = headingRef.current;
    if (!headingEl) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setHeadingVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(headingEl);
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setItemsVisible((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
            obs.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <section
      className="px-8 py-20 max-[767px]:px-4 max-[767px]:py-12"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="donate.impact"
      data-editable-label="Donate Impact"
    >
      <div className="relative z-[2] mx-auto w-full max-w-[1800px]">
        <div className="rounded-3xl bg-[#ddd0c4] px-8 py-[7.5rem] max-[767px]:rounded-[1.25rem] max-[767px]:px-4 max-[767px]:py-20">
          <div className="mx-auto flex max-w-[42.5rem] flex-col items-center gap-12 text-center max-[767px]:gap-8">
            <h2
              ref={headingRef}
              className={`m-0 font-display text-[2.75rem] font-bold leading-10 tracking-[-0.031rem] text-puget-night transition-all duration-700 ease-out max-[767px]:text-[2rem] max-[767px]:leading-7 ${
                headingVisible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"
              }`}
            >
              Where your gift goes
            </h2>

            <div className="flex w-full flex-col gap-4 max-[767px]:gap-3">
              {donationImpacts.map((item, i) => (
                <div
                  key={item.label}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className={`flex w-full flex-row items-center justify-between gap-6 rounded-2xl bg-sparkles-cream px-6 py-6 text-left transition-all duration-700 ease-out max-[767px]:gap-5 max-[767px]:px-5 max-[767px]:py-5 max-[479px]:flex-wrap max-[479px]:gap-y-3 ${
                    itemsVisible[i] ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="font-body text-xl font-semibold leading-7 text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                      {item.label}
                    </div>
                    <div className="font-body text-sm leading-5 text-sparkles-muted">{item.detail}</div>
                  </div>
                  <div className="shrink-0 font-display text-xl font-bold leading-7 text-sparkles-navy/65 max-[767px]:text-base max-[767px]:leading-6">
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>

            <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
              MLCC is volunteer-run. Your donation goes directly toward neighborhood programs, not
              overhead.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DonateImpactSection;

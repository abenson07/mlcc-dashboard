"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 1L8.854 5.146L13.5 5.854L10.25 9.021L11.09 13.646L7 11.5L2.91 13.646L3.75 9.021L0.5 5.854L5.146 5.146L7 1Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ValueFeatures29Section({ title }: { title: string }) {
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
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="one-seattle-plan.value-features-intro"
      data-editable-label="Value Features Intro"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="grid grid-cols-2 gap-16 max-[991px]:grid-cols-1">
              <div className="flex flex-col items-start justify-between gap-20 max-[991px]:gap-16">
                <div className="flex max-w-[35.25rem] flex-col items-start justify-start gap-4">
                  <SectionLabel>Label placeholder</SectionLabel>

                  <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                    {title}
                  </h2>

                  <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                    This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of
                    where real words will go.
                  </p>

                  <a
                    href="/contact"
                    onMouseEnter={() => setBtnHovered(true)}
                    onMouseLeave={() => setBtnHovered(false)}
                    className={`
                      flex cursor-pointer flex-row items-center justify-center gap-2 rounded-[2rem] border px-4 py-3
                      font-display text-sm leading-5 font-bold text-sparkles-cream no-underline
                      transition-all duration-300
                      ${btnHovered ? "border-sparkles-navy/90 bg-sparkles-navy/90" : "border-sparkles-navy bg-sparkles-navy"}
                    `}
                  >
                    <span>Primary</span>
                    <span className="flex h-4 w-4 items-center justify-center overflow-hidden">
                      <ArrowRightIcon />
                    </span>
                  </a>
                </div>

                <div className="flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-sparkles-warm p-4">
                  <div className="flex flex-col items-start justify-start gap-6">
                    <div className="flex flex-row items-center justify-start gap-1 text-sparkles-navy">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex h-4 w-4 items-center justify-center">
                          <StarIcon />
                        </div>
                      ))}
                    </div>

                    <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                      This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of
                      where real words will go.
                    </p>
                  </div>

                  <div className="flex flex-row items-center justify-start gap-2">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                      <img
                        loading="lazy"
                        alt=""
                        src="https://byqsupply-components.netlify.app/skeletons/value-features/images/User.svg"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col">
                      <div className="font-body text-base leading-6 font-bold text-sparkles-navy">Jessy Skeleton</div>
                      <div className="font-body text-xs leading-4 font-normal text-sparkles-muted">Hollow City, CA</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[45rem] w-full overflow-hidden rounded-lg max-[991px]:h-[28rem] max-[991px]:min-h-0 max-[479px]:h-[15rem]">
                <img
                  ref={parallaxRef}
                  loading="lazy"
                  alt=""
                  src="https://byqsupply-components.netlify.app/skeletons/value-features/images/horizontal-pattern-2.svg"
                  className="absolute left-0 top-0 z-[1] h-[150%] w-full object-cover"
                />

                <div className="absolute inset-0 z-[2] flex items-center justify-center">
                  <img
                    loading="lazy"
                    alt=""
                    src="https://byqsupply-components.netlify.app/skeletons/value-features/images/vf29-mockup.svg"
                    className="h-full px-6 max-[479px]:h-[150%]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueFeatures29Section;

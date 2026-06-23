"use client";

import * as React from "react";

export function Hero35Section({ title }: { title: string }) {
  const [headingVisible, setHeadingVisible] = React.useState(false);
  const [imagesVisible, setImagesVisible] = React.useState(false);

  const headingRef = React.useRef<HTMLDivElement>(null);
  const imagesRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const observe = (
      ref: React.RefObject<HTMLElement | null>,
      setter: (v: boolean) => void,
    ) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setter(true);
            obs.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      obs.observe(ref.current);
      observers.push(obs);
    };

    observe(headingRef, setHeadingVisible);
    observe(imagesRef, setImagesVisible);

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section className="relative py-[7.5rem] bg-sparkles-cream max-[767px]:py-20">
      <div className="absolute inset-x-0 top-0 z-0 h-[37.5rem] bg-sparkles-warm" />

      <div className="px-8 max-[767px]:px-4">
        <div className="w-full max-w-[1800px] mx-auto">
          <div ref={headingRef} className="relative z-[2] mb-20 max-w-[42.5rem]">
            <h1
              className={`
                m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-puget-night
                transition-all duration-700 ease-out
                max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]
                ${headingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
              `}
            >
              {title}
            </h1>
          </div>

          <div
            ref={imagesRef}
            className={`
              relative z-[2] grid gap-4 w-full
              [grid-template-columns:8fr_4fr]
              max-[991px]:[grid-template-columns:1fr_1fr]
              max-[767px]:[grid-template-columns:1fr]
              transition-all duration-700 ease-out delay-100
              ${imagesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            `}
          >
            <div className="h-[32.5rem] w-full rounded-3xl bg-[var(--sparkles-navy-16)] max-[767px]:h-[25rem] max-[767px]:rounded-[1.25rem]" />

            <div className="flex h-[32.5rem] w-full items-center justify-center rounded-3xl bg-[var(--sparkles-navy-16)] max-[767px]:h-[25rem] max-[767px]:rounded-[1.25rem]">
              <span className="font-display text-2xl font-bold tracking-[-0.03125rem] text-puget-night max-[767px]:text-xl">
                Next meeting
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero35Section;

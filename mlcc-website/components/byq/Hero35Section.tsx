"use client";

import * as React from "react";

export function Hero35Section({ title, image }: { title: string; image?: string }) {
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
            <div className="h-[32.5rem] w-full overflow-hidden rounded-3xl bg-[var(--sparkles-navy-16)] max-[767px]:h-[25rem] max-[767px]:rounded-[1.25rem]">
              {image ? (
                <img loading="lazy" src={image} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>

            <div className="flex h-[32.5rem] w-full flex-col justify-center rounded-3xl bg-sparkles-navy p-8 max-[767px]:h-auto max-[767px]:rounded-[1.25rem] max-[767px]:p-6">
              <div className="mb-6 flex flex-col gap-2">
                <span className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-cream/70">
                  Saturday, July 12, 2026 · 6:30 PM
                </span>
                <h2 className="m-0 font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-sparkles-cream">
                  Join us for our next committee meeting
                </h2>
              </div>

              <form className="flex flex-col gap-3" aria-label="Committee meeting signup">
                <input
                  className="min-h-12 w-full rounded-lg border border-sparkles-cream/20 bg-sparkles-cream/10 px-4 py-2 font-body text-base leading-6 text-sparkles-cream placeholder:text-sparkles-cream/50 focus:border-sparkles-cream focus:outline-none"
                  type="text"
                  name="name"
                  placeholder="Name"
                  autoComplete="name"
                  maxLength={256}
                  required
                />
                <input
                  className="min-h-12 w-full rounded-lg border border-sparkles-cream/20 bg-sparkles-cream/10 px-4 py-2 font-body text-base leading-6 text-sparkles-cream placeholder:text-sparkles-cream/50 focus:border-sparkles-cream focus:outline-none"
                  type="email"
                  name="email"
                  placeholder="Email"
                  autoComplete="email"
                  maxLength={256}
                  required
                />
                <button
                  type="submit"
                  className="mt-1 cursor-pointer rounded-[2rem] border border-sparkles-cream bg-sparkles-cream px-4 py-3 font-display text-sm leading-5 font-bold uppercase text-sparkles-navy transition-all duration-300 hover:border-sparkles-cream/90 hover:bg-sparkles-cream/90"
                >
                  Request to join
                </button>
              </form>

              <p className="m-0 mt-4 font-body text-xs leading-4 font-normal text-sparkles-cream/60">
                Meetings are often hosted in neighbors&apos; homes, so we don&apos;t post the address publicly. A
                committee member will reach out to share the details and get you signed up.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero35Section;

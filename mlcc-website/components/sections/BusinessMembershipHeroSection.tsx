"use client";

import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

const HERO_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2ef4da00327d5e0c5403_love-your-neighbor.webp";
const SECONDARY_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f1e1da163ec47328051_summer_social_2024-39.webp";

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

export function BusinessMembershipHeroSection() {
  const heading = useInView();
  const body = useInView();
  const images = useInView();

  return (
    <section className="relative bg-sparkles-cream text-sparkles-navy">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[37.5rem] bg-sparkles-warm" />

      <div className="relative z-[1] px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div
              ref={heading.ref}
              className={`mb-8 flex max-w-[42.5rem] flex-col items-start gap-6 transition-all duration-700 ease-out ${
                heading.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <SectionLabel>Business membership</SectionLabel>
              <h1 className="m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                Put your business behind Maple Leaf
              </h1>
            </div>

            <div className="grid gap-12 [grid-template-columns:1.5fr_1fr] max-[991px]:grid-cols-1">
              <div
                ref={body.ref}
                className={`flex flex-col gap-8 transition-all duration-700 ease-out delay-100 max-[991px]:max-w-none ${
                  body.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <p className="m-0 max-w-[35.25rem] font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                  Maple Leaf is built on neighbors who show up — and local businesses are part of
                  that story. A business membership tells customers you invest in the community
                  where you work, connect with other owners and volunteers, and help fund the
                  events and advocacy that keep this neighborhood strong.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/subscribe"
                    className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
                  >
                    Join for $200/year
                  </Link>
                  <Link
                    href="#benefits"
                    className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy/30 bg-white/50 px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-navy no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90 hover:text-sparkles-cream"
                  >
                    See what&apos;s included
                  </Link>
                </div>
              </div>

              <div
                ref={images.ref}
                className={`grid gap-4 transition-all duration-700 ease-out delay-150 [grid-template-columns:1fr_1fr] max-[479px]:grid-cols-1 ${
                  images.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="h-[18rem] overflow-hidden rounded-2xl max-[991px]:h-[16rem]">
                  <img
                    loading="lazy"
                    alt="Neighbors gathering at a Love Your Neighbor event in Maple Leaf"
                    src={HERO_IMAGE}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="h-[18rem] overflow-hidden rounded-2xl max-[991px]:h-[16rem]">
                  <img
                    loading="lazy"
                    alt="Families enjoying the Summer Social in Maple Leaf"
                    src={SECONDARY_IMAGE}
                    className="h-full w-full object-cover"
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

export default BusinessMembershipHeroSection;

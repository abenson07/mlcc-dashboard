"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

const SPONSORSHIP_PERKS = [
  "Early access to sponsorship opportunities",
  "Member discounts on event sponsorships",
  "Priority placement at the Summer Social",
  "Partnership options at the Halloween Parade",
] as const;

const SPONSORSHIP_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f1e1da163ec47328051_summer_social_2024-39.webp";
const COMMUNITY_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2ef4da00327d5e0c5403_love-your-neighbor.webp";
const PATTERN_IMAGE =
  "https://cdn.prod.website-files.com/6931c0eea92dec5b7ca905e9/6931c0eea92dec5b7ca907c4_pattern-vertical-new.svg";

function CheckIcon() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
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

function FeatureImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative flex h-[38.75rem] items-center justify-center overflow-hidden rounded-xl max-[767px]:h-[30rem] max-[479px]:h-80">
      <img
        loading="lazy"
        alt=""
        src={PATTERN_IMAGE}
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      <img
        loading="lazy"
        alt={alt}
        src={src}
        className="absolute z-[1] h-full w-full object-cover"
      />
    </div>
  );
}

export function BusinessMembershipPerksSection() {
  const [divider1Ref, divider1Visible] = useDividerAnimation();
  const [divider2Ref, divider2Visible] = useDividerAnimation();

  return (
    <section className="bg-sparkles-cream text-sparkles-navy">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="flex flex-col gap-40 max-[991px]:gap-20">
              <div className="grid grid-cols-2 items-start gap-[8.25rem] max-[991px]:grid-cols-1 max-[991px]:gap-20 max-[767px]:flex max-[767px]:flex-col max-[479px]:gap-12">
                <div className="h-full">
                  <div className="flex h-full flex-col items-start justify-between gap-12">
                    <div className="flex flex-col items-start justify-start gap-8">
                      <div ref={divider1Ref} className="w-full">
                        <div
                          className="border-b border-sparkles-navy/16 transition-all duration-[800ms] ease-out"
                          style={{ width: divider1Visible ? "100%" : "0%" }}
                        />
                      </div>

                      <div className="flex flex-col items-start justify-start gap-6">
                        <SectionLabel>Sponsorship access</SectionLabel>
                        <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                          Get there first — and pay less to sponsor
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-navy">
                        Maple Leaf&apos;s biggest gatherings draw hundreds of neighbors. As a business
                        member, you hear about sponsorship openings before the general public and
                        receive discounted rates on the events that put your name in front of local
                        customers.
                      </p>

                      <div className="grid grid-cols-2 gap-4 max-[479px]:grid-cols-1">
                        {SPONSORSHIP_PERKS.map((item) => (
                          <div key={item} className="flex items-center gap-4">
                            <div className="flex h-6 w-6 flex-none items-center justify-center overflow-hidden text-sparkles-navy/60">
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
                </div>

                <FeatureImage
                  src={SPONSORSHIP_IMAGE}
                  alt="Neighbors enjoying the Summer Social in Maple Leaf"
                />
              </div>

              <div className="grid grid-cols-2 items-start gap-[8.25rem] max-[991px]:grid-cols-1 max-[991px]:gap-20 max-[767px]:flex max-[767px]:flex-col-reverse max-[479px]:gap-12">
                <FeatureImage
                  src={COMMUNITY_IMAGE}
                  alt="Neighbors gathering at a Love Your Neighbor event in Maple Leaf"
                />

                <div className="h-full">
                  <div className="flex h-full flex-col items-start justify-between gap-12">
                    <div className="flex flex-col items-start justify-start gap-8">
                      <div ref={divider2Ref} className="w-full">
                        <div
                          className="border-b border-sparkles-navy/16 transition-all duration-[800ms] ease-out"
                          style={{ width: divider2Visible ? "100%" : "0%" }}
                        />
                      </div>

                      <div className="flex flex-col items-start justify-start gap-6">
                        <SectionLabel>Business community</SectionLabel>
                        <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                          Connect with the owners and operators who make Maple Leaf work
                        </h2>
                      </div>
                    </div>

                    <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-navy">
                      Membership plugs you into the broader Maple Leaf business community — the
                      shops, restaurants, and service providers who sponsor events, host gatherings,
                      and show up for the neighborhood. Through the Business Committee, you&apos;ll
                      meet fellow members, learn what&apos;s happening locally, and find natural
                      ways to collaborate with businesses on your block and beyond.
                    </p>
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

export default BusinessMembershipPerksSection;

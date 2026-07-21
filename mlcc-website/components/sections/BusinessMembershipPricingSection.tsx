"use client";

import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

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

function BuildingIcon() {
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
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

const cardClassName =
  "flex h-full w-full flex-col gap-6 rounded-3xl bg-sparkles-navy p-6 text-sparkles-cream";

const features = [
  "Business directory listing",
  "Newsletter recognition",
  "Event sponsorship access",
  "Business Committee involvement",
  "Community partnership opportunities",
  "Council voting rights",
] as const;

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

export function BusinessMembershipPricingSection() {
  const section = useInView();

  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="membership-business.pricing"
      data-editable-label="Business Membership Pricing"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div
              ref={section.ref}
              className={`mx-auto flex max-w-[56rem] flex-col items-center gap-8 transition-all duration-700 ease-out ${
                section.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex flex-col items-center gap-6 text-center">
                <SectionLabel>Simple pricing</SectionLabel>
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                  One membership. One neighborhood.
                </h2>
                <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
                  A flat annual rate: no tiers, no surprises. Your support goes directly toward
                  keeping Maple Leaf connected.
                </p>
              </div>

              <div className="mx-auto grid w-full max-w-[28rem] grid-cols-1 items-stretch gap-6">
                <div className={cardClassName}>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 flex-none items-center justify-center">
                          <BuildingIcon />
                        </div>
                        <div className="font-display text-[1.75rem] leading-8 font-normal tracking-[-0.0625rem]">
                          Business
                        </div>
                      </div>
                      <p className="m-0 font-body text-sm leading-4">
                        Show your business supports the neighborhood.
                      </p>
                    </div>

                    <div className="h-0 w-full border-b border-sparkles-cream/30" />

                    <div className="flex flex-col gap-5">
                      <div className="font-display text-[2.5rem] leading-[2.75rem] font-normal tracking-[-0.0625rem]">
                        $200<span className="text-xl leading-7">/yr</span>
                      </div>
                      <Link
                        href="/subscribe"
                        className="block rounded-[2rem] border border-sparkles-cream bg-sparkles-cream py-3 px-4 text-center font-display text-sm font-bold leading-5 text-sparkles-navy no-underline transition-all duration-300 hover:border-sparkles-cream/80 hover:bg-sparkles-cream/90"
                      >
                        Join now
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-center gap-4">
                        <div className="flex h-6 w-6 flex-none items-center justify-center overflow-hidden rounded-lg bg-sparkles-cream/10 text-sparkles-cream">
                          <div className="flex h-4 w-4 items-center justify-center">
                            <CheckIcon />
                          </div>
                        </div>
                        <span className="font-body text-sm leading-4">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="h-0 w-full border-b border-sparkles-cream/30" />

                  <div className="flex flex-col gap-2">
                    <div className="font-body text-[0.625rem] font-normal uppercase leading-3 tracking-[0.0625rem] text-sparkles-cream/60">
                      Best for
                    </div>
                    <p className="m-0 font-body text-xs leading-4">
                      Local shops, restaurants, and service providers invested in Maple Leaf&apos;s
                      future.
                    </p>
                  </div>
                </div>

                {/* <div className={`${cardClassName} items-center justify-center text-center`}>
                  <blockquote className="m-0 font-body text-xl leading-7 font-normal">
                    &ldquo;Hosting neighbors through council events brought regulars through our
                    door, but more than that, it reminded us we&apos;re part of something bigger
                    than our four walls.&rdquo;
                  </blockquote>

                  <div className="flex w-full flex-col items-center gap-2">
                    <div className="h-0 w-full border-b border-sparkles-cream/30" />

                    <div className="flex flex-col items-center gap-2 pt-4">
                      <div className="font-body text-[0.625rem] font-normal uppercase leading-3 tracking-[0.0625rem] text-sparkles-cream/60">
                        Watershed Pub &amp; Kitchen
                      </div>
                      <p className="m-0 font-display text-base font-bold leading-5 tracking-[-0.015rem]">
                        Maple Leaf business member
                      </p>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BusinessMembershipPricingSection;

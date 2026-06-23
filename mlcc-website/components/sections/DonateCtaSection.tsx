"use client";

import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";

export function DonateCtaSection() {
  return (
    <div className="bg-sparkles-cream p-2">
      <div className="relative z-[1] flex h-[34.25rem] w-full items-center justify-center overflow-hidden rounded-2xl max-[991px]:h-auto max-[991px]:py-40 max-[767px]:py-24">
        <img
          loading="lazy"
          alt=""
          src="https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d6d_community-meeting.webp"
          className="absolute inset-0 z-[1] h-full w-full object-cover max-[991px]:h-auto"
        />

        <div className="absolute inset-0 z-[2] bg-sparkles-navy/56" />

        <div className="relative z-[3] w-full px-8 max-[767px]:px-4">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="relative z-[3] mx-auto flex max-w-[42.5rem] flex-col items-center justify-center gap-6 text-center max-[767px]:gap-5">
              <div className="flex flex-col items-center gap-4">
                <SectionLabel>Give today</SectionLabel>

                <h2 className="m-0 font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-sparkles-cream max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Every gift strengthens Maple Leaf
                </h2>

                <p className="m-0 font-body text-base leading-6 text-sparkles-cream/85">
                  Make a one-time donation, or join as a member for steady support year-round.
                </p>
              </div>

              <div className="flex flex-row flex-wrap items-center justify-center gap-2">
                <Link
                  href="#give"
                  className="inline-flex items-center justify-center gap-2 rounded-[2rem] border border-sparkles-cream bg-sparkles-cream px-4 py-3 font-display text-sm font-bold uppercase leading-5 text-sparkles-navy no-underline transition-all duration-300 hover:border-sparkles-cream/90 hover:bg-sparkles-cream/90"
                >
                  Donate now
                </Link>
                <Link
                  href="/membership"
                  className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-cream/40 bg-sparkles-navy/20 px-4 py-3 font-display text-sm font-bold uppercase leading-5 text-sparkles-cream no-underline backdrop-blur-sm transition-all duration-300 hover:border-sparkles-cream hover:bg-sparkles-navy/40"
                >
                  Become a member
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonateCtaSection;

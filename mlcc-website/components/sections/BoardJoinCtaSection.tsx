"use client";

import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";

export function BoardJoinCtaSection() {
  return (
    <div className="bg-sparkles-cream p-2">
      <div className="relative z-[1] flex h-[34.25rem] w-full items-center justify-center overflow-hidden rounded-2xl max-[991px]:h-auto max-[991px]:py-40 max-[767px]:py-24">
        <img
          loading="lazy"
          alt=""
          src="https://byqsupply-components.netlify.app/skeletons/cta/images/patter-horizontal-new.svg"
          className="absolute inset-0 z-[1] h-full w-full object-cover max-[991px]:h-auto"
        />

        <div className="absolute inset-0 z-[2] bg-sparkles-navy/8" />

        <div className="relative z-[3] w-full px-8 max-[767px]:px-4">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="relative z-[3] mx-auto flex max-w-[42.5rem] flex-col items-center justify-center gap-6 text-center max-[767px]:gap-5">
              <div className="flex flex-col items-center gap-4">
                <SectionLabel>Get involved</SectionLabel>

                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Interested in joining the board?
                </h2>

                <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
                  Board positions open up from time to time. If you&apos;d like to learn more about
                  serving on the executive board, we&apos;d love to hear from you.
                </p>
              </div>

              <div className="flex flex-row flex-wrap items-center justify-center gap-2">
                <Link
                  href="/volunteer"
                  className="inline-flex items-center justify-center gap-2 rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm font-bold uppercase leading-5 text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
                >
                  View open roles
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                    <path
                      d="M3 8H13M13 8L9 4M13 8L9 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy/30 bg-white/50 px-4 py-3 font-display text-sm font-bold uppercase leading-5 text-sparkles-navy no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90 hover:text-sparkles-cream"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardJoinCtaSection;

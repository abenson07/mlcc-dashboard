"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

function PrimaryButton({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[2rem] border
        px-4 py-3 font-display text-sm leading-5 font-bold uppercase no-underline transition-all duration-300
        ${hovered ? "border-sparkles-navy/90 bg-sparkles-navy/90 text-sparkles-cream" : "border-sparkles-navy bg-sparkles-navy text-sparkles-cream"}
      `}
    >
      <span>{label}</span>
      <span className="flex h-4 w-4 items-center justify-center">
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
          <path
            d="M3 8H13M13 8L9 4M13 8L9 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}

function SecondaryButton({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[2rem] border px-4 py-3
        font-display text-sm leading-5 font-bold uppercase no-underline transition-all duration-300
        ${
          hovered
            ? "border-sparkles-navy/90 bg-sparkles-navy/90 text-sparkles-cream"
            : "border-sparkles-navy/30 bg-white/50 text-sparkles-navy"
        }
      `}
    >
      {label}
    </a>
  );
}

export function JoinBoardConfirmationSection() {
  return (
    <section
      className="bg-sparkles-cream py-20 max-[767px]:py-16"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="join-the-board.confirmation"
      data-editable-label="Join The Board Confirmation"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-sparkles-blue px-8 py-32 max-[767px]:px-4 max-[767px]:py-24">
            <div className="flex max-w-[42.5rem] flex-col items-center gap-6 text-center max-[767px]:gap-5">
              <SectionLabel>Interest received</SectionLabel>

              <h1 className="m-0 font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                Thanks for reaching out
              </h1>

              <p className="m-0 max-w-[28rem] font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                We&apos;ve received your note. A board member will follow up by email to talk about
                open roles, timing, and whether executive board service is the right fit for you.
              </p>

              <div className="flex flex-row flex-wrap items-center justify-center gap-2">
                <PrimaryButton href="/board" label="About the board" />
                <SecondaryButton href="/join-the-board" label="Back to join page" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JoinBoardConfirmationSection;

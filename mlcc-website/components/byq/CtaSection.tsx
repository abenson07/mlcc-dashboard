"use client";

import * as React from "react";

function PrimaryButton({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative inline-flex justify-center items-center gap-2 overflow-hidden no-underline shrink-0 cursor-pointer
        rounded-[2rem] font-display text-sm leading-5 font-bold uppercase
        transition-all duration-300 border
        ${hovered ? "border-sparkles-navy/90 bg-sparkles-navy/90 text-sparkles-cream" : "border-sparkles-navy bg-sparkles-navy text-sparkles-cream"}
      `}
      style={{ padding: "0.75rem 1rem" }}
    >
      <span>{label}</span>
      <span className="w-4 h-4 flex items-center justify-center">
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
        inline-flex justify-center items-center no-underline shrink-0 cursor-pointer
        rounded-[2rem] px-4 py-3 font-display text-sm leading-5 font-bold uppercase
        transition-all duration-300 border
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

export interface CtaButtonConfig {
  label: string;
  href: string;
}

export interface CtaSectionProps {
  title?: string;
  subhead?: string;
  primaryButton?: CtaButtonConfig;
  secondaryButton?: CtaButtonConfig;
}

export function CtaSection({
  title = "A better neighborhood starts with you",
  subhead = "Join us in making a better Maple Leaf for all",
  primaryButton = { label: "Become a supporting member", href: "/membership" },
  secondaryButton = { label: "Volunteer to help", href: "/volunteer" },
}: CtaSectionProps) {
  return (
    <div
      className="p-2 bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="global.cta"
      data-editable-label="Global CTA"
    >
      <div
        className="
          relative z-[1] rounded-2xl flex justify-center items-center w-full overflow-hidden
          bg-sparkles-accent h-[34.25rem] max-[991px]:h-auto max-[991px]:py-40 max-[767px]:py-24
        "
      >
        <div className="relative z-[3] px-8 w-full max-[767px]:px-4">
          <div className="w-full max-w-[1800px] mx-auto">
            <div className="relative z-[3] flex flex-col justify-center items-center text-center mx-auto gap-6 max-w-[42.5rem] max-[767px]:gap-5">
              <div className="flex flex-col items-center gap-4">
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-sparkles-cream max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  {title}
                </h2>

                <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-cream/90 max-[767px]:text-base max-[767px]:leading-6">
                  {subhead}
                </p>
              </div>

              <div className="flex flex-row justify-center items-center gap-2 flex-wrap">
                <PrimaryButton href={primaryButton.href} label={primaryButton.label} />
                <SecondaryButton href={secondaryButton.href} label={secondaryButton.label} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CtaSection;

"use client";

import * as React from "react";

function CtaButton({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: "primary" | "secondary";
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={href}
      className={`
        relative flex justify-center items-center overflow-hidden no-underline shrink-0 cursor-pointer
        rounded-[2rem] font-[family-name:var(--font-decalotype)] text-xl leading-5 font-bold uppercase
        transition-[padding,color] duration-300
        max-[767px]:rounded-[2rem] max-[767px]:py-3 max-[767px]:px-4 max-[767px]:text-base
        ${hovered ? "text-[#fdf8f1] pr-10" : "text-[#0d1526]"}
      `}
      style={{ padding: hovered ? "1rem 2.5rem 1rem 1.25rem" : "1rem 1.25rem" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="z-[3] pointer-events-none shrink-0 relative flex items-center">
        <div
          className={`shrink-0 flex justify-center items-center absolute overflow-hidden transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
          style={{ inset: "0 -1.5rem 0 auto" }}
        >
          <div className="shrink-0 pl-2">
            <div className="z-[2] shrink-0 flex justify-center items-center relative w-4 h-4">
              <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
        <div className="z-[1] relative">{label}</div>
      </div>
      <div
        className="absolute inset-0 rounded-[2rem] border border-transparent transition-colors duration-300"
        style={{
          backgroundColor:
            hovered ? "#0d1526" : variant === "primary" ? "#ffffff" : "#0d152614",
        }}
      />
    </a>
  );
}

export function CtaSection() {
  return (
    <section className="py-[7.5rem] bg-[#fdf8f1] max-[767px]:py-20">
      <div className="px-8 max-[767px]:px-4">
        <div className="z-[2] w-full max-w-[1800px] mx-auto">
          <div className="flex flex-col justify-center items-center py-40 px-8 rounded-3xl bg-sparkles-blue max-[767px]:py-24 max-[767px]:px-4">
            <div className="flex flex-col justify-start items-center text-center max-w-[42.5rem] gap-8 max-[767px]:gap-6">
              <h2 className="m-0 font-[family-name:var(--font-decalotype)] text-[5rem] leading-[4rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[3rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.094rem]">
                READY FOR A CLEANER &amp; CALMER HOME?
              </h2>

              <div className="max-w-[28rem]">
                <p className="m-0 font-[family-name:var(--font-bricolage)] text-xl leading-7 font-normal text-[#0d1526] max-[767px]:text-base max-[767px]:leading-6">
                  Book trusted cleaners who actually show up, care, and leave your place feeling fresh.
                </p>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-3">
                <CtaButton href="/template/style-guide" label="Book your cleaning" variant="primary" />
                <CtaButton href="/template/style-guide" label="View pricing" variant="secondary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;

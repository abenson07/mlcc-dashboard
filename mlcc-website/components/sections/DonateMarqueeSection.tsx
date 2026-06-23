"use client";

import Link from "next/link";
import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { membershipPrograms } from "@marketing/data/membership";

const SLIDE_INTERVAL_MS = 4000;

function SupportCard({ title, image, isActive }: { title: string; image: string; isActive: boolean }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden rounded-2xl transition-opacity duration-700 ease-in-out ${
        isActive ? "z-[2] opacity-100" : "z-[1] opacity-0"
      }`}
    >
      <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover" />
      <div
        className="absolute inset-x-0 bottom-0 z-[2] h-[45%]"
        style={{ backgroundImage: "linear-gradient(0deg, rgba(13,21,38,0.72), rgba(13,21,38,0))" }}
      />
      <div className="absolute bottom-6 left-6 right-6 z-[3] flex flex-col gap-2">
        <span className="font-body text-[0.625rem] font-bold uppercase leading-3 tracking-[0.0625rem] text-sparkles-cream/70">
          Your gift supports
        </span>
        <span className="font-display text-[2rem] font-bold uppercase leading-8 tracking-[-0.031rem] text-sparkles-cream max-[767px]:text-[1.75rem] max-[767px]:leading-7">
          {title}
        </span>
      </div>
    </div>
  );
}

export function DonateMarqueeSection() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const totalSlides = membershipPrograms.length;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [totalSlides]);

  return (
    <section className="relative overflow-hidden bg-sparkles-cream text-sparkles-navy">
      <div className="relative z-[1] px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="grid min-h-[44rem] grid-cols-2 items-center gap-12 py-20 max-[991px]:min-h-0 max-[991px]:grid-cols-1 max-[991px]:gap-10 max-[767px]:py-16">
            {/* Left: headline */}
            <div className="flex max-w-[35.25rem] flex-col items-start gap-6 max-[991px]:max-w-none">
              <SectionLabel>Give today</SectionLabel>

              <h1 className="m-0 font-display text-[3.75rem] font-bold leading-16 tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                A one-time gift keeps Maple Leaf going
              </h1>

              <p className="m-0 font-body text-xl leading-7 text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                Not ready for a monthly membership? A single donation still fuels the programs,
                events, and traditions that connect this neighborhood.
              </p>

              <Link
                href="#give"
                className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
              >
                Make a gift
              </Link>

              <p className="m-0 font-body text-sm leading-5 text-sparkles-muted">
                Prefer steady support?{" "}
                <Link
                  href="/membership"
                  className="font-semibold text-sparkles-navy underline-offset-2 hover:underline"
                >
                  Memberships
                </Link>{" "}
                start as low as $5 a year.
              </p>
            </div>

            {/* Right: cycling support card */}
            <div className="relative h-[31.25rem] w-full max-[991px]:mx-auto max-[991px]:max-w-[28rem] max-[767px]:h-[24rem] max-[479px]:h-[20rem]">
              {membershipPrograms.map((program, index) => (
                <SupportCard
                  key={program.title}
                  title={program.title}
                  image={program.image}
                  isActive={index === currentSlide}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DonateMarqueeSection;

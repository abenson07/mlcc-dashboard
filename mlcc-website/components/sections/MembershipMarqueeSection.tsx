"use client";

import Link from "next/link";
import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { membershipPrograms } from "@marketing/data/membership";

const SLIDE_INTERVAL_MS = 4000;

function ProgramShowcase({ currentSlide }: { currentSlide: number }) {
  const program = membershipPrograms[currentSlide];

  return (
    <div className="relative h-full max-[991px]:mx-auto max-[991px]:w-full max-[991px]:max-w-[34rem]">
      <div className="relative h-[34rem] w-full overflow-hidden rounded-2xl max-[767px]:h-[24rem] max-[479px]:h-[20rem]">
        {membershipPrograms.map((item, index) => (
          <img
            key={item.title}
            src={item.image}
            alt={item.title}
            loading={index === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "z-[2] opacity-100" : "z-[1] opacity-0"
            }`}
            data-editable="true"
            data-editable-type="image"
            data-editable-id={`membership.hero.slide-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
            data-editable-label={item.title}
          />
        ))}
      </div>

      <div className="absolute -bottom-6 -left-6 z-[3] flex w-[18rem] max-w-[78%] flex-col gap-2 rounded-2xl border border-sparkles-warm bg-sparkles-cream p-6 shadow-sm max-[767px]:-left-2 max-[767px]:w-[15rem] max-[767px]:p-5">
        <span className="font-body text-xs font-bold uppercase leading-4 tracking-[0.0625rem] text-sparkles-muted">
          Your membership supports
        </span>
        <span className="font-display text-3xl font-bold leading-9 tracking-[-0.0625rem] text-puget-night max-[767px]:text-2xl max-[767px]:leading-8">
          {program.title}
        </span>
        <span className="font-body text-xs leading-4 text-sparkles-navy">
          {currentSlide + 1} of {membershipPrograms.length} neighborhood programs your membership powers
        </span>
      </div>
    </div>
  );
}

export function MembershipMarqueeSection() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const totalSlides = membershipPrograms.length;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [totalSlides]);

  return (
    <section
      className="relative overflow-hidden bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="membership.hero"
      data-editable-label="Membership Hero"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="grid items-center gap-12 py-20 [grid-template-columns:minmax(0,1.3fr)_minmax(0,1fr)] max-[991px]:grid-cols-1 max-[991px]:gap-16 max-[767px]:py-16">
            {/* Left: headline + CTA */}
            <div className="flex max-w-[35.25rem] flex-col items-start gap-6 max-[991px]:max-w-none">
              <SectionLabel>Support MLCC</SectionLabel>

              <h1
                className="m-0 font-display text-[3.75rem] font-bold leading-16 tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]"
                data-editable="true"
                data-editable-type="text"
                data-editable-id="membership.hero.title"
                data-editable-label="Membership headline"
              >
                Your membership keeps Maple Leaf connected
              </h1>

              <p
                className="m-0 font-body text-xl leading-7 text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6"
                data-editable="true"
                data-editable-type="text"
                data-editable-id="membership.hero.description"
                data-editable-label="Membership description"
              >
                From the Leaflet on your doorstep to movie nights in the park, these are the programs
                neighbors built together. Membership is how we keep them going.
              </p>

              <a
                href="#membership-pricing"
                className="inline-flex shrink-0 items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-6 py-3 font-display text-sm font-bold leading-5 text-sparkles-cream transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
              >
                Become a supporter
              </a>

              <p className="m-0 font-body text-sm leading-5 text-sparkles-muted">
                Memberships start as low as $5 a year. Prefer a one-time gift?{" "}
                <Link
                  href="/donate"
                  className="font-semibold text-sparkles-navy underline-offset-2 hover:underline"
                >
                  Donate
                </Link>{" "}
                instead.
              </p>
            </div>

            {/* Right: cycling image + floating widget */}
            <ProgramShowcase currentSlide={currentSlide} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default MembershipMarqueeSection;

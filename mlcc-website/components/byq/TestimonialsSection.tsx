"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";

export function TestimonialsSection() {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="bg-sparkles-navy text-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="one-seattle-plan.council-testimonial"
      data-editable-label="Council Testimonial"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div
              ref={contentRef}
              className={`mx-auto flex max-w-[42.5rem] flex-col items-center gap-8 text-center transition-all duration-700 ease-out max-[767px]:gap-6 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <SectionLabel className="bg-sparkles-cream/10 text-sparkles-cream">
                From the Community Council
              </SectionLabel>

              <blockquote className="m-0 font-display text-[2rem] leading-10 font-bold tracking-[-0.0625rem] max-[767px]:text-[1.5rem] max-[767px]:leading-8">
                &ldquo;We recognize the need for greater density in our neighborhood&apos;s future. As Maple Leaf
                evolves, we must create a balance between that density and ensuring that our residents have a say
                in the evolution of what makes our neighborhood a place we all love to live and grow in.&rdquo;
              </blockquote>

              <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-cream/70">
                We see the MLCC as a valuable mechanism for our neighbors to provide input into this growth and
                look forward to working with the Mayor and the City Council to leverage this plan to introduce
                affordability, transportation, greenery, and walkability improvements that are driven by the needs
                of current and future residents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;

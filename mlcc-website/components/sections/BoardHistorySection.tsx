"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

export function BoardHistorySection() {
  const labelRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLDivElement>(null);
  const [labelVisible, setLabelVisible] = React.useState(false);
  const [textVisible, setTextVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === labelRef.current) setLabelVisible(true);
            if (entry.target === textRef.current) setTextVisible(true);
          }
        });
      },
      { threshold: 0.1 },
    );

    if (labelRef.current) observer.observe(labelRef.current);
    if (textRef.current) observer.observe(textRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-sparkles-cream text-sparkles-navy">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div className="grid items-start gap-4 [grid-template-columns:7fr_5fr] max-[767px]:grid-cols-1 max-[767px]:gap-6">
              <div
                ref={labelRef}
                className={`transition-all duration-700 ease-out ${labelVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              >
                <SectionLabel>Our purpose</SectionLabel>
              </div>

              <div className="max-w-[42.5rem] max-[991px]:max-w-none max-[991px]:w-full">
                <div
                  ref={textRef}
                  className={`flex flex-col gap-6 transition-all delay-150 duration-700 ease-out ${textVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
                >
                  <p className="m-0 font-body text-2xl leading-10 font-normal tracking-[-0.0625rem] text-puget-night max-[767px]:text-xl max-[767px]:leading-8">
                    The executive board has guided the Maple Leaf Community Council for decades —
                    through parades, newsletters, community meetings, and the everyday work of
                    keeping a neighborhood organization alive.
                  </p>
                  <p className="m-0 font-body text-base leading-6 font-normal">
                    Board members set direction, oversee finances, represent the council with city
                    partners, and support the committees that do the hands-on work. They meet
                    regularly, make decisions together, and volunteer their time because they
                    believe in what Maple Leaf can be when neighbors show up for each other.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BoardHistorySection;

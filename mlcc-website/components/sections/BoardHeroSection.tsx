"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

const HERO_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69531455684e18c663a2a6b7_community-meeting3.webp";

export function BoardHeroSection() {
  const [visible, setVisible] = React.useState(false);
  const sectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="bg-sparkles-cream p-2"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="board.hero"
      data-editable-label="Board Hero"
    >
      <div className="grid gap-4 [grid-template-columns:1.3fr_1fr] max-[991px]:grid-cols-1">
        <div className="relative flex flex-col items-start justify-end overflow-hidden rounded-2xl bg-sparkles-warm py-16 max-[767px]:py-40">
          <div className="px-8 max-[767px]:px-4">
            <div className="mx-auto w-full max-w-[42.5rem]">
              <div className="flex max-w-[42.5rem] flex-col items-start gap-6 max-[767px]:w-full max-[767px]:max-w-none">
                <div
                  className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
                  style={{ transitionDelay: "100ms" }}
                >
                  <SectionLabel>Leadership</SectionLabel>
                </div>

                <h1
                  className={`m-0 font-display text-[4.5rem] font-bold leading-[4.75rem] tracking-[-0.1875rem] text-puget-night transition-all duration-700 ease-out max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem] ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                  style={{ transitionDelay: "250ms" }}
                >
                  Executive Board
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[56.5rem] overflow-hidden rounded-2xl max-[991px]:h-[41.25rem] max-[479px]:h-[12.5rem]">
          <img
            loading="eager"
            alt="Neighbors gathered at a Maple Leaf community meeting"
            src={HERO_IMAGE}
            className="relative z-[1] block h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default BoardHeroSection;

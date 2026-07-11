"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

const features = [
  {
    id: 1,
    title: "Bone Frame",
    text: "This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of where real words will go.",
    isMiddle: false,
  },
  {
    id: 2,
    title: "Hollow Shell",
    text: "This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of where real words will go.",
    isMiddle: true,
  },
  {
    id: 3,
    title: "Silent Spine",
    text: "This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of where real words will go.",
    isMiddle: false,
  },
];

function CheckIcon() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ValueFeature53Section() {
  const [buttonHovered, setButtonHovered] = React.useState(false);

  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="one-seattle-plan.value-feature-2"
      data-editable-label="Value Feature 2"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-20 flex flex-col items-start gap-8">
              <SectionLabel>Label placeholder</SectionLabel>

              <div className="w-full max-w-[42.5rem] max-[767px]:max-w-none">
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Headline skeleton placeholder exists only to structure your layout
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-20 gap-y-20 max-[991px]:grid-cols-1">
              <div className="flex flex-col items-start gap-8">
                <div className="flex w-full flex-col">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex flex-col gap-4 py-6 ${
                        feature.isMiddle ? "" : "border-b border-t border-sparkles-navy/16"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="h-6 w-6 shrink-0 text-sparkles-navy">
                          <CheckIcon />
                        </div>
                        <div className="font-display text-[1.5rem] leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
                          {feature.title}
                        </div>
                      </div>

                      <div className="pl-12">
                        <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-navy">
                          {feature.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href="/contact"
                  onMouseEnter={() => setButtonHovered(true)}
                  onMouseLeave={() => setButtonHovered(false)}
                  className={`
                    inline-block rounded-[2rem] border px-4 py-3 text-center font-display text-sm leading-5 font-bold
                    text-sparkles-cream no-underline transition-all duration-300
                    ${buttonHovered ? "border-sparkles-navy/90 bg-sparkles-navy/90" : "border-sparkles-navy bg-sparkles-navy"}
                  `}
                >
                  Primary
                </a>
              </div>

              <div className="relative flex h-[40rem] w-full items-center justify-center overflow-hidden rounded-xl max-[991px]:h-[30rem] max-[767px]:h-[22.5rem] max-[479px]:h-[17.5rem]">
                <img
                  loading="lazy"
                  alt=""
                  src="https://cdn.prod.website-files.com/68a8bac34ba5bc8cee4c21c1/68b0356dfa8c858921d10fb7_pattern-vertical-new.svg"
                  className="h-full w-full object-cover"
                />
                <img
                  loading="lazy"
                  alt=""
                  src="https://byqsupply-components.netlify.app/skeletons/value-features/images/value-features53_widget.svg"
                  className="absolute w-[37.75rem] max-w-[90%] object-contain max-[767px]:w-96 max-[479px]:w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueFeature53Section;

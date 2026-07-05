"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

const tabs = [
  {
    label: "Volunteer",
    title: "Volunteer",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7.5" r="2" />
        <circle cx="15" cy="7.5" r="2" />
        <circle cx="9" cy="17.5" r="2" />
        <circle cx="15" cy="17.5" r="2" />
        <path d="M9 9.5v6M15 9.5v6M11 7.5h2M11 17.5h2" />
        <circle cx="12" cy="12.5" r="1" />
        <path d="M10 11.5l-1 1 1 1M14 11.5l1 1-1 1" />
      </svg>
    ),
    text: "This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this placeholder creates a frame that can stand without flesh.",
    bgImage: "https://byqsupply-components.netlify.app/skeletons/value-features/images/pattern-vertical-new.svg",
    widgetImage: "https://byqsupply-components.netlify.app/skeletons/value-features/images/ValueFeatures49Widget.svg",
  },
  {
    label: "Organize",
    title: "Organize",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    text: "This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this placeholder creates a frame that can stand without flesh.",
    bgImage: "https://byqsupply-components.netlify.app/skeletons/value-features/images/pattern-vertical-new.svg",
    widgetImage: "https://byqsupply-components.netlify.app/skeletons/value-features/images/Hero40Widget.png",
  },
  {
    label: "Executive Board",
    title: "Executive Board",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M8 6h8M8 10h8M8 14h8M8 18h8" />
      </svg>
    ),
    text: "This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this placeholder creates a frame that can stand without flesh.",
    bgImage: "https://byqsupply-components.netlify.app/skeletons/value-features/images/pattern-vertical-new.svg",
    widgetImage: "https://byqsupply-components.netlify.app/skeletons/value-features/images/value-features55_widget.svg",
  },
];

export function ValueFeature49Section() {
  const [activeTab, setActiveTab] = React.useState(0);
  const active = tabs[activeTab];

  return (
    <section
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="home.get-involved"
      data-editable-label="Home Value Feature"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="z-[2] w-full max-w-[1800px] mx-auto">
          <div className="py-40 max-[767px]:py-20">
            <div className="flex flex-col items-center justify-start gap-8 max-[767px]:gap-6">
              <div className="flex flex-col items-center justify-start gap-4 text-center max-[479px]:text-left max-[479px]:items-start">
                <SectionLabel>Label placeholder</SectionLabel>

                <h2 className="m-0 font-display text-[2.5rem] leading-[2.75rem] font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                  Headline skeleton placeholder
                </h2>
              </div>

              <div className="flex flex-col items-center justify-start w-full max-[479px]:items-start max-[479px]:justify-start">
                <div className="mb-16 p-1 rounded-[2rem] bg-sparkles-navy/30 flex max-[767px]:overflow-x-auto max-[767px]:flex-row max-[767px]:max-w-full">
                  {tabs.map((tab, i) => (
                    <button
                      key={tab.label}
                      type="button"
                      onClick={() => setActiveTab(i)}
                      className={`
                        px-4 py-1 rounded-[2rem] font-body text-sm leading-5 font-semibold text-sparkles-navy
                        transition-colors duration-200 whitespace-nowrap max-[767px]:flex-none border-0 cursor-pointer outline-none
                        ${activeTab === i ? "bg-sparkles-cream" : "bg-transparent hover:bg-sparkles-cream/60"}
                      `}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="w-full">
                  <div className="grid grid-cols-3 gap-4 w-full max-[991px]:grid-cols-2 max-[767px]:grid-cols-1">
                    <div
                      className="
                        col-span-2 flex flex-col justify-between items-start gap-16
                        p-6 rounded-2xl bg-sparkles-warm
                        h-[25.5rem] w-full
                        max-[991px]:col-span-1 max-[991px]:h-auto
                        max-[767px]:col-span-1
                      "
                    >
                      <div className="flex flex-col items-start justify-start gap-4">
                        <div className="w-8 h-8 text-sparkles-navy">{active.icon}</div>
                        <div className="font-display text-[2rem] leading-10 font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[1.75rem] max-[767px]:leading-8">
                          {active.title}
                        </div>
                      </div>

                      <div className="max-w-[42.5rem]">
                        <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                          {active.text}
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        relative flex items-center justify-center
                        rounded-2xl overflow-hidden
                        h-[25.5rem] w-full
                        max-[991px]:col-span-1 max-[991px]:h-full
                        max-[767px]:col-span-1 max-[767px]:h-[25rem]
                        max-[479px]:h-[18.75rem]
                      "
                    >
                      <img
                        src={active.bgImage}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover z-[1]"
                      />
                      <img
                        src={active.widgetImage}
                        alt=""
                        loading="lazy"
                        className="
                          absolute z-[2]
                          max-w-[65%]
                          max-[991px]:max-w-[80%]
                          max-[767px]:max-w-full
                          max-[479px]:max-w-[80%]
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueFeature49Section;

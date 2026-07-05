"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";

const FEATURE_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/6877bff9b59839fa1fd6792c_Photo-Jun-11-2025.jpg";

const valueItems = [
  "Fund the printed Leaflet — Seattle's last neighborhood newsletter delivered door to door",
  "Keep traditions going: Summer Social, Halloween Parade, Movies by the Tower, and more",
  "Support advocacy on zoning, street safety, and issues neighbors care about",
  "Maintain emergency hub readiness and community meeting spaces",
  "Give neighbors with new ideas the backing to try something in Maple Leaf",
  "Vote on council matters and stay connected to what's happening nearby",
];

const features = [
  {
    title: "Sustain what works",
    text: "The parade, the newsletter, the summer gathering — neighbors experience MLCC as part of daily life. Membership keeps those threads intact.",
  },
  {
    title: "Grow what's next",
    text: "When capacity allows, we can say yes to more neighbor-led ideas, extra meetings, and programs that respond to what people ask for.",
  },
  {
    title: "Show up your way",
    text: "Not everyone can volunteer every month. A membership is a meaningful way to contribute even when your calendar is full.",
  },
  {
    title: "Belong here",
    text: "Joining tells your neighbors you invest in this place — the schools, streets, businesses, and traditions that make Maple Leaf home.",
  },
] as const;

function useInView(threshold = 0.1) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function MembershipValueSection() {
  const quote = useInView();
  const list = useInView();
  const grid = useInView();
  const image = useInView();

  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="membership.value"
      data-editable-label="Membership Value"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div
              ref={quote.ref}
              className={`mx-auto mb-20 flex max-w-[42.5rem] flex-col gap-16 transition-all duration-700 ease-out max-[767px]:mb-12 ${
                quote.visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"
              }`}
            >
              <div className="text-center">
                <SectionLabel>Why it matters</SectionLabel>
                <h2 className="mt-6 mb-0 font-display text-[2.75rem] font-bold leading-10 tracking-[-0.031rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                  Maple Leaf is built by neighbors who show up — and sustained by neighbors who give back
                </h2>
              </div>
            </div>

            <div
              ref={list.ref}
              className={`mx-auto mb-20 flex max-w-[42.5rem] flex-col gap-8 transition-all delay-100 duration-700 ease-out max-[767px]:mb-12 ${
                list.visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"
              }`}
            >
              <h3 className="m-0 text-center font-display text-[2rem] font-bold leading-8 tracking-[-0.031rem] text-puget-night max-[767px]:text-[1.5rem] max-[767px]:leading-7">
                What your membership supports
              </h3>
              <div className="flex flex-col gap-3">
                {valueItems.map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-5 rounded-2xl bg-sparkles-warm p-4 max-[767px]:gap-4 max-[767px]:p-3"
                    style={{ transitionDelay: list.visible ? `${i * 60 + 150}ms` : "0ms" }}
                  >
                    <div className="shrink-0 rounded-2xl bg-white p-3 text-sparkles-blue max-[767px]:p-2">
                      <div className="h-6 w-6 max-[767px]:h-4 max-[767px]:w-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    <p className="m-0 font-body text-lg font-semibold leading-7 text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 items-start gap-x-[7.5rem] gap-y-12 max-[991px]:grid-cols-1 max-[991px]:gap-x-12">
              <div
                ref={grid.ref}
                className={`grid grid-cols-2 gap-x-4 gap-y-12 transition-all delay-150 duration-700 ease-out max-[767px]:grid-cols-1 ${
                  grid.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                {features.map((feature, index) => (
                  <div
                    key={feature.title}
                    className="flex flex-col gap-4"
                    style={{ transitionDelay: grid.visible ? `${index * 80 + 200}ms` : "0ms" }}
                  >
                    <div className="font-display text-xl font-bold leading-7 tracking-[-0.03125rem] text-puget-night">
                      {feature.title}
                    </div>
                    <p className="m-0 font-body text-sm leading-5 text-sparkles-navy">{feature.text}</p>
                  </div>
                ))}
              </div>

              <div
                ref={image.ref}
                className={`transition-all delay-100 duration-700 ease-out max-[991px]:order-first ${
                  image.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                <img
                  src={FEATURE_IMAGE}
                  alt="Neighbors gathered at a Maple Leaf community event"
                  loading="lazy"
                  className="h-full min-h-[28rem] w-full rounded-2xl object-cover max-[991px]:min-h-[20rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MembershipValueSection;

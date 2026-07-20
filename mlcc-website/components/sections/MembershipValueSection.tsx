"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";

const FEATURE_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/6877bff9b59839fa1fd6792c_Photo-Jun-11-2025.jpg";

const valueItems = [
  "Fund the printed Leaflet, Seattle's last neighborhood newsletter delivered door to door",
  "Keep traditions going: Summer Social, Halloween Parade, Movies by the Tower, and more",
  "Support advocacy on zoning, street safety, and issues neighbors care about",
  "Maintain emergency hub readiness and community meeting spaces",
  "Give neighbors with new ideas the backing to try something in Maple Leaf",
  "Vote on council matters and stay connected to what's happening nearby",
];

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
  const tabs = useInView();

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
              className={`mb-20 flex max-w-[42.5rem] flex-col gap-6 transition-all duration-700 ease-out max-[767px]:mb-12 ${
                quote.visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"
              }`}
            >
              <SectionLabel className="self-start">Why it matters</SectionLabel>
              <h2 className="m-0 font-display text-[2.75rem] font-bold leading-10 tracking-[-0.031rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                Maple Leaf is built by neighbors who show up, and sustained by neighbors who give back
              </h2>
            </div>

            <div
              ref={tabs.ref}
              className={`grid grid-cols-2 items-start gap-x-[7.5rem] gap-y-12 transition-all delay-150 duration-700 ease-out max-[991px]:grid-cols-1 max-[991px]:gap-x-12 ${
                tabs.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <div className="flex flex-col gap-3">
                {valueItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-5 rounded-2xl bg-sparkles-warm p-4 max-[767px]:gap-4 max-[767px]:p-3"
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

              <div className="max-[991px]:order-first">
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

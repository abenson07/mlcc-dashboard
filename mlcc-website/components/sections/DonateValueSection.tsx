"use client";

import Link from "next/link";
import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";

const FEATURE_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f1e1da163ec47328051_summer_social_2024-39.webp";

const comparisons = [
  {
    title: "One-time gift",
    text: "Give once, right now. Perfect when you want to help immediately without a recurring commitment.",
    highlight: true,
  },
  {
    title: "Membership",
    text: "Steady monthly or annual support with voting rights and member benefits. Best for ongoing connection.",
    highlight: false,
  },
] as const;

const reasons = [
  {
    title: "Fill a gap right now",
    text: "Event season, printing deadlines, and unexpected needs don't wait. A gift today meets the moment.",
  },
  {
    title: "Give above membership",
    text: "Already a member? A one-time donation on top of your dues makes an even bigger difference.",
  },
  {
    title: "Support from afar",
    text: "Moved away but still love Maple Leaf? A donation keeps you connected to the neighborhood you call home.",
  },
  {
    title: "Honor a tradition",
    text: "Sponsor something specific, like the parade, the Leaflet, or a movie night, with a gift that matches your passion.",
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

export function DonateValueSection() {
  const headline = useInView();
  const compare = useInView();
  const grid = useInView();
  const image = useInView();

  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="donate.value"
      data-editable-label="Donate Value"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div
              ref={headline.ref}
              className={`mx-auto mb-16 flex max-w-[42.5rem] flex-col items-center gap-6 text-center transition-all duration-700 ease-out max-[767px]:mb-12 ${
                headline.visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"
              }`}
            >
              <SectionLabel>Donate vs. membership</SectionLabel>
              <h2 className="m-0 font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                Two ways to support: pick what fits your life
              </h2>
            </div>

            <div
              ref={compare.ref}
              className={`mx-auto mb-16 grid max-w-[42.5rem] grid-cols-2 gap-4 transition-all delay-100 duration-700 ease-out max-[767px]:mb-12 max-[767px]:grid-cols-1 ${
                compare.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              {comparisons.map((item) => (
                <div
                  key={item.title}
                  className={`flex flex-col gap-3 rounded-2xl border p-6 ${
                    item.highlight
                      ? "border-sparkles-navy bg-sparkles-navy text-sparkles-cream"
                      : "border-sparkles-navy/16 bg-sparkles-warm text-sparkles-navy"
                  }`}
                >
                  <div className="font-display text-xl font-bold leading-7 tracking-[-0.03125rem]">
                    {item.title}
                  </div>
                  <p className={`m-0 font-body text-sm leading-5 ${item.highlight ? "text-sparkles-cream/80" : ""}`}>
                    {item.text}
                  </p>
                  {!item.highlight ? (
                    <Link
                      href="/membership"
                      className="mt-auto font-display text-sm font-bold uppercase leading-5 text-sparkles-navy underline-offset-2 hover:underline"
                    >
                      Learn about membership
                    </Link>
                  ) : (
                    <a
                      href="#give"
                      className="mt-auto font-display text-sm font-bold uppercase leading-5 text-sparkles-cream underline-offset-2 hover:underline"
                    >
                      Give now
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 items-start gap-x-[7.5rem] gap-y-12 max-[991px]:grid-cols-1 max-[991px]:gap-x-12">
              <div
                ref={grid.ref}
                className={`grid grid-cols-2 gap-x-4 gap-y-12 transition-all delay-150 duration-700 ease-out max-[767px]:grid-cols-1 ${
                  grid.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                {reasons.map((reason, index) => (
                  <div
                    key={reason.title}
                    className="flex flex-col gap-4"
                    style={{ transitionDelay: grid.visible ? `${index * 80 + 200}ms` : "0ms" }}
                  >
                    <div className="font-display text-xl font-bold leading-7 tracking-[-0.03125rem] text-puget-night">
                      {reason.title}
                    </div>
                    <p className="m-0 font-body text-sm leading-5 text-sparkles-navy">{reason.text}</p>
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
                  alt="Families enjoying the Summer Social in Maple Leaf"
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

export default DonateValueSection;

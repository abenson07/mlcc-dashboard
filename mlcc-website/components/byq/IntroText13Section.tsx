"use client";

import * as React from "react";

const timelineItems = [
  {
    label: "Session opener",
    title: "Introductions",
    body: "Each workshop opens with introductions, so neighbors and the MLCC know who's in the room.",
  },
  {
    label: "Context",
    title: "Information sharing",
    body: "We walk through what's changed under WA State's HB 1110 and the Seattle Comprehensive Plan, and what it means for Maple Leaf.",
  },
  {
    label: "Working session",
    title: "Group work",
    body: "Large-group time to dig into the key areas of focus — density, trees, affordability, transit, and more.",
  },
  {
    label: "Ongoing",
    title: "Follow-through",
    body: "Between sessions, volunteers handle neighborhood association relationships, City-level updates, meeting logistics, and facilitation.",
  },
];

function useInView(threshold = 0.1) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function IntroText13Section() {
  const headline = useInView(0.1);
  const image = useInView(0.1);
  const items = [useInView(0.1), useInView(0.1), useInView(0.1), useInView(0.1)];

  return (
    <section
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="one-seattle-plan.intro-text-2"
      data-editable-label="Intro Text 2"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-40 max-[767px]:py-20">
            <div
              ref={headline.ref}
              className={`mb-20 max-w-[42.5rem] transition-all duration-700 ease-out max-[767px]:mb-14 ${
                headline.visible ? "opacity-100 blur-none" : "opacity-0 blur-md"
              }`}
            >
              <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                The workshop process
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-[8.25rem] max-[991px]:grid-cols-1 max-[991px]:gap-12 max-[767px]:gap-8">
              <div
                ref={image.ref}
                className={`h-full w-full overflow-hidden rounded-xl border border-sparkles-navy/16 transition-all duration-700 ease-out max-[991px]:h-[22.625rem] ${
                  image.visible ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  loading="lazy"
                  src="/images/one-seattle/workshop-activities.jpg"
                  alt="Neighbors at a Maple Leaf zoning workshop"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="border-t border-sparkles-navy/16">
                {timelineItems.map((item, i) => (
                  <div
                    key={item.title}
                    ref={items[i].ref}
                    className="grid grid-cols-2 gap-4 border-b border-sparkles-navy/16 py-6 transition-all duration-700 ease-out max-[767px]:gap-3 max-[767px]:py-4 max-[479px]:grid-cols-1"
                    style={{
                      opacity: items[i].visible ? 1 : 0,
                      transform: items[i].visible ? "translateY(0)" : "translateY(1rem)",
                      transitionDelay: `${i * 100}ms`,
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="font-body text-[0.625rem] leading-3 font-normal uppercase tracking-[0.047rem] text-sparkles-navy/70">
                        {item.label}
                      </div>
                      <div className="font-body text-base leading-6 font-medium text-puget-night">{item.title}</div>
                    </div>

                    <div className="font-body text-base leading-6 font-normal text-sparkles-navy/70">{item.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IntroText13Section;

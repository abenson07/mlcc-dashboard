"use client";

import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

const FEATURE_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d22bb2d6d_community-meeting.webp";

const features = [
  {
    title: "Support the neighborhood",
    text: "Your membership helps fund the Leaflet, Summer Social, advocacy work, and emergency preparedness — the programs neighbors rely on year-round.",
    icon: (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 13C20 18 16.5 20.5 12.34 21.95C12.1222 22.0238 11.8855 22.0202 11.67 21.94C7.5 20.5 4 18 4 13V5.99996C4 5.73474 4.10536 5.48039 4.29289 5.29285C4.48043 5.10532 4.73478 4.99996 5 4.99996C7 4.99996 9.5 3.79996 11.24 2.27996C11.4519 2.09896 11.7214 1.99951 12 1.99951C12.2786 1.99951 12.5481 2.09896 12.76 2.27996C14.51 3.80996 17 4.99996 19 4.99996C19.2652 4.99996 19.5196 5.10532 19.7071 5.29285C19.8946 5.48039 20 5.73474 20 5.99996V13Z" />
      </svg>
    ),
  },
  {
    title: "Get involved",
    text: "Connect with the Business Committee, volunteer at events, and meet neighbors who care about the same streets, schools, and small businesses you do.",
    icon: (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Promote your business",
    text: "Gain visibility through the business directory, newsletter recognition, and event sponsorship opportunities that put your name in front of local customers.",
    icon: (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M12 6h.01" />
        <path d="M12 10h.01" />
        <path d="M12 14h.01" />
        <path d="M16 10h.01" />
        <path d="M16 14h.01" />
        <path d="M8 10h.01" />
        <path d="M8 14h.01" />
      </svg>
    ),
  },
  {
    title: "Stand out locally",
    text: "Customers notice when a business gives back. Membership signals that you are rooted here — not just passing through Maple Leaf.",
    icon: (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
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

export function BusinessMembershipValueSection() {
  const headline = useInView();
  const grid = useInView();
  const image = useInView();

  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="membership-business.value"
      data-editable-label="Business Membership Value"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="grid grid-cols-2 items-start gap-x-[7.5rem] gap-y-12 max-[991px]:grid-cols-1 max-[991px]:gap-x-12">
              <div
                ref={image.ref}
                className={`transition-all duration-700 ease-out delay-100 ${
                  image.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <img
                  src={FEATURE_IMAGE}
                  alt="Neighbors gathered at a Maple Leaf community meeting"
                  loading="lazy"
                  className="h-full min-h-[32rem] w-full rounded-2xl object-cover max-[991px]:min-h-[22rem]"
                />
              </div>

              <div className="flex flex-col gap-12">
                <div
                  ref={headline.ref}
                  className={`flex max-w-[35.25rem] flex-col items-start gap-6 transition-all duration-700 ease-out ${
                    headline.visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"
                  }`}
                >
                  <SectionLabel>Why join</SectionLabel>
                  <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                    More than a line item — a connection to Maple Leaf
                  </h2>
                </div>

                <div
                  ref={grid.ref}
                  className={`grid grid-cols-2 gap-x-4 gap-y-12 max-[767px]:grid-cols-1 transition-all duration-700 ease-out delay-150 ${
                    grid.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                >
                  {features.map((feature, index) => (
                    <div
                      key={feature.title}
                      className="flex flex-col gap-4"
                      style={{ transitionDelay: grid.visible ? `${index * 80 + 200}ms` : "0ms" }}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sparkles-warm text-sparkles-navy">
                        <div className="h-6 w-6">{feature.icon}</div>
                      </div>
                      <div className="font-display text-xl font-bold leading-7 tracking-[-0.03125rem] text-puget-night">
                        {feature.title}
                      </div>
                      <p className="m-0 font-body text-sm leading-5 text-sparkles-navy">{feature.text}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/committees/business-committee"
                  className="inline-flex w-fit items-center justify-center rounded-[2rem] border border-sparkles-navy bg-transparent px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-navy no-underline transition-all duration-300 hover:border-sparkles-navy hover:bg-sparkles-navy hover:text-sparkles-cream"
                >
                  Meet the Business Committee
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BusinessMembershipValueSection;

"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

const benefits = [
  "Listing in the MLCC business directory",
  "Recognition in the quarterly Leaflet newsletter",
  "Priority access to event sponsorship opportunities",
  "Invitations to Business Committee meetings and networking",
  "Community partnership visibility at neighborhood events",
  "Voting rights as a supporting member of the council",
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

export function BusinessMembershipBenefitsSection() {
  const quote = useInView();
  const list = useInView();

  return (
    <section
      id="benefits"
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="membership-business.benefits"
      data-editable-label="Business Membership Benefits"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mx-auto max-w-[42.5rem] rounded-2xl bg-sparkles-warm p-12 max-[767px]:p-8">
              <div className="flex flex-col gap-[7.5rem] max-[767px]:gap-16">
              <div
                ref={quote.ref}
                className={`text-center transition-all duration-700 ease-out ${
                  quote.visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"
                }`}
              >
                <SectionLabel>Member benefits</SectionLabel>
                <h2 className="mt-6 font-display text-[2.75rem] leading-10 font-bold tracking-[-0.031rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                  When you join, neighbors know you&apos;re invested, and your business gets seen
                  by the people who live and shop right here.
                </h2>
              </div>

              <div
                ref={list.ref}
                className={`flex flex-col gap-8 transition-all duration-700 ease-out delay-150 ${
                  list.visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"
                }`}
              >
                <h3 className="m-0 text-center font-display text-[2rem] leading-9 font-bold tracking-[-0.031rem] text-puget-night max-[767px]:text-[1.5rem] max-[767px]:leading-7">
                  What&apos;s included
                </h3>

                <div className="flex flex-col gap-4 max-[767px]:gap-3">
                  {benefits.map((benefit, index) => (
                    <div
                      key={benefit}
                      className="flex flex-row items-center gap-6 rounded-2xl bg-sparkles-cream p-4 max-[767px]:gap-5 max-[767px]:p-3"
                      style={{ transitionDelay: list.visible ? `${index * 60 + 200}ms` : "0ms" }}
                    >
                      <div className="flex-shrink-0 rounded-2xl bg-white p-3 text-sparkles-accent max-[767px]:p-2">
                        <div className="h-6 w-6 max-[767px]:h-4 max-[767px]:w-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="100%"
                            height="100%"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="m-0 font-body text-xl font-semibold leading-7 text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                        {benefit}
                      </p>
                    </div>
                  ))}
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

export default BusinessMembershipBenefitsSection;

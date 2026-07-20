"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";

const faqs = [
  {
    question: "What's included in a standard cleaning?",
    answer:
      "A standard cleaning covers your kitchen, bathroom, living areas, floors, dusting, and trash removal. It's designed to keep your home fresh and tidy.",
  },
  {
    question: "How much does a cleaning cost?",
    answer:
      "Pricing depends on your home size and how often you want us to clean. Weekly, bi-weekly, and monthly plans include automatic discounts.",
  },
  {
    question: "How long does a cleaning take?",
    answer:
      "Most cleanings take 2–3 hours depending on the home size and condition. Deep cleanings take longer.",
  },
  {
    question: "Are cleaners background-checked?",
    answer:
      "Yes. Every cleaner is background-checked, interviewed, and vetted to meet NYC regulations.",
  },
  {
    question: "Do you use eco-friendly products?",
    answer: "Yes, everything we bring is non-toxic and safe for kids and pets.",
  },
  {
    question: "Can I request the same cleaner every time?",
    answer:
      "Yes, if you book recurring cleanings we'll assign the same cleaner whenever possible.",
  },
];

function useInView(threshold = 0.1) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
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

export function FaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const headline = useInView();
  const faqBlock = useInView();
  const buttonWrap = useInView();
  const [btnHovered, setBtnHovered] = React.useState(false);

  return (
    <section
      className="py-20 bg-sparkles-cream max-[767px]:py-12"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="template.faq"
      data-editable-label="FAQ (Template)"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="z-[2] w-full max-w-[1800px] mx-auto">
          <div className="rounded-3xl bg-sparkles-warm px-8 py-[7.5rem] max-[767px]:rounded-[1.25rem] max-[767px]:px-4 max-[767px]:py-24">
            <div
              ref={headline.ref}
              className={`
                max-w-[42.5rem] mx-auto mb-20 flex flex-col items-center text-center gap-8
                transition-all duration-700 ease-out
                max-[767px]:mb-12 max-[767px]:gap-6
                ${headline.visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"}
              `}
            >
              <SectionLabel>FAQ</SectionLabel>

              <h2 className="m-0 font-display text-[5rem] leading-16 font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[3rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.094rem]">
                ANSWERS TO YOUR QUESTIONS
              </h2>

              <div className="max-w-[28rem]">
                <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                  Choose how often you want your home cleaned; your price updates automatically.
                </p>
              </div>
            </div>

            <div
              ref={faqBlock.ref}
              className={`
                w-full max-w-[42.5rem] mx-auto flex flex-col gap-4
                transition-all duration-700 ease-out
                max-[767px]:gap-3
                ${faqBlock.visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"}
              `}
            >
              {faqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 cursor-pointer max-[767px]:p-5"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <div className="flex items-center justify-between gap-8 max-[767px]:gap-6">
                      <div className="font-body text-xl leading-7 font-semibold text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                        {faq.question}
                      </div>

                      <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-sparkles-blue relative max-[767px]:w-8 max-[767px]:h-8">
                        <div className="rounded-[1px] absolute w-3 h-[0.156rem] bg-sparkles-navy" />
                        <div
                          className="rounded-[1px] absolute w-[0.156rem] bg-sparkles-navy transition-all duration-300"
                          style={{
                            height: isOpen ? "0rem" : "0.75rem",
                            opacity: isOpen ? 0 : 1,
                          }}
                        />
                      </div>
                    </div>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-[500px]" : "max-h-0"
                      }`}
                    >
                      <p className="pt-8 mb-0 font-body text-base leading-6 text-sparkles-muted max-[767px]:pt-6">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              ref={buttonWrap.ref}
              className={`
                mt-20 flex items-center justify-center transition-all duration-700 ease-out
                max-[767px]:mt-12
                ${buttonWrap.visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"}
              `}
            >
              <a
                href="#"
                className={`
                  relative flex items-center justify-center overflow-hidden rounded-[2rem] px-5 py-4
                  no-underline cursor-pointer transition-colors duration-300
                  font-display text-xl leading-5 font-bold uppercase
                  max-[767px]:px-4 max-[767px]:py-3 max-[767px]:text-base
                  ${btnHovered ? "text-sparkles-cream" : "text-sparkles-navy"}
                `}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
              >
                <div
                  className="absolute inset-0 rounded-[2rem] transition-colors duration-300"
                  style={{
                    backgroundColor: btnHovered ? "#0d1526" : "#0d152614",
                  }}
                />
                <div className="relative z-[3] flex items-center">
                  <div className="flex items-center justify-center overflow-hidden absolute right-[-1.5rem] top-0 bottom-0">
                    <div className="pl-2 w-4 h-4 flex items-center justify-center">
                      <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M3 8H13M13 8L9 4M13 8L9 12"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="relative z-[1]">Show more</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FaqSection;

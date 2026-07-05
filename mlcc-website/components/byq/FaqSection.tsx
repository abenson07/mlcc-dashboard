"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

const defaultFaqs: FaqItem[] = [
  {
    question: "Is coding knowledge required to customize Skeletons?",
    answer:
      "This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this placeholder creates a frame that can stand without flesh.",
  },
  {
    question: "Does Skeletons support e-commerce functionality?",
    answer:
      "This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this placeholder creates a frame that can stand without flesh.",
  },
  {
    question: "Can I import my own fonts and branding?",
    answer:
      "This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this placeholder creates a frame that can stand without flesh.",
  },
  {
    question: "How do I get support if I need help?",
    answer:
      "This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this placeholder creates a frame that can stand without flesh.",
  },
  {
    question: "Does Skeletons ensure my website will be fully responsive on all devices?",
    answer:
      "This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this placeholder creates a frame that can stand without flesh.",
  },
  {
    question: "How do I optimize my website for better SEO?",
    answer:
      "This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this placeholder creates a frame that can stand without flesh.",
  },
];

type FaqSectionProps = {
  label?: string;
  headline?: string;
  faqs?: FaqItem[];
} & React.HTMLAttributes<HTMLElement>;

export function FaqSection({
  label = "Label placeholder",
  headline = "Headline skeleton placeholder",
  faqs = defaultFaqs,
  className,
  ...rest
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const handleToggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section
      className={`bg-sparkles-cream ${className ?? ""}`}
      data-editable="true"
      data-editable-type="section"
      data-editable-id="global.faq"
      data-editable-label="Global FAQ"
      {...rest}
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="z-[2] w-full max-w-[1800px] mx-auto">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="grid grid-cols-2 gap-12 items-start w-full max-[991px]:grid-cols-1 max-[991px]:gap-20 max-[767px]:gap-12">
              <div className="flex flex-col gap-4 max-w-[28rem]">
                <SectionLabel className="self-start">{label}</SectionLabel>

                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  {headline}
                </h2>
              </div>

              <div className="flex flex-col gap-4 max-[767px]:gap-3">
                {faqs.map((faq, i) => {
                  const isOpen = openIndex === i;
                  return (
                    <div
                      key={i}
                      className="bg-sparkles-warm rounded-2xl p-6 cursor-pointer max-[767px]:p-5"
                      onClick={() => handleToggle(i)}
                    >
                      <div className="flex justify-between items-start gap-8 max-[479px]:gap-4">
                        <div className="font-display text-2xl leading-7 font-bold tracking-[-0.031rem] text-puget-night max-[767px]:text-xl max-[767px]:leading-6">
                          {faq.question}
                        </div>

                        <div className="relative flex items-center justify-center shrink-0 w-3 h-[0.047rem] mt-[0.6rem]">
                          <div className="absolute bg-sparkles-navy w-3 h-[0.0625rem] transition-all duration-300" />
                          <div
                            className="absolute bg-sparkles-navy w-[0.0625rem] h-3 transition-all duration-300"
                            style={{
                              opacity: isOpen ? 0 : 1,
                              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                            }}
                          />
                        </div>
                      </div>

                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen ? "max-h-[500px]" : "max-h-0"
                        }`}
                      >
                        <p className="m-0 pt-6 font-body text-base leading-6 font-normal tracking-[-0.03em] text-sparkles-navy max-[479px]:pt-4">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FaqSection;

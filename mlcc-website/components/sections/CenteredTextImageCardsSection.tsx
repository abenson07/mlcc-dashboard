"use client";

import * as React from "react";

function ImageCard({
  cardRef,
  visible,
  title,
  imageUrl,
  className = "",
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  visible: boolean;
  title: string;
  imageUrl: string;
  className?: string;
}) {
  return (
    <div
      ref={cardRef}
      className={`
        relative flex flex-col justify-between items-start w-full max-w-[28rem] rounded-3xl overflow-hidden
        h-[35.13rem] p-6 text-[#fdf8f1] transition-all duration-700 ease-out
        max-[767px]:rounded-[1.25rem]
        ${visible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"}
        ${className}
      `}
      style={{
        backgroundImage: `url('${imageUrl}')`,
        backgroundPosition: "50%",
        backgroundSize: "cover",
      }}
    >
      <div
        className="absolute left-0 right-0 bottom-0 w-full"
        style={{
          height: "35%",
          backgroundImage: "linear-gradient(0deg, #0d1526a3, #0d152600)",
        }}
      />
      <div className="relative z-[2] flex flex-col justify-end items-start w-full h-full">
        <h3 className="m-0 font-[family-name:var(--font-bricolage)] text-xl leading-7 font-semibold text-[#fdf8f1]">
          {title}
        </h3>
      </div>
    </div>
  );
}

export function CenteredTextImageCardsSection() {
  const textRef = React.useRef<HTMLDivElement>(null);
  const card1Ref = React.useRef<HTMLDivElement>(null);
  const card2Ref = React.useRef<HTMLDivElement>(null);

  const [textVisible, setTextVisible] = React.useState(false);
  const [card1Visible, setCard1Visible] = React.useState(false);
  const [card2Visible, setCard2Visible] = React.useState(false);

  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const makeObserver = (
      ref: React.RefObject<HTMLElement | null>,
      setter: (v: boolean) => void,
      delay = 0,
    ) => {
      const el = ref.current;
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setter(true), delay);
            obs.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      obs.observe(el);
      observers.push(obs);
    };

    makeObserver(textRef, setTextVisible, 0);
    makeObserver(card1Ref, setCard1Visible, 0);
    makeObserver(card2Ref, setCard2Visible, 150);

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div
      data-editable="true"
      data-editable-type="section"
      data-editable-id="template.centered-text-image-cards"
      data-editable-label="Centered Text Image Cards (Template)"
    >
      <section className="bg-[#fdf8f1] pt-[7.5rem] pb-20 max-[767px]:pt-20 max-[767px]:pb-12">
        <div className="px-8 max-[767px]:px-4">
          <div className="z-[2] w-full max-w-[1800px] mx-auto">
            <div
              ref={textRef}
              className={`
                max-w-[42.5rem] text-center mx-auto transition-all duration-700 ease-out
                ${textVisible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"}
              `}
            >
              <h2 className="m-0 text-puget-night font-[family-name:var(--font-decalotype)] text-[2.75rem] leading-10 font-bold tracking-[-0.031rem] max-[767px]:text-[2rem] max-[767px]:leading-7">
                We&apos;re the cleaning team built for busy New Yorkers — the people juggling work, family, pets,
                elevators, walk-ups, deadlines, and everything in between.
              </h2>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fdf8f1] pt-20 pb-[7.5rem] max-[767px]:pt-12 max-[767px]:pb-20">
        <div className="px-8 max-[767px]:px-4">
          <div className="z-[2] w-full max-w-[1800px] mx-auto">
            <div className="flex justify-center items-start gap-4 max-[767px]:gap-3 max-[479px]:flex-col">
              <ImageCard
                cardRef={card1Ref}
                visible={card1Visible}
                title="We're not a huge franchise."
                imageUrl="https://byqsupply-components.netlify.app/sparkles/images/ServicesImage4.jpg"
              />
              <ImageCard
                cardRef={card2Ref}
                visible={card2Visible}
                title="We're a trained, vetted, friendly team."
                imageUrl="https://byqsupply-components.netlify.app/sparkles/images/ServicesImage6.jpg"
                className="mt-20 max-[479px]:mt-0"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CenteredTextImageCardsSection;

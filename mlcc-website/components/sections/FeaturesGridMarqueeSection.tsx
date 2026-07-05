"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";

const logos = [
  { src: "https://byqsupply-components.netlify.app/evermind/images/Compnaylogo_1.svg", size: "normal" as const },
  { src: "https://byqsupply-components.netlify.app/evermind/images/Compnaylogo-1.svg", size: "large" as const },
  { src: "https://byqsupply-components.netlify.app/evermind/images/Compnaylogo-2.svg", size: "large" as const },
  { src: "https://byqsupply-components.netlify.app/evermind/images/Compnaylogo-3.svg", size: "large" as const },
  { src: "https://byqsupply-components.netlify.app/evermind/images/Compnaylogo-4.svg", size: "small" as const },
  { src: "https://byqsupply-components.netlify.app/evermind/images/Compnaylogo-5.svg", size: "large" as const },
  { src: "https://byqsupply-components.netlify.app/evermind/images/Compnaylogo-6.svg", size: "large" as const },
  { src: "https://byqsupply-components.netlify.app/evermind/images/Compnaylogo-7.svg", size: "large" as const },
];

const featureCards = [
  {
    eyebrow: "Deep Cleaning",
    title: "Every corner, every detail",
    imageSrc: "https://byqsupply-components.netlify.app/sparkles/images/ServicesImage2.jpg",
    imageSrcSet:
      "https://byqsupply-components.netlify.app/sparkles/images/ServicesImage2-p-500.jpg 500w, https://byqsupply-components.netlify.app/sparkles/images/ServicesImage2-p-800.jpg 800w, https://byqsupply-components.netlify.app/sparkles/images/ServicesImage2.jpg 996w",
    imageSizes: "(max-width: 680px) 100vw, 680px",
  },
  {
    eyebrow: "Move-in / Move-out",
    title: "Fresh start, spotless finish",
    imageSrc: "https://byqsupply-components.netlify.app/sparkles/images/ServicesImage5.jpg",
    imageSrcSet:
      "https://byqsupply-components.netlify.app/sparkles/images/ServicesImage5-p-500.jpg 500w, https://byqsupply-components.netlify.app/sparkles/images/ServicesImage5-p-800.jpg 800w, https://byqsupply-components.netlify.app/sparkles/images/ServicesImage5.jpg 996w",
    imageSizes: "(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px",
  },
];

function ParallaxImage({
  src,
  srcSet,
  sizes,
  alt,
}: {
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
}) {
  const ref = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const parent = ref.current.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const progress = -rect.top / window.innerHeight;
      ref.current.style.transform = `translateY(${progress * 50}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <img
      ref={ref}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover will-change-transform scale-110"
    />
  );
}

function FeatureCard({
  eyebrow,
  title,
  imageSrc,
  imageSrcSet,
  imageSizes,
}: (typeof featureCards)[number]) {
  return (
    <a
      href="#"
      className="group relative block rounded-3xl overflow-hidden h-[500px] max-[767px]:h-[380px]"
    >
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <ParallaxImage src={imageSrc} srcSet={imageSrcSet} sizes={imageSizes} alt="" />
      </div>
      <div className="absolute inset-0 bg-sparkles-navy/30 group-hover:bg-sparkles-navy/40 transition-all duration-500 rounded-3xl z-10" />
      <div
        className="absolute inset-0 rounded-3xl z-10"
        style={{ backgroundImage: "linear-gradient(0deg, rgba(13,21,38,0.64), rgba(13,21,38,0) 50%)" }}
      />
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        <SectionLabel>{eyebrow}</SectionLabel>
        <div className="font-display text-2xl font-bold leading-tight text-sparkles-cream max-[767px]:text-xl">
          {title}
        </div>
      </div>
      <div className="absolute bottom-6 right-6 z-20">
        <div className="w-12 h-12 rounded-full bg-sparkles-cream/20 group-hover:bg-sparkles-cream/30 transition-all duration-300 flex items-center justify-center border border-sparkles-cream/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.33594 7.9987L12.0026 7.9987M8.0026 3.33203L12.6693 7.9987L8.0026 12.6654"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-sparkles-cream"
            />
          </svg>
        </div>
      </div>
    </a>
  );
}

export function FeaturesGridMarqueeSection() {
  return (
    <div
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="template.features-grid-marquee"
      data-editable-label="Features Grid Marquee (Template)"
    >
      <style>{`
        @keyframes marquee-logos {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        .animate-marquee-logos {
          animation: marquee-logos 30s linear infinite;
        }
        .animate-marquee-logos:hover {
          animation-play-state: paused;
        }
      `}</style>

      <section className="py-20 max-[767px]:py-12">
        <div className="px-8 max-[767px]:px-4">
          <div className="w-full max-w-[1800px] mx-auto">
            <div className="grid grid-cols-2 gap-4 max-[767px]:grid-cols-1 max-[767px]:gap-3">
              {featureCards.map((card) => (
                <FeatureCard key={card.eyebrow} {...card} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 max-[767px]:py-12 bg-sparkles-cream">
        <div className="px-8 max-[767px]:px-4">
          <div className="w-full max-w-[1800px] mx-auto">
            <div className="mb-8">
              <div className="w-full h-px bg-sparkles-navy/10 mb-4" />
              <div className="flex items-center gap-2">
                <SectionLabel>Companies we worked with</SectionLabel>
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 w-24 z-20 pointer-events-none"
                style={{ background: "linear-gradient(to right, #fdf8f1 0%, #fdf8f1 25%, transparent 100%)" }}
              />
              <div
                aria-hidden
                className="absolute inset-y-0 right-0 w-24 z-20 pointer-events-none"
                style={{ background: "linear-gradient(to left, #fdf8f1 0%, #fdf8f1 25%, transparent 100%)" }}
              />

              <div className="animate-marquee-logos flex items-center gap-12 w-max">
                {[0, 1, 2].map((setIdx) => (
                  <div key={setIdx} className="flex items-center gap-12">
                    {logos.map((logo, i) => (
                      <img
                        key={`${setIdx}-${i}`}
                        src={logo.src}
                        alt=""
                        loading="lazy"
                        className={
                          logo.size === "large"
                            ? "h-8 w-auto object-contain opacity-70"
                            : logo.size === "small"
                              ? "h-5 w-auto object-contain opacity-70"
                              : "h-6 w-auto object-contain opacity-70"
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FeaturesGridMarqueeSection;

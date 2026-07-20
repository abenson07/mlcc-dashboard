"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function ParallaxImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const onScroll = () => {
      if (!imgRef.current) return;
      const parent = imgRef.current.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const progress = -rect.top / window.innerHeight;
      imgRef.current.style.transform = `translateY(${progress * 40}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <img ref={imgRef} loading="lazy" src={src} alt={alt} className={className} />;
}

export function ValueFeatures29Section({ title }: { title: string }) {
  const headingAnim = useInView(0.1);
  const subtitleAnim = useInView(0.1);
  const img1Anim = useInView(0.1);
  const img2Anim = useInView(0.1);
  const bodyAnim = useInView(0.1);

  const [btnHovered, setBtnHovered] = React.useState(false);

  return (
    <div
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="one-seattle-plan.value-features-intro"
      data-editable-label="Value Features Intro"
    >
      <section className="relative overflow-hidden pt-[7.5rem] pb-0 max-[767px]:pt-20">
        <div className="mx-auto w-full max-w-[1800px] px-8 max-[767px]:px-4">
          <div className="mx-auto mb-16 flex max-w-[45rem] flex-col items-center gap-6 text-center max-[767px]:mb-10">
            <SectionLabel>Zoning workshops</SectionLabel>

            <div ref={headingAnim.ref}>
              <h1
                className={`m-0 font-display text-[4rem] leading-[4rem] font-bold tracking-[-0.125rem] text-puget-night transition-all duration-700 ease-out max-[767px]:text-[2.5rem] max-[767px]:leading-[2.75rem] ${
                  headingAnim.visible ? "opacity-100 blur-none" : "opacity-0 blur-md"
                }`}
              >
                {title}
              </h1>
            </div>

            <div
              ref={subtitleAnim.ref}
              className={`flex flex-col items-center gap-5 transition-all delay-150 duration-700 ease-out ${
                subtitleAnim.visible ? "opacity-100 blur-none" : "opacity-0 blur-md"
              }`}
            >
              <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                As Seattle changes, neighbors are coming together to make our voice heard and partner with others in
                creating a community where we can all grow, play, work, and live.
              </p>

              <a
                href="/contact"
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                className={`
                  flex cursor-pointer flex-row items-center justify-center gap-2 rounded-[2rem] border px-4 py-3
                  font-display text-sm leading-5 font-bold text-sparkles-cream no-underline
                  transition-all duration-300
                  ${btnHovered ? "border-sparkles-navy/90 bg-sparkles-navy/90" : "border-sparkles-navy bg-sparkles-navy"}
                `}
              >
                <span>Get involved</span>
                <span className="flex h-4 w-4 items-center justify-center overflow-hidden">
                  <ArrowRightIcon />
                </span>
              </a>
            </div>
          </div>

          <div className="relative flex items-start justify-center gap-8 max-[767px]:flex-col max-[767px]:items-center max-[767px]:gap-4">
            <div
              ref={img1Anim.ref}
              className={`relative z-10 w-[24rem] max-w-[38%] shrink-0 overflow-hidden rounded-2xl transition-all duration-700 ease-out max-[767px]:w-[80%] max-[767px]:max-w-none ${
                img1Anim.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl">
                <ParallaxImage
                  src="/images/one-seattle/Maple_Leaf.jpg"
                  alt="Aerial view of the Maple Leaf neighborhood"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div
              ref={img2Anim.ref}
              className={`relative z-20 mt-16 w-[24rem] max-w-[38%] shrink-0 overflow-hidden rounded-2xl transition-all delay-150 duration-700 ease-out max-[767px]:mt-0 max-[767px]:w-[80%] max-[767px]:max-w-none ${
                img2Anim.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl">
                <ParallaxImage
                  src="/images/one-seattle/reservoir-park.jpg"
                  alt="Maple Leaf Reservoir Park"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 max-[767px]:py-16">
        <div className="mx-auto w-full max-w-[1800px] px-8 max-[767px]:px-4">
          <div
            ref={bodyAnim.ref}
            className={`mx-auto max-w-[38rem] text-center transition-all duration-700 ease-out ${
              bodyAnim.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <p className="m-0 font-body text-lg leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
              How might we encourage thoughtful growth that takes the whole human being into account? Our zoning
              workshops build a shared vision for Maple Leaf, balancing density with the character and affordability
              that make this neighborhood feel like home.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ValueFeatures29Section;

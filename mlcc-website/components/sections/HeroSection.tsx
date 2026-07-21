"use client";

import * as React from "react";

export function HeroSection() {
  const leftRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLDivElement>(null);
  const [leftVisible, setLeftVisible] = React.useState(false);
  const [videoVisible, setVideoVisible] = React.useState(false);
  const [primaryHovered, setPrimaryHovered] = React.useState(false);
  const [secondaryHovered, setSecondaryHovered] = React.useState(false);

  React.useEffect(() => {
    const leftEl = leftRef.current;
    if (!leftEl) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLeftVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(leftEl);
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVideoVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(videoEl);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      className="pt-20 pb-[7.5rem] max-[767px]:pt-12 max-[767px]:pb-20"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="template.hero"
      data-editable-label="Hero (Template)"
    >
      <style>{`
        @keyframes textSwap {
          0%, 18% { transform: translateY(0); }
          20%, 38% { transform: translateY(-20%); }
          40%, 58% { transform: translateY(-40%); }
          60%, 78% { transform: translateY(-60%); }
          80%, 98% { transform: translateY(-80%); }
          100% { transform: translateY(0); }
        }
        .text-swap-track {
          animation: textSwap 8s ease-in-out infinite;
        }
      `}</style>
      <div className="px-8 max-[767px]:px-4">
        <div className="z-[2] w-full max-w-[1800px] mx-auto">
          <div
            className="
              w-full grid grid-cols-2 gap-4
              [height:88vh] min-h-[49rem] max-h-[68.75rem] pb-4
              max-[991px]:flex max-[991px]:flex-col-reverse max-[991px]:h-auto max-[991px]:min-h-0 max-[991px]:max-h-none
              max-[991px]:rounded-3xl max-[991px]:bg-[#0d1526] max-[991px]:mb-4 max-[991px]:p-12 max-[991px]:gap-12
              max-[767px]:rounded-[1.25rem] max-[767px]:mb-3 max-[767px]:p-8 max-[767px]:gap-8
            "
          >
            <div
              ref={leftRef}
              className={`
                w-full flex flex-col justify-between items-start gap-16
                p-12 px-8 rounded-3xl bg-[#0d1526] text-[#fdf8f1] overflow-hidden
                transition-all duration-700 ease-out
                max-[991px]:p-0 max-[991px]:rounded-none max-[991px]:bg-transparent
                max-[767px]:gap-10 max-[767px]:rounded-[1.25rem] max-[767px]:p-0
                max-[479px]:gap-8
                ${leftVisible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"}
              `}
            >
              <div className="flex flex-col gap-8 items-start max-[767px]:gap-6">
                <h1 className="flex flex-wrap gap-x-3 gap-y-0 max-w-[33rem] max-[767px]:gap-x-2 max-[767px]:gap-y-1 max-[767px]:max-w-[20rem]">
                  {["CLEANING", "FOR", "BUSY", "PEOPLE", "IN"].map((word) => (
                    <div
                      key={word}
                      className="
                        font-[family-name:var(--font-decalotype)] text-[6.5rem] leading-[5.5rem] font-bold tracking-[-0.125rem]
                        max-[767px]:text-[4rem] max-[767px]:leading-[3rem]
                      "
                    >
                      {word}
                    </div>
                  ))}
                  <div className="overflow-clip flex flex-col h-[5.5rem] max-[767px]:h-[3rem]">
                    <div className="text-swap-track flex flex-col">
                      {["MANHATTAN", "BROOKLYN", "QUEENS", "CHELSEA", "MANHATTAN"].map((city, i) => (
                        <div key={i} className="pb-4 max-[479px]:pt-[0.3rem] max-[479px]:pb-4">
                          <div
                            className="
                              font-[family-name:var(--font-decalotype)] text-[6.5rem] leading-[5.5rem] font-bold tracking-[-0.125rem]
                              max-[767px]:text-[4rem] max-[767px]:leading-[3rem]
                            "
                          >
                            {city}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </h1>
              </div>

              <div className="flex flex-wrap justify-start items-center gap-2">
                <a
                  href="/template/style-guide"
                  className={`
                    relative flex justify-center items-center overflow-hidden
                    rounded-[2rem] cursor-pointer no-underline flex-none
                    font-[family-name:var(--font-decalotype)] text-xl leading-5 font-bold tracking-[0] uppercase
                    transition-all duration-300
                    max-[767px]:rounded-[2rem] max-[767px]:py-3 max-[767px]:px-4 max-[767px]:text-base max-[767px]:leading-5
                    ${primaryHovered ? "text-[#0d1526] pr-10" : "text-[#0d1526]"}
                  `}
                  style={{ padding: primaryHovered ? "1rem 2.5rem 1rem 1.25rem" : "1rem 1.25rem" }}
                  onMouseEnter={() => setPrimaryHovered(true)}
                  onMouseLeave={() => setPrimaryHovered(false)}
                >
                  <div className="z-[3] pointer-events-none flex-none relative flex items-center">
                    <div
                      className={`absolute flex justify-center items-center overflow-hidden transition-opacity duration-300 ${primaryHovered ? "opacity-100" : "opacity-0"}`}
                      style={{ inset: "0 -1.5rem 0 auto" }}
                    >
                      <div className="pl-2 flex-none">
                        <div className="w-4 h-4 z-[2] flex justify-center items-center relative">
                          <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="z-[1] relative">Book your cleaning</div>
                  </div>
                  <div
                    className={`
                      absolute inset-0 rounded-[2rem] border transition-colors duration-300
                      border-[#fdf8f100]
                      ${primaryHovered ? "bg-[#fdf8f1]" : "bg-sparkles-blue"}
                    `}
                  />
                </a>

                <a
                  href="/template/style-guide"
                  className={`
                    relative flex justify-center items-center overflow-hidden
                    rounded-[2rem] cursor-pointer no-underline flex-none
                    font-[family-name:var(--font-decalotype)] text-xl leading-5 font-bold tracking-[0] uppercase
                    transition-all duration-300
                    max-[767px]:rounded-[2rem] max-[767px]:py-3 max-[767px]:px-4 max-[767px]:text-base max-[767px]:leading-5
                    ${secondaryHovered ? "text-[#0d1526]" : "text-[#fdf8f1]"}
                  `}
                  style={{ padding: secondaryHovered ? "1rem 2.5rem 1rem 1.25rem" : "1rem 1.25rem" }}
                  onMouseEnter={() => setSecondaryHovered(true)}
                  onMouseLeave={() => setSecondaryHovered(false)}
                >
                  <div className="z-[3] pointer-events-none flex-none relative flex items-center">
                    <div
                      className={`absolute flex justify-center items-center overflow-hidden transition-opacity duration-300 ${secondaryHovered ? "opacity-100" : "opacity-0"}`}
                      style={{ inset: "0 -1.5rem 0 auto" }}
                    >
                      <div className="pl-2 flex-none">
                        <div className="w-4 h-4 z-[2] flex justify-center items-center relative">
                          <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="z-[1] relative">See pricing</div>
                  </div>
                  <div
                    className={`
                      absolute inset-0 rounded-[2rem] border transition-colors duration-300
                      border-[#0d152600]
                      ${secondaryHovered ? "bg-[#fdf8f1]" : "bg-[#fdf8f114]"}
                    `}
                  />
                </a>
              </div>
            </div>

            <div
              ref={videoRef}
              className={`
                z-[2] rounded-3xl w-full h-full overflow-hidden
                transition-all duration-700 ease-out delay-150
                max-[991px]:h-[13.5rem] max-[991px]:rounded-3xl
                max-[767px]:rounded-[1.25rem]
                ${videoVisible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"}
              `}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{
                  backgroundImage:
                    'url("/images/hero/hero-poster.jpg")',
                }}
              >
                <source src="https://byqsupply-components.netlify.app/sparkles/videos/hero-1_mp4.mp4" type="video/mp4" />
                <source src="https://byqsupply-components.netlify.app/sparkles/videos/hero-1_webm.webm" type="video/webm" />
              </video>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 w-full max-[991px]:grid-cols-2 max-[767px]:gap-3">
            {[
              {
                label: "Phone",
                value: "(212) 555-0198",
                href: "tel:(212)555-0198",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 32 32" fill="none">
                    <path d="M6 4H12L14 10L11 12C12.5 15.5 16.5 19.5 20 21L22 18L28 20V26C28 27.1 27.1 28 26 28C13.9 28 4 18.1 4 6C4 4.9 4.9 4 6 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                label: "Text",
                value: "(212) 555-0198",
                href: "tel:(212)555-0198",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 32 32" fill="none">
                    <path d="M28 6H4C2.9 6 2 6.9 2 8V22C2 23.1 2.9 24 4 24H10V30L18 24H28C29.1 24 30 23.1 30 22V8C30 6.9 29.1 6 28 6Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 14H22M10 18H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                label: "iMessage",
                value: "(212) 555-0198",
                href: "tel:(212)555-0198",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4C9.4 4 4 8.9 4 15C4 17.8 5.1 20.4 7 22.4L5 28L11.4 26.2C12.8 26.7 14.4 27 16 27C22.6 27 28 22.1 28 16C28 9.9 22.6 4 16 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                label: "Email",
                value: "(212) 555-0198",
                href: "tel:(212)555-0198",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 30 24" fill="none">
                    <path d="M2 2H28C29.1 2 30 2.9 30 4V20C30 21.1 29.1 22 28 22H2C0.9 22 0 21.1 0 20V4C0 2.9 0.9 2 2 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M0 4L15 14L30 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="
                  w-full flex flex-wrap justify-start items-center gap-6
                  p-6 rounded-2xl bg-[#f2ece5] text-[#0d1526] no-underline
                  max-[767px]:gap-5 max-[767px]:rounded-2xl max-[767px]:p-5
                  max-[479px]:flex-col max-[479px]:justify-center max-[479px]:items-start
                "
              >
                <div className="p-4 rounded-3xl bg-white text-sparkles-accent flex-none flex justify-center items-center max-[767px]:p-3 max-[767px]:rounded-[1.25rem]">
                  <div className="w-8 h-8 flex justify-center items-center max-[767px]:w-6 max-[767px]:h-6">{item.icon}</div>
                </div>
                <div className="flex flex-col gap-3 justify-start items-start max-[767px]:gap-2">
                  <div className="font-[family-name:var(--font-decalotype)] text-[2rem] leading-[2rem] font-bold tracking-[-0.031rem] max-[767px]:text-[1.5rem] max-[767px]:leading-5">
                    {item.label}
                  </div>
                  <div className="font-[family-name:var(--font-bricolage)] text-base leading-6 font-normal">{item.value}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

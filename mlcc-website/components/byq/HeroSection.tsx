"use client";

import * as React from "react";

export function HeroSection({ title }: { title: string }) {
  const [ctaHovered, setCtaHovered] = React.useState(false);
  const [btnHovered, setBtnHovered] = React.useState(false);

  return (
    <div
      className="flex h-[calc(100vh-6.75rem)] max-[991px]:h-[calc(100vh-6.25rem)] bg-sparkles-cream p-2"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="home.hero"
      data-editable-label="Hero Section"
    >
      <div className="relative flex flex-row w-full h-full rounded-2xl overflow-hidden p-6">
        {/* Video — swap back in when ready
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          style={{
            backgroundImage:
              'url("https://cdn.prod.website-files.com/6931c0eea92dec5b7ca905e9%2F69b53b7293cf73e76c9173d6_Silhouette%20Profile%20Art_poster.0000000.jpg")',
          }}
        >
          <source
            src="https://cdn.prod.website-files.com/6931c0eea92dec5b7ca905e9%2F69b53b7293cf73e76c9173d6_Silhouette%20Profile%20Art_mp4.mp4"
            type="video/mp4"
          />
          <source
            src="https://cdn.prod.website-files.com/6931c0eea92dec5b7ca905e9%2F69b53b7293cf73e76c9173d6_Silhouette%20Profile%20Art_webm.webm"
            type="video/webm"
          />
        </video>
        */}
        <img
          loading="lazy"
          alt="Maple Leaf neighborhood hero"
          src="https://cdn.prod.website-files.com/6931c0eea92dec5b7ca905e9%2F69b53b7293cf73e76c9173d6_Silhouette%20Profile%20Art_poster.0000000.jpg"
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          data-editable="true"
          data-editable-type="image"
          data-editable-id="home.hero.background"
          data-editable-label="Hero background"
        />

        <div
          className="absolute top-0 left-0 right-0 z-[2] pointer-events-none h-1/4"
          style={{ backgroundImage: "linear-gradient(#0d152629, #0d152600)" }}
        />

        <div
          className="absolute bottom-0 left-0 right-0 z-[2] pointer-events-none h-[45%]"
          style={{ backgroundImage: "linear-gradient(#0d152600, #0d1526a3)" }}
        />

        <div className="relative z-[3] w-full max-w-[1800px] mx-auto h-full">
          <div className="flex flex-col w-full h-full justify-end">
            <div className="relative z-[2] flex justify-between items-end w-full gap-6 max-[767px]:flex-col max-[767px]:items-start max-[767px]:gap-8">
              <div className="max-w-[42.5rem]">
                <h1
                  className="m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-sparkles-cream max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]"
                  data-editable="true"
                  data-editable-type="text"
                  data-editable-id="home.hero.title"
                  data-editable-label="Hero headline"
                >
                  {title}
                </h1>
              </div>

              <a
                href="/template/style-guide"
                className={`
                  flex flex-col items-start no-underline max-w-[20.75rem] w-full p-4 gap-6 rounded-lg
                  transition-colors duration-[400ms]
                  ${ctaHovered ? "bg-sparkles-warm" : "bg-sparkles-cream"}
                `}
                data-editable="true"
                data-editable-type="button"
                data-editable-id="home.hero.cta"
                data-editable-label="Hero CTA"
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
              >
                <div className="font-body text-base leading-6 font-normal text-sparkles-navy">
                  This is skeleton super short text.
                </div>

                <div
                  className={`
                    inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[2rem]
                    font-display text-sm leading-5 font-bold cursor-pointer
                    transition-all duration-300
                    ${
                      btnHovered
                        ? "border border-white/10 bg-sparkles-navy/90 text-sparkles-cream"
                        : "border border-sparkles-navy/30 bg-white/50 text-sparkles-navy"
                    }
                  `}
                  onMouseEnter={(e) => {
                    e.preventDefault();
                    setBtnHovered(true);
                  }}
                  onMouseLeave={() => setBtnHovered(false)}
                >
                  <span>Secondary</span>
                  <span className="overflow-hidden flex items-center justify-center w-4 h-4 shrink-0">
                    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path
                        d="M3 8H13M13 8L9 4M13 8L9 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;

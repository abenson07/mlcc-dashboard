"use client";

import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

const heroImages = [
  {
    src: "/images/leaflet/leaflet.webp",
    alt: "A neighbor holding a copy of the Maple Leaf Leaflet newsletter",
  },
  {
    src: "/images/community-photos/summer-social-2024-39.webp",
    alt: "Families enjoying the Summer Social in Maple Leaf",
  },
  {
    src: "/images/community-photos/img-6554.jpg",
    alt: "Children and families at the Maple Leaf Halloween Parade",
  },
  {
    src: "/images/community-photos/community-meeting-a.webp",
    alt: "Neighbors gathered at a Maple Leaf community meeting",
  },
  {
    src: "/images/community-photos/img-9152.jpg",
    alt: "Neighbors at an advocacy workshop in Maple Leaf",
  },
  {
    src: "/images/community-photos/community-meeting-d.webp",
    alt: "Community meeting in Maple Leaf",
  },
  {
    src: "/images/community-photos/movies-tower.webp",
    alt: "Movies by the Tower in Maple Leaf Park",
  },
  {
    src: "/images/community-photos/img-6862.jpg",
    alt: "Neighbors at Silent Book Club",
  },
  {
    src: "/images/community-photos/love-your-neighbor.webp",
    alt: "Love Your Neighbor community event in Maple Leaf",
  },
  {
    src: "/images/community-photos/maple-leaf.jpg",
    alt: "Aerial view of the Maple Leaf neighborhood in Seattle",
  },
];

export function AboutHeroSection() {
  const [primaryHovered, setPrimaryHovered] = React.useState(false);
  const [secondaryHovered, setSecondaryHovered] = React.useState(false);

  return (
    <section
      className="bg-sparkles-cream py-[7.5rem] text-sparkles-navy max-[767px]:py-20"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="about.hero"
      data-editable-label="About Hero"
    >
      <style>{`
        @keyframes about-hero-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-about-hero-marquee {
          animation: about-hero-marquee 60s linear infinite;
        }
      `}</style>

      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="relative z-[2] mx-auto flex w-full max-w-[42.5rem] flex-col items-center justify-start gap-6 text-center max-[479px]:mb-6 max-[479px]:items-start max-[479px]:text-left">
            <SectionLabel>About the council</SectionLabel>

            <h1
              className="m-0 font-display text-[3.75rem] font-bold leading-16 tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]"
              data-editable="true"
              data-editable-type="text"
              data-editable-id="about.hero.title"
              data-editable-label="About headline"
            >
              Neighbors building Maple Leaf together
            </h1>

            <p
              className="m-0 max-w-[34rem] font-body text-base leading-6 text-sparkles-navy"
              data-editable="true"
              data-editable-type="text"
              data-editable-id="about.hero.description"
              data-editable-label="About description"
            >
              The Maple Leaf Community Council is a volunteer-run neighborhood organization. We
              connect neighbors, host traditions, publish the Leaflet, and give Maple Leaf a voice
              at City Hall.
            </p>

            <div className="flex items-center justify-center gap-2 max-[479px]:justify-start">
              <Link
                href="/membership"
                onMouseEnter={() => setPrimaryHovered(true)}
                onMouseLeave={() => setPrimaryHovered(false)}
                className={`
                  inline-flex items-center justify-center rounded-[2rem] border px-4 py-3
                  font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300
                  ${primaryHovered ? "border-sparkles-navy/90 bg-sparkles-navy/90" : "border-sparkles-navy bg-sparkles-navy"}
                `}
                data-editable="true"
                data-editable-type="button"
                data-editable-id="about.hero.membership-cta"
                data-editable-label="Become a member"
              >
                Become a member
              </Link>

              <Link
                href="/volunteer"
                onMouseEnter={() => setSecondaryHovered(true)}
                onMouseLeave={() => setSecondaryHovered(false)}
                className={`
                  inline-flex items-center justify-center rounded-[2rem] border px-4 py-3
                  font-display text-sm font-bold leading-5 no-underline transition-all duration-300
                  ${
                    secondaryHovered
                      ? "border-sparkles-navy/90 bg-sparkles-navy/90 text-sparkles-cream"
                      : "border-sparkles-navy/30 bg-white/50 text-sparkles-navy"
                  }
                `}
              >
                Volunteer
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[2] mt-20 overflow-hidden">
        <div className="animate-about-hero-marquee flex w-max items-center justify-start gap-6">
          {[0, 1].map((set) => (
            <div key={set} className="flex flex-none gap-6">
              {heroImages.map((image, i) => (
                <div
                  key={`${set}-${i}`}
                  className="h-[22.5rem] w-[26rem] flex-none overflow-hidden rounded-2xl max-[479px]:h-[17rem] max-[479px]:w-[16rem]"
                >
                  <img
                    loading="lazy"
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover"
                    data-editable="true"
                    data-editable-type="image"
                    data-editable-id={`about.hero.image-${i}`}
                    data-editable-label={`About image ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutHeroSection;

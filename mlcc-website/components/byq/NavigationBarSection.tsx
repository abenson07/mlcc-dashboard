"use client";

import * as React from "react";
import Link from "next/link";
import { RotatingBanner } from "@marketing/components/byq/RotatingBanner";

const menuSections = [
  {
    label: "Multi-Layout",
    items: [
      { name: "Homepage", links: ["Version A", "Version B", "Version C"] },
      { name: "About", links: ["Version A", "Version B", "Version C"] },
      { name: "Contact", links: ["Version A", "Version B", "Version C"] },
    ],
    type: "icons" as const,
  },
  {
    label: "Company",
    items: [
      { name: "Page 1", href: "/template/style-guide" },
      { name: "Page 2", href: "/template/style-guide" },
      { name: "Page 3", href: "/template/style-guide" },
      { name: "Page 4", href: "/template/style-guide" },
    ],
    type: "links" as const,
  },
  {
    label: "Other Pages",
    items: [
      { name: "Page 1", href: "/template/style-guide" },
      { name: "Page 2", href: "/template/style-guide" },
      { name: "Page 3", href: "/template/style-guide" },
      { name: "Page 4", href: "/template/style-guide" },
    ],
    type: "links" as const,
  },
  {
    label: "Template",
    items: [
      { name: "Page 1", href: "/template/style-guide" },
      { name: "Page 2", href: "/template/style-guide" },
      { name: "Page 3", href: "/template/style-guide" },
    ],
    type: "links" as const,
  },
];

export function NavigationBarSection() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mobileAccordion, setMobileAccordion] = React.useState<number | null>(null);

  const toggleMobileAccordion = (i: number) => {
    setMobileAccordion((prev) => (prev === i ? null : i));
  };

  return (
    <>
      <div
        className="fixed left-0 right-0 top-0 z-[999] bg-sparkles-cream"
        data-editable="true"
        data-editable-type="section"
        data-editable-id="global.nav"
        data-editable-label="Navigation Bar"
      >
        <RotatingBanner />

        <div className="px-8 max-[767px]:px-4">
          <div className="w-full max-w-[1800px] mx-auto">
            <div
              className="
                grid grid-cols-[1fr_auto_1fr] gap-8 items-center w-full py-4
                border-b border-sparkles-navy/30
                max-[991px]:grid-cols-[1fr_1fr]
                max-[479px]:flex max-[479px]:justify-between max-[479px]:items-center
              "
            >
              <Link href="/" className="z-[2] flex justify-start items-center w-[6.25rem] max-[479px]:w-[5.625rem]">
                <img
                  loading="lazy"
                  src="https://byqsupply-components.netlify.app/skeletons/navigation-bar/images/SkeletonsLogo.svg"
                  alt=""
                  className="w-full"
                />
              </Link>

              <nav className="max-[991px]:hidden" aria-label="Primary">
                <div className="flex items-center gap-6">
                  {[
                    { label: "Events", href: "/events" },
                    { label: "Leaflet", href: "/leaflet" },
                    { label: "Committees", href: "/committees" },
                    { label: "One Seattle Plan", href: "/one-seattle-plan" },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="relative z-[2] p-0 font-display text-[0.875rem] leading-4 font-bold uppercase no-underline text-sparkles-navy transition-colors duration-200 hover:text-sparkles-navy/90"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </nav>

              <div className="z-[2] flex flex-wrap justify-end items-center gap-6 relative max-[767px]:gap-6 max-[479px]:gap-4">
                <div className="max-[767px]:hidden flex items-center gap-2">
                  <a
                    href="/volunteer"
                    className="
                      inline-flex items-center justify-center px-3 py-2
                      border border-sparkles-navy rounded-[2rem] bg-sparkles-cream
                      font-display text-xs font-bold leading-4 text-sparkles-navy no-underline
                      transition-all duration-300 hover:bg-sparkles-warm hover:border-sparkles-navy
                    "
                  >
                    Volunteer
                  </a>
                  <a
                    href="/membership"
                    className="
                      inline-flex items-center justify-center px-3 py-2
                      border border-sparkles-navy rounded-[2rem] bg-sparkles-navy
                      font-display text-xs font-bold leading-4 text-sparkles-cream no-underline
                      transition-all duration-300 hover:bg-sparkles-navy/90 hover:border-sparkles-navy/90
                    "
                  >
                    Support
                  </a>
                </div>

                <button
                  type="button"
                  className="p-0 bg-transparent border-none cursor-pointer flex items-center justify-center text-sparkles-navy max-[991px]:flex min-[992px]:hidden"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Toggle menu"
                >
                  {menuOpen ? (
                    <span className="flex items-center justify-center w-5 p-[2px]">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 10 L90 90 M90 10 L10 90" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-5">
                      <svg width="100%" height="100%" viewBox="0 0 157 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="157" height="14" rx="7" />
                        <rect x="0" y="43" width="157" height="14" rx="7" />
                        <rect x="0" y="86" width="157" height="14" rx="7" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-x-0 top-0 z-[998] hidden max-[991px]:block max-h-[87vh] overflow-y-auto">
          <div className="flex flex-col gap-0 items-stretch relative bg-sparkles-warm px-8 pt-[7.5rem] pb-6 max-h-[87vh] overflow-y-auto max-[767px]:px-4">
            <div className="flex justify-between items-center gap-3 pt-2 pr-6 pl-6 absolute inset-x-0 top-0 bg-sparkles-warm">
              <div className="flex flex-col gap-1 items-start">
                <div className="font-body text-sm font-semibold text-sparkles-navy">Perfect stage for your brand</div>
                <a
                  href="https://webflow.com/templates/designers/byq-studio"
                  target="_blank"
                  rel="noreferrer"
                  className="font-body text-sm font-semibold text-sparkles-navy no-underline"
                >
                  Buy Template
                </a>
              </div>
              <img
                loading="lazy"
                src="https://byqsupply-components.netlify.app/skeletons/navigation-bar/images/backgroundVertical.svg"
                alt=""
                className="w-[8.5625rem] max-[479px]:w-[7.5rem] border-t border-l border-r border-sparkles-navy/15 rounded-tl-2xl rounded-tr-2xl"
              />
            </div>

            {menuSections.map((section, i) => (
              <div key={i} className="w-full">
                <button
                  type="button"
                  className="flex justify-between items-center w-full gap-6 bg-transparent border-none cursor-pointer py-0"
                  onClick={() => toggleMobileAccordion(i)}
                >
                  <div className="font-body text-sm font-semibold text-sparkles-navy">{section.label}</div>
                  <div className="relative flex items-center justify-center w-3 h-3">
                    <div
                      className="absolute bg-sparkles-navy w-[0.125rem] h-3 transition-all duration-300"
                      style={{ opacity: mobileAccordion === i ? 0 : 1 }}
                    />
                    <div className="bg-sparkles-navy w-3 h-[0.125rem]" />
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${mobileAccordion === i ? "max-h-[500px]" : "max-h-0"}`}>
                  <div className="flex flex-col gap-2 pt-5">
                    {section.type === "icons"
                      ? (section.items as { name: string; links: string[] }[]).map((item) => (
                          <div key={item.name} className="flex flex-col gap-1">
                            <div className="font-body text-sm font-normal text-sparkles-navy">{item.name}</div>
                            <div className="flex gap-1 items-center">
                              {item.links.map((link, li) => (
                                <React.Fragment key={link}>
                                  <a href="/template/style-guide" className="font-body text-xs font-semibold text-sparkles-muted no-underline hover:text-sparkles-navy hover:underline">
                                    {link}
                                  </a>
                                  {li < item.links.length - 1 && <span className="text-xs text-sparkles-navy">·</span>}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))
                      : (section.items as { name: string; href: string }[]).map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="font-body text-base font-normal text-sparkles-navy no-underline hover:opacity-80 transition-opacity duration-200"
                          >
                            {item.name}
                          </a>
                        ))}
                  </div>
                </div>

                <div className="w-full h-px bg-sparkles-navy/30 my-5 max-[479px]:my-3" />
              </div>
            ))}

            <div className="flex justify-between items-center gap-6 max-[479px]:flex-wrap max-[479px]:gap-4">
              <div className="flex gap-3">
                {[
                  { href: "https://facebook.com", src: "https://cdn.prod.website-files.com/68a8bac34ba5bc8cee4c21c1/68a8bac34ba5bc8cee4c224a_Social%20Icon.svg" },
                  { href: "https://instagram.com", src: "https://cdn.prod.website-files.com/68a8bac34ba5bc8cee4c21c1/68a8bac34ba5bc8cee4c21ca_Social%20Icon-1.svg" },
                  { href: "https://linkedin.com", src: "https://cdn.prod.website-files.com/68a8bac34ba5bc8cee4c21c1/68a8bac34ba5bc8cee4c2262_Social%20Icon-2.svg" },
                  { href: "https://youtube.com", src: "https://cdn.prod.website-files.com/68a8bac34ba5bc8cee4c21c1/68a8bac34ba5bc8cee4c21ce_Social%20Icon-3.svg" },
                ].map((social) => (
                  <a key={social.href} href={social.href} target="_blank" rel="noreferrer" className="flex items-center justify-center w-5 h-5">
                    <img loading="lazy" src={social.src} alt="" className="w-full h-full" />
                  </a>
                ))}
              </div>
              <div className="font-body text-xs leading-4 text-sparkles-navy">Design by Ariel for BYQ Studio</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NavigationBarSection;

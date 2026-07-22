"use client";

import * as React from "react";
import Link from "next/link";
import { RotatingBanner } from "@marketing/components/byq/RotatingBanner";
import { SectionLabel } from "@marketing/components/SectionLabel";

const primaryLinks: {
  label: string;
  href: string;
  tag?: string;
}[] = [
  { label: "Events", href: "/events" },
  { label: "Leaflet", href: "/leaflet" },
  { label: "Committees", href: "/committees" },
  {
    label: "Summer Social T-Shirt",
    href: "/shop/2026-summer-social-shirt",
    tag: "New",
  },
];

export function NavigationBarSection() {
  const [menuOpen, setMenuOpen] = React.useState(false);

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
                  src="/logo_black.svg"
                  alt="Maple Leaf Community Council"
                  className="w-full"
                />
              </Link>

              <nav className="max-[991px]:hidden" aria-label="Primary">
                <div className="flex items-center gap-6">
                  {primaryLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="relative z-[2] inline-flex items-center gap-2 p-0 font-display text-[0.875rem] leading-4 font-bold uppercase no-underline text-sparkles-navy transition-colors duration-200 hover:text-sparkles-navy/90"
                    >
                      <span>{item.label}</span>
                      {item.tag ? <SectionLabel>{item.tag}</SectionLabel> : null}
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
          <div className="flex flex-col gap-2 items-stretch relative bg-sparkles-warm px-8 pt-[7.5rem] pb-6 max-h-[87vh] overflow-y-auto max-[767px]:px-4">
            {primaryLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 py-3 font-display text-lg font-bold uppercase text-sparkles-navy no-underline hover:opacity-80 transition-opacity duration-200"
              >
                <span>{item.label}</span>
                {item.tag ? <SectionLabel>{item.tag}</SectionLabel> : null}
              </a>
            ))}

            <div className="w-full h-px bg-sparkles-navy/30 my-3" />

            <div className="flex flex-col gap-3 pb-3">
              <a
                href="/volunteer"
                className="inline-flex items-center justify-center px-3 py-2 border border-sparkles-navy rounded-[2rem] bg-sparkles-cream font-display text-xs font-bold leading-4 text-sparkles-navy no-underline transition-all duration-300"
              >
                Volunteer
              </a>
              <a
                href="/membership"
                className="inline-flex items-center justify-center px-3 py-2 border border-sparkles-navy rounded-[2rem] bg-sparkles-navy font-display text-xs font-bold leading-4 text-sparkles-cream no-underline transition-all duration-300"
              >
                Support
              </a>
            </div>

            <div className="w-full h-px bg-sparkles-navy/30 my-3" />

            <div className="flex justify-between items-center gap-6 max-[479px]:flex-wrap max-[479px]:gap-4">
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/MapleLeafCC/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sparkles-navy transition-colors duration-200 hover:opacity-80"
                  aria-label="Facebook"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_mobilenav_fb)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0 12.067C0 18.033 4.333 22.994 10 24v-8.667H7V12h3V9.333c0-3 1.933-4.666 4.667-4.666.866 0 1.8.133 2.666.266V8H15.8c-1.467 0-1.8.733-1.8 1.667V12h3.2l-.533 3.333H14V24c5.667-1.006 10-5.966 10-11.933C24 5.43 18.6 0 12 0S0 5.43 0 12.067z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_mobilenav_fb">
                        <rect width="24" height="24" fill="currentColor" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>

                <a
                  href="https://www.instagram.com/mapleleafcommunitycouncil/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sparkles-navy transition-colors duration-200 hover:opacity-80"
                  aria-label="Instagram"
                >
                  <svg width="24" height="24" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_mobilenav_ig)">
                      <path
                        d="M6 1.081c1.603 0 1.792.006 2.425.035 1.627.074 2.387.847 2.461 2.461.029.633.034.822.034 2.425 0 1.604-.005 1.792-.034 2.425-.075 1.613-.833 2.387-2.461 2.461-.633.029-.82.035-2.425.035-1.603 0-1.792-.006-2.425-.035C1.948 10.814 1.188 10.04 1.114 8.427 1.085 7.794 1.08 7.605 1.08 6.002c0-1.604.006-1.792.035-2.425C1.189 1.964 1.949 1.19 3.575 1.116 4.209 1.087 4.397 1.081 6 1.081zM6 0C4.37 0 4.166.007 3.527.036 1.345.138.138 1.343.036 3.527.007 4.166 0 4.37 0 6s.007 1.835.036 2.473C.138 10.655 1.343 11.862 3.527 11.964 4.166 11.993 4.37 12 6 12s1.835-.007 2.473-.036c2.181-.102 3.39-1.307 3.491-3.491C11.993 7.835 12 7.63 12 6s-.007-1.834-.036-2.473C11.863 1.347 10.657.138 8.473.036 7.835.007 7.63 0 6 0zm0 2.919a3.081 3.081 0 100 6.162 3.081 3.081 0 000-6.162zM6 8a2 2 0 110-4 2 2 0 010 4zm3.202-5.872a.72.72 0 100 1.44.72.72 0 000-1.44z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_mobilenav_ig">
                        <rect width="12" height="12" fill="currentColor" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>

                <a
                  href="https://us.nextdoor.com/pages/maple-leaf-community-council-seattle-wa/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sparkles-navy transition-colors duration-200 hover:opacity-80"
                  aria-label="Nextdoor"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4 H9 V11 L15 4 H18 V20 H15 V13 L9 20 H6 Z" fill="currentColor" />
                  </svg>
                </a>
              </div>

              <div className="font-body text-xs leading-4 text-sparkles-navy">
                © Maple Leaf Community Council 2026
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NavigationBarSection;

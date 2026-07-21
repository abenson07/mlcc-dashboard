"use client";

import * as React from "react";
import Link from "next/link";
import { RotatingBanner } from "@marketing/components/byq/RotatingBanner";

const primaryLinks = [
  { label: "Events", href: "/events" },
  { label: "Leaflet", href: "/leaflet" },
  { label: "Committees", href: "/committees" },
  { label: "One Seattle Plan", href: "/one-seattle-plan" },
];

function DefaultAccountIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-sparkles-navy text-sparkles-navy"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12Zm0 2.25c-3.004 0-9 1.508-9 4.5V21h18v-2.25c0-2.992-5.996-4.5-9-4.5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

interface NavigationBarSectionProps {
  /** Real sign-in button is injected by the deployed app; the design sandbox falls back to a static icon. */
  accountSlot?: React.ReactNode;
}

export function NavigationBarSection({ accountSlot }: NavigationBarSectionProps = {}) {
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
                  src="https://byqsupply-components.netlify.app/skeletons/navigation-bar/images/SkeletonsLogo.svg"
                  alt=""
                  className="w-full"
                />
              </Link>

              <nav className="max-[991px]:hidden" aria-label="Primary">
                <div className="flex items-center gap-6">
                  {primaryLinks.map((item) => (
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
                  {/* Sign-in icon disabled for now — re-enable by uncommenting when ready to launch.
                  {accountSlot ?? <DefaultAccountIcon />}
                  */}
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
                className="py-3 font-display text-lg font-bold uppercase text-sparkles-navy no-underline hover:opacity-80 transition-opacity duration-200"
              >
                {item.label}
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
                  href="https://facebook.com"
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
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sparkles-navy transition-colors duration-200 hover:opacity-80"
                  aria-label="YouTube"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_mobilenav_yt)">
                      <path
                        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
                        fill="currentColor"
                      />
                      <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#fdf8f1" />
                    </g>
                    <defs>
                      <clipPath id="clip0_mobilenav_yt">
                        <rect width="24" height="24" fill="currentColor" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sparkles-navy transition-colors duration-200 hover:opacity-80"
                  aria-label="LinkedIn"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_mobilenav_li)">
                      <path
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_mobilenav_li">
                        <rect width="24" height="24" fill="currentColor" />
                      </clipPath>
                    </defs>
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

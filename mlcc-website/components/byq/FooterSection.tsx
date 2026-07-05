"use client";

import * as React from "react";
import Link from "next/link";
import { COMMITTEE_CONTENT, COMMITTEE_LISTINGS } from "@marketing/data/committees";

const linkColumns = [
  {
    label: "Committees",
    links: COMMITTEE_LISTINGS.map((committee) => ({
      name: COMMITTEE_CONTENT[committee.slug].title,
      href: `/committees/${committee.slug}`,
    })),
  },
  {
    label: "Community",
    links: [
      { name: "Events", href: "/events" },
      { name: "Leaflet", href: "/leaflet" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Get Involved",
    links: [
      { name: "Volunteer", href: "/volunteer" },
      { name: "Support", href: "/membership" },
    ],
  },
];

export function FooterSection() {
  const [socialHover, setSocialHover] = React.useState<number | null>(null);

  return (
    <footer className="bg-sparkles-cream">
      <div className="px-8 max-[767px]:px-4">
        <div className="z-[2] w-full max-w-[1800px] mx-auto">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="flex justify-between gap-4 max-[991px]:flex-col max-[991px]:gap-16">
              <div className="flex flex-col gap-12 justify-start items-start max-[991px]:gap-10">
                <a href="/" className="h-12 block">
                  <img
                    loading="lazy"
                    alt=""
                    src="https://byqsupply-components.netlify.app/skeletons/footer/images/SkeletonsLogo.svg"
                    className="h-full"
                  />
                </a>

                <div className="mb-0 flex flex-col justify-start items-start w-full">
                  <form className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-3">
                      <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                        Subscribe for our newsletter
                      </div>

                      <div className="relative max-w-[28.5rem] w-full">
                        <input
                          className="
                            w-full min-h-12 mb-0 px-4 py-2 border border-sparkles-warm rounded-2xl
                            bg-sparkles-warm text-sparkles-navy text-xs leading-4
                            placeholder:text-sparkles-muted focus:outline-none focus:border-sparkles-navy
                          "
                          maxLength={256}
                          name="Email"
                          placeholder="Email"
                          type="email"
                          id="footer-email"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex flex-col justify-center items-center w-[3.4375rem] max-[479px]:w-[2.8125rem] pr-4 pl-4">
                          <input
                            type="submit"
                            className="absolute inset-0 bg-transparent cursor-pointer pr-6 opacity-0 w-full"
                            value=""
                            aria-label="Subscribe"
                          />
                          <div className="flex justify-center items-center h-6 max-[479px]:h-3 text-sparkles-navy pointer-events-none">
                            <svg
                              width="100%"
                              height="100%"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="font-body text-xs leading-4 font-normal text-sparkles-muted">
                      Unsubscribe at any time.
                    </div>
                  </form>
                </div>
              </div>

              <div className="flex gap-16 max-[767px]:flex-wrap max-[767px]:gap-y-12">
                {linkColumns.map((column) => (
                  <div key={column.label} className="flex w-fit flex-col gap-8 shrink-0">
                    <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-muted">
                      {column.label}
                    </div>
                    <div className="flex flex-col gap-3">
                      {column.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="font-body text-sm leading-5 font-normal text-sparkles-navy no-underline"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-20 max-[767px]:mt-12">
              <div className="py-8 border-t border-b border-sparkles-navy/30">
                <div className="flex flex-wrap justify-between items-center gap-12 max-[479px]:gap-2">
                  <div className="flex items-center gap-8 max-[479px]:flex-col max-[479px]:items-start max-[479px]:justify-start">
                    <div className="flex items-center gap-3">
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noreferrer"
                        className={`transition-colors duration-200 ${socialHover === 0 ? "text-sparkles-navy" : "text-sparkles-muted"}`}
                        onMouseEnter={() => setSocialHover(0)}
                        onMouseLeave={() => setSocialHover(null)}
                        aria-label="Facebook"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_byq_footer_fb)">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M0 12.067C0 18.033 4.333 22.994 10 24v-8.667H7V12h3V9.333c0-3 1.933-4.666 4.667-4.666.866 0 1.8.133 2.666.266V8H15.8c-1.467 0-1.8.733-1.8 1.667V12h3.2l-.533 3.333H14V24c5.667-1.006 10-5.966 10-11.933C24 5.43 18.6 0 12 0S0 5.43 0 12.067z"
                              fill="currentColor"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_byq_footer_fb">
                              <rect width="24" height="24" fill="currentColor" />
                            </clipPath>
                          </defs>
                        </svg>
                      </a>

                      <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noreferrer"
                        className={`transition-colors duration-200 ${socialHover === 1 ? "text-sparkles-navy" : "text-sparkles-muted"}`}
                        onMouseEnter={() => setSocialHover(1)}
                        onMouseLeave={() => setSocialHover(null)}
                        aria-label="YouTube"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_byq_footer_yt)">
                            <g clipPath="url(#clip1_byq_footer_yt)">
                              <path
                                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
                                fill="currentColor"
                              />
                              <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#fdf8f1" />
                            </g>
                          </g>
                          <defs>
                            <clipPath id="clip0_byq_footer_yt">
                              <rect width="24" height="24" fill="currentColor" />
                            </clipPath>
                            <clipPath id="clip1_byq_footer_yt">
                              <rect width="24" height="24" fill="currentColor" />
                            </clipPath>
                          </defs>
                        </svg>
                      </a>

                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noreferrer"
                        className={`transition-colors duration-200 ${socialHover === 2 ? "text-sparkles-navy" : "text-sparkles-muted"}`}
                        onMouseEnter={() => setSocialHover(2)}
                        onMouseLeave={() => setSocialHover(null)}
                        aria-label="LinkedIn"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_byq_footer_li)">
                            <g clipPath="url(#clip1_byq_footer_li)">
                              <path
                                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                                fill="currentColor"
                              />
                            </g>
                          </g>
                          <defs>
                            <clipPath id="clip0_byq_footer_li">
                              <rect width="24" height="24" fill="currentColor" />
                            </clipPath>
                            <clipPath id="clip1_byq_footer_li">
                              <rect width="24" height="24" fill="currentColor" />
                            </clipPath>
                          </defs>
                        </svg>
                      </a>
                    </div>

                    <div className="font-body text-xs leading-4 font-normal text-sparkles-navy">
                      © Maple Leaf Community Council 2026, All Rights Reserved
                    </div>
                  </div>

                  <div className="font-body text-xs leading-4 font-normal text-sparkles-navy">
                    Built by{" "}
                    <a
                      href="https://www.midwesternoriginals.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sparkles-navy underline"
                    >
                      MWO
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <p className="m-0 font-body text-xs leading-4 font-normal text-sparkles-muted">
                Maple Leaf Community Council is a nonprofit organization operating out of Seattle, Washington. We are
                not affiliated with the City of Seattle, King County, or the State of Washington in any way. We aim
                to operate in compliance with all applicable Washington state requirements for nonprofit organizations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;

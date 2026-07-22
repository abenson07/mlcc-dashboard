"use client";

import * as React from "react";
import Link from "next/link";
import { COMMITTEE_CONTENT, COMMITTEE_LISTINGS } from "@marketing/data/committees";
import { getApiBase } from "@/lib/apiBase";

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
      { name: "Shop", href: "/shop/2026-summer-social-shirt" },
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
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    try {
      const response = await fetch(`${getApiBase()}/api/public/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="global.footer"
      data-editable-label="Footer"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="z-[2] w-full max-w-[1800px] mx-auto">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="flex justify-between gap-4 max-[991px]:flex-col max-[991px]:gap-16">
              <div className="flex flex-col gap-12 justify-start items-start max-[991px]:gap-10">
                <a href="/" className="h-12 block">
                  <img
                    loading="lazy"
                    alt="Maple Leaf Community Council"
                    src="/logo_black.svg"
                    className="h-full"
                  />
                </a>

                <div className="mb-0 flex flex-col justify-start items-start w-full">
                  <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
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
                          disabled={status === "submitting"}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex flex-col justify-center items-center w-[3.4375rem] max-[479px]:w-[2.8125rem] pr-4 pl-4">
                          <input
                            type="submit"
                            className="absolute inset-0 bg-transparent cursor-pointer pr-6 opacity-0 w-full disabled:cursor-not-allowed"
                            value=""
                            aria-label="Subscribe"
                            disabled={status === "submitting"}
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
                      {status === "success"
                        ? "Thanks for subscribing!"
                        : status === "error"
                          ? "Something went wrong. Please try again."
                          : "Unsubscribe at any time."}
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
                        href="https://www.facebook.com/MapleLeafCC/"
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
                        href="https://www.instagram.com/mapleleafcommunitycouncil/"
                        target="_blank"
                        rel="noreferrer"
                        className={`transition-colors duration-200 ${socialHover === 1 ? "text-sparkles-navy" : "text-sparkles-muted"}`}
                        onMouseEnter={() => setSocialHover(1)}
                        onMouseLeave={() => setSocialHover(null)}
                        aria-label="Instagram"
                      >
                        <svg width="24" height="24" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_byq_footer_ig)">
                            <path
                              d="M6 1.081c1.603 0 1.792.006 2.425.035 1.627.074 2.387.847 2.461 2.461.029.633.034.822.034 2.425 0 1.604-.005 1.792-.034 2.425-.075 1.613-.833 2.387-2.461 2.461-.633.029-.82.035-2.425.035-1.603 0-1.792-.006-2.425-.035C1.948 10.814 1.188 10.04 1.114 8.427 1.085 7.794 1.08 7.605 1.08 6.002c0-1.604.006-1.792.035-2.425C1.189 1.964 1.949 1.19 3.575 1.116 4.209 1.087 4.397 1.081 6 1.081zM6 0C4.37 0 4.166.007 3.527.036 1.345.138.138 1.343.036 3.527.007 4.166 0 4.37 0 6s.007 1.835.036 2.473C.138 10.655 1.343 11.862 3.527 11.964 4.166 11.993 4.37 12 6 12s1.835-.007 2.473-.036c2.181-.102 3.39-1.307 3.491-3.491C11.993 7.835 12 7.63 12 6s-.007-1.834-.036-2.473C11.863 1.347 10.657.138 8.473.036 7.835.007 7.63 0 6 0zm0 2.919a3.081 3.081 0 100 6.162 3.081 3.081 0 000-6.162zM6 8a2 2 0 110-4 2 2 0 010 4zm3.202-5.872a.72.72 0 100 1.44.72.72 0 000-1.44z"
                              fill="currentColor"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_byq_footer_ig">
                              <rect width="12" height="12" fill="currentColor" />
                            </clipPath>
                          </defs>
                        </svg>
                      </a>

                      <a
                        href="https://us.nextdoor.com/pages/maple-leaf-community-council-seattle-wa/"
                        target="_blank"
                        rel="noreferrer"
                        className={`transition-colors duration-200 ${socialHover === 2 ? "text-sparkles-navy" : "text-sparkles-muted"}`}
                        onMouseEnter={() => setSocialHover(2)}
                        onMouseLeave={() => setSocialHover(null)}
                        aria-label="Nextdoor"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 4 H9 V11 L15 4 H18 V20 H15 V13 L9 20 H6 Z" fill="currentColor" />
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

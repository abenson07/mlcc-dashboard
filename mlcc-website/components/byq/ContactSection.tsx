"use client";

import * as React from "react";

const inputClassName =
  "mb-3 min-h-12 w-full rounded-lg border border-sparkles-warm bg-white px-4 py-2 font-body text-base leading-6 text-sparkles-navy/90 placeholder:text-sparkles-muted focus:border-sparkles-navy focus:text-sparkles-navy focus:outline-none";

const contactTiles = [
  {
    label: "City Council",
    value: "council@seattle.gov",
    href: "mailto:council@seattle.gov",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        <path d="m16 19 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Friends of Maple Leaf Park",
    value: "fomlp@gmail.com",
    href: "mailto:fomlp@gmail.com",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
        <path d="M15 5.764v15" />
        <path d="M9 3.236v15" />
      </svg>
    ),
  },
  {
    label: "Parks Department",
    value: "+1 289 876 2331",
    secondaryValue: "parks@seattle.gov",
    href: "tel:+12898762331",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2a9 9 0 0 1 9 9" />
        <path d="M13 6a5 5 0 0 1 5 5" />
        <path d="M16.9 16.9c-1.4 1.4-3.1 1.8-4.5 1.1l-4.4-2.2-3.5 3.5a1 1 0 0 1-1.4 0l-1.3-1.3a1 1 0 0 1 0-1.4l3.5-3.5-2.2-4.4c-.7-1.4-.3-3.1 1.1-4.5" />
      </svg>
    ),
  },
  {
    label: "Transit Department",
    value: "Mon - Fri: 8AM - 8PM",
    phone: "+1 289 876 2331",
    secondaryValue: "transit@seattle.gov",
    href: "tel:+12898762331",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6v6l-4-2" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    label: "P.O. Box",
    value: "PO NUMBER HERE",
    href: "/committees",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Email",
    value: "hello@mapleleafcommunity.org",
    href: "mailto:hello@mapleleafcommunity.org",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 12h6" />
        <path d="M12 9v6" />
      </svg>
    ),
  },
];

export function ContactSection({ title }: { title: string }) {
  const [submitHovered, setSubmitHovered] = React.useState(false);

  return (
    <section className="bg-sparkles-cream">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="grid items-stretch gap-12 [grid-template-columns:1fr_auto_1fr] max-[991px]:grid-cols-1">
              <div className="flex w-full flex-col gap-16">
                <div className="flex max-w-[35.25rem] flex-col items-start justify-start gap-6 max-[767px]:w-full max-[767px]:max-w-none">
                  <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                    Contact
                  </h2>

                  <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                    If you need something, let us know, we&apos;ll do our best to help. We&apos;re a volunteer
                    organization, so it may take us some time to get back to you.
                  </p>
                  <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                    If you need more immediate help, refer to the contacts below.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-[767px]:grid-cols-1">
                  {contactTiles.map((tile) => (
                    <a
                      key={`${tile.label}-${tile.value}`}
                      href={tile.href}
                      className="flex flex-col justify-between gap-12 rounded-xl bg-sparkles-warm p-6 text-sparkles-navy no-underline"
                    >
                      <div className="flex h-8 w-8 flex-none items-center justify-center text-sparkles-navy">
                        {tile.icon}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                          {tile.label}
                        </div>
                        <div className="font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night max-[767px]:text-xl max-[767px]:leading-6">
                          {tile.value}
                        </div>
                        {"phone" in tile && tile.phone ? (
                          <div className="font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night max-[767px]:text-xl max-[767px]:leading-6">
                            {tile.phone}
                          </div>
                        ) : null}
                        {"secondaryValue" in tile && tile.secondaryValue ? (
                          <div className="font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night max-[767px]:text-xl max-[767px]:leading-6">
                            {tile.secondaryValue}
                          </div>
                        ) : null}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="h-[53rem] w-px bg-sparkles-navy/16 max-[991px]:h-px max-[991px]:w-full" />

              <div className="w-full max-w-[35.25rem] pt-12 max-[991px]:max-w-none">
                <div className="mb-16 max-w-[28rem]">
                  <h3 className="m-0 font-display text-[2.5rem] leading-[2.75rem] font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                    {title}
                  </h3>
                </div>

                <form id="contact-form" name="contact-form" method="get">
                  <div className="mb-0">
                    <div className="mb-0 grid grid-cols-2 gap-4 max-[479px]:grid-cols-1">
                      <input
                        className={inputClassName}
                        maxLength={256}
                        name="Input-Field"
                        placeholder="First Name"
                        type="text"
                        id="contact-first-name"
                      />
                      <input
                        className={inputClassName}
                        maxLength={256}
                        name="Phone"
                        placeholder="Phone"
                        type="tel"
                        id="contact-phone"
                      />
                    </div>
                    <input
                      className={inputClassName}
                      maxLength={256}
                      name="Email"
                      placeholder="Email"
                      type="email"
                      id="contact-email"
                    />
                  </div>

                  <div className="mb-0">
                    <textarea
                      className={`${inputClassName} min-h-[21.375rem] resize-y pt-3`}
                      maxLength={5000}
                      name="Message"
                      placeholder="Message"
                      id="contact-message"
                    />
                  </div>

                  <input
                    type="submit"
                    value="Submit"
                    onMouseEnter={() => setSubmitHovered(true)}
                    onMouseLeave={() => setSubmitHovered(false)}
                    className={`
                      mt-3 cursor-pointer rounded-[2rem] border px-4 py-3 font-display text-sm leading-5 font-bold
                      text-sparkles-cream transition-all duration-300
                      ${submitHovered ? "border-sparkles-navy/90 bg-sparkles-navy/90" : "border-sparkles-navy bg-sparkles-navy"}
                    `}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;

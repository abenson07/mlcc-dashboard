"use client";

import * as React from "react";
import Link from "next/link";

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#clip0_footer_fb)">
      <path d="M16 8.05C16 3.603 12.418 0 8 0S0 3.603 0 8.05c0 4.017 2.926 7.348 6.75 7.95V10.38H4.719V8.05H6.75V6.276c0-2.017 1.194-3.131 3.022-3.131.875 0 1.79.157 1.79.157v1.98h-1.008c-.994 0-1.304.62-1.304 1.257V8.05h2.219l-.355 2.33H9.25V16c3.824-.602 6.75-3.933 6.75-7.95z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_footer_fb">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#clip0_footer_x)">
      <path fillRule="evenodd" clipRule="evenodd" d="M0 0h16v16H0V0zm9.38 6.772L15.27 0h-1.393L8.757 5.878 4.81 0H0l6.19 9.01L0 16h1.393l5.415-6.3L11.19 16H16L9.38 6.772zm-1.916 2.228L6.98 7.9 1.92 1.04h1.9l3.34 4.78 .484 1.1 4.04 5.78h-1.9l-3.32-4.7z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_footer_x">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 12 12" fill="none">
    <g clipPath="url(#clip0_footer_ig)">
      <path d="M6 1.081c1.603 0 1.792.006 2.425.035 1.627.074 2.387.847 2.461 2.461.029.633.034.822.034 2.425 0 1.604-.005 1.792-.034 2.425-.075 1.613-.833 2.387-2.461 2.461-.633.029-.82.035-2.425.035-1.603 0-1.792-.006-2.425-.035C1.948 10.814 1.188 10.04 1.114 8.427 1.085 7.794 1.08 7.605 1.08 6.002c0-1.604.006-1.792.035-2.425C1.189 1.964 1.949 1.19 3.575 1.116 4.209 1.087 4.397 1.081 6 1.081zM6 0C4.37 0 4.166.007 3.527.036 1.345.138.138 1.343.036 3.527.007 4.166 0 4.37 0 6s.007 1.835.036 2.473C.138 10.655 1.343 11.862 3.527 11.964 4.166 11.993 4.37 12 6 12s1.835-.007 2.473-.036c2.181-.102 3.39-1.307 3.491-3.491C11.993 7.835 12 7.63 12 6s-.007-1.834-.036-2.473C11.863 1.347 10.657.138 8.473.036 7.835.007 7.63 0 6 0zm0 2.919a3.081 3.081 0 100 6.162 3.081 3.081 0 000-6.162zM6 8a2 2 0 110-4 2 2 0 010 4zm3.202-5.872a.72.72 0 100 1.44.72.72 0 000-1.44z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_footer_ig">
        <rect width="12" height="12" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 12 12" fill="none">
    <path d="M2.686 1.333C2.686 1.98 2.176 2.5 1.343 2.5 .549 2.5 .039 1.98 .039 1.333.039.667.549.167 1.343.167c.833 0 1.343.5 1.343 1.166zM.078 3.833h2.549V12H.078V3.833zm3.961 0H6.51v1.127h.039c.353-.667 1.216-1.294 2.5-1.294 2.667 0 3.157 1.755 3.157 4.039V12H9.647V8.167c0-.98-.02-2.245-1.373-2.245-1.373 0-1.588 1.07-1.588 2.176V12H4.039V3.833z" fill="currentColor" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 32 32" fill="none">
    <path d="M16 3L4 8v8c0 7.18 5.16 13.9 12 15.5C22.84 29.9 28 23.18 28 16V8L16 3z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 16l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 32 32" fill="none">
    <path d="M22 28v-2a6 6 0 00-6-6H8a6 6 0 00-6 6v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30 28v-2a6 6 0 00-4-5.65M20 4.35a6 6 0 010 11.3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.5 20.5L9 30l7-4 7 4-1.5-9.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function UnderlineAnimatedLink({
  href,
  children,
  className = "",
  target,
  small = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  small?: boolean;
}) {
  const [hovered, setHovered] = React.useState(false);
  const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");

  const content = (
    <>
      {children}
      <div className={`absolute left-0 right-0 bottom-0 overflow-hidden ${small ? "h-px" : "h-0.5"}`}>
        <div
          className="absolute inset-0 bg-[#0d1526] w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: hovered ? "translateX(0%)" : "translateX(-100%)" }}
        />
      </div>
    </>
  );

  const classNames = `relative inline-block no-underline text-[#0d1526] ${className}`;

  if (isExternal || href.startsWith("#")) {
    return (
      <a
        href={href}
        target={target}
        className={classNames}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={classNames}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {content}
    </Link>
  );
}

function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={href}
      className="no-underline text-sm leading-5 font-normal transition-colors duration-300 max-[767px]:text-xs max-[767px]:leading-4"
      style={{ color: hovered ? "#381d0f" : "#0d1526a3" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
}

function SocialLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-4 h-4 shrink-0 flex justify-center items-center no-underline transition-all duration-300"
      style={{
        color: hovered ? "#381d0f" : "#0d1526a3",
        opacity: hovered ? 0.5 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex justify-center items-center w-full h-full">{children}</div>
    </a>
  );
}

const featureCards = [
  {
    icon: <ShieldIcon />,
    title: "NYC Licensed & Insured",
    description: "Fully compliant with local regulations.",
  },
  {
    icon: <UsersIcon />,
    title: "1,200+ recurring clients",
    description: "Across Manhattan, Brooklyn & Queens.",
  },
  {
    icon: <AwardIcon />,
    title: "Top Rated 2025",
    description: "Recognized by Cleaners NYC Awards",
  },
];

const pageLinks = [
  { label: "About", href: "#" },
  { label: "Services", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Blog Article", href: "/blog/nyc-apartment-cleaning-checklist-room-by-room-guide" },
  { label: "Book Cleaning", href: "#" },
  { label: "FAQ", href: "#" },
];

const serviceLinks = [
  "Home Cleaning",
  "Deep Cleaning",
  "Window Cleaning",
  "Post-Reno Cleaning",
  "Move-in / Move-out Cleaning",
  "Short-term Rental Cleaning",
  "Office & Studio Cleaning",
];

export function FooterSection() {
  return (
    <footer className="bg-[#fdf8f1] font-[family-name:var(--font-bricolage)]">
      <section className="bg-[#fdf8f1] pt-20 max-[767px]:pt-3">
        <div className="px-8 max-[767px]:px-4">
          <div className="z-[2] w-full max-w-[1800px] mx-auto">
            <div className="grid grid-cols-3 gap-4 max-[991px]:grid-cols-1 max-[767px]:gap-3">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-[#f2ece5] rounded-2xl p-6 flex justify-start items-start gap-6 max-[767px]:p-5 max-[767px]:gap-5"
                >
                  <div className="bg-white text-sparkles-accent rounded-3xl p-4 shrink-0 flex justify-center items-center max-[767px]:rounded-[20px] max-[767px]:p-3">
                    <div className="w-8 h-8 flex justify-center items-center max-[767px]:w-6 max-[767px]:h-6">{card.icon}</div>
                  </div>
                  <div className="flex flex-col gap-2 justify-start items-start">
                    <div className="text-xl leading-7 font-semibold text-[#0d1526] m-0 max-[767px]:text-base max-[767px]:leading-6">
                      {card.title}
                    </div>
                    <div className="text-[#0d1526] max-[767px]:text-sm">{card.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="z-[1] w-full pt-4 pb-20 bg-[#fdf8f1] max-[767px]:pt-3 max-[767px]:pb-4">
        <div className="px-8 max-[767px]:px-4">
          <div className="z-[2] w-full max-w-[1800px] mx-auto">
            <div className="bg-[#f2ece5] rounded-3xl p-8 flex flex-col gap-[8.25rem] max-[767px]:p-6 max-[767px]:px-4 max-[767px]:gap-10">
              <div className="grid grid-cols-2 gap-4 max-[767px]:flex max-[767px]:flex-col max-[767px]:gap-10">
                <div className="flex flex-col gap-[120px]">
                  <div className="flex flex-col gap-6 justify-start items-start relative max-[767px]:gap-5">
                    <div className="flex flex-col gap-2 justify-start items-start">
                      <div className="font-[family-name:var(--font-bricolage)] text-[0.625rem] leading-3 font-bold uppercase tracking-[0.047rem] text-[#0d1526a3] max-[767px]:text-[0.5rem] max-[767px]:leading-[0.625rem]">
                        Address
                      </div>
                      <div className="text-xl leading-7 font-semibold text-[#0d1526] m-0 max-[767px]:text-base max-[767px]:leading-6">
                        Sparkles NYC <br />
                        123 East 77th Street <br />
                        New York, NY 10075
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 justify-start items-start">
                      <div className="font-[family-name:var(--font-bricolage)] text-[0.625rem] leading-3 font-bold uppercase tracking-[0.047rem] text-[#0d1526a3] max-[767px]:text-[0.5rem] max-[767px]:leading-[0.625rem]">
                        Phone
                      </div>
                      <UnderlineAnimatedLink href="tel:(212)555-0198">
                        <div className="text-xl leading-7 font-semibold text-[#0d1526] m-0 max-[767px]:text-base max-[767px]:leading-6">
                          (212) 555-0198
                        </div>
                      </UnderlineAnimatedLink>
                    </div>
                    <div className="flex flex-col gap-2 justify-start items-start">
                      <div className="font-[family-name:var(--font-bricolage)] text-[0.625rem] leading-3 font-bold uppercase tracking-[0.047rem] text-[#0d1526a3] max-[767px]:text-[0.5rem] max-[767px]:leading-[0.625rem]">
                        Email
                      </div>
                      <UnderlineAnimatedLink href="mailto:hi@sparkles.byq">
                        <div className="text-xl leading-7 font-semibold text-[#0d1526] m-0 max-[767px]:text-base max-[767px]:leading-6">
                          hi@sparkles.byq
                        </div>
                      </UnderlineAnimatedLink>
                    </div>
                  </div>
                </div>

                <div className="max-[767px]:order-first">
                  <div className="grid grid-cols-2 gap-4 place-items-start max-[767px]:flex max-[767px]:flex-wrap max-[767px]:gap-3 max-[767px]:w-full">
                    <div className="flex flex-col gap-5 shrink-0 max-[767px]:gap-4">
                      <div className="font-[family-name:var(--font-bricolage)] text-[0.625rem] leading-3 font-bold uppercase tracking-[0.047rem] text-[#0d1526a3] max-[767px]:text-[0.5rem] max-[767px]:leading-[0.625rem]">
                        Pages
                      </div>
                      <div className="flex flex-col gap-1 justify-start items-start">
                        {pageLinks.map((item) => (
                          <UnderlineAnimatedLink key={item.label} href={item.href} small>
                            <div className="text-[#0d1526] text-sm leading-5">{item.label}</div>
                          </UnderlineAnimatedLink>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-5 shrink-0 max-[767px]:gap-4">
                      <div className="font-[family-name:var(--font-bricolage)] text-[0.625rem] leading-3 font-bold uppercase tracking-[0.047rem] text-[#0d1526a3] max-[767px]:text-[0.5rem] max-[767px]:leading-[0.625rem]">
                        <strong>Services</strong>
                      </div>
                      <div className="flex flex-col gap-1 justify-start items-start">
                        {serviceLinks.map((service) => (
                          <UnderlineAnimatedLink key={service} href="#" small>
                            <div className="text-[#0d1526] text-sm leading-5">{service}</div>
                          </UnderlineAnimatedLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link href="/" className="w-full inline-block no-underline">
                  <img
                    loading="lazy"
                    src="https://byqsupply-components.netlify.app/sparkles/images/logo-footer.svg"
                    alt="Sparkles logo"
                    className="w-full block"
                  />
                </Link>

                <div className="flex justify-between items-center gap-6 flex-wrap max-[767px]:gap-8">
                  <div className="flex flex-wrap justify-start items-center gap-6 max-[767px]:gap-5 max-[479px]:gap-4">
                    <LegalLink href="#">Changelog</LegalLink>
                    <LegalLink href="#">Licenses</LegalLink>
                    <LegalLink href="#">Style Guide</LegalLink>
                    <LegalLink href="#">404</LegalLink>
                    <LegalLink href="#">Password</LegalLink>
                  </div>

                  <div className="flex justify-between items-center gap-8 max-[767px]:gap-6 max-[479px]:flex-wrap max-[479px]:gap-5">
                    <div className="text-sm leading-5 text-[#0d1526a3] max-[767px]:text-xs max-[767px]:leading-4">
                      ©{" "}
                      <a href="https://www.byq.studio/" target="_blank" rel="noopener noreferrer" className="no-underline text-[#0d1526a3]">
                        BYQ Studio
                      </a>{" "}
                      powered by{" "}
                      <a href="https://www.webflow.com/" target="_blank" rel="noopener noreferrer" className="no-underline text-[#0d1526a3]">
                        Webflow
                      </a>
                    </div>
                    <div className="flex justify-start items-center gap-4 max-[767px]:gap-3">
                      <SocialLink href="https://facebook.com">
                        <FacebookIcon />
                      </SocialLink>
                      <SocialLink href="https://facebook.com">
                        <XIcon />
                      </SocialLink>
                      <SocialLink href="https://instagram.com">
                        <InstagramIcon />
                      </SocialLink>
                      <SocialLink href="https://linkedin.com">
                        <LinkedInIcon />
                      </SocialLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

export default FooterSection;

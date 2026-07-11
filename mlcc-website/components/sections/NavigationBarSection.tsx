"use client";

import * as React from "react";
import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";

const services = [
  "Home Cleaning",
  "Deep Cleaning",
  "Window Cleaning",
  "Post-Reno Cleaning",
  "Move-in / Move-out Cleaning",
  "Short-term Rental Cleaning",
  "Office & Studio Cleaning",
];

const serviceCards = [
  {
    title: "Home Cleaning",
    img: "https://byqsupply-components.netlify.app/sparkles/images/ServicesImage1.jpg",
    srcset:
      "https://byqsupply-components.netlify.app/sparkles/images/ServicesImage1-p-500.jpg 500w, https://byqsupply-components.netlify.app/sparkles/images/ServicesImage1-p-800.jpg 800w, https://byqsupply-components.netlify.app/sparkles/images/ServicesImage1.jpg 996w",
  },
  {
    title: "Deep Cleaning",
    img: "https://byqsupply-components.netlify.app/sparkles/images/ServicesImage2.jpg",
    srcset:
      "https://byqsupply-components.netlify.app/sparkles/images/ServicesImage2-p-500.jpg 500w, https://byqsupply-components.netlify.app/sparkles/images/ServicesImage2-p-800.jpg 800w, https://byqsupply-components.netlify.app/sparkles/images/ServicesImage2.jpg 996w",
  },
  {
    title: "Window Cleaning",
    img: "https://byqsupply-components.netlify.app/sparkles/images/ServicesImage3.jpg",
    srcset:
      "https://byqsupply-components.netlify.app/sparkles/images/ServicesImage3-p-500.jpg 500w, https://byqsupply-components.netlify.app/sparkles/images/ServicesImage3-p-800.jpg 800w, https://byqsupply-components.netlify.app/sparkles/images/ServicesImage3.jpg 996w",
  },
];

export function NavigationBarSection() {
  const [servicesOpen, setServicesOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [bookHovered, setBookHovered] = React.useState(false);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[999]"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="template.nav"
      data-editable-label="Navigation Bar (Template)"
    >
      <nav
        role="banner"
        className="relative z-[5] py-4 px-8 max-[767px]:py-3 max-[767px]:px-4 flex items-center justify-between gap-6 bg-[#fdf8f1] w-full"
      >
        <div className="absolute inset-0 bg-[#fdf8f1] w-full h-full max-[991px]:hidden" />

        <div className="relative z-[2] w-full max-w-[1800px] mx-auto flex items-center justify-between gap-6 max-[767px]:gap-5">
          <div className="flex items-center gap-12 max-[767px]:gap-8">
            <Link href="/" className="relative z-[5] w-[140px] max-[767px]:w-[120px] block">
              <img
                loading="eager"
                src="https://byqsupply-components.netlify.app/sparkles/images/sparkles-logo.svg"
                alt="Sparkles"
                className="w-full"
              />
            </Link>

            <div className="max-[991px]:hidden">
              <div className="flex items-center gap-6">
                <div
                  className="relative z-0"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <button
                    type="button"
                    className="flex items-center gap-2 p-0 text-[#0d1526] font-bold bg-transparent border-none cursor-pointer"
                    style={{ fontFamily: "Bricolagegrotesque, Arial, sans-serif" }}
                    onClick={() => setServicesOpen(!servicesOpen)}
                  >
                    <span>Services</span>
                    <div className="flex items-center justify-center w-4 h-4 flex-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={`transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`}
                      >
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>

                  {servicesOpen && (
                    <div className="fixed left-0 right-0 top-auto z-[10] px-8 bg-[#fdf8f1]">
                      <div className="relative z-[2] w-full max-w-[1800px] mx-auto pt-12 pb-8 flex flex-row justify-between items-stretch gap-6">
                        <div className="flex flex-col justify-between items-start gap-8 flex-none">
                          <div className="flex flex-col gap-4">
                            <SectionLabel>services</SectionLabel>
                            <div className="flex flex-col gap-3">
                              {services.map((service) => (
                                <div key={service} className="flex">
                                  <a href="#" className="text-[#0d1526] no-underline inline-block">
                                    <div
                                      className="text-xl font-semibold leading-7"
                                      style={{ fontFamily: "Bricolagegrotesque, Arial, sans-serif" }}
                                    >
                                      {service}
                                    </div>
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                          <a
                            href="#"
                            className="flex items-center gap-1 no-underline text-[#0d1526] hover:text-[#0d1526e0] transition-colors duration-[350ms] uppercase text-lg font-bold"
                            style={{ fontFamily: 'var(--font-decalotype)' }}
                          >
                            <span>Explore all services</span>
                            <div className="w-4 h-4 flex items-center justify-center flex-none">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="100%"
                                height="100%"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M6 12L10 8L6 4"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </a>
                        </div>

                        <div className="max-w-[57rem]">
                          <div className="grid grid-cols-3 gap-4">
                            {serviceCards.map((card) => (
                              <a
                                key={card.title}
                                href="#"
                                className="rounded-2xl w-full max-w-[293px] h-[380px] text-[#fdf8f1] uppercase no-underline block relative overflow-hidden"
                              >
                                <div className="absolute inset-0 z-[3] w-full h-full overflow-hidden">
                                  <img
                                    className="object-cover w-full h-full z-[1]"
                                    src={card.img}
                                    alt=""
                                    sizes="100vw"
                                    loading="lazy"
                                    srcSet={card.srcset}
                                  />
                                </div>
                                <div
                                  className="relative z-[4] w-full h-full flex items-end justify-between gap-8 px-6 pt-6 pb-6"
                                  style={{
                                    backgroundImage:
                                      "linear-gradient(0deg, rgba(13,21,38,0.64), rgba(13,21,38,0) 50%)",
                                    paddingRight: "7.5rem",
                                  }}
                                >
                                  <div
                                    className="text-[2.75rem] leading-[2.5rem] font-bold tracking-[-0.031rem]"
                                    style={{ fontFamily: 'var(--font-decalotype)' }}
                                  >
                                    {card.title}
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-full bg-[#fdf8f1] rounded-bl-3xl rounded-br-3xl -z-[1]" />
                    </div>
                  )}
                </div>

                {["About", "Pricing", "Blog", "FAQ"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-[#0d1526] font-bold no-underline"
                    style={{ fontFamily: "Bricolagegrotesque, Arial, sans-serif" }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-[5] flex items-center gap-2">
            <a
              href="#"
              className="relative flex items-center justify-center gap-1 rounded-[2rem] overflow-clip no-underline transition-all duration-300"
              style={{
                fontFamily: 'var(--font-decalotype)',
                color: bookHovered ? "#fdf8f1" : "#0d1526",
                padding: bookHovered ? "0.75rem 2.25rem 0.75rem 1rem" : "0.75rem 1rem",
                fontSize: "1.125rem",
                lineHeight: "1rem",
                fontWeight: 700,
                letterSpacing: "0",
                textTransform: "uppercase",
                transition: "padding 0.3s, color 0.3s",
              }}
              onMouseEnter={() => setBookHovered(true)}
              onMouseLeave={() => setBookHovered(false)}
            >
              <div className="relative z-[3] pointer-events-none flex-none" style={{ height: "1rem" }}>
                <div className="relative flex items-center gap-1">
                  <div
                    className="flex items-center justify-center absolute right-[-1.5rem] inset-y-0 overflow-hidden transition-all duration-300"
                    style={{
                      opacity: bookHovered ? 1 : 0,
                      transform: bookHovered ? "translate3d(0, 0, 0)" : "translate3d(-1rem, 0, 0)",
                      transition: "opacity 0.3s, transform 0.3s",
                    }}
                  >
                    <div className="pl-2 flex-none">
                      <div className="w-4 h-4 flex items-center justify-center z-[2] relative">
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 12L10 8L6 4"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-[1]">Book cleaning</div>
                </div>
              </div>
              <div
                className="absolute inset-0 rounded-[2rem] border transition-colors duration-300"
                style={{
                  backgroundColor: bookHovered ? "#0d1526" : "#c1cb38",
                  borderColor: bookHovered ? "#0d152600" : "#fdf8f100",
                }}
              />
            </a>

            <button
              type="button"
              className="hidden max-[991px]:flex items-center justify-center p-3 max-[767px]:p-2 border border-[#0d152614] rounded-[1.5rem] bg-[#0d152614] backdrop-blur-[8px] text-[#151515] flex-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <div className="flex items-center justify-center w-4 h-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M9 3L3 9M3 3L9 9"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                <div className="flex items-center justify-center w-4 h-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M1 3H11M1 6H11M1 9H11"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`hidden max-[991px]:block overflow-hidden transition-all duration-300 ${mobileMenuOpen ? "max-h-[100vh]" : "max-h-0"}`}
      >
        <div className="rounded-bl-3xl rounded-br-3xl max-[767px]:rounded-bl-[1.25rem] max-[767px]:rounded-br-[1.25rem] bg-[#fdf8f1]">
          <div className="flex flex-col items-start gap-6 px-8 py-6 max-[767px]:px-4 max-[767px]:py-5 max-[767px]:gap-5">
            <div className="w-full">
              <button
                type="button"
                className="w-full flex items-center justify-between gap-2 bg-transparent border-none cursor-pointer text-[#0d1526] font-bold p-0"
                style={{
                  fontFamily: 'var(--font-decalotype)',
                  fontSize: "3.5rem",
                  lineHeight: "3rem",
                  letterSpacing: "-0.094rem",
                  fontWeight: 700,
                }}
                onClick={() => setServicesOpen(!servicesOpen)}
              >
                <span className="max-[767px]:text-[2.5rem] max-[767px]:leading-8 max-[767px]:tracking-[-0.062rem]">
                  Services
                </span>
                <div className="p-2 rounded-full bg-[#f2ece5] flex items-center justify-center">
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <div className="bg-[#0d1526] w-[90%] h-[2px]" />
                    {!servicesOpen && <div className="bg-[#0d1526] w-[2px] h-[90%] absolute" />}
                  </div>
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${servicesOpen ? "max-h-[500px]" : "max-h-0"}`}
              >
                <div className="pt-6 pb-4 max-[767px]:pt-5 max-[767px]:pb-3 flex flex-col gap-8 max-[767px]:gap-6">
                  <div className="flex flex-col gap-4 max-[767px]:gap-3">
                    <SectionLabel className="self-start">services</SectionLabel>
                    <div className="flex flex-col gap-3 max-[767px]:gap-2">
                      {services.map((service) => (
                        <a key={service} href="#" className="text-[#0d1526] no-underline">
                          <div
                            className="text-xl font-semibold leading-7 max-[767px]:text-base max-[767px]:leading-6"
                            style={{ fontFamily: "Bricolagegrotesque, Arial, sans-serif" }}
                          >
                            {service}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                  <a
                    href="#"
                    className="flex items-center gap-1 no-underline text-[#0d1526] hover:text-[#0d1526e0] transition-colors duration-[350ms] uppercase text-lg font-bold max-[767px]:text-sm max-[767px]:gap-1"
                    style={{ fontFamily: 'var(--font-decalotype)' }}
                  >
                    <span>Explore all services</span>
                    <div className="w-4 h-4 flex items-center justify-center flex-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M6 12L10 8L6 4"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {["About", "Pricing", "Blog", "FAQ"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-[#0d1526] no-underline font-bold"
                style={{
                  fontFamily: 'var(--font-decalotype)',
                  fontSize: "3.5rem",
                  lineHeight: "3rem",
                  letterSpacing: "-0.094rem",
                }}
              >
                <span className="block max-[767px]:text-[2.5rem] max-[767px]:leading-8 max-[767px]:tracking-[-0.062rem]">
                  {link}
                </span>
              </a>
            ))}

            <div className="w-full mt-16 max-[767px]:mt-0 flex items-center justify-between gap-5 max-[479px]:flex-wrap">
              <div
                className="text-sm leading-5 text-[#0d1526a3]"
                style={{ fontFamily: "Bricolagegrotesque, Arial, sans-serif" }}
              >
                ©{" "}
                <a href="https://www.byq.studio/" target="_blank" rel="noopener noreferrer" className="text-[#0d1526a3] no-underline">
                  BYQ Studio
                </a>{" "}
                powered by{" "}
                <a href="https://www.webflow.com/" target="_blank" rel="noopener noreferrer" className="text-[#0d1526a3] no-underline">
                  Webflow
                </a>
              </div>
              <div className="flex items-center gap-4 max-[767px]:gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-4 h-4 flex items-center justify-center text-[#0d1526a3] no-underline transition-all duration-300 hover:opacity-50 hover:text-[#381d0f] flex-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none">
                    <g clipPath="url(#nav_fb)">
                      <path
                        d="M16 8a8 8 0 1 0-9.25 7.903V10.25H4.719V8H6.75V6.238c0-2.005 1.194-3.113 3.022-3.113.875 0 1.79.156 1.79.156v1.969h-1.008c-.994 0-1.304.617-1.304 1.25V8h2.219l-.355 2.25H9.25v5.653A8.002 8.002 0 0 0 16 8z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="nav_fb">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-4 h-4 flex items-center justify-center text-[#0d1526a3] no-underline transition-all duration-300 hover:opacity-50 hover:text-[#381d0f] flex-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none">
                    <g clipPath="url(#nav_tw)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8.52-3.558L5.862 7.9 3.5 4.442H5.3l1.72 2.46 2.42-2.46h1.06L8.04 7.1l2.56 3.9H8.8L6.9 8.3l-2.66 2.7H3.18l2.7-2.74L3.5 4.442h1.8l1.22 1.74zM9.5 10.3l-5.5-7.858H2.5L8 10.3h1.5z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="nav_tw">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-4 h-4 flex items-center justify-center text-[#0d1526a3] no-underline transition-all duration-300 hover:opacity-50 hover:text-[#381d0f] flex-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 12 12" fill="none">
                    <g clipPath="url(#nav_ig)">
                      <path
                        d="M6 1.08c1.603 0 1.792.006 2.424.035 1.688.077 2.476.878 2.553 2.553.029.631.034.82.034 2.424 0 1.603-.005 1.792-.034 2.423-.077 1.674-.863 2.476-2.553 2.553-.632.029-.82.035-2.424.035-1.603 0-1.792-.006-2.423-.035C1.895 10.991 1.107 10.188 1.03 8.515 1.001 7.883.996 7.695.996 6.092c0-1.604.006-1.792.035-2.424C1.108 1.992 1.897 1.19 3.577 1.115 4.208 1.086 4.397 1.08 6 1.08zm0-.972c-1.63 0-1.833.007-2.472.036C1.29 1.24.24 2.288.144 4.528.115 5.167.108 5.37.108 6s.007 1.833.036 2.472c.096 2.238 1.143 3.288 3.384 3.384C4.167 11.885 4.37 11.892 6 11.892s1.833-.007 2.472-.036c2.237-.096 3.288-1.144 3.384-3.384.029-.639.036-.842.036-2.472s-.007-1.833-.036-2.472C11.76 1.29 10.712.24 8.472.144 7.833.115 7.63.108 6 .108zm0 2.622a3.27 3.27 0 1 0 0 6.54 3.27 3.27 0 0 0 0-6.54zm0 5.4a2.13 2.13 0 1 1 0-4.26 2.13 2.13 0 0 1 0 4.26zm3.384-6.21a.765.765 0 1 0 0 1.53.765.765 0 0 0 0-1.53z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="nav_ig">
                        <rect width="12" height="12" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-4 h-4 flex items-center justify-center text-[#0d1526a3] no-underline transition-all duration-300 hover:opacity-50 hover:text-[#381d0f] flex-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.7 1.2a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0zM.3 3.6h2.4V12H.3V3.6zm3.9 0H6.6v1.14h.036C7.02 4.2 7.8 3.48 9 3.48c2.4 0 2.7 1.56 2.7 3.6V12H9.3V7.56c0-.84-.012-1.92-1.2-1.92-1.2 0-1.38.924-1.38 1.86V12H4.2V3.6z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 z-[1] bg-[#0d1526a3] opacity-0 pointer-events-none" />
    </div>
  );
}

export default NavigationBarSection;

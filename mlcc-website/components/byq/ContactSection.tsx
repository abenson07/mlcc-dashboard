"use client";

import * as React from "react";

const CONTACT_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/6913dbb252ed363168221ae6_Maple_Leaf.jpg";

const inputClassName =
  "w-full rounded-lg border border-sparkles-warm bg-white px-4 py-3 font-body text-base leading-6 text-sparkles-navy/90 placeholder:text-sparkles-muted focus:border-sparkles-navy focus:text-sparkles-navy focus:outline-none";

type ContactItem = {
  id: number;
  title: string;
  detail: string;
  secondaryDetail?: string;
  href: string;
  icon: React.ReactNode;
};

const contactItems: ContactItem[] = [
  {
    id: 1,
    title: "City Council",
    detail: "council@seattle.gov",
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
    id: 2,
    title: "Friends of Maple Leaf Park",
    detail: "fomlp@gmail.com",
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
    id: 3,
    title: "Parks Department",
    detail: "+1 289 876 2331",
    secondaryDetail: "parks@seattle.gov",
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
    id: 4,
    title: "Transit Department",
    detail: "Mon - Fri: 8AM - 8PM",
    secondaryDetail: "transit@seattle.gov",
    href: "tel:+12898762331",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6v6l-4-2" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    id: 5,
    title: "P.O. Box",
    detail: "PO NUMBER HERE",
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
    id: 6,
    title: "Email",
    detail: "hello@mapleleafcommunity.org",
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

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3.33594 7.9987L12.0026 7.9987M8.0026 3.33203L12.6693 7.9987L8.0026 12.6654"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useInView<T extends HTMLElement>(threshold = 0.1) {
  const ref = React.useRef<T>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

export function ContactSection({ title = "Contact" }: { title?: string }) {
  const parallaxRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const onScroll = () => {
      const el = parallaxRef.current;
      const parent = el?.parentElement;
      if (!el || !parent) return;
      const rect = parent.getBoundingClientRect();
      const progress = -rect.top / window.innerHeight;
      el.style.transform = `translateY(${progress * 60}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [cardRef, cardVisible] = useInView<HTMLDivElement>(0.1);
  const [headlineRef, headlineVisible] = useInView<HTMLDivElement>(0.1);
  const [listRef, listVisible] = useInView<HTMLDivElement>(0.05);

  const [mapHovered, setMapHovered] = React.useState(false);
  const [submitHovered, setSubmitHovered] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent("Website contact form");
    const body = encodeURIComponent(`From: ${email}\n\n${message}`);
    window.location.href = `mailto:hello@mapleleafcommunity.org?subject=${subject}&body=${body}`;
  };

  return (
    <section className="relative overflow-hidden bg-sparkles-cream">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="grid grid-cols-2 gap-12 max-[991px]:grid-cols-1 max-[991px]:gap-8">
              {/* LEFT COLUMN */}
              <div className="relative">
                <div className="relative h-[42.5rem] overflow-hidden rounded-2xl max-[991px]:h-[30rem] max-[767px]:h-[22.5rem]">
                  <img
                    ref={parallaxRef}
                    src={CONTACT_IMAGE}
                    loading="lazy"
                    alt="Maple Leaf neighborhood"
                    className="-mt-10 h-[calc(100%+5rem)] w-full object-cover object-center"
                  />
                </div>

                <div
                  className={`absolute right-6 bottom-6 left-6 rounded-2xl bg-sparkles-cream p-6 transition-all duration-700 ease-out max-[767px]:p-4 ${
                    cardVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: "200ms" }}
                  ref={cardRef}
                >
                  <div className="mb-6">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 flex-none rounded-full bg-sparkles-blue" />
                      <span className="font-body text-xs font-bold tracking-[0.0625rem] text-sparkles-navy uppercase">
                        Our neighborhood
                      </span>
                    </div>
                    <p className="m-0 font-body text-sm leading-6 text-sparkles-navy/80">
                      The Maple Leaf Community Council serves the Maple Leaf neighborhood in
                      northeast Seattle — your local voice for parks, transit, and community.
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <p className="m-0 font-display text-lg leading-snug font-bold text-puget-night">
                      Maple Leaf
                      <br />
                      Seattle, WA
                    </p>
                    <a
                      href="https://www.google.com/maps/place/Maple+Leaf,+Seattle,+WA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-none items-center gap-2 font-display text-sm font-bold text-sparkles-navy no-underline"
                      onMouseEnter={() => setMapHovered(true)}
                      onMouseLeave={() => setMapHovered(false)}
                    >
                      <span>Show on map</span>
                      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sparkles-blue text-sparkles-navy">
                        <span
                          className="transition-transform duration-300 ease-out"
                          style={{ transform: mapHovered ? "translateX(2rem)" : "translateX(0)" }}
                        >
                          <ArrowIcon />
                        </span>
                        <span
                          className="absolute transition-transform duration-300 ease-out"
                          style={{ transform: mapHovered ? "translateX(0)" : "translateX(-2rem)" }}
                        >
                          <ArrowIcon />
                        </span>
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="flex flex-col justify-center">
                <div
                  ref={headlineRef}
                  className={`mb-8 transition-all duration-700 ease-out ${
                    headlineVisible ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-sm"
                  }`}
                >
                  <div className="mb-5 border-t border-sparkles-navy/16" />
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-2 w-2 flex-none rounded-full bg-sparkles-blue" />
                    <span className="font-body text-xs font-bold tracking-[0.0625rem] text-sparkles-navy uppercase">
                      {title}
                    </span>
                  </div>
                  <h2 className="m-0 font-display text-[3.5rem] leading-tight font-bold tracking-[-0.125rem] text-puget-night max-[991px]:text-5xl max-[767px]:text-4xl">
                    Let&apos;s stay in touch
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="mb-10 flex flex-col gap-3">
                  <input
                    className={inputClassName}
                    type="email"
                    name="email"
                    placeholder="Email"
                    maxLength={256}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <textarea
                    className={`${inputClassName} min-h-[10rem] resize-y`}
                    name="message"
                    placeholder="Message"
                    maxLength={5000}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <input
                    type="submit"
                    value="Send message"
                    onMouseEnter={() => setSubmitHovered(true)}
                    onMouseLeave={() => setSubmitHovered(false)}
                    className={`mt-1 w-fit cursor-pointer rounded-[2rem] border px-4 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream transition-all duration-300 ${
                      submitHovered ? "border-sparkles-navy/90 bg-sparkles-navy/90" : "border-sparkles-navy bg-sparkles-navy"
                    }`}
                  />
                </form>

                <div ref={listRef}>
                  <div className="border-t border-sparkles-navy/16" />
                  {contactItems.map((item, i) => (
                    <div
                      key={item.id}
                      className={`transition-all duration-700 ease-out ${
                        listVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                      }`}
                      style={{ transitionDelay: `${i * 80}ms` }}
                    >
                      <a
                        href={item.href}
                        className="flex items-center justify-between gap-4 py-4 no-underline"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="font-display text-sm font-bold text-puget-night">
                            {item.title}
                          </div>
                          <div className="font-body text-sm text-sparkles-navy/70">
                            {item.detail}
                            {item.secondaryDetail ? (
                              <>
                                <span className="px-2 opacity-50">·</span>
                                <span>{item.secondaryDetail}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-sparkles-blue text-sparkles-navy">
                          <div className="flex h-6 w-6 items-center justify-center">{item.icon}</div>
                        </div>
                      </a>
                      <div className="border-t border-sparkles-navy/16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;

"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";

const events = [
  {
    image: "https://byqsupply-components.netlify.app/sparkles/images/BlogImage1.jpg",
    srcset:
      "https://byqsupply-components.netlify.app/sparkles/images/BlogImage1-p-500.jpg 500w, https://byqsupply-components.netlify.app/sparkles/images/BlogImage1-p-800.jpg 800w, https://byqsupply-components.netlify.app/sparkles/images/BlogImage1.jpg 1080w",
    date: "March 15, 2026",
    title: "Spring Community Clean-Up Day",
  },
  {
    image: "https://byqsupply-components.netlify.app/sparkles/images/BlogImage2.jpg",
    srcset:
      "https://byqsupply-components.netlify.app/sparkles/images/BlogImage2-p-500.jpg 500w, https://byqsupply-components.netlify.app/sparkles/images/BlogImage2-p-800.jpg 800w, https://byqsupply-components.netlify.app/sparkles/images/BlogImage2.jpg 1080w",
    date: "April 8, 2026",
    title: "NYC Apartment Organizing Workshop",
  },
  {
    image: "https://byqsupply-components.netlify.app/sparkles/images/BlogImage3.jpg",
    srcset:
      "https://byqsupply-components.netlify.app/sparkles/images/BlogImage3-p-500.jpg 500w, https://byqsupply-components.netlify.app/sparkles/images/BlogImage3-p-800.jpg 800w, https://byqsupply-components.netlify.app/sparkles/images/BlogImage3.jpg 1080w",
    date: "May 2, 2026",
    title: "Eco-Friendly Cleaning Tips Live Session",
  },
  {
    image: "https://byqsupply-components.netlify.app/sparkles/images/BlogImage4.jpg",
    srcset:
      "https://byqsupply-components.netlify.app/sparkles/images/BlogImage4-p-500.jpg 500w, https://byqsupply-components.netlify.app/sparkles/images/BlogImage4-p-800.jpg 800w, https://byqsupply-components.netlify.app/sparkles/images/BlogImage4.jpg 1080w",
    date: "June 12, 2026",
    title: "Move-Out Cleaning Prep Seminar",
  },
  {
    image: "https://byqsupply-components.netlify.app/sparkles/images/BlogImage5.jpg",
    srcset:
      "https://byqsupply-components.netlify.app/sparkles/images/BlogImage5-p-500.jpg 500w, https://byqsupply-components.netlify.app/sparkles/images/BlogImage5-p-800.jpg 800w, https://byqsupply-components.netlify.app/sparkles/images/BlogImage5.jpg 1080w",
    date: "July 20, 2026",
    title: "Summer Deep Clean Open House",
  },
  {
    image: "https://byqsupply-components.netlify.app/sparkles/images/BlogImage6.jpg",
    srcset:
      "https://byqsupply-components.netlify.app/sparkles/images/BlogImage6-p-500.jpg 500w, https://byqsupply-components.netlify.app/sparkles/images/BlogImage6-p-800.jpg 800w, https://byqsupply-components.netlify.app/sparkles/images/BlogImage6.jpg 1080w",
    date: "August 5, 2026",
    title: "Back-to-School Home Reset Event",
  },
];

function ReadMoreLink() {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className={`
        flex justify-start items-center gap-1 cursor-pointer no-underline
        font-display text-lg leading-4 font-bold uppercase
        transition-colors duration-[350ms]
        max-[767px]:text-sm max-[767px]:leading-4
        ${hovered ? "text-sparkles-navy/88" : "text-sparkles-navy"}
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>View event</div>
      <div className="w-4 h-4 shrink-0 flex justify-center items-center">
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
    </div>
  );
}

function EventCard({ event }: { event: (typeof events)[0] }) {
  return (
    <a href="#" className="flex flex-col w-full gap-6 no-underline text-sparkles-navy max-[767px]:gap-6">
      <div className="w-full h-[27.5rem] overflow-hidden rounded-3xl max-[767px]:h-[22rem]">
        <img
          className="w-full h-full object-cover"
          src={event.image}
          alt=""
          sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px"
          srcSet={event.srcset}
          loading="eager"
        />
      </div>

      <div className="flex flex-col justify-start items-start gap-8 max-[767px]:gap-6">
        <div className="flex flex-col justify-start items-start gap-4 max-[767px]:gap-3">
          <div className="font-body text-sm leading-5 font-normal max-[767px]:text-xs max-[767px]:leading-4">
            {event.date}
          </div>
          <div className="font-display text-[2.75rem] leading-10 font-bold tracking-[-0.031rem] max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
            {event.title}
          </div>
        </div>
        <ReadMoreLink />
      </div>
    </a>
  );
}

export function BlogGridHeaderSection() {
  const headlineRef = React.useRef<HTMLDivElement>(null);
  const [headlineVisible, setHeadlineVisible] = React.useState(false);

  React.useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadlineVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      className="py-40 bg-sparkles-cream max-[767px]:py-24"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="template.blog-grid-header"
      data-editable-label="Blog Grid Header (Template)"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="z-[2] w-full max-w-[1800px] mx-auto">
          <div
            ref={headlineRef}
            className={`
              flex flex-col justify-start items-center text-center mx-auto mb-20 max-w-[42.5rem] gap-8
              transition-all duration-700 ease-out
              max-[767px]:gap-6 max-[767px]:mb-12
              ${headlineVisible ? "opacity-100 blur-0" : "opacity-0 blur-[12px]"}
            `}
          >
            <SectionLabel>Events</SectionLabel>

            <h1 className="z-[1] m-0 font-display text-[6.5rem] leading-[5.5rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[4rem] max-[767px]:leading-12 max-[767px]:tracking-[-0.125rem]">
              UPCOMING EVENTS &amp; WORKSHOPS
            </h1>

            <div className="max-w-[28rem]">
              <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                Join us for community clean-ups, home care workshops, and live sessions with our NYC cleaning team.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-4 gap-y-12 max-[991px]:grid-cols-2 max-[479px]:grid-cols-1 max-[767px]:gap-x-3 max-[767px]:gap-y-8">
            {events.map((event, i) => (
              <EventCard key={i} event={event} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogGridHeaderSection;

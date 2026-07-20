import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";

const FEATURE_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f1e1da163ec47328051_summer_social_2024-39.webp";

const features = [
  {
    title: "Make an impact locally",
    text: "Help shape the events, programs, and advocacy that neighbors experience every day, from the Summer Social to the Leaflet on your doorstep.",
    icon: (
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
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Meet your neighbors",
    text: "Committees are where familiar faces become friends. Many current board members and volunteers started by showing up to one event or conversation.",
    icon: (
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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Flexible commitment",
    text: "Help plan one event, deliver newsletters a few times a year, or dive into ongoing work. There’s room for every schedule and every level of experience.",
    icon: (
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
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    title: "Learn as you go",
    text: "No expertise required. Experienced volunteers share what they know, and the council supports neighbors who want to try something new for the community.",
    icon: (
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
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
] as const;

export function CommitteesValueFeaturesSection() {
  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="committees.value-features"
      data-editable-label="Committees Value Features"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-20 flex max-w-[42.5rem] flex-col items-start gap-6 max-[767px]:mb-16">
              <SectionLabel>Get involved</SectionLabel>
              <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                A little time goes a long way in Maple Leaf
              </h2>
            </div>

            <div className="grid grid-cols-2 items-stretch gap-x-[7.5rem] gap-y-[7.5rem] max-[991px]:gap-x-12 max-[991px]:gap-y-12 max-[767px]:grid-cols-1">
              <img
                src={FEATURE_IMAGE}
                alt="Neighbors enjoying the Summer Social in Maple Leaf"
                loading="lazy"
                className="h-full w-full max-h-[40rem] rounded-xl object-cover max-[767px]:max-h-[26rem]"
              />

              <div className="flex max-w-[35.25rem] flex-col gap-16 max-[767px]:max-w-none">
                {features.map((feature) => (
                  <div key={feature.title} className="flex flex-col gap-6">
                    <div className="flex flex-row items-center gap-4">
                      <div className="flex h-8 w-8 flex-none items-center justify-center text-sparkles-navy">
                        {feature.icon}
                      </div>
                      <div className="font-display text-2xl font-bold leading-7 tracking-[-0.03125rem] text-puget-night">
                        {feature.title}
                      </div>
                    </div>
                    <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                      {feature.text}
                    </p>
                  </div>
                ))}

                <Link
                  href="/volunteer"
                  className="inline-flex w-fit items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
                >
                  Find a way to volunteer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CommitteesValueFeaturesSection;

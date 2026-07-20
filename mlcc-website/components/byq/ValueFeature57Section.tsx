import { SectionLabel } from "@marketing/components/SectionLabel";

function LinkIcon() {
  return (
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const resources = [
  {
    title: "Workshop public materials",
    text: "Slides, notes, and documentation from the Maple Leaf zoning workshops.",
    href: "https://drive.google.com/drive/folders/1wk8NFQJOCYAQDX2H8UnUBM_nr9RyTkYX?usp=sharing",
  },
  {
    title: "Washington State HB 1110",
    text: "A plain-language explainer on the state's 2023 middle housing bill.",
    href: "https://www.sightline.org/2023/01/03/washingtons-2023-middle-housing-bill-explained/",
  },
  {
    title: "City planning resources",
    text: "Seattle OPCD's official One Seattle Plan resources, timeline, and how to comment.",
    href: "https://www.seattle.gov/opcd/one-seattle-plan",
  },
  {
    title: "Seattle Residents for Thoughtful Growth",
    text: "A citywide group focused on thoughtful, community-informed growth.",
    href: "https://www.seattlethoughtfulgrowth.org/",
  },
  {
    title: "The Urbanist",
    text: "Seattle-focused reporting and commentary on housing, land use, and transit.",
    href: "https://www.theurbanist.org/",
  },
];

export function ValueFeature57Section() {
  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="one-seattle-plan.value-feature-3"
      data-editable-label="Value Feature 3"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-20 flex flex-col gap-8">
              <div className="flex w-full max-w-[35.25rem] flex-col items-start gap-6 max-[767px]:max-w-none">
                <SectionLabel>Resources</SectionLabel>
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Where to learn more
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[991px]:grid-cols-2 max-[479px]:grid-cols-1">
              {resources.map((resource) => {
                const isExternal = resource.href.startsWith("http");
                return (
                  <a
                    key={resource.title}
                    href={resource.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="flex flex-col gap-6 rounded-2xl bg-sparkles-warm p-8 text-sparkles-navy no-underline transition-opacity hover:opacity-90"
                  >
                    <div className="flex flex-row items-center gap-4">
                      <div className="h-8 w-8 shrink-0 text-sparkles-navy">
                        <LinkIcon />
                      </div>
                      <div className="font-display text-[1.5rem] leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
                        {resource.title}
                      </div>
                    </div>
                    <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                      {resource.text}
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueFeature57Section;

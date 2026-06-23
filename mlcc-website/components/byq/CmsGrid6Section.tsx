import { SectionLabel } from "@marketing/components/SectionLabel";
const tiles = [
  {
    meta1: "Location:",
    meta2: "On-site",
    meta3: "Part-time",
    title: "Wireframe Architect",
    description:
      "This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of where real words will go.",
  },
  {
    meta1: "Location:",
    meta2: "On-site",
    meta3: "Part-time",
    title: "Placeholder Hero",
    description:
      "This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of where real words will go.",
  },
  {
    meta1: "Location:",
    meta2: "On-site",
    meta3: "Part-time",
    title: "Pixel Skeleton",
    description:
      "This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of where real words will go.",
  },
  {
    meta1: "Location:",
    meta2: "On-site",
    meta3: "Part-time",
    title: "Grid Keeper",
    description:
      "This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of where real words will go.",
  },
  {
    meta1: "Location:",
    meta2: "On-site",
    meta3: "Part-time",
    title: "Layout Surgeon",
    description:
      "This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of where real words will go.",
  },
];

export function CmsGrid6Section() {
  return (
    <section className="bg-sparkles-cream">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="grid gap-8 [grid-template-columns:1fr_1.5fr] max-[767px]:grid-cols-1 max-[767px]:gap-16">
              <div className="flex flex-col items-start justify-start gap-6 max-[767px]:col-span-1">
                <SectionLabel>Label placeholder</SectionLabel>
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Headline skeleton placeholder
                </h2>
              </div>

              <div
                id="open-positions"
                className="flex flex-col gap-6 border-b border-sparkles-navy/16 pb-8 max-[767px]:col-span-1"
              >
                {tiles.map((tile, index) => (
                  <div key={index} className="flex flex-col gap-4 border-t border-sparkles-navy/16 pt-8">
                    <div className="flex flex-wrap items-center justify-start gap-2">
                      <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                        {tile.meta1}
                      </div>
                      <div className="flex items-center justify-start gap-2">
                        <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                          {tile.meta2}
                        </div>
                        <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                          |
                        </div>
                        <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                          {tile.meta3}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-6">
                      <div className="font-display text-[2rem] leading-10 font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[1.75rem] max-[767px]:leading-8">
                        {tile.title}
                      </div>
                      <a
                        href="/template/style-guide"
                        className="inline-flex shrink-0 items-center justify-center rounded-[2rem] border border-sparkles-navy/30 bg-white/50 px-4 py-3 font-display text-sm leading-5 font-bold text-puget-night no-underline transition-all duration-300 hover:border-white/10 hover:bg-sparkles-navy/90 hover:text-sparkles-cream"
                      >
                        Secondary
                      </a>
                    </div>

                    <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                      {tile.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CmsGrid6Section;

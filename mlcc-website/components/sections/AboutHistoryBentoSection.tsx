import { SectionLabel } from "@marketing/components/SectionLabel";

const HISTORY_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp";
const MEETING_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d6d_community-meeting.webp";
const PARADE_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2c3441277b54461fac94_IMG_6554.jpg";

export function AboutHistoryBentoSection() {
  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="about.history-bento"
      data-editable-label="About History Bento"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-20 flex flex-col gap-8 max-[767px]:mb-12 max-[767px]:gap-6">
              <div className="h-0 w-full border-b border-dashed border-sparkles-navy/20" />
              <SectionLabel>Our history</SectionLabel>
              <h2 className="m-0 max-w-[40rem] font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                Decades of neighbors showing up for Maple Leaf
              </h2>
              <p className="m-0 max-w-[42.5rem] font-body text-base leading-6 text-sparkles-navy">
                The council has been part of Maple Leaf long enough that many neighbors experience
                it not as an organization, but simply as part of life here — a parade in the fall, a
                newsletter at the door, a summer gathering. What&apos;s easy to miss is that none of
                it happens on its own.
              </p>
            </div>

            <div
              className="grid grid-cols-4 gap-4 max-[991px]:grid-cols-2 max-[479px]:grid-cols-1"
              style={{ gridTemplateRows: "auto auto" }}
            >
              <div className="flex flex-col justify-between gap-6 overflow-hidden rounded-2xl bg-sparkles-warm p-8">
                <span className="font-body text-xs font-bold uppercase tracking-[0.0625rem] text-sparkles-navy/60">
                  Since the 1990s
                </span>
                <div className="flex flex-col gap-4">
                  <p className="m-0 font-display text-[3rem] font-bold leading-none tracking-[-0.125rem] text-puget-night max-[767px]:text-[2.5rem]">
                    30+
                  </p>
                  <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
                    years of the Summer Social bringing neighbors together in the park.
                  </p>
                </div>
              </div>

              <div
                className="overflow-hidden rounded-2xl max-[991px]:row-span-2 max-[479px]:h-[18.75rem]"
                style={{ gridRow: "span 2" }}
              >
                <img
                  src={HISTORY_IMAGE}
                  alt="The Maple Leaf Leaflet — Seattle's last printed neighborhood newsletter"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between gap-6 overflow-hidden rounded-2xl bg-sparkles-warm p-8">
                <span className="font-body text-xs font-bold uppercase tracking-[0.0625rem] text-sparkles-navy/60">
                  Door to door
                </span>
                <div className="flex flex-col gap-4">
                  <p className="m-0 font-display text-[3rem] font-bold leading-none tracking-[-0.125rem] text-puget-night max-[767px]:text-[2.5rem]">
                    50+
                  </p>
                  <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
                    volunteers deliver the printed Leaflet to every doorstep each issue.
                  </p>
                </div>
              </div>

              <div className="h-[19rem] overflow-hidden rounded-2xl max-[479px]:h-[15rem]">
                <img
                  src={MEETING_IMAGE}
                  alt="Neighbors at a Maple Leaf community meeting"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="h-[19rem] overflow-hidden rounded-2xl max-[479px]:h-[15rem]">
                <img
                  src={PARADE_IMAGE}
                  alt="Families at the Maple Leaf Halloween Parade"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="relative col-span-2 flex flex-col justify-between gap-6 overflow-hidden rounded-2xl bg-sparkles-navy p-8 text-sparkles-cream max-[991px]:col-span-1">
                <span className="font-body text-xs font-bold uppercase tracking-[0.0625rem] text-sparkles-cream/70">
                  Built by neighbors
                </span>
                <div className="flex flex-col gap-4">
                  <p className="m-0 font-display text-[3rem] font-bold leading-none tracking-[-0.125rem] max-[767px]:text-[2.5rem]">
                    4,500+
                  </p>
                  <p className="m-0 font-body text-base leading-6 text-sparkles-cream/90">
                    neighbors attend MLCC events each year — roughly everyone who lives in Maple Leaf.
                    Past board members, route volunteers, and quiet supporters have carried these
                    traditions forward for generations.
                  </p>
                </div>
                <div
                  className="pointer-events-none absolute -bottom-24 -right-24 h-[25rem] w-[25rem] rounded-full border border-dashed border-sparkles-cream/30 max-[479px]:-bottom-16 max-[479px]:-right-16 max-[479px]:h-[9.75rem] max-[479px]:w-[9.75rem]"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutHistoryBentoSection;

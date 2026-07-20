import { SectionLabel } from "@marketing/components/SectionLabel";

const LEFT_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d6d_community-meeting.webp";
const RIGHT_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69540779dacfe8969b3b1a95_summer_social_2024-1%201.webp";

export function CommitteesHeroSection() {
  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="committees.hero"
      data-editable-label="Committees Hero"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div className="grid gap-12 [grid-template-columns:1.5fr_1fr] max-[991px]:grid-cols-1">
              <div className="col-start-1 row-start-1 flex max-w-[42.5rem] flex-col items-start gap-6">
                <SectionLabel>What committees do</SectionLabel>
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Neighbors organized around what matters most
                </h2>
              </div>

              <div className="col-start-1 row-start-2 mt-20 max-w-[35.25rem] max-[991px]:mt-0 max-[767px]:max-w-none">
                <div className="h-[22.5rem] w-full overflow-hidden rounded-2xl max-[479px]:h-[18.75rem]">
                  <img
                    loading="lazy"
                    alt="Neighbors gathered at a Maple Leaf community meeting"
                    src={LEFT_IMAGE}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="col-start-1 row-start-3 mt-20 max-w-[28rem] max-[991px]:mt-0 max-[767px]:max-w-none">
                <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-navy">
                  Committees are how the Maple Leaf Community Council gets things done. Each team
                  focuses on a part of neighborhood life: events, the newsletter, advocacy,
                  communications, emergency preparedness, and local business. Volunteers plan
                  gatherings, share information, and represent Maple Leaf with city partners. You
                  don&apos;t need a special résumé, just curiosity and a willingness to show up.
                </p>
              </div>

              <div className="col-start-2 row-start-1 row-span-3 self-start max-[991px]:col-start-1 max-[991px]:row-start-auto max-[991px]:row-span-1">
                <div className="h-[38.75rem] w-full overflow-hidden rounded-2xl max-[991px]:h-[35rem] max-[767px]:h-[28rem] max-[479px]:h-[25rem]">
                  <img
                    loading="lazy"
                    alt="Neighbors at a Maple Leaf community gathering"
                    src={RIGHT_IMAGE}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CommitteesHeroSection;

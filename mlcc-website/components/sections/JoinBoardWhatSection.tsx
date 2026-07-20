import { SectionLabel } from "@marketing/components/SectionLabel";

const responsibilities = [
  {
    title: "Set direction for the council",
    text: "The board decides what the community council focuses on, from sustaining traditions like the Leaflet and Summer Social to supporting new neighbor-led ideas. Committees do the day-to-day work; the board keeps everyone aligned.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f1e1da163ec47328051_summer_social_2024-39.webp",
  },
  {
    title: "Support the people doing the work",
    text: "Board members recruit committee leads, mentor volunteers, and make sure the organization's memory doesn't depend on whoever happened to be in the room. It's leadership that looks like reliability and follow-through.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d22bb2d6d_community-meeting.webp",
  },
  {
    title: "Represent Maple Leaf thoughtfully",
    text: "From community meetings to conversations with city officials, the board gives neighbors a consistent voice on local issues: zoning, street safety, emergency preparedness, and what it means to grow as a neighborhood.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/6913dbb252ed363168221ae6_Maple_Leaf.jpg",
  },
];

export function JoinBoardWhatSection() {
  return (
    <section
      className="bg-sparkles-warm"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="join-the-board.what"
      data-editable-label="Join The Board What"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-16 flex flex-col items-center gap-6 text-center max-[767px]:mb-12 max-[767px]:gap-5">
              <SectionLabel>What the board does</SectionLabel>
              <h2 className="m-0 max-w-[42.5rem] font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                What keeps neighbor-led work going
              </h2>
              <p className="m-0 max-w-[35.25rem] font-body text-base leading-6 text-sparkles-navy">
                The executive board isn&apos;t a separate layer above the neighborhood; it&apos;s
                neighbors who stepped up to steward what Maple Leaf has built together. Here&apos;s
                the short version of what that involves.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[991px]:grid-cols-1">
              {responsibilities.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col overflow-hidden rounded-2xl bg-sparkles-cream"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-3 px-6 py-6">
                    <h3 className="m-0 font-display text-[1.5rem] font-bold leading-8 tracking-[-0.03125rem] text-puget-night">
                      {item.title}
                    </h3>
                    <p className="m-0 font-body text-base leading-6 text-sparkles-muted">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JoinBoardWhatSection;

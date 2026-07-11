import { SectionLabel } from "@marketing/components/SectionLabel";

const reasons = [
  {
    title: "Reach neighbors where they live",
    text: "The Leaflet is Seattle's last printed neighborhood newsletter. Your story lands on doorsteps across Maple Leaf — not buried in a feed.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp",
  },
  {
    title: "Celebrate what makes Maple Leaf, Maple Leaf",
    text: "Block parties, new businesses, quiet acts of kindness, advocacy wins — the Leaflet is how we remember what this neighborhood is building together.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f1e1da163ec47328051_summer_social_2024-39.webp",
  },
  {
    title: "No polish required",
    text: "A few paragraphs and a photo from your phone is plenty. Volunteers on the Newsletter committee help shape submissions into print-ready stories.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d22bb2d6d_community-meeting.webp",
  },
];

export function SubmitStoryWhySection() {
  return (
    <section
      className="bg-sparkles-warm"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="submit-story.why"
      data-editable-label="Submit Story Why"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-16 flex flex-col items-center gap-6 text-center max-[767px]:mb-12 max-[767px]:gap-5">
              <SectionLabel>Why share a story</SectionLabel>
              <h2 className="m-0 max-w-[42.5rem] font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                Your corner of the neighborhood deserves to be heard
              </h2>
              <p className="m-0 max-w-[35.25rem] font-body text-base leading-6 text-sparkles-navy">
                Most neighbors first meet the community council through the Leaflet. When you share what
                you&apos;ve seen, heard, or helped make happen, you&apos;re adding to a tradition that
                has connected Maple Leaf for decades.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[991px]:grid-cols-1">
              {reasons.map((reason) => (
                <div
                  key={reason.title}
                  className="flex flex-col overflow-hidden rounded-2xl bg-sparkles-cream"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={reason.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-3 px-6 py-6">
                    <h3 className="m-0 font-display text-[1.5rem] font-bold leading-8 tracking-[-0.03125rem] text-puget-night">
                      {reason.title}
                    </h3>
                    <p className="m-0 font-body text-base leading-6 text-sparkles-muted">
                      {reason.text}
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

export default SubmitStoryWhySection;

import { SectionLabel } from "@marketing/components/SectionLabel";

const benefits = [
  {
    title: "Events you won't want to miss",
    text: "Early word on Summer Social, Movie Nights, the Halloween Parade, community meetings, and volunteer open houses.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f1e1da163ec47328051_summer_social_2024-39.webp",
  },
  {
    title: "Neighborhood news that matters",
    text: "Highlights from the Leaflet — Seattle's last printed neighborhood newsletter — plus updates on local projects and council decisions.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp",
  },
  {
    title: "Ways to get involved",
    text: "Calls for volunteers, committee openings, and advocacy updates when your voice can make a difference in Maple Leaf.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2ef4da00327d5e0c5403_love-your-neighbor.webp",
  },
];

export function SubscribeBenefitsSection() {
  return (
    <section
      className="bg-sparkles-warm"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="subscribe.benefits"
      data-editable-label="Subscribe Benefits"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-16 flex flex-col items-center gap-6 text-center max-[767px]:mb-12 max-[767px]:gap-5">
              <SectionLabel>What you&apos;ll receive</SectionLabel>
              <h2 className="m-0 max-w-[42.5rem] font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                The neighborhood in your inbox
              </h2>
              <p className="m-0 max-w-[35.25rem] font-body text-base leading-6 text-sparkles-navy">
                Our email list is how neighbors hear about what&apos;s happening before it hits the
                doorstep. No spam — just the updates that help you stay part of Maple Leaf.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[991px]:grid-cols-1">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex flex-col overflow-hidden rounded-2xl bg-sparkles-cream"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={benefit.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-3 px-6 py-6">
                    <h3 className="m-0 font-display text-[1.5rem] font-bold leading-8 tracking-[-0.03125rem] text-puget-night">
                      {benefit.title}
                    </h3>
                    <p className="m-0 font-body text-base leading-6 text-sparkles-muted">
                      {benefit.text}
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

export default SubscribeBenefitsSection;

import { SectionLabel } from "@marketing/components/SectionLabel";

function BuildingIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 21V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v17M14 9h4a1 1 0 0 1 1 1v11M9 7h1M9 11h1M9 15h1M18 13h1M18 17h1M3 21h18" />
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-6M9 10a3 3 0 1 1 1.5-5.6A3 3 0 0 1 15 6a3 3 0 0 1 1.9 5.3A3 3 0 0 1 15 16H9a3 3 0 0 1-1.9-5.3A3 3 0 0 1 9 10Z" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 6.5c0-1.93-2.24-3.5-5-3.5s-5 1.57-5 3.5 2.24 3.5 5 3.5 5 1.57 5 3.5-2.24 3.5-5 3.5-5-1.57-5-3.5" />
    </svg>
  );
}

const features = [
  {
    icon: <BuildingIcon />,
    title: "Density & design",
    text: "Height and design standards for buildings coming to Maple Leaf.",
  },
  {
    icon: <TreeIcon />,
    title: "Trees & green space",
    text: "Protecting canopy and open space as the neighborhood grows.",
  },
  {
    icon: <DollarIcon />,
    title: "Affordability",
    text: "Keeping Maple Leaf attainable for current and future residents.",
  },
];

export function VisionSection() {
  return (
    <section
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="one-seattle-plan.vision"
      data-editable-label="Our Vision"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="grid grid-cols-2 gap-20 max-[991px]:grid-cols-1 max-[767px]:gap-12">
              <div className="relative h-[42rem] w-full overflow-hidden rounded-xl max-[991px]:h-[30rem] max-[767px]:h-[22.5rem]">
                <img
                  loading="lazy"
                  alt=""
                  src="/images/one-seattle/tree-canopy.jpeg"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex w-full max-w-[32rem] flex-col justify-between gap-16 max-[767px]:gap-10">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col items-start gap-4">
                    <SectionLabel>Our vision</SectionLabel>
                    <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                      Growth that still feels like Maple Leaf
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-sparkles-navy/16 pt-8">
                    <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                      Zoning workshops gave neighbors a real seat at the table before decisions were made, not after.
                    </p>
                    <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                      We built shared language around density, trees, and affordability so Maple Leaf could grow on its own terms.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 max-[767px]:grid-cols-1">
                  {features.map((feature) => (
                    <div key={feature.title} className="flex flex-col items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sparkles-warm text-sparkles-navy">
                        <div className="h-5 w-5">{feature.icon}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="font-body text-sm leading-5 font-bold text-puget-night">
                          {feature.title}
                        </div>
                        <p className="m-0 font-body text-sm leading-5 font-normal text-sparkles-navy">
                          {feature.text}
                        </p>
                      </div>
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

export default VisionSection;

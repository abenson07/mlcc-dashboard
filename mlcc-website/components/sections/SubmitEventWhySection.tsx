import { SectionLabel } from "@marketing/components/SectionLabel";

const reasons = [
  {
    title: "Help neighbors find each other",
    text: "The events calendar is where people discover block parties, book clubs, meetings, and gatherings they might otherwise miss. Your submission keeps that list useful.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530e8b1aadf47968a6eb09_summer_social_2024-62%20(1).webp",
  },
  {
    title: "Support what’s already happening",
    text: "You don’t have to run the event yourself. If something community-minded is coming up in Maple Leaf, sharing it helps the right people show up.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b30685a1f306acdc73283_IMG_6862.jpg",
  },
  {
    title: "Quick to submit, easy to review",
    text: "Date, location, and a short description are enough to get started. Volunteers review submissions and follow up if anything needs clarification.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d22bb2d6d_community-meeting.webp",
  },
];

export function SubmitEventWhySection() {
  return (
    <section
      className="bg-sparkles-warm"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="submit-event.why"
      data-editable-label="Submit Event Why"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-16 flex flex-col items-center gap-6 text-center max-[767px]:mb-12 max-[767px]:gap-5">
              <SectionLabel>Why submit an event</SectionLabel>
              <h2 className="m-0 max-w-[42.5rem] font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                Maple Leaf is better when neighbors know what&apos;s on
              </h2>
              <p className="m-0 max-w-[35.25rem] font-body text-base leading-6 text-sparkles-navy">
                From the Summer Social to a quiet meetup at a local shop, gatherings are how this
                neighborhood stays connected. Listing your event helps more people take part.
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

export default SubmitEventWhySection;

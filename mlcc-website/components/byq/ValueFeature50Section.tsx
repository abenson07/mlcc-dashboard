const cards = [
  {
    title: "Bone Frame",
    text: "This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of where real words will go.",
    image:
      "https://byqsupply-components.netlify.app/skeletons/value-features/images/ValueFeatures50Widget.svg",
    className: "bg-sparkles-warm text-sparkles-navy",
  },
  {
    title: "Hollow Shell",
    text: "This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of where real words will go.",
    image:
      "https://byqsupply-components.netlify.app/skeletons/value-features/images/ValueFeatures50Widget2.svg",
    className: "bg-sparkles-warm text-sparkles-navy",
  },
  {
    title: "Silent Spine",
    text: "This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of where real words will go.",
    image:
      "https://byqsupply-components.netlify.app/skeletons/value-features/images/ValueFeatures50Widget3.svg",
    className: "bg-sparkles-navy text-sparkles-cream",
  },
];

export function ValueFeature50Section() {
  return (
    <section className="bg-sparkles-cream">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-20 flex flex-col gap-6 max-[767px]:mb-12">
              <div className="w-full max-w-[42.5rem] max-[767px]:max-w-none">
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Headline skeleton placeholder exists only to structure your layout
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[991px]:grid-cols-2 max-[767px]:grid-cols-1">
              {cards.map((card) => (
                <div
                  key={card.title}
                  className={`flex w-full flex-col items-start justify-start gap-16 rounded-2xl p-8 ${card.className}`}
                >
                  <div className="flex flex-col items-start justify-start gap-6">
                    <div className="font-display text-[2rem] leading-10 font-bold tracking-[-0.0625rem] max-[767px]:text-[1.75rem] max-[767px]:leading-8">
                      {card.title}
                    </div>
                    <p className="m-0 font-body text-base leading-6 font-normal">{card.text}</p>
                  </div>
                  <img
                    loading="lazy"
                    alt=""
                    src={card.image}
                    className="h-full w-full max-[767px]:object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueFeature50Section;

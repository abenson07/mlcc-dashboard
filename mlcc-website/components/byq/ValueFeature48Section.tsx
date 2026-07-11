import { SectionLabel } from "@marketing/components/SectionLabel";
import type { CommitteeFeatureCard } from "@marketing/data/committees";

type ValueFeature48SectionProps = {
  label: string;
  headline: string;
  cards: CommitteeFeatureCard[];
};

export function ValueFeature48Section({ label, headline, cards }: ValueFeature48SectionProps) {
  return (
    <section
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="template.value-feature-48"
      data-editable-label="Value Feature 48 (Template)"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="w-full max-w-[1800px] mx-auto">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-20 max-[767px]:mb-12">
              <div className="text-center">
                <div className="mx-auto flex max-w-[42.5rem] flex-col items-center gap-6 max-[767px]:gap-5">
                  <SectionLabel>{label}</SectionLabel>
                  <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                    {headline}
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 place-items-stretch gap-4 max-[991px]:grid-cols-2 max-[767px]:grid-cols-1">
              {cards.map((card) => (
                <div
                  key={card.title}
                  className="flex w-full flex-col overflow-hidden rounded-2xl bg-sparkles-warm text-center"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-3 px-6 py-6">
                    <div className="font-display text-[2rem] leading-10 font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[1.75rem] max-[767px]:leading-8">
                      {card.title}
                    </div>
                    <div className="font-body text-base leading-6 font-normal text-sparkles-muted">
                      {card.text}
                    </div>
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

export default ValueFeature48Section;

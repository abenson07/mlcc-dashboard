import { getUpcomingEvents } from "@marketing/data/events";
import { EventCard } from "@marketing/components/byq/EventCard";
import { SectionLabel } from "@marketing/components/SectionLabel";

export function CmsGrid12Section({ title }: { title: string }) {
  const events = getUpcomingEvents();
  return (
    <div
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="events.cms-grid"
      data-editable-label="Events CMS Grid"
    >
      <section className="bg-sparkles-cream pb-[10rem] pt-[10rem] max-[767px]:pb-20 max-[767px]:pt-20">
        <div className="px-8 max-[767px]:px-4">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="mb-16 flex flex-col items-start gap-6">
              <SectionLabel>Community</SectionLabel>
              <h1 className="m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                {title}
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-8 max-[991px]:grid-cols-2 max-[767px]:grid-cols-1">
              {events.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CmsGrid12Section;

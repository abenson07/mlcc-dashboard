const articleImage =
  "https://byqsupply-components.netlify.app/skeletons/cms-grid/images/pattern-vertical-new.svg";

const articles = [
  {
    title: "Article skeleton title placeholder for layout demonstration only",
    date: "May 24, 2025",
  },
  {
    title: "Temporary article headline keeping structure alive before publishing",
    date: "May 24, 2025",
  },
  {
    title: "Skeleton article heading exists here until real words replace it",
    date: "May 24, 2025",
  },
  {
    title: "Skeleton article heading exists here until real words replace it",
    date: "May 24, 2025",
  },
  {
    title: "Skeleton article heading exists here until real words replace it",
    date: "May 24, 2025",
  },
  {
    title: "Skeleton article heading exists here until real words replace it",
    date: "May 24, 2025",
  },
];

export function CmsGrid26Section() {
  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="one-seattle-plan.cms-grid"
      data-editable-label="One Seattle Plan CMS Grid"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="flex flex-col items-stretch gap-20">
              <div className="relative">
                <h2 className="m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                  Headline skeleton placeholder
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-x-4 gap-y-6 max-[991px]:grid-cols-2 max-[479px]:grid-cols-1">
                {articles.map((article, index) => (
                  <a
                    key={index}
                    href="/leaflet/template"
                    className="flex flex-col gap-6 text-sparkles-navy no-underline"
                  >
                    <div className="relative h-[25rem] overflow-hidden rounded-2xl max-[767px]:h-[21.875rem] max-[479px]:h-[18.75rem]">
                      <img
                        loading="lazy"
                        src={articleImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 hidden bg-sparkles-navy/32" />
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="font-body text-[0.625rem] leading-3 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                        {article.date}
                      </div>

                      <div className="max-w-[28rem] max-[991px]:max-w-none">
                        <div className="font-display text-[1.5rem] leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
                          {article.title}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CmsGrid26Section;

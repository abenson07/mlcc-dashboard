import Link from "next/link";
import { getLeafletStory } from "@marketing/data/leaflet-stories";

const articleImage =
  "https://byqsupply-components.netlify.app/skeletons/cms-grid/images/pattern-vertical-new.svg";

const visioningSurvey = getLeafletStory("visioning-survey");
const housingTypes = getLeafletStory("housing-types");
const oneSeattlePlan = getLeafletStory("one-seattle-plan");

const articles = [
  {
    title: "Interested in one particular area of focus? Find materials here.",
    category: "Focus-area Workgroups",
    image: "/images/one-seattle/workgroups.jpg",
    href: "https://drive.google.com/drive/folders/1jWdzllu5VmkefD1LDk4SaBH2XERzjZ6q",
    external: true,
  },
  {
    title: "Curious about the visioning survey for Maple Leaf? Read more here.",
    category: "Neighborhood Visioning Survey",
    image: "/images/one-seattle/visioning.jpeg",
    href: "https://drive.google.com/drive/folders/191T0LAHZ-rb_R6IXhQVc5plB1M7dluAu",
    external: true,
  },
  {
    title: "Want to find out more about each meeting? Dig deep here.",
    category: "Workshop Archives",
    image: "/images/one-seattle/workshop-activities.jpg",
    href: "https://drive.google.com/drive/folders/16JyV5oTSnm2uxrntf7nkX9CHUzEiIlvb",
    external: true,
  },
  {
    title: visioningSurvey?.title ?? "Your Maple Leaf Visioning Survey",
    category: "Zoning Workshop Update",
    image: visioningSurvey?.image ?? articleImage,
    href: "/leaflet/template/visioning-survey",
  },
  {
    title: housingTypes?.title ?? "Housing Types",
    category: "Zoning Workshop Update",
    image: housingTypes?.image ?? articleImage,
    href: "/leaflet/template/housing-types",
  },
  {
    title: oneSeattlePlan?.title ?? "One Seattle Plan: Speak Up for Maple Leaf's Future",
    category: "Zoning Workshop Update",
    image: oneSeattlePlan?.image ?? articleImage,
    href: "/leaflet/template/one-seattle-plan",
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
                  Our work so far...
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-x-4 gap-y-6 max-[991px]:grid-cols-2 max-[479px]:grid-cols-1">
                {articles.map((article) => {
                  const linkProps = article.external
                    ? { href: article.href, target: "_blank", rel: "noopener noreferrer" }
                    : { href: article.href };

                  return (
                    <Link
                      key={article.title}
                      {...linkProps}
                      className="flex flex-col gap-6 text-sparkles-navy no-underline"
                    >
                      <div className="relative h-[25rem] overflow-hidden rounded-2xl max-[767px]:h-[21.875rem] max-[479px]:h-[18.75rem]">
                        <img
                          loading="lazy"
                          src={article.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 hidden bg-sparkles-navy/32" />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="font-body text-[0.625rem] leading-3 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                          {article.category}
                        </div>

                        <div className="max-w-[28rem] max-[991px]:max-w-none">
                          <div className="font-display text-[1.5rem] leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
                            {article.title}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CmsGrid26Section;

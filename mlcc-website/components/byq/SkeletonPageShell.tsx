import { SectionLabel } from "@marketing/components/SectionLabel";
import { CtaSection } from "@marketing/components/byq/CtaSection";

export function SkeletonPageShell({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <>
      <main>
        <section className="py-20 max-[767px]:py-12">
          <div className="px-8 max-[767px]:px-4">
            <div className="w-full max-w-[1800px] mx-auto">
              <div className="max-w-[42.5rem] flex flex-col gap-6">
                <SectionLabel className="self-start">Skeleton page</SectionLabel>
                <h1 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                  {title}
                </h1>
                {description ? (
                  <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
        <CtaSection />
      </main>
    </>
  );
}

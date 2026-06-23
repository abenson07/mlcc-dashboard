import { SectionLabel } from "@marketing/components/SectionLabel";

const PARADE_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2c3441277b54461fac94_IMG_6554.jpg";
const MOVIES_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2928eb2f48f58fa2aef8_movies-tower.webp";

export function AboutFutureIntroSection() {
  return (
    <div className="bg-sparkles-cream text-sparkles-navy">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="grid grid-cols-2 items-start justify-items-center gap-12 max-[767px]:grid-cols-1">
              <div className="flex w-full flex-col items-start justify-start">
                <SectionLabel>Where we&apos;re headed</SectionLabel>

                <img
                  loading="lazy"
                  alt="Families at the Maple Leaf Halloween Parade"
                  src={PARADE_IMAGE}
                  className="
                    mt-[31rem] h-[40rem] w-full max-w-[42.5rem] rounded-2xl object-cover
                    max-[991px]:mt-16 max-[991px]:h-[21.5rem]
                    max-[767px]:max-w-none
                    max-[479px]:mt-8 max-[479px]:hidden
                  "
                />
              </div>

              <div className="flex w-full max-w-[42.5rem] flex-col gap-[7.5rem] max-[767px]:max-w-none max-[479px]:gap-16">
                <div className="flex flex-col gap-6">
                  <h2 className="m-0 font-display text-[2rem] leading-10 font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[1.75rem] max-[767px]:leading-8">
                    Room for what&apos;s next — and for you
                  </h2>
                  <p className="m-0 font-body text-xl leading-7 text-sparkles-navy">
                    Maple Leaf is growing and changing. The council&apos;s job is to hold onto what
                    makes this neighborhood feel like home while making room for new ideas — and new
                    neighbors ready to help carry them forward.
                  </p>
                </div>

                <img
                  loading="lazy"
                  alt="Movies by the Tower in Maple Leaf Park"
                  src={MOVIES_IMAGE}
                  className="z-[1] h-[28.15rem] w-full rounded-2xl object-cover max-[991px]:h-[18.75rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutFutureIntroSection;

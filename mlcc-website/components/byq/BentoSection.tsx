const posterUrl =
  "https://cdn.prod.website-files.com/68a8bac34ba5bc8cee4c21c1%2F695016cbee4099a70a798b6c_Freckled%20Portrait%20Close-Up_poster.0000000.jpg";

const patternImage =
  "https://byqsupply-components.netlify.app/skeletons/bento/images/pattern-vertical-new.svg";

export function BentoSection() {
  return (
    <section className="bg-sparkles-cream text-sparkles-navy">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-20 flex flex-col gap-8">
              <div className="w-full max-w-[42.5rem] max-[767px]:max-w-none">
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Headline skeleton placeholder exists only to structure your layout
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-4 grid-rows-[auto_auto] gap-4 max-[991px]:grid-cols-2 max-[991px]:grid-rows-[auto_auto_auto_auto] max-[479px]:grid-cols-1 max-[479px]:grid-rows-[repeat(7,auto)]">
              <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-xl bg-sparkles-warm p-8">
                <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                  Bone Frame
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night">
                    3,000+
                  </h3>
                  <div className="font-body text-base leading-6 font-normal text-sparkles-navy">
                    This is skeleton super short text.
                  </div>
                </div>
              </div>

              <div className="row-span-2 h-[39rem] overflow-hidden rounded-xl max-[991px]:row-span-1 max-[479px]:h-[18.75rem]">
                <div className="relative z-[2] h-full w-full">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                    style={{ backgroundImage: `url("${posterUrl}")` }}
                  >
                    <source
                      src="https://cdn.prod.website-files.com/68a8bac34ba5bc8cee4c21c1%2F695016cbee4099a70a798b6c_Freckled%20Portrait%20Close-Up_mp4.mp4"
                      type="video/mp4"
                    />
                    <source
                      src="https://cdn.prod.website-files.com/68a8bac34ba5bc8cee4c21c1%2F695016cbee4099a70a798b6c_Freckled%20Portrait%20Close-Up_webm.webm"
                      type="video/webm"
                    />
                  </video>
                </div>
              </div>

              <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-xl bg-sparkles-warm p-8">
                <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                  Hollow Shell
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night">
                    99.7%
                  </h3>
                  <div className="font-body text-base leading-6 font-normal text-sparkles-navy">
                    This is skeleton super short text.
                  </div>
                </div>
              </div>

              <div className="h-[19rem] overflow-hidden rounded-xl bg-sparkles-warm">
                <img loading="lazy" alt="" src={patternImage} className="relative z-[1] h-full w-full object-cover" />
              </div>

              <div className="h-[19rem] overflow-hidden rounded-xl bg-sparkles-warm">
                <img loading="lazy" alt="" src={patternImage} className="relative z-[1] h-full w-full object-cover" />
              </div>

              <div className="relative col-span-2 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-xl bg-sparkles-warm p-8 max-[991px]:col-span-1 max-[479px]:col-span-1">
                <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                  Silent Spine
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night">
                    50+
                  </h3>
                  <div className="font-body text-base leading-6 font-normal text-sparkles-navy">
                    This is skeleton super short text.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BentoSection;

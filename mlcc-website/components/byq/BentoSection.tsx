export function BentoSection() {
  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="one-seattle-plan.bento"
      data-editable-label="Bento"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="grid grid-cols-4 grid-rows-[auto_auto] gap-4 max-[991px]:grid-cols-2 max-[991px]:grid-rows-[auto_auto_auto_auto] max-[479px]:grid-cols-1 max-[479px]:grid-rows-[repeat(7,auto)]">
              <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-xl bg-sparkles-warm p-8">
                <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                  Households
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night">
                    3,490
                  </h3>
                  <div className="font-body text-base leading-6 font-normal text-sparkles-navy">
                    Households in Maple Leaf.
                  </div>
                </div>
              </div>

              <div className="row-span-2 h-[39rem] overflow-hidden rounded-xl max-[991px]:row-span-1 max-[479px]:h-[18.75rem]">
                <img
                  loading="lazy"
                  alt="Maple Leaf Reservoir Park"
                  src="/images/one-seattle/reservoir-park.jpg"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-xl bg-sparkles-warm p-8">
                <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                  Owner / renter split
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night">
                    55/45
                  </h3>
                  <div className="font-body text-base leading-6 font-normal text-sparkles-navy">
                    Owner vs. renter split.
                  </div>
                </div>
              </div>

              <div className="relative flex h-[19rem] flex-col items-start justify-between gap-6 overflow-hidden rounded-xl bg-sparkles-warm p-8">
                <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                  Median age
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night">
                    38
                  </h3>
                  <div className="font-body text-base leading-6 font-normal text-sparkles-navy">
                    Median age of Maple Leaf residents.
                  </div>
                </div>
              </div>

              <div className="relative flex h-[19rem] flex-col items-start justify-between gap-6 overflow-hidden rounded-xl bg-sparkles-warm p-8">
                <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                  Housing mix
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night">
                    68%
                  </h3>
                  <div className="font-body text-base leading-6 font-normal text-sparkles-navy">
                    Single-family homes, with more multifamily housing on the way.
                  </div>
                </div>
              </div>

              <div className="relative col-span-2 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-xl bg-sparkles-warm p-8 max-[991px]:col-span-1 max-[479px]:col-span-1">
                <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                  Neighbors
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night">
                    7,624
                  </h3>
                  <div className="font-body text-base leading-6 font-normal text-sparkles-navy">
                    Neighbors call Maple Leaf home.
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

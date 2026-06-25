export function IntroText12Section({
  headline = "Headline skeleton placeholder exists only to structure your layout",
  body = "This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this placeholder creates a frame that can stand without flesh. It stretches across the page, line after line, showing flow, hierarchy, and balance. You can read it or ignore it, because its only job is to hold the silence. Imagine this copy as scaffolding: strong, temporary, replaceable. Each sentence arrives without purpose, except to suggest weight and movement in the layout. The words lean forward, repeating, echoing, circling around themselves. They are not here to tell a story, only to show where a story could be told.",
}: {
  headline?: string;
  body?: string;
}) {
  return (
    <section className="bg-sparkles-cream">
      <div className="px-8 max-[767px]:px-4">
        <div className="w-full max-w-[1800px] mx-auto">
          <div className="py-40 max-[767px]:py-20">
            <div className="mx-auto flex max-w-[50%] flex-col items-center gap-6 text-center max-[767px]:max-w-none">
              <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                {headline}
              </h2>
              <div className="font-body text-base leading-6 font-normal text-sparkles-navy">
                {body}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IntroText12Section;

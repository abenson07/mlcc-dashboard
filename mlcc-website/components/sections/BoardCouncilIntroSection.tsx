import Link from "next/link";

export function BoardCouncilIntroSection() {
  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="board.council-intro"
      data-editable-label="Board Council Intro"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="border-t border-sparkles-warm py-16 max-[767px]:py-12">
            <p className="m-0 max-w-[42.5rem] font-body text-xl leading-7 font-normal max-[767px]:text-base max-[767px]:leading-6">
              The{" "}
              <Link
                href="/about"
                className="font-semibold text-puget-night underline decoration-sparkles-navy/30 underline-offset-4 transition-colors hover:decoration-sparkles-navy"
              >
                Maple Leaf Community Council
              </Link>{" "}
              is a volunteer-run neighborhood organization. We organize events, publish the Leaflet,
              advocate for Maple Leaf, and help neighbors stay connected. The executive board
              provides the leadership and stewardship that keeps that work going year after year.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BoardCouncilIntroSection;

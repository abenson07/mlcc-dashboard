import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";

const requirements = [
  {
    number: "01",
    title: "Live in Maple Leaf",
    text: "Board members need to be neighbors here — people who experience the same streets, schools, and local changes as the community they represent. They're also dues-paying MLCC members, investing in the same organization they help lead.",
  },
  {
    number: "02",
    title: "Contribute to the work",
    text: "You'll serve on an existing committee or initiative, or bring something new to the neighborhood. Board members stay connected to the volunteer work happening on the ground.",
  },
  {
    number: "03",
    title: "Contribute to the larger vision",
    text: "Executive board members meet monthly to set priorities, support committee leads, and think ahead about where the council is headed. It's work at the leadership level — helping guide the organization, not just keeping tasks moving.",
  },
] as const;

export function JoinBoardRequirementsSection() {
  return (
    <section className="bg-sparkles-cream text-sparkles-navy">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-16 flex flex-col items-center gap-6 text-center max-[767px]:mb-12 max-[767px]:gap-5">
              <SectionLabel>Requirements</SectionLabel>
              <h2 className="m-0 max-w-[42.5rem] font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                What we ask of board members
              </h2>
              <p className="m-0 max-w-[35.25rem] font-body text-base leading-6 text-sparkles-navy">
                Serving on the executive board is a real commitment, but it doesn&apos;t require a
                special résumé. These three expectations keep the board grounded in the neighborhood
                it serves.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[991px]:grid-cols-1">
              {requirements.map((item) => (
                <div
                  key={item.number}
                  className="flex flex-col gap-5 rounded-2xl bg-sparkles-warm p-8 max-[767px]:p-6"
                >
                  <span className="font-display text-sm font-bold uppercase tracking-[0.0625rem] text-sparkles-accent">
                    {item.number}
                  </span>
                  <div className="flex flex-col gap-3">
                    <h3 className="m-0 font-display text-[1.5rem] font-bold leading-8 tracking-[-0.03125rem] text-puget-night">
                      {item.title}
                    </h3>
                    <p className="m-0 font-body text-base leading-6 text-sparkles-muted">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mx-auto mt-12 mb-0 max-w-[35.25rem] text-center font-body text-base leading-6 text-sparkles-muted">
              Want to start smaller, maybe?{" "}
              <Link
                href="/committees"
                className="font-bold text-sparkles-navy underline decoration-sparkles-navy/30 underline-offset-2 transition-colors duration-200 hover:decoration-sparkles-navy"
              >
                Start with a committee
              </Link>{" "}
              or{" "}
              <Link
                href="/membership"
                className="font-bold text-sparkles-navy underline decoration-sparkles-navy/30 underline-offset-2 transition-colors duration-200 hover:decoration-sparkles-navy"
              >
                become a member
              </Link>{" "}
              — many board members built up to it that way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JoinBoardRequirementsSection;

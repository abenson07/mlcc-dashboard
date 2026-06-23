import { SectionLabel } from "@marketing/components/SectionLabel";
import { BOARD_MEMBERS } from "@marketing/data/board";

function BoardMemberCard({ member }: { member: (typeof BOARD_MEMBERS)[number] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-[32rem] w-full overflow-hidden rounded-xl bg-sparkles-warm max-[767px]:h-[24rem]">
        <img
          loading="lazy"
          alt=""
          src={member.image}
          className="z-[1] h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="font-display text-2xl font-bold leading-7 tracking-[-0.03125rem] text-puget-night">
          {member.name}
        </div>
        <div className="font-body text-xs font-bold uppercase leading-4 tracking-[0.0625rem] text-sparkles-navy/50">
          {member.role}
        </div>
      </div>
    </div>
  );
}

export function BoardMembersSection() {
  return (
    <section className="w-full bg-sparkles-cream text-sparkles-navy">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div className="mb-20 flex flex-col items-start gap-6 max-[991px]:mb-16 max-[767px]:gap-5">
              <SectionLabel>Current board</SectionLabel>
              <h2 className="m-0 max-w-[42.5rem] font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[991px]:max-w-none max-[991px]:w-full max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                Neighbors leading the council
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-12 max-[991px]:grid-cols-2 max-[479px]:grid-cols-1">
              {BOARD_MEMBERS.map((member) => (
                <BoardMemberCard key={member.name} member={member} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BoardMembersSection;

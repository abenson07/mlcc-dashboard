import { SectionLabel } from "@marketing/components/SectionLabel";
function ToothIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 3 1 4.5C8 14 8 16 8 18c0 2 1 4 2 4s2-2 2-4c0 2 1 4 2 4s2-2 2-4c0-2 0-4 1-6.5.5-1.5 1-3 1-4.5 0-2.5-2.5-5-6-5z" />
    </svg>
  );
}

function SkullIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5C7.03 2.5 3 6.53 3 11.5c0 3.1 1.57 5.84 3.97 7.5H17.03C19.43 17.34 21 14.6 21 11.5c0-4.97-4.03-9-9-9zM9 17.5v3h6v-3M9 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM15 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
    </svg>
  );
}

function CrossBonesIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18M21 3 3 21M5.5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM18.5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM5.5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM18.5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  );
}

function RibsIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M12 6C8 6 4 8 4 12M12 6c4 0 8 2 8 6M12 10C8 10 4 12 4 16M12 10c4 0 8 2 8 6M12 14c-4 0-8 2-8 6M12 14c4 0 8 2 8 6" />
    </svg>
  );
}

const cards = [
  { icon: <SkullIcon />, title: "Bone Frame" },
  { icon: <CrossBonesIcon />, title: "Hollow Shell" },
  { icon: <RibsIcon />, title: "Silent Spine" },
  { icon: <ToothIcon />, title: "Bone Frame" },
  { icon: <SkullIcon />, title: "Hollow Shell" },
  { icon: <CrossBonesIcon />, title: "Silent Spine" },
  { icon: <RibsIcon />, title: "Bone Frame" },
  { icon: <ToothIcon />, title: "Hollow Shell" },
  { icon: <SkullIcon />, title: "Silent Spine" },
].map((card) => ({
  ...card,
  text: "This is skeleton filler text, written only to keep the shape alive. It simply marks the rhythm of where real words will go.",
}));

export function ValueFeature57Section() {
  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="one-seattle-plan.value-feature-3"
      data-editable-label="Value Feature 3"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-20 flex flex-col gap-8">
              <div className="flex w-full max-w-[35.25rem] flex-col items-start gap-6 max-[767px]:max-w-none">
                <SectionLabel>Label placeholder</SectionLabel>
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Headline skeleton placeholder exists only to structure your layout
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[991px]:grid-cols-2 max-[479px]:grid-cols-1">
              {cards.map((card, index) => (
                <div key={index} className="flex flex-col gap-6 rounded-2xl bg-sparkles-warm p-8">
                  <div className="flex flex-row items-center gap-4">
                    <div className="h-8 w-8 shrink-0 text-sparkles-navy">{card.icon}</div>
                    <div className="font-display text-[1.5rem] leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
                      {card.title}
                    </div>
                  </div>
                  <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueFeature57Section;

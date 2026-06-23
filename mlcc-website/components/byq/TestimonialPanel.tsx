export type TestimonialPanelProps = {
  quote: string;
  name: string;
  attribution?: string;
  avatarSrc?: string;
  backgroundClassName?: string;
};

export function TestimonialPanel({
  quote,
  name,
  attribution,
  avatarSrc,
  backgroundClassName = "bg-sparkles-navy",
}: TestimonialPanelProps) {
  return (
    <div
      className={`relative flex h-auto min-h-full flex-col justify-between gap-8 overflow-clip rounded-lg p-6 text-sparkles-cream max-[991px]:min-h-[400px] max-[479px]:min-h-[300px] ${backgroundClassName}`}
    >
      <blockquote className="m-0 font-body text-xl leading-7 font-normal max-[767px]:text-base max-[767px]:leading-6">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <div className="flex items-center gap-5">
        {avatarSrc ? (
          <div className="h-[4.5rem] w-[4.5rem] flex-none overflow-hidden rounded-full max-[479px]:h-12 max-[479px]:w-12">
            <img loading="lazy" src={avatarSrc} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="flex flex-col gap-1">
          <div className="font-display text-2xl leading-7 font-bold tracking-[-0.03125rem]">
            {name}
          </div>
          {attribution ? (
            <div className="font-body text-base leading-6 text-sparkles-cream/65">{attribution}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default TestimonialPanel;

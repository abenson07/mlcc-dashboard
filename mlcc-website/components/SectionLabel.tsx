import type { ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
  className?: string;
};

export function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <div
      className={`inline-flex w-fit items-center justify-center text-center backdrop-blur-md px-2 py-1 rounded-2xl bg-sparkles-warm text-sparkles-navy ${className}`.trim()}
    >
      <span className="font-body text-xs leading-4 font-bold tracking-[0.047rem] uppercase">
        {children}
      </span>
    </div>
  );
}

export default SectionLabel;

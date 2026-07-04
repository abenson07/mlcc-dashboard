import type { ReactNode } from "react";

type CanvasContentProps = {
  children?: ReactNode;
};

export default function CanvasContent({ children }: CanvasContentProps) {
  return <div className="shell-canvas-content">{children}</div>;
}

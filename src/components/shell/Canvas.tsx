import type { ReactNode } from "react";

type CanvasProps = {
  children: ReactNode;
};

export default function Canvas({ children }: CanvasProps) {
  return <div className="shell-canvas">{children}</div>;
}

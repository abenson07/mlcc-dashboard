import type { ReactNode } from "react";
import CanvasFooter from "./CanvasFooter";

type CanvasAreaProps = {
  children: ReactNode;
};

export default function CanvasArea({ children }: CanvasAreaProps) {
  return (
    <div className="shell-canvas-area">
      {children}
      <CanvasFooter />
    </div>
  );
}

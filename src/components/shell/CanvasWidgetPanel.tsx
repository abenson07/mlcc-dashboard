import type { ReactNode } from "react";

type CanvasWidgetPanelProps = {
  children?: ReactNode;
};

export default function CanvasWidgetPanel({ children }: CanvasWidgetPanelProps) {
  return <aside className="shell-canvas-widget-panel">{children}</aside>;
}

import type { ReactNode } from "react";
import CanvasContent from "./CanvasContent";
import CanvasWidgetPanel from "./CanvasWidgetPanel";

type CanvasContainerProps = {
  showWidgetPanel?: boolean;
  content?: ReactNode;
  widgetPanel?: ReactNode;
  children?: ReactNode;
};

export default function CanvasContainer({
  showWidgetPanel = true,
  content,
  widgetPanel,
  children,
}: CanvasContainerProps) {
  if (children) {
    return <div className="shell-canvas-container">{children}</div>;
  }

  return (
    <div className="shell-canvas-container">
      <CanvasContent>{content}</CanvasContent>
      {showWidgetPanel ? <CanvasWidgetPanel>{widgetPanel}</CanvasWidgetPanel> : null}
    </div>
  );
}

"use client";

import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import ShellWidget from "./ShellWidget";

export default function DistributionProgressWidget() {
  const { timeline } = useLeafletContext();

  if (!timeline || timeline.length === 0) return null;

  return (
    <ShellWidget title="Distribution Progress" widgetId="distribution-progress">
      {timeline.map((item) => (
        <div
          key={item.stage}
          className={`shell-widget-row${item.active ? " shell-widget-row--active" : ""}`}
        >
          <span className="shell-widget-item-label">{item.stage}</span>
          <span className="shell-widget-item-value">{item.counter}</span>
        </div>
      ))}
    </ShellWidget>
  );
}
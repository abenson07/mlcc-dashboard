"use client";

export type MeetingLocationType = "in_person" | "remote" | "hybrid";

const TABS: { value: MeetingLocationType; label: string }[] = [
  { value: "in_person", label: "In person" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

type MeetingLocationTypeTabsProps = {
  value: MeetingLocationType;
  onChange: (value: MeetingLocationType) => void;
  id?: string;
};

export default function MeetingLocationTypeTabs({
  value,
  onChange,
  id = "meeting-location-type",
}: MeetingLocationTypeTabsProps) {
  return (
    <div className="lf-segment-tabs" role="tablist" aria-label="Meeting type" id={id}>
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          className={value === tab.value ? "lf-segment-tab lf-segment-tab--active" : "lf-segment-tab"}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function showPhysicalLocation(type: MeetingLocationType): boolean {
  return type === "in_person" || type === "hybrid";
}

export function showMeetLink(type: MeetingLocationType): boolean {
  return type === "remote" || type === "hybrid";
}

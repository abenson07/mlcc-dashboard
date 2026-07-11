"use client";

import { useCallback } from "react";
import { useCommitteeMeeting } from "hooks";
import { AttendanceFields } from "@/components/integrated/committee-meetings/AttendancePanel";
import ShellWidget from "./ShellWidget";

type AttendanceWidgetProps = {
  eventId: string;
};

export default function AttendanceWidget({ eventId }: AttendanceWidgetProps) {
  const { meeting, setAttendees } = useCommitteeMeeting(eventId);

  const handleChange = useCallback(
    (personIds: string[]) => {
      if (!meeting) return;
      void setAttendees(meeting.id, personIds);
    },
    [meeting, setAttendees],
  );

  if (!meeting) return null;

  return (
    <ShellWidget
      title="In attendance"
      widgetId="attendance"
      headerAction={<span className="lf-meta">{meeting.attendees.length} people</span>}
    >
      <AttendanceFields attendees={meeting.attendees} onChange={handleChange} />
    </ShellWidget>
  );
}

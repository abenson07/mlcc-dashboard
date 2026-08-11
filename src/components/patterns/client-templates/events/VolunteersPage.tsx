"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { type EventVolunteerRow } from "@/data/mocks/events";

/** Static pattern-library data — this page isn't tied to a real/curated event. */
const sampleEventVolunteers: EventVolunteerRow[] = [
  { id: "vol-1", name: "Priya Anand", role: "Event Lead", email: "priya.anand@example.com", status: "Confirmed" },
  { id: "vol-2", name: "Marcus Ianelli", role: "Setup & Teardown", email: "marcus.ianelli@example.com", status: "Confirmed" },
  { id: "vol-3", name: "Dana Whitfield", role: "Concessions", email: "dana.whitfield@example.com", status: "Confirmed" },
  { id: "vol-4", name: "Sam Okafor", role: "Concessions", email: "sam.okafor@example.com", status: "Invited" },
  { id: "vol-5", name: "Lena Brandt", role: "Parking & Traffic", email: "lena.brandt@example.com", status: "Invited" },
  { id: "vol-6", name: "Owen Castillo", role: "Parking & Traffic", email: "owen.castillo@example.com", status: "Declined" },
];

const GROUP_ORDER = ["Confirmed", "Invited", "Declined"];

const groupColors: Record<string, string> = {
  Confirmed: "#27a644",
  Invited: "#f2c94c",
  Declined: "#8a8f98",
};

function buildColumns(
  onSelectVolunteer?: (row: EventVolunteerRow) => void,
): TableColumn<EventVolunteerRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectVolunteer?.(row)}>
          <Avatar name={row.name} size="sm" />
          <span
            style={{
              marginInlineStart: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "var(--linear-color-ink)",
            }}
          >
            {row.name}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "role",
      header: "Role",
      width: pixel(160),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectVolunteer?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.role}</span>
        </RowClickCell>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: pixel(220),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectVolunteer?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {row.email}
          </span>
        </RowClickCell>
      ),
    },
  ];
}

export type VolunteersPageProps = {
  onSelectVolunteer?: (row: EventVolunteerRow) => void;
};

/**
 * Full-width Volunteers list — same list chrome as Foundation's own
 * grouped-table canvas, grouped by RSVP status.
 */
export function VolunteersPage({ onSelectVolunteer }: VolunteersPageProps) {
  const columns = useMemo(
    () => buildColumns(onSelectVolunteer),
    [onSelectVolunteer],
  );
  const groupOrder = useMemo(() => GROUP_ORDER, []);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={sampleEventVolunteers}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.status}
        groupOrder={groupOrder}
        getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
        listChrome
      />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { useEventContext } from "@/components/integrated/events/EventContext";
import {
  useCommitteeInterests,
  type VolunteerAskWithSignups,
} from "hooks";
import { isCommitteeSlug } from "@/lib/committees/committeeSlug";
import type { CommitteeSlug } from "schemas/committee_meetings";
import { CreateVolunteerAskModal } from "@/components/patterns/client-templates-migrate/committees/CreateVolunteerAskModal";
import { InterestResponseModal } from "@/components/patterns/client-templates-migrate/committees/InterestResponseModal";
import type { CommitteeInterests } from "@/types/database";

export type EventVolunteerRow = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "Accepted" | "Pending";
  interestId?: string;
};

const GROUP_ORDER = ["Pending", "Accepted"];

const groupColors: Record<string, string> = {
  Pending: "#f2c94c",
  Accepted: "#27a644",
};

function rowsFromAsks(asks: VolunteerAskWithSignups[]): EventVolunteerRow[] {
  const rows: EventVolunteerRow[] = [];
  for (const ask of asks) {
    for (const signup of ask.signups) {
      const status = signup.status === "pending" ? "Pending" : "Accepted";
      rows.push({
        id: signup.id,
        name: signup.person?.full_name ?? "Unknown",
        role: ask.title,
        email: signup.person?.email ?? signup.person?.phone ?? "—",
        status,
      });
    }
  }
  return rows;
}

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
      header: "Ask",
      width: pixel(200),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectVolunteer?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.role}</span>
        </RowClickCell>
      ),
    },
    {
      key: "email",
      header: "Contact",
      width: pixel(220),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectVolunteer?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type VolunteersPageProps = {
  onSelectVolunteer?: (row: EventVolunteerRow) => void;
};

/**
 * Event volunteers from linked volunteer asks (pending + accepted), plus
 * pending website interests for this event.
 */
export function VolunteersPage({ onSelectVolunteer }: VolunteersPageProps) {
  const { eventId, event, volunteerAsks, refetchAll } = useEventContext();
  const committeeRaw = event?.fieldData.committee;
  const committee: CommitteeSlug | null = isCommitteeSlug(committeeRaw)
    ? committeeRaw
    : null;

  const {
    interests,
    respondWithEmail,
    markHandled,
  } = useCommitteeInterests({
    eventId,
    status: "pending",
    autoFetch: Boolean(eventId),
  });

  const [askModalOpen, setAskModalOpen] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<CommitteeInterests | null>(null);

  const askRows = useMemo(() => rowsFromAsks(volunteerAsks), [volunteerAsks]);
  const interestRows: EventVolunteerRow[] = useMemo(
    () =>
      interests.map((interest) => ({
        id: `interest-${interest.id}`,
        name: interest.name,
        role: interest.opportunity_title ?? "Website interest",
        email: interest.contact,
        status: "Pending" as const,
        interestId: interest.id,
      })),
    [interests],
  );

  const data = useMemo(() => {
    const seen = new Set(askRows.map((r) => `${r.name}|${r.email}|${r.role}`));
    const extras = interestRows.filter(
      (r) => !seen.has(`${r.name}|${r.email}|${r.role}`),
    );
    return [...askRows, ...extras];
  }, [askRows, interestRows]);

  const columns = useMemo(
    () =>
      buildColumns((row) => {
        if (row.interestId) {
          const interest = interests.find((i) => i.id === row.interestId) ?? null;
          setSelectedInterest(interest);
          return;
        }
        onSelectVolunteer?.(row);
      }),
    [onSelectVolunteer, interests],
  );
  const groupOrder = useMemo(() => GROUP_ORDER, []);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 8px",
        }}
      >
        <Text size="sm" color="secondary">
          {volunteerAsks.length} ask{volunteerAsks.length === 1 ? "" : "s"} · {data.length}{" "}
          signup{data.length === 1 ? "" : "s"}
        </Text>
        {committee ? (
          <Button
            label="New ask"
            variant="secondary"
            onClick={() => setAskModalOpen(true)}
          />
        ) : null}
      </div>
      <GroupedTable
        data={data}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.status}
        groupOrder={groupOrder}
        getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
        listChrome
      />

      {committee ? (
        <CreateVolunteerAskModal
          isOpen={askModalOpen}
          committee={committee}
          eventId={eventId}
          onClose={() => setAskModalOpen(false)}
          onSaved={() => {
            void refetchAll();
          }}
        />
      ) : null}

      <InterestResponseModal
        interest={selectedInterest}
        onClose={() => setSelectedInterest(null)}
        onSend={async (payload) => {
          if (!selectedInterest) return;
          await respondWithEmail(selectedInterest.id, payload);
        }}
        onMarkHandled={async () => {
          if (!selectedInterest) return;
          await markHandled(selectedInterest.id);
        }}
      />
    </div>
  );
}

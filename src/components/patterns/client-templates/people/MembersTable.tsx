"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { sampleMembers, type MemberRow } from "@/data/mocks/people";

const GROUP_ORDER = ["household", "individual", "business-affiliate"];

const groupMeta: Record<string, { label: string; color: string }> = {
  household: { label: "Household", color: "#27a644" },
  individual: { label: "Individual", color: "#5e6ad2" },
  "business-affiliate": { label: "Business Affiliate", color: "#f2994a" },
};

function buildColumns(): TableColumn<MemberRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell>
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
      key: "email",
      header: "Email",
      width: pixel(220),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>
        </RowClickCell>
      ),
    },
    {
      key: "memberSince",
      header: "Member Since",
      width: pixel(130),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.memberSince}</span>
        </RowClickCell>
      ),
    },
  ];
}

/** Members roster grouped by membership type. */
export function MembersTable() {
  const columns = useMemo(() => buildColumns(), []);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={sampleMembers}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.membershipType}
        groupOrder={GROUP_ORDER}
        getGroupMeta={(key) => groupMeta[key]}
        listChrome
      />
    </div>
  );
}

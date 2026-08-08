"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import { sampleCommitteeMembers, type CommitteeMemberRow } from "@/data/mocks/committees";

export type CommitteeMembersSectionProps = {
  onSelectMember?: (row: CommitteeMemberRow) => void;
};

/**
 * Members list for the committee Overview page — a plain Name / Role list,
 * matching the boxed shape of `VolunteersListSection` for a side-by-side
 * layout with `CommitteeMeetingsSection`.
 */
export function CommitteeMembersSection({ onSelectMember }: CommitteeMembersSectionProps) {
  const members = sampleCommitteeMembers;

  return (
    <section
      data-slot="committee-members-section"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 20,
        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        borderRadius: "var(--linear-radius-md)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text weight="semibold">Members</Text>
        <Text size="sm" color="secondary">
          {members.length} total
        </Text>
      </div>

      {members.length === 0 ? (
        <Text size="sm" color="secondary">
          No members added yet.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelectMember?.(member)}
              style={{
                all: "unset",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 4px",
                borderRadius: "var(--linear-radius-sm)",
                cursor: onSelectMember ? "pointer" : "default",
              }}
            >
              <Avatar name={member.name} size="sm" />
              <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                {member.name}
              </Text>
              <Text size="sm" color="secondary">
                {member.role}
              </Text>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

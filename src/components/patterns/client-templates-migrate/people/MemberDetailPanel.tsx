"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { Calendar, Mail, Tag } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { MemberRow, MembershipType } from "./types";

const MEMBERSHIP_TYPE_LABEL: Record<MembershipType, string> = {
  household: "Household",
  individual: "Individual",
  senior: "Senior",
  student: "Student",
  "no-tier": "No tier",
};

export type MemberDetailPanelProps = {
  member: MemberRow;
};

/** Member detail — shown in the outlined side panel when a row is selected from Members. */
export function MemberDetailPanel({ member }: MemberDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={member.name} size="md" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{member.name}</Text>
          <Text size="sm" color="secondary">
            {MEMBERSHIP_TYPE_LABEL[member.membershipType]}
          </Text>
        </div>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Membership
          </Text>
        }
      >
        <SideContentField icon={<Tag size={16} strokeWidth={1.75} />} label={MEMBERSHIP_TYPE_LABEL[member.membershipType]} />
        <SideContentField icon={<Calendar size={16} strokeWidth={1.75} />} label={`Member since ${member.memberSince}`} />
      </List>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Contact
          </Text>
        }
      >
        <SideContentField icon={<Mail size={16} strokeWidth={1.75} />} label={member.email} />
      </List>
    </VStack>
  );
}

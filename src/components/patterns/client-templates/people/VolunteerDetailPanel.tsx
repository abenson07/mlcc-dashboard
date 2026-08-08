"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { CircleDot, Mail, Sparkles } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { VolunteerRow } from "@/data/mocks/people";

export type VolunteerDetailPanelProps = {
  volunteer: VolunteerRow;
};

/** Volunteer detail — shown in the outlined side panel when a row is selected from Volunteers. */
export function VolunteerDetailPanel({ volunteer }: VolunteerDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={volunteer.name} size="md" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{volunteer.name}</Text>
          <Text size="sm" color="secondary">
            {volunteer.interestArea}
          </Text>
        </div>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Volunteering
          </Text>
        }
      >
        <SideContentField
          icon={<CircleDot size={16} strokeWidth={1.75} />}
          label={volunteer.hasVolunteeredBefore ? "Has volunteered before" : "Interested, not yet volunteered"}
        />
        <SideContentField icon={<Sparkles size={16} strokeWidth={1.75} />} label={volunteer.interestArea} />
      </List>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Contact
          </Text>
        }
      >
        <SideContentField icon={<Mail size={16} strokeWidth={1.75} />} label={volunteer.email} />
      </List>
    </VStack>
  );
}

"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { Calendar, Mail, MapPin } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { NeighborRow } from "@/data/mocks/people";

export type NeighborDetailPanelProps = {
  neighbor: NeighborRow;
};

/** Neighbor detail — shown in the outlined side panel when a row is selected from Neighbors. */
export function NeighborDetailPanel({ neighbor }: NeighborDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={neighbor.name} size="md" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{neighbor.name}</Text>
          <Text size="sm" color="secondary">
            Neighbor
          </Text>
        </div>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Details
          </Text>
        }
      >
        <SideContentField icon={<MapPin size={16} strokeWidth={1.75} />} label={neighbor.address} />
        <SideContentField icon={<Calendar size={16} strokeWidth={1.75} />} label={`Joined ${neighbor.joinedDate}`} />
      </List>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Contact
          </Text>
        }
      >
        <SideContentField icon={<Mail size={16} strokeWidth={1.75} />} label={neighbor.email} />
      </List>
    </VStack>
  );
}

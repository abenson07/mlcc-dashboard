"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { Phone, Tag, UserRound } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { BusinessRow } from "@/data/mocks/businesses";

export type BusinessDetailPanelProps = {
  business: BusinessRow;
};

/** Business detail — shown in the outlined side panel when a row is selected from All Businesses. */
export function BusinessDetailPanel({ business }: BusinessDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={business.businessName} size="md" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{business.businessName}</Text>
          <Text size="sm" color="secondary">
            {business.category}
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
        <SideContentField icon={<Tag size={16} strokeWidth={1.75} />} label={business.category} />
        <SideContentField icon={<UserRound size={16} strokeWidth={1.75} />} label={business.contactName} />
        <SideContentField icon={<Phone size={16} strokeWidth={1.75} />} label={business.phone} />
      </List>
    </VStack>
  );
}

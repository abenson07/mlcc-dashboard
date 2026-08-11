"use client";

import { useRouter } from "next/navigation";
import { Users2 } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import type { CommitteeCard as CommitteeCardData } from "@/data/mocks/committees";

export type CommitteeCardProps = {
  committee: CommitteeCardData;
};

export function CommitteeCard({ committee }: CommitteeCardProps) {
  const router = useRouter();

  return (
    <Card padding={4} style={{ cursor: "pointer" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/admin-preview/committees/${committee.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            router.push(`/admin-preview/committees/${committee.id}`);
          }
        }}
      >
        <VStack gap={3}>
          <HStack gap={2} align="center">
            <Icon icon={Users2} size="sm" color="secondary" />
            <Text weight="semibold" display="block" style={{ flex: 1 }}>
              {committee.name}
            </Text>
            <Text color="secondary" size="sm">
              {committee.chair}
            </Text>
          </HStack>
          <Text color="secondary">{committee.description}</Text>
          <HStack gap={2}>
            <Badge label={`${committee.memberCount} members`} />
            <Badge label={committee.cadence} />
          </HStack>
        </VStack>
      </div>
    </Card>
  );
}

"use client";

import { FileText } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import type { Story } from "@/data/mocks/content";

export type StoryCardProps = {
  story: Story;
  isSelected?: boolean;
  onClick: () => void;
};

export function StoryCard({ story, isSelected = false, onClick }: StoryCardProps) {
  return (
    <Card
      padding={4}
      style={{
        cursor: "pointer",
        borderColor: isSelected ? "var(--linear-color-accent)" : undefined,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        }}
      >
        <VStack gap={3}>
          <HStack gap={2} align="center">
            <Icon icon={FileText} size="sm" color="secondary" />
            <Text weight="semibold" display="block" style={{ flex: 1 }}>
              {story.title}
            </Text>
          </HStack>
          <Text color="secondary">By {story.author}</Text>
          <HStack gap={2}>
            <Badge label={story.status} />
          </HStack>
        </VStack>
      </div>
    </Card>
  );
}

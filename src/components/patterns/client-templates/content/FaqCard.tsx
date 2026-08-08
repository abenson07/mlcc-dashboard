"use client";

import { HelpCircle } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import type { Faq } from "@/data/mocks/content";

export type FaqCardProps = {
  faq: Faq;
  isSelected?: boolean;
  onClick: () => void;
};

export function FaqCard({ faq, isSelected = false, onClick }: FaqCardProps) {
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
            <Icon icon={HelpCircle} size="sm" color="secondary" />
            <Text weight="semibold" display="block" style={{ flex: 1 }}>
              {faq.question}
            </Text>
          </HStack>
          <Text color="secondary">{faq.answer}</Text>
          <HStack gap={2} style={{ flexWrap: "wrap" }}>
            {faq.pages.map((page) => (
              <Badge key={page} label={page} />
            ))}
          </HStack>
        </VStack>
      </div>
    </Card>
  );
}

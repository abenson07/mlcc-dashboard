"use client";

import { Fragment } from "react";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import { PromotionCard } from "./PromotionCard";
import { PromotionInsertRow } from "./PromotionInsertRow";
import type { EventPromotionItem } from "@/data/mocks/events";

export type EventPromotionPageProps = {
  items: EventPromotionItem[];
  onInsertAt: (index: number, item: Omit<EventPromotionItem, "id">) => void;
};

/**
 * Center-constrained timeline of emails/social posts leading up to the
 * event, mirroring the Action Items list. A "+" row sits between every
 * card (and at each end) so a new email or social post can be dropped in
 * at any point in the sequence.
 */
export function EventPromotionPage({ items, onInsertAt }: EventPromotionPageProps) {
  return (
    <VStack gap={3}>
      <Text type="label" color="secondary">
        Promotion timeline
      </Text>

      <PromotionInsertRow onInsert={(item) => onInsertAt(0, item)} />

      {items.map((item, index) => (
        <Fragment key={item.id}>
          <PromotionCard item={item} />
          <PromotionInsertRow onInsert={(newItem) => onInsertAt(index + 1, newItem)} />
        </Fragment>
      ))}
    </VStack>
  );
}

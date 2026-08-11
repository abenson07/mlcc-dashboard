"use client";

import { Button } from "@/components/patterns/primitives/Button";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { Building2, CalendarDays, CircleDollarSign } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { EventBudgetRow } from "@/data/mocks/events";

export type BudgetDetailPanelProps = {
  item: EventBudgetRow;
};

/**
 * Budget line-item detail — shown in the outlined side panel when a
 * row is selected from the Overview's Invoices section.
 */
export function BudgetDetailPanel({ item }: BudgetDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text size="sm" color="secondary">
          {item.item}
        </Text>
        <Text
          style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}
        >
          {item.amount}
        </Text>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Invoice
          </Text>
        }
      >
        <SideContentField
          icon={<CircleDollarSign size={16} strokeWidth={1.75} />}
          label={item.status}
        />
        <SideContentField
          icon={<CalendarDays size={16} strokeWidth={1.75} />}
          label={`Due ${item.dueDate}`}
        />
        <SideContentField
          icon={<Building2 size={16} strokeWidth={1.75} />}
          label={item.vendor}
        />
      </List>

      <Button label="Mark as paid" variant="secondary" size="sm" width="100%" />
    </VStack>
  );
}

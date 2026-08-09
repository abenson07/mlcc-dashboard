"use client";

import { useMemo } from "react";
import { useAllActionItems } from "hooks";
import { DraftsSection } from "@/components/patterns/client-templates/drafts";
import { Text } from "@/components/patterns/primitives/Text";
import { ActionItemCard } from "./ActionItemCard";
import { toActionItem } from "./adapters";

/** Action Items body — stacked list of open task cards. */
export function ActionItemsPage() {
  const { items, loading, error } = useAllActionItems();

  const openItems = useMemo(
    () => items.filter((item) => item.status === "open" || item.status === "canceled").map(toActionItem),
    [items]
  );

  if (error) {
    return <Text color="secondary">Couldn&apos;t load action items: {error}</Text>;
  }
  if (loading) {
    return <Text color="secondary">Loading…</Text>;
  }

  return (
    <DraftsSection title="Action Items" columns={1}>
      {openItems.map((item) => (
        <ActionItemCard key={item.id} item={item} />
      ))}
    </DraftsSection>
  );
}

"use client";

import { DraftsSection } from "@/components/patterns/client-templates/drafts";
import { ActionItemCard } from "./ActionItemCard";
import { sampleActionItems } from "@/data/mocks/action-items";

/** Action Items body — stacked list of task cards. */
export function ActionItemsPage() {
  return (
    <DraftsSection title="Action Items" columns={1}>
      {sampleActionItems.map((item) => (
        <ActionItemCard key={item.id} item={item} />
      ))}
    </DraftsSection>
  );
}

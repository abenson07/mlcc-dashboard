"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { DraftsSection } from "@/components/patterns/client-templates/drafts";
import { CommitteeCard } from "./CommitteeCard";
import { sampleCommittees } from "@/data/mocks/committees";

/** Committees body — a 2-column grid of committee cards. */
export function CommitteesPage() {
  return (
    <VStack gap={8}>
      <DraftsSection title="Committees" columns={2}>
        {sampleCommittees.map((committee) => (
          <CommitteeCard key={committee.id} committee={committee} />
        ))}
      </DraftsSection>
    </VStack>
  );
}

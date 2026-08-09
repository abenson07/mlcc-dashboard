"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { EmptyStateCard } from "@/components/patterns/client-templates/shared";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { DraftsSection } from "./DraftsSection";
import { DraftIssueCard } from "./DraftIssueCard";
import { DraftUpdateCard } from "./DraftUpdateCard";
import { DraftCommentCard } from "./DraftCommentCard";
import {
  sampleDraftComments,
  sampleDraftIssues,
  sampleDraftUpdates,
} from "@/data/mocks/drafts";

/**
 * Drafts body — Issues / Updates / Comments sections, each spreading its
 * cards over 1 to 5 columns via `DraftsSection`'s `columns` prop.
 */
export function DraftsPage() {
  const { enabled: demo } = useDemoModeOptional();

  if (!demo) {
    return (
      <EmptyStateCard variant="plain" label="Drafts not wired yet — turn on demo mode to preview" />
    );
  }

  return (
    <VStack gap={8}>
      <DraftsSection title="Issues" columns={1}>
        {sampleDraftIssues.map((issue) => (
          <DraftIssueCard key={issue.id} issue={issue} />
        ))}
      </DraftsSection>

      <DraftsSection title="Updates" columns={1}>
        {sampleDraftUpdates.map((update) => (
          <DraftUpdateCard key={update.id} update={update} />
        ))}
      </DraftsSection>

      <DraftsSection title="Comments" columns={2}>
        {sampleDraftComments.map((comment) => (
          <DraftCommentCard key={comment.id} comment={comment} />
        ))}
      </DraftsSection>
    </VStack>
  );
}

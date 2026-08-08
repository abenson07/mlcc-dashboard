"use client";

import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { CommitteeInfoBox } from "./CommitteeInfoBox";
import { CommitteeMembersSection } from "./CommitteeMembersSection";
import { CommitteeMeetingsSection } from "./CommitteeMeetingsSection";
import type { CommitteeDetail, CommitteeMeetingRow, CommitteeMemberRow } from "@/data/mocks/committees";

export type CommitteeDetailPageProps = {
  committee: CommitteeDetail;
  onSelectMember?: (row: CommitteeMemberRow) => void;
  onSelectMeeting?: (row: CommitteeMeetingRow) => void;
};

/**
 * Committee Detail Overview: info box, then a two-column Members / Meetings
 * row. Mirrors `StudentDetailPage` / `EventOverviewPage`.
 */
export function CommitteeDetailPage({ committee, onSelectMember, onSelectMeeting }: CommitteeDetailPageProps) {
  return (
    <ClassContentPage>
      <CommitteeInfoBox committee={committee} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <CommitteeMembersSection onSelectMember={onSelectMember} />
        <CommitteeMeetingsSection onSelectMeeting={onSelectMeeting} />
      </div>
    </ClassContentPage>
  );
}

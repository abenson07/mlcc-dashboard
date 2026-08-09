"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Text } from "@/components/patterns/primitives/Text";
import { CommitteeDetailPage } from "./CommitteeDetailPage";
import { ScheduleCommitteeMeetingModal } from "./ScheduleCommitteeMeetingModal";
import { resolveCommitteeSlug } from "./committeeSlug";
import {
  sampleCommitteeDetail,
  sampleCommittees,
  type CommitteeDetail,
} from "@/data/mocks/committees";
import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";

function buildCommitteeDetail(
  slug: CommitteeSlug,
  rawId: string,
  demo: boolean,
): CommitteeDetail {
  const fromSample = demo
    ? sampleCommittees.find((c) => c.id === rawId || c.id === slug)
    : undefined;
  return {
    id: rawId,
    name: fromSample?.name ?? `${COMMITTEE_LABELS[slug]} Committee`,
    chair: fromSample?.chair ?? "—",
    memberCount: fromSample?.memberCount ?? 0,
    cadence: fromSample?.cadence ?? (demo ? "Monthly" : "Ongoing"),
    description:
      fromSample?.description ??
      `Meetings, agenda, minutes, and action items for the ${COMMITTEE_LABELS[slug]} committee.`,
    meetingDay: demo ? sampleCommitteeDetail.meetingDay : "—",
    location: demo ? sampleCommitteeDetail.location : "—",
    founded: demo ? sampleCommitteeDetail.founded : "—",
  };
}

export function CommitteeDetailDemo() {
  const params = useParams<{ committeeId: string }>();
  const router = useRouter();
  const { enabled: demo } = useDemoModeOptional();
  const rawId = typeof params?.committeeId === "string" ? params.committeeId : "events";
  const slug = resolveCommitteeSlug(rawId);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const committee = useMemo(
    () => (slug ? buildCommitteeDetail(slug, rawId, demo) : null),
    [slug, rawId, demo],
  );

  if (!slug || !committee) {
    return (
      <div style={{ height: "100%" }}>
        <FoundationLayout
          navigation={<LinearSidebar />}
          contentMaxWidth={1200}
          header={<CanvasHeader topbar={{ title: "Committee" }} />}
        >
          <div style={{ padding: 32 }}>
            <Text color="secondary">Unknown committee: {rawId}</Text>
          </div>
        </FoundationLayout>
      </div>
    );
  }

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={
          <CanvasHeader
            topbar={{
              title: committee.name,
              titleAdornment: <Badge label={committee.cadence} />,
              hasFavorite: true,
              breadcrumbs: [
                {
                  label: "Committees",
                  onClick: () => router.push("/admin-migrate/committees"),
                },
              ],
            }}
          />
        }
      >
        <CommitteeDetailPage
          committee={committee}
          committeeSlug={slug}
          onScheduleMeeting={() => setScheduleOpen(true)}
          onSelectMeeting={(meetingId) => {
            router.push(
              `/admin-migrate/committees/${encodeURIComponent(rawId)}/meetings/${encodeURIComponent(meetingId)}`,
            );
          }}
        />
      </FoundationLayout>

      <ScheduleCommitteeMeetingModal
        isOpen={scheduleOpen}
        committee={slug}
        onClose={() => setScheduleOpen(false)}
        onCreated={(meeting) => {
          router.push(
            `/admin-migrate/committees/${encodeURIComponent(rawId)}/meetings/${encodeURIComponent(meeting.id)}`,
          );
        }}
      />
    </div>
  );
}

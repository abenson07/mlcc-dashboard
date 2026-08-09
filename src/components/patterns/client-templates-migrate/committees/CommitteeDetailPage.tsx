"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HandHelping,
  Users2,
  Megaphone,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { ContentListRow } from "@/components/patterns/client-templates-migrate/content/ContentListRow";
import { Text } from "@/components/patterns/primitives/Text";
import {
  useAllActionItems,
  useCommitteeInterests,
  useCommitteeVolunteerAsks,
  useEvents,
  type VolunteerAskWithSignups,
} from "hooks";
import type { CommitteeInterests } from "@/types/database";
import type { CommitteeDetail, CommitteeMemberRow } from "@/data/mocks/committees";
import type { CommitteeSlug } from "schemas/committee_meetings";
import { CommitteeInfoBox } from "./CommitteeInfoBox";
import { CommitteeMembersSection } from "./CommitteeMembersSection";
import { CommitteeMeetingsSection } from "./CommitteeMeetingsSection";
import { CommitteeHubSection } from "./CommitteeHubSection";
import { InterestResponseModal } from "./InterestResponseModal";
import { CreateVolunteerAskModal } from "./CreateVolunteerAskModal";

export type CommitteeDetailPageProps = {
  committee: CommitteeDetail;
  committeeSlug: CommitteeSlug;
  onSelectMember?: (row: CommitteeMemberRow) => void;
  onSelectMeeting?: (meetingId: string) => void;
  onScheduleMeeting?: () => void;
};

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function sourceLabel(source: CommitteeInterests["source"]): string {
  switch (source) {
    case "join-card":
      return "Wants to join";
    case "meeting-signup":
      return "Meeting interest";
    case "zoning-workshop":
      return "Zoning workshop";
    case "volunteer-opportunity":
      return "Volunteer opportunity";
    default:
      return "Interest";
  }
}

/**
 * Committee ops hub: pending interest, volunteer asks, members/meetings,
 * events, action items, and a stub for initiatives.
 */
export function CommitteeDetailPage({
  committee,
  committeeSlug,
  onSelectMember,
  onSelectMeeting,
  onScheduleMeeting,
}: CommitteeDetailPageProps) {
  const router = useRouter();
  const [selectedInterest, setSelectedInterest] = useState<CommitteeInterests | null>(null);
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [editingAsk, setEditingAsk] = useState<VolunteerAskWithSignups | null>(null);

  const {
    interests,
    loading: interestsLoading,
    respondWithEmail,
    markHandled,
  } = useCommitteeInterests({ committee: committeeSlug, status: "pending" });

  const {
    openAsks,
    filledAsks,
    loading: asksLoading,
    refetch: refetchAsks,
  } = useCommitteeVolunteerAsks(committeeSlug);

  const { events, loading: eventsLoading } = useEvents();
  const { items: actionItems, loading: actionsLoading } = useAllActionItems();

  const committeeEvents = useMemo(() => {
    return events.filter((e) => {
      if (e.kind === "committee_meeting") return false;
      return e.committee === committeeSlug;
    });
  }, [events, committeeSlug]);

  const committeeActionItems = useMemo(() => {
    return actionItems.filter(
      (item) =>
        item.status === "open" && item.committee_meetings?.committee === committeeSlug,
    );
  }, [actionItems, committeeSlug]);

  return (
    <ClassContentPage>
      <CommitteeInfoBox committee={committee} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        <CommitteeHubSection
          title="Pending interest"
          isEmpty={!interestsLoading && interests.length === 0}
          emptyLabel="No pending signups"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {interests.map((interest) => (
              <ContentListRow
                key={interest.id}
                icon={<HandHelping size={16} strokeWidth={1.75} />}
                title={interest.name}
                subtitle={[
                  sourceLabel(interest.source),
                  interest.opportunity_title,
                  interest.contact,
                  formatWhen(interest.created_at),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                onClick={() => setSelectedInterest(interest)}
              />
            ))}
          </div>
        </CommitteeHubSection>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <CommitteeHubSection
            title="Open volunteer asks"
            actionLabel="New ask"
            onAction={() => {
              setEditingAsk(null);
              setAskModalOpen(true);
            }}
            isEmpty={!asksLoading && openAsks.length === 0}
            emptyLabel="No open asks"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {openAsks.map((ask) => (
                <ContentListRow
                  key={ask.id}
                  icon={<Users2 size={16} strokeWidth={1.75} />}
                  title={ask.title}
                  subtitle={`${ask.signup_count}/${ask.quantity} filled${ask.auto_accept ? " · Auto-accept" : ""}${ask.event?.name ? ` · ${ask.event.name}` : ""}`}
                  onClick={() => {
                    setEditingAsk(ask);
                    setAskModalOpen(true);
                  }}
                />
              ))}
            </div>
          </CommitteeHubSection>

          <CommitteeHubSection
            title="Filled asks"
            isEmpty={!asksLoading && filledAsks.length === 0}
            emptyLabel="No filled asks yet"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filledAsks.map((ask) => (
                <ContentListRow
                  key={ask.id}
                  icon={<Users2 size={16} strokeWidth={1.75} />}
                  title={ask.title}
                  subtitle={`${ask.signup_count}/${ask.quantity} filled`}
                  onClick={() => {
                    setEditingAsk(ask);
                    setAskModalOpen(true);
                  }}
                />
              ))}
            </div>
          </CommitteeHubSection>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <CommitteeMembersSection onSelectMember={onSelectMember} />
          <CommitteeMeetingsSection
            committee={committeeSlug}
            onSchedule={onScheduleMeeting}
            onSelectMeeting={onSelectMeeting}
          />
        </div>

        <CommitteeHubSection
          title="Events"
          isEmpty={!eventsLoading && committeeEvents.length === 0}
          emptyLabel="No events linked to this committee"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {committeeEvents.map((event) => (
              <ContentListRow
                key={event.id}
                icon={<Megaphone size={16} strokeWidth={1.75} />}
                title={event.title}
                subtitle={[event.date, event.location].filter(Boolean).join(" · ")}
                onClick={() => router.push(`/admin-migrate/events/${event.id}`)}
              />
            ))}
          </div>
        </CommitteeHubSection>

        <CommitteeHubSection
          title="Action items"
          isEmpty={!actionsLoading && committeeActionItems.length === 0}
          emptyLabel="No open action items"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {committeeActionItems.map((item) => (
              <ContentListRow
                key={item.id}
                icon={<ClipboardList size={16} strokeWidth={1.75} />}
                title={item.title}
                subtitle={
                  item.assignee?.full_name
                    ? `Assigned to ${item.assignee.full_name}`
                    : "Unassigned"
                }
                onClick={() => router.push("/admin-migrate/action-items")}
              />
            ))}
          </div>
        </CommitteeHubSection>

        <CommitteeHubSection title="Initiatives" isEmpty emptyLabel="Initiatives coming soon">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={14} strokeWidth={1.75} color="var(--linear-color-ink-subtle)" />
            <Text size="sm" color="secondary">
              Track longer-running initiatives here in a later pass.
            </Text>
          </div>
        </CommitteeHubSection>
      </div>

      <InterestResponseModal
        interest={selectedInterest}
        onClose={() => setSelectedInterest(null)}
        onSend={async (payload) => {
          if (!selectedInterest) return;
          await respondWithEmail(selectedInterest.id, payload);
        }}
        onMarkHandled={async () => {
          if (!selectedInterest) return;
          await markHandled(selectedInterest.id);
        }}
      />

      <CreateVolunteerAskModal
        isOpen={askModalOpen}
        committee={committeeSlug}
        ask={editingAsk}
        onClose={() => {
          setAskModalOpen(false);
          setEditingAsk(null);
        }}
        onSaved={() => {
          void refetchAsks();
        }}
      />
    </ClassContentPage>
  );
}

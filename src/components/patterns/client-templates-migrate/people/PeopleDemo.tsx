"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { usePeople, useMemberships, type PersonWithMembership } from "hooks";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { MembersTable } from "./MembersTable";
import { NeighborsTable } from "./NeighborsTable";
import { VolunteersTable } from "./VolunteersTable";
import { MemberDetailPanel } from "./MemberDetailPanel";
import { NeighborDetailPanel } from "./NeighborDetailPanel";
import { VolunteerDetailPanel } from "./VolunteerDetailPanel";
import { AddPersonModal } from "./AddPersonModal";
import type { MemberRow, NeighborRow, VolunteerRow } from "./types";
import { hookFiltersForView, toMemberRow, toNeighborRow, toVolunteerRow, VOLUNTEERED_BEFORE_TAG } from "./adapters";

type PeopleView = "members" | "neighbors" | "volunteers";

const VIEW_TABS: { key: PeopleView; label: string }[] = [
  { key: "members", label: "Members" },
  { key: "neighbors", label: "Neighbors" },
  { key: "volunteers", label: "Volunteers" },
];

function isPeopleView(value: string | null): value is PeopleView {
  return value === "members" || value === "neighbors" || value === "volunteers";
}

type Selection =
  | { kind: "member"; row: MemberRow }
  | { kind: "neighbor"; row: NeighborRow }
  | { kind: "volunteer"; row: VolunteerRow };

function PeopleDemoInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<PeopleView>(isPeopleView(initial) ? initial : "members");

  const filters = useMemo(() => hookFiltersForView(view), [view]);
  const { people, loading, error, create, refetch } = usePeople({ filters });
  const { create: createMembership } = useMemberships();

  const members: MemberRow[] = useMemo(
    () => (view === "members" ? people.map(toMemberRow) : []),
    [people, view]
  );
  const neighbors: NeighborRow[] = useMemo(
    () => (view === "neighbors" ? people.map(toNeighborRow) : []),
    [people, view]
  );
  const volunteers: VolunteerRow[] = useMemo(
    () => (view === "volunteers" ? people.map(toVolunteerRow) : []),
    [people, view]
  );

  const [selection, setSelection] = useState<Selection | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  function selectView(next: PeopleView) {
    setView(next);
    setSelection(null);
  }

  async function handleAddMember(row: Omit<MemberRow, "id">) {
    const membership = await createMembership({
      tier: row.membershipType,
      status: "active",
      start_date: new Date().toISOString().slice(0, 10),
    });
    await create({
      full_name: row.name,
      email: row.email,
      membership_id: membership?.id ?? null,
    });
    await refetch();
  }

  async function handleAddNeighbor(row: Omit<NeighborRow, "id">) {
    await create({ full_name: row.name, email: row.email, address: row.address });
    await refetch();
  }

  async function handleAddVolunteer(row: Omit<VolunteerRow, "id">) {
    const tags = [row.interestArea, row.hasVolunteeredBefore ? VOLUNTEERED_BEFORE_TAG : null].filter(
      (tag): tag is string => Boolean(tag)
    );
    await create({ full_name: row.name, email: row.email, roles: ["volunteer"], tags });
    await refetch();
  }

  const body =
    view === "neighbors" ? (
      <NeighborsTable data={neighbors} onSelect={(row) => setSelection({ kind: "neighbor", row })} />
    ) : view === "volunteers" ? (
      <VolunteersTable data={volunteers} onSelect={(row) => setSelection({ kind: "volunteer", row })} />
    ) : (
      <MembersTable data={members} onSelect={(row) => setSelection({ kind: "member", row })} />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={
          <CanvasHeader
            topbar={{
              title: "People",
              endContent: (
                <Button
                  label={view === "members" ? "Add member" : view === "neighbors" ? "Add neighbor" : "Add volunteer"}
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setIsAddOpen(true)}
                />
              ),
            }}
            controls={
              <ViewTabs aria-label="People views">
                {VIEW_TABS.map((tab) => (
                  <ViewTab
                    key={tab.key}
                    label={tab.label}
                    selected={view === tab.key}
                    onClick={() => selectView(tab.key)}
                  />
                ))}
              </ViewTabs>
            }
          />
        }
        sideContent={
          selection ? (
            <OutlinedPanel onClose={() => setSelection(null)}>
              {selection.kind === "member" ? <MemberDetailPanel member={selection.row} /> : null}
              {selection.kind === "neighbor" ? <NeighborDetailPanel neighbor={selection.row} /> : null}
              {selection.kind === "volunteer" ? <VolunteerDetailPanel volunteer={selection.row} /> : null}
            </OutlinedPanel>
          ) : null
        }
      >
        {error ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">Couldn&apos;t load people: {error}</Text>
          </div>
        ) : loading ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">Loading…</Text>
          </div>
        ) : (
          body
        )}
      </FoundationLayout>

      <AddPersonModal
        isOpen={isAddOpen}
        view={view}
        onClose={() => setIsAddOpen(false)}
        onAddMember={handleAddMember}
        onAddNeighbor={handleAddNeighbor}
        onAddVolunteer={handleAddVolunteer}
      />
    </div>
  );
}

export function PeopleDemo() {
  return (
    <Suspense fallback={null}>
      <PeopleDemoInner />
    </Suspense>
  );
}

"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Button } from "@/components/patterns/primitives/Button";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { MembersTable } from "./MembersTable";
import { NeighborsTable } from "./NeighborsTable";
import { VolunteersTable } from "./VolunteersTable";
import { MemberDetailPanel } from "./MemberDetailPanel";
import { NeighborDetailPanel } from "./NeighborDetailPanel";
import { VolunteerDetailPanel } from "./VolunteerDetailPanel";
import { AddPersonModal } from "./AddPersonModal";
import {
  sampleMembers,
  sampleNeighbors,
  sampleVolunteers,
  type MemberRow,
  type NeighborRow,
  type VolunteerRow,
} from "@/data/mocks/people";

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

let nextId = 1000;

function PeopleDemoInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<PeopleView>(isPeopleView(initial) ? initial : "members");

  const [members, setMembers] = useState<MemberRow[]>(sampleMembers);
  const [neighbors, setNeighbors] = useState<NeighborRow[]>(sampleNeighbors);
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>(sampleVolunteers);

  const [selection, setSelection] = useState<Selection | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  function selectView(next: PeopleView) {
    setView(next);
    setSelection(null);
  }

  const body =
    view === "neighbors" ? (
      <NeighborsTable
        data={neighbors}
        onSelect={(row) => setSelection({ kind: "neighbor", row })}
      />
    ) : view === "volunteers" ? (
      <VolunteersTable
        data={volunteers}
        onSelect={(row) => setSelection({ kind: "volunteer", row })}
      />
    ) : (
      <MembersTable data={members} onSelect={(row) => setSelection({ kind: "member", row })} />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={
          <CanvasHeader
            topbar={{ title: "People" }}
            controls={
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
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
                <Button
                  label={view === "members" ? "Add member" : view === "neighbors" ? "Add neighbor" : "Add volunteer"}
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setIsAddOpen(true)}
                />
              </div>
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
        {body}
      </FoundationLayout>

      <AddPersonModal
        isOpen={isAddOpen}
        view={view}
        onClose={() => setIsAddOpen(false)}
        onAddMember={(row) => setMembers((prev) => [...prev, { ...row, id: `mem-${nextId++}` }])}
        onAddNeighbor={(row) => setNeighbors((prev) => [...prev, { ...row, id: `ngh-${nextId++}` }])}
        onAddVolunteer={(row) => setVolunteers((prev) => [...prev, { ...row, id: `vol-${nextId++}` }])}
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

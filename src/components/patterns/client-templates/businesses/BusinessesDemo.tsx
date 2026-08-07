"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { BusinessMembersPage } from "./BusinessMembersPage";
import { SponsorsPage } from "./SponsorsPage";
import { AllBusinessesTable } from "./AllBusinessesTable";

type BusinessesView = "members" | "sponsors" | "all";

function isBusinessesView(value: string | null): value is BusinessesView {
  return value === "members" || value === "sponsors" || value === "all";
}

function BusinessesDemoInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<BusinessesView>(
    isBusinessesView(initial) ? initial : "members",
  );

  const isFullBleed = view === "all";

  const body =
    view === "all" ? <AllBusinessesTable /> : view === "sponsors" ? <SponsorsPage /> : <BusinessMembersPage />;

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={isFullBleed ? undefined : 1200}
        header={
          <CanvasHeader
            topbar={{ title: "Businesses" }}
            controls={
              <ViewTabs aria-label="Businesses views">
                <ViewTab
                  label="Members"
                  selected={view === "members"}
                  onClick={() => setView("members")}
                />
                <ViewTab
                  label="Sponsors"
                  selected={view === "sponsors"}
                  onClick={() => setView("sponsors")}
                />
                <ViewTab
                  label="All Businesses"
                  selected={view === "all"}
                  onClick={() => setView("all")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>
    </div>
  );
}

export function BusinessesDemo() {
  return (
    <Suspense fallback={null}>
      <BusinessesDemoInner />
    </Suspense>
  );
}

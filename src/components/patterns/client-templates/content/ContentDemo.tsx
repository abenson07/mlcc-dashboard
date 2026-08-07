"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { ComingSoon } from "@/components/patterns/client-templates/shared";

type ContentView = "stories" | "faqs";

function isContentView(value: string | null): value is ContentView {
  return value === "stories" || value === "faqs";
}

function ContentDemoInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<ContentView>(isContentView(initial) ? initial : "stories");

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={
          <CanvasHeader
            topbar={{ title: "Content" }}
            controls={
              <ViewTabs aria-label="Content views">
                <ViewTab
                  label="Stories"
                  selected={view === "stories"}
                  onClick={() => setView("stories")}
                />
                <ViewTab
                  label="FAQs"
                  selected={view === "faqs"}
                  onClick={() => setView("faqs")}
                />
              </ViewTabs>
            }
          />
        }
      >
        <ComingSoon label={view === "faqs" ? "FAQs" : "Stories"} fullPage />
      </FoundationLayout>
    </div>
  );
}

export function ContentDemo() {
  return (
    <Suspense fallback={null}>
      <ContentDemoInner />
    </Suspense>
  );
}

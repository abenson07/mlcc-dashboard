"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { DraftsSection } from "@/components/patterns/client-templates/drafts";
import { VStack } from "@/components/patterns/primitives/Stack";
import { StoryCard } from "./StoryCard";
import { FaqCard } from "./FaqCard";
import { StoryFormPanel } from "./StoryFormPanel";
import { FaqFormPanel } from "./FaqFormPanel";
import { sampleStories, sampleFaqs, type Story, type Faq } from "@/data/mocks/content";

type ContentView = "stories" | "faqs";

function isContentView(value: string | null): value is ContentView {
  return value === "stories" || value === "faqs";
}

function ContentDemoInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<ContentView>(isContentView(initial) ? initial : "stories");

  const [stories, setStories] = useState<Story[]>(sampleStories);
  const [faqs, setFaqs] = useState<Faq[]>(sampleFaqs);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function changeView(next: ContentView) {
    setView(next);
    setSelectedId(null);
  }

  const selectedStory = view === "stories" ? stories.find((s) => s.id === selectedId) ?? null : null;
  const selectedFaq = view === "faqs" ? faqs.find((f) => f.id === selectedId) ?? null : null;

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        isSideContentVisible={selectedStory != null || selectedFaq != null}
        sideContent={
          selectedStory ? (
            <OutlinedPanel onClose={() => setSelectedId(null)}>
              <StoryFormPanel
                story={selectedStory}
                onClose={() => setSelectedId(null)}
                onSave={(updated) => {
                  setStories((current) =>
                    current.map((s) => (s.id === updated.id ? updated : s)),
                  );
                  setSelectedId(null);
                }}
              />
            </OutlinedPanel>
          ) : selectedFaq ? (
            <OutlinedPanel onClose={() => setSelectedId(null)}>
              <FaqFormPanel
                faq={selectedFaq}
                onClose={() => setSelectedId(null)}
                onSave={(updated) => {
                  setFaqs((current) => current.map((f) => (f.id === updated.id ? updated : f)));
                  setSelectedId(null);
                }}
              />
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{ title: "Content" }}
            controls={
              <ViewTabs aria-label="Content views">
                <ViewTab
                  label="Stories"
                  selected={view === "stories"}
                  onClick={() => changeView("stories")}
                />
                <ViewTab
                  label="FAQs"
                  selected={view === "faqs"}
                  onClick={() => changeView("faqs")}
                />
              </ViewTabs>
            }
          />
        }
      >
        <VStack gap={8}>
          {view === "stories" ? (
            <DraftsSection title="Stories" columns={1}>
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  isSelected={story.id === selectedId}
                  onClick={() => setSelectedId(story.id)}
                />
              ))}
            </DraftsSection>
          ) : (
            <DraftsSection title="FAQs" columns={1}>
              {faqs.map((faq) => (
                <FaqCard
                  key={faq.id}
                  faq={faq}
                  isSelected={faq.id === selectedId}
                  onClick={() => setSelectedId(faq.id)}
                />
              ))}
            </DraftsSection>
          )}
        </VStack>
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

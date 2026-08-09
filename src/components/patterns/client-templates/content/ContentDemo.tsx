"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { VStack } from "@/components/patterns/primitives/Stack";
import { StoryCard } from "./StoryCard";
import { FaqCard } from "./FaqCard";
import { StoryFormPanel } from "./StoryFormPanel";
import { FaqFormPanel } from "./FaqFormPanel";
import {
  sampleStories,
  sampleFaqs,
  CURRENT_USER_NAME,
  availableTopics,
  type Story,
  type Faq,
} from "@/data/mocks/content";

type ContentView = "stories" | "faqs";

function isContentView(value: string | null): value is ContentView {
  return value === "stories" || value === "faqs";
}

function emptyStory(): Story {
  return {
    id: `story-${Date.now()}`,
    title: "",
    author: CURRENT_USER_NAME,
    topic: availableTopics[0],
    status: "Draft",
    publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    imageUrl: "",
    description: "",
    body: "",
  };
}

function emptyFaq(): Faq {
  return { id: `faq-${Date.now()}`, question: "", answer: "", pages: [] };
}

function ContentDemoInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<ContentView>(isContentView(initial) ? initial : "stories");

  const [stories, setStories] = useState<Story[]>(sampleStories);
  const [faqs, setFaqs] = useState<Faq[]>(sampleFaqs);

  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  function changeView(next: ContentView) {
    setView(next);
    setEditingStory(null);
    setEditingFaq(null);
    setIsCreatingNew(false);
  }

  function closeDetail() {
    setEditingStory(null);
    setEditingFaq(null);
    setIsCreatingNew(false);
  }

  function startCreate() {
    setIsCreatingNew(true);
    if (view === "stories") setEditingStory(emptyStory());
    else setEditingFaq(emptyFaq());
  }

  const isDetailView = editingStory != null || editingFaq != null;

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={760}
        header={
          <CanvasHeader
            topbar={
              isDetailView
                ? {
                    title: isCreatingNew
                      ? view === "stories"
                        ? "New story"
                        : "New FAQ"
                      : view === "stories"
                        ? "Story"
                        : "FAQ",
                    breadcrumbs: [{ label: "Content", onClick: closeDetail }],
                  }
                : { title: "Content" }
            }
            controls={
              isDetailView ? undefined : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <ViewTabs aria-label="Content views">
                    <ViewTab
                      label="Stories"
                      selected={view === "stories"}
                      onClick={() => changeView("stories")}
                    />
                    <ViewTab label="FAQs" selected={view === "faqs"} onClick={() => changeView("faqs")} />
                  </ViewTabs>
                  <button
                    type="button"
                    onClick={startCreate}
                    aria-label={view === "stories" ? "New story" : "New FAQ"}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      height: 28,
                      paddingInline: 10,
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      color: "var(--linear-color-ink)",
                      background: "var(--linear-color-icon-button-secondary)",
                      border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                    }}
                  >
                    <Plus size={14} strokeWidth={1.75} />
                    {view === "stories" ? "New story" : "New FAQ"}
                  </button>
                </div>
              )
            }
            isControlsVisible={!isDetailView}
          />
        }
      >
        <div style={{ height: "100%", padding: isDetailView ? "24px 0" : "16px 0" }}>
          {editingStory ? (
            <StoryFormPanel
              story={editingStory}
              isNew={isCreatingNew}
              onClose={closeDetail}
              onSave={(updated) => {
                setStories((current) =>
                  current.some((s) => s.id === updated.id)
                    ? current.map((s) => (s.id === updated.id ? updated : s))
                    : [updated, ...current],
                );
                closeDetail();
              }}
            />
          ) : editingFaq ? (
            <FaqFormPanel
              faq={editingFaq}
              isNew={isCreatingNew}
              onClose={closeDetail}
              onSave={(updated) => {
                setFaqs((current) =>
                  current.some((f) => f.id === updated.id)
                    ? current.map((f) => (f.id === updated.id ? updated : f))
                    : [updated, ...current],
                );
                closeDetail();
              }}
            />
          ) : (
            <VStack gap={2}>
              {view === "stories"
                ? stories.map((story) => (
                    <StoryCard key={story.id} story={story} onClick={() => setEditingStory(story)} />
                  ))
                : faqs.map((faq) => <FaqCard key={faq.id} faq={faq} onClick={() => setEditingFaq(faq)} />)}
            </VStack>
          )}
        </div>
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

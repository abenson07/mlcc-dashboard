"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useFaqs, usePeople, useStories } from "hooks";
import { getCurrentPersonId } from "@/lib/people/currentPerson";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Button } from "@/components/patterns/primitives/Button";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { DraftsSection } from "@/components/patterns/client-templates/drafts";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import { StoryCard } from "./StoryCard";
import { FaqCard } from "./FaqCard";
import { StoryFormPanel } from "./StoryFormPanel";
import { FaqFormPanel } from "./FaqFormPanel";
import { NewStoryModal } from "./NewStoryModal";
import { NewFaqModal } from "./NewFaqModal";
import type { Faq, Story } from "./types";
import { contentStatusToStoryStatus, toFaq, toStory } from "./adapters";

type ContentView = "stories" | "faqs";

function isContentView(value: string | null): value is ContentView {
  return value === "stories" || value === "faqs";
}

function ContentDemoInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<ContentView>(isContentView(initial) ? initial : "stories");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const {
    stories: storyRows,
    loading: storiesLoading,
    error: storiesError,
    create: createStory,
    update: updateStory,
  } = useStories();
  const {
    faqs: faqRows,
    loading: faqsLoading,
    error: faqsError,
    create: createFaq,
    update: updateFaq,
    togglePage,
  } = useFaqs();
  const { people } = usePeople();

  const authorNameById = useMemo(() => new Map(people.map((p) => [p.id, p.full_name])), [people]);
  const stories: Story[] = useMemo(
    () => storyRows.map((row) => toStory(row, authorNameById)),
    [storyRows, authorNameById]
  );
  const faqs: Faq[] = useMemo(() => faqRows.map(toFaq), [faqRows]);

  function changeView(next: ContentView) {
    setView(next);
    setSelectedId(null);
  }

  const selectedStory = view === "stories" ? stories.find((s) => s.id === selectedId) ?? null : null;
  const selectedFaq = view === "faqs" ? faqs.find((f) => f.id === selectedId) ?? null : null;

  async function handleSaveStory(updated: Story) {
    await updateStory(updated.id, {
      title: updated.title,
      body: updated.body,
      status: contentStatusToStoryStatus(updated.status),
    });
    setSelectedId(null);
  }

  async function handleSaveFaq(updated: Faq) {
    await updateFaq(updated.id, { question: updated.question, answer: updated.answer });
    const before = selectedFaq?.pages ?? [];
    const added = updated.pages.filter((slug) => !before.includes(slug));
    const removed = before.filter((slug) => !updated.pages.includes(slug));
    await Promise.all([
      ...added.map((slug) => togglePage(updated.id, slug, true)),
      ...removed.map((slug) => togglePage(updated.id, slug, false)),
    ]);
    setSelectedId(null);
  }

  const loading = view === "stories" ? storiesLoading : faqsLoading;
  const error = view === "stories" ? storiesError : faqsError;

  async function handleCreateStory(story: Omit<Story, "id">) {
    const authorId = await getCurrentPersonId();
    await createStory({
      title: story.title,
      author_id: authorId,
      status: contentStatusToStoryStatus(story.status),
      body: story.body || "",
    });
  }

  async function handleCreateFaq(faq: Omit<Faq, "id">) {
    await createFaq({ question: faq.question, answer: faq.answer });
  }

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        isSideContentVisible={selectedStory != null || selectedFaq != null}
        sideContent={
          selectedStory ? (
            <div style={{ flex: "4 1 0%", minWidth: 0, height: "100%" }}>
              <OutlinedPanel width="100%" onClose={() => setSelectedId(null)}>
                <StoryFormPanel
                  story={selectedStory}
                  onClose={() => setSelectedId(null)}
                  onSave={handleSaveStory}
                />
              </OutlinedPanel>
            </div>
          ) : selectedFaq ? (
            <div style={{ flex: "4 1 0%", minWidth: 0, height: "100%" }}>
              <OutlinedPanel width="100%" onClose={() => setSelectedId(null)}>
                <FaqFormPanel faq={selectedFaq} onClose={() => setSelectedId(null)} onSave={handleSaveFaq} />
              </OutlinedPanel>
            </div>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: "Content",
              endContent: (
                <Button
                  label={view === "stories" ? "Add story" : "Add FAQ"}
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setIsAddOpen(true)}
                />
              ),
            }}
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
        {error ? (
          <Text color="secondary">Couldn&apos;t load content: {error}</Text>
        ) : loading ? (
          <Text color="secondary">Loading…</Text>
        ) : (
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
        )}
      </FoundationLayout>

      {view === "stories" ? (
        <NewStoryModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onCreate={handleCreateStory} />
      ) : (
        <NewFaqModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onCreate={handleCreateFaq} />
      )}
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

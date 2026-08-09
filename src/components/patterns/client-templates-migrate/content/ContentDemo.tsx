"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useFaqs, usePeople, useStories, useDemoGuard } from "hooks";
import { supabaseClient } from "@/lib/supabaseClient";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import { StoryCard } from "./StoryCard";
import { FaqCard } from "./FaqCard";
import { StoryFormPanel } from "./StoryFormPanel";
import { FaqFormPanel } from "./FaqFormPanel";
import type { Faq, Story } from "./types";
import { contentStatusToStoryStatus, toFaq, toStory } from "./adapters";
import { sampleStories } from "@/data/mocks/content";

type ContentView = "stories" | "faqs";

function isContentView(value: string | null): value is ContentView {
  return value === "stories" || value === "faqs";
}

function emptyStory(currentUser: { id: string; name: string } | null): Story {
  return {
    id: "",
    title: "",
    author: currentUser?.name ?? "—",
    authorId: currentUser?.id ?? null,
    status: "Draft",
    publishedAt: null,
    body: "",
  };
}

function emptyFaq(): Faq {
  return { id: "", question: "", answer: "", pages: [] };
}

function ContentDemoInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<ContentView>(isContentView(initial) ? initial : "stories");

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
  const { enabled: demo } = useDemoGuard();

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      if (!supabaseClient) return;
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (cancelled || !user?.email) return;
      const match = people.find((p) => p.email === user.email);
      if (match && !cancelled) setCurrentUser({ id: match.id, name: match.full_name });
    }
    resolve();
    return () => {
      cancelled = true;
    };
  }, [people]);

  const authorNameById = useMemo(() => new Map(people.map((p) => [p.id, p.full_name])), [people]);
  const stories: Story[] = useMemo(() => {
    if (demo) {
      return sampleStories.map((s): Story => ({
        id: s.id,
        title: s.title,
        author: s.author,
        authorId: null,
        status: s.status,
        publishedAt: s.publishedAt,
        body: s.body,
        imageUrl: s.imageUrl,
        description: s.description,
      }));
    }
    return storyRows.map((row) => toStory(row, authorNameById));
  }, [demo, storyRows, authorNameById]);
  const faqs: Faq[] = useMemo(() => faqRows.map(toFaq), [faqRows]);

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
    if (view === "stories") setEditingStory(emptyStory(currentUser));
    else setEditingFaq(emptyFaq());
  }

  async function handleSaveStory(updated: Story) {
    if (demo) {
      toast.success(`${updated.id ? "Story updated" : "Story created"} — demo mode, not saved`);
      closeDetail();
      return;
    }
    if (!updated.id) {
      await createStory({
        title: updated.title,
        author_id: updated.authorId,
        status: contentStatusToStoryStatus(updated.status),
        body: updated.body,
      });
    } else {
      await updateStory(updated.id, {
        title: updated.title,
        body: updated.body,
        status: contentStatusToStoryStatus(updated.status),
      });
    }
    closeDetail();
  }

  async function handleSaveFaq(updated: Faq) {
    if (demo) {
      toast.success(`${updated.id ? "FAQ updated" : "FAQ created"} — demo mode, not saved`);
      closeDetail();
      return;
    }
    if (!updated.id) {
      const created = await createFaq({ question: updated.question, answer: updated.answer });
      if (created) {
        await Promise.all(updated.pages.map((slug) => togglePage(created.id, slug, true)));
      }
    } else {
      await updateFaq(updated.id, { question: updated.question, answer: updated.answer });
      const before = editingFaq?.pages ?? [];
      const added = updated.pages.filter((slug) => !before.includes(slug));
      const removed = before.filter((slug) => !updated.pages.includes(slug));
      await Promise.all([
        ...added.map((slug) => togglePage(updated.id, slug, true)),
        ...removed.map((slug) => togglePage(updated.id, slug, false)),
      ]);
    }
    closeDetail();
  }

  const isDetailView = editingStory != null || editingFaq != null;
  const loading = demo ? false : view === "stories" ? storiesLoading : faqsLoading;
  const error = demo ? null : view === "stories" ? storiesError : faqsError;

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
              onSave={handleSaveStory}
            />
          ) : editingFaq ? (
            <FaqFormPanel faq={editingFaq} isNew={isCreatingNew} onClose={closeDetail} onSave={handleSaveFaq} />
          ) : error ? (
            <Text color="secondary">Couldn&apos;t load content: {error}</Text>
          ) : loading ? (
            <Text color="secondary">Loading…</Text>
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

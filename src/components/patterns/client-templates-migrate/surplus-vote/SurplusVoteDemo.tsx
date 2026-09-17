"use client";

import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSurplusVote } from "@/hooks/useSurplusVote";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Text } from "@/components/patterns/primitives/Text";
import type { SurplusVoteItem } from "@/lib/surplus-vote/items";
import { SurplusVoteRanker } from "./SurplusVoteRanker";
import { SurplusVoteResults } from "./SurplusVoteResults";

type SurplusVoteView = "vote" | "results";

const VIEW_TABS: { key: SurplusVoteView; label: string }[] = [
  { key: "vote", label: "Vote" },
  { key: "results", label: "Results" },
];

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

function SurplusVoteDemoInner() {
  const [view, setView] = useState<SurplusVoteView>("vote");
  const {
    orderedItems,
    myRanking,
    ballotCount,
    results,
    loading,
    saving,
    resetting,
    error,
    loaded,
    saveRanking,
    resetRanking,
    hasSaved,
  } = useSurplusVote();
  const [draft, setDraft] = useState<SurplusVoteItem[]>(orderedItems);

  useEffect(() => {
    setDraft(orderedItems);
  }, [orderedItems]);

  const dirty =
    !hasSaved ||
    !arraysEqual(
      draft.map((item) => item.id),
      myRanking ?? [],
    );

  async function handleSave() {
    try {
      await saveRanking(draft.map((item) => item.id));
      toast.success("Ranking saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn’t save ranking");
    }
  }

  async function handleReset() {
    if (!window.confirm("Reset your vote? This removes your saved ranking so you can start over.")) {
      return;
    }
    try {
      await resetRanking();
      toast.success("Vote reset — rank the cards again and save when ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn’t reset vote");
    }
  }

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={
          <CanvasHeader
            topbar={{ title: "Surplus Vote" }}
            controls={
              <ViewTabs aria-label="Surplus vote views">
                {VIEW_TABS.map((tab) => (
                  <ViewTab
                    key={tab.key}
                    label={tab.label}
                    selected={view === tab.key}
                    onClick={() => setView(tab.key)}
                  />
                ))}
              </ViewTabs>
            }
          />
        }
      >
        {loading ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">Loading…</Text>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 8px" }}>
            {error && !loaded ? (
              <Text color="secondary">Couldn&apos;t load saved rankings: {error}</Text>
            ) : null}
            {view === "vote" ? (
              <SurplusVoteRanker
                items={draft}
                onReorder={setDraft}
                onSave={() => void handleSave()}
                onReset={() => void handleReset()}
                saving={saving}
                resetting={resetting}
                dirty={dirty}
                hasSaved={hasSaved}
              />
            ) : (
              <SurplusVoteResults results={results} ballotCount={ballotCount} />
            )}
          </div>
        )}
      </FoundationLayout>
    </div>
  );
}

export function SurplusVoteDemo() {
  return (
    <Suspense fallback={null}>
      <SurplusVoteDemoInner />
    </Suspense>
  );
}

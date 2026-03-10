"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ComponentCard from "@/components/common/ComponentCard";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import FeaturesTable from "@/components/features/FeaturesTable";
import FeatureDetailSidebar from "@/components/features/FeatureDetailSidebar";
import type { FeatureItem, FeatureSurface } from "@/components/features/features-types";
import { PROJECT_IDS } from "@/components/features/features-types";
import { supabaseClient } from "@/lib/supabaseClient";

async function fetchProjectIssues(projectId: string) {
  const res = await fetch(
    `/api/linear/project-issues?projectId=${encodeURIComponent(projectId)}`
  );
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `Failed to fetch issues (${res.status})`);
  }
  return res.json() as Promise<Array<{
    id: string;
    title: string;
    description: string | null;
    stateName: string | null;
    priority: number;
    url: string | null;
  }>>;
}

async function fetchVoteCounts(surface: FeatureSurface) {
  if (!supabaseClient) {
    return [] as Array<{ feature_id: string; vote_count: number | null }>;
  }
  const { data, error } = await supabaseClient
    .from("feature_ids")
    .select("feature_id, vote_count")
    .eq("surface", surface);

  if (error) throw error;
  return (data ?? []) as Array<{ feature_id: string; vote_count: number | null }>;
}

function mergeFeatures(
  issues: Array<{
    id: string;
    title: string;
    description: string | null;
    stateName: string | null;
    priority: number;
    url: string | null;
  }>,
  voteCounts: Array<{ feature_id: string; vote_count: number | null }>,
  surface: FeatureSurface
): FeatureItem[] {
  const voteMap = new Map(
    voteCounts.map((v) => [v.feature_id, v.vote_count ?? 0])
  );
  const merged: FeatureItem[] = issues.map((issue) => ({
    ...issue,
    vote_count: voteMap.get(issue.id) ?? 0,
    surface,
  }));
  merged.sort((a, b) => {
    if (b.vote_count !== a.vote_count) return b.vote_count - a.vote_count;
    if (a.priority !== b.priority) return a.priority - b.priority;
    return (a.title || "").localeCompare(b.title || "");
  });
  return merged;
}

export interface FeaturesContentProps {
  surface: FeatureSurface;
}

export default function FeaturesContent({ surface }: FeaturesContentProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);
  const [lastUpvoteAt, setLastUpvoteAt] = useState<Record<string, number>>({});
  const [votingId, setVotingId] = useState<string | null>(null);
  const projectId = PROJECT_IDS[surface];

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: issues = [], isLoading: issuesLoading, error: issuesError } = useQuery({
    queryKey: ["linear-project-issues", projectId],
    queryFn: () => fetchProjectIssues(projectId),
    enabled: mounted && !!projectId,
  });

  const { data: voteCounts = [], refetch: refetchVotes } = useQuery({
    queryKey: ["feature_ids", surface],
    queryFn: () => fetchVoteCounts(surface),
    enabled: mounted,
  });

  const features = mergeFeatures(issues, voteCounts, surface);

  const handleVote = useCallback(
    async (item: FeatureItem) => {
      setVotingId(item.id);
      try {
        const res = await fetch("/api/features/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feature_id: item.id,
            surface: item.surface,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || "Vote failed");
        }
        setLastUpvoteAt((prev) => ({ ...prev, [item.id]: Date.now() }));
        await refetchVotes();
        if (selectedFeature?.id === item.id) {
          const updated = { ...selectedFeature, vote_count: selectedFeature.vote_count + 1 };
          setSelectedFeature(updated);
        }
      } finally {
        setVotingId(null);
      }
    },
    [refetchVotes, selectedFeature]
  );

  return (
    <TableWithDetailSidebar
        selectedItem={selectedFeature}
        onClose={() => setSelectedFeature(null)}
        sidebarTitle="Feature details"
        renderSidebar={(item) => (
          <FeatureDetailSidebar
            item={item}
            onClose={() => setSelectedFeature(null)}
          />
        )}
      >
        <ComponentCard title={surface === "dashboard" ? "Dashboard features" : "Website features"}>
          {!mounted && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
              <p className="text-gray-500 dark:text-gray-400">Loading features…</p>
            </div>
          )}
          {mounted && issuesError && (
            <div className="rounded-xl border border-red-200 bg-white p-4 text-center text-red-600 dark:border-red-900/30 dark:bg-white/[0.03] dark:text-red-400">
              {(issuesError as Error).message}
            </div>
          )}
          {mounted && issuesLoading && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
              <p className="text-gray-500 dark:text-gray-400">Loading features…</p>
            </div>
          )}
          {mounted && !issuesLoading && !issuesError && (
            <FeaturesTable
              features={features}
              selectedItem={selectedFeature}
              onRowClick={setSelectedFeature}
              onVote={handleVote}
              lastUpvoteAt={lastUpvoteAt}
              votingId={votingId}
            />
          )}
        </ComponentCard>
      </TableWithDetailSidebar>
  );
}

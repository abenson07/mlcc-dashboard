"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiBase } from "@/lib/apiBase";
import { SURPLUS_VOTE_ITEMS, shuffleSurplusVoteItems } from "@/lib/surplus-vote/items";
import { orderItemsByRanking, type SurplusVoteResult } from "@/lib/surplus-vote/score";
import type { SurplusVoteGetResponse } from "@/lib/surplus-vote/types";

export function useSurplusVote() {
  // Randomized once per mount so an unsaved ballot doesn't default to the
  // catalog order (which would bias voting toward whatever's listed first).
  const [defaultOrder, setDefaultOrder] = useState(() =>
    shuffleSurplusVoteItems(SURPLUS_VOTE_ITEMS),
  );
  const [myRanking, setMyRanking] = useState<string[] | null>(null);
  const [ballotCount, setBallotCount] = useState(0);
  const [results, setResults] = useState<SurplusVoteResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const applyPayload = useCallback((payload: SurplusVoteGetResponse) => {
    setMyRanking(payload.myRanking);
    setBallotCount(payload.ballotCount);
    setResults(payload.results);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/surplus-vote`);
        const json = (await res.json()) as SurplusVoteGetResponse & { error?: string };
        if (!res.ok) throw new Error(json.error ?? "Failed to load");
        if (!cancelled) {
          applyPayload(json);
          setLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyPayload]);

  const saveRanking = useCallback(
    async (rankedItemIds: string[]) => {
      setSaving(true);
      try {
        const res = await fetch(`${getApiBase()}/api/surplus-vote`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rankedItemIds }),
        });
        const json = (await res.json()) as SurplusVoteGetResponse & { error?: string };
        if (!res.ok) throw new Error(json.error ?? "Failed to save");
        applyPayload(json);
      } catch (e) {
        throw e instanceof Error ? e : new Error("Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [applyPayload],
  );

  const resetRanking = useCallback(async () => {
    setResetting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/surplus-vote`, { method: "DELETE" });
      const json = (await res.json()) as SurplusVoteGetResponse & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to reset");
      applyPayload(json);
      setDefaultOrder(shuffleSurplusVoteItems(SURPLUS_VOTE_ITEMS));
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to reset");
    } finally {
      setResetting(false);
    }
  }, [applyPayload]);

  const orderedItems = useMemo(
    () => (myRanking != null ? orderItemsByRanking(myRanking, SURPLUS_VOTE_ITEMS) : defaultOrder),
    [myRanking, defaultOrder],
  );

  return {
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
    hasSaved: myRanking != null,
  };
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Sponsorships } from "@/types/database";

export function useLeafletSponsorships(leafletId: string | null) {
  const { data: sponsorships = [], isLoading, error, refetch } = useQuery({
    queryKey: ["sponsorships", "leaflet", leafletId],
    queryFn: async () => {
      if (!supabaseClient || !leafletId) return [];
      const { data, error: qError } = await supabaseClient
        .from("sponsorships")
        .select("*, businesses ( business_name, email )")
        .eq("leaflet_id", leafletId);
      if (qError) throw qError;
      return (data ?? []) as Sponsorships[];
    },
    enabled: Boolean(leafletId),
  });

  const pledged = sponsorships.filter((s) => s.status === "pledged");
  const paid = sponsorships.filter((s) => s.status === "paid");
  const raised = paid.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const pledgedAmount = pledged.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const goal = sponsorships.reduce((sum, s) => sum + (s.amount ?? 0), 0);

  return {
    sponsorships,
    pledged,
    paid,
    raised,
    pledgedAmount,
    goal,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load sponsorships") : null,
    refetch: async () => {
      await refetch();
    },
  };
}

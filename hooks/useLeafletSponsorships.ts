"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Sponsorships, SponsorshipsInsert, SponsorshipsUpdate } from "@/types/database";

export function useLeafletSponsorships(leafletId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["sponsorships", "leaflet", leafletId] as const;

  const { data: sponsorships = [], isLoading, error, refetch } = useQuery({
    queryKey,
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

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["sponsorships", "leaflet"] });
  };

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<SponsorshipsInsert, "leaflet_id">) => {
      if (!supabaseClient || !leafletId) throw new Error("Supabase client is not initialized");
      const { data, error: iError } = await supabaseClient
        .from("sponsorships")
        .insert({ ...payload, leaflet_id: leafletId, event_id: null })
        .select("*, businesses ( business_name, email )")
        .single();
      if (iError) throw iError;
      return data as Sponsorships;
    },
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: SponsorshipsUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data, error: uError } = await supabaseClient
        .from("sponsorships")
        .update(patch)
        .eq("id", id)
        .select("*, businesses ( business_name, email )")
        .single();
      if (uError) throw uError;
      return data as Sponsorships;
    },
    onSuccess: () => invalidate(),
  });

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
    createSponsorship: (payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">) =>
      createMutation.mutateAsync(payload),
    updateSponsorship: (id: string, patch: SponsorshipsUpdate) =>
      updateMutation.mutateAsync({ id, patch }),
  };
}

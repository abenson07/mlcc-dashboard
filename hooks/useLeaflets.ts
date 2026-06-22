"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import { getApiBase } from "@/lib/apiBase";
import type { Leaflets, LeafletsInsert } from "@/types/database";

export const LEAFLETS_QUERY_KEY = ["leaflets"] as const;

export function useLeaflets(options: { autoFetch?: boolean } = {}) {
  const { autoFetch = true } = options;
  const queryClient = useQueryClient();

  const { data: leaflets = [], isLoading, error, refetch } = useQuery({
    queryKey: LEAFLETS_QUERY_KEY,
    queryFn: async () => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data, error: qError } = await supabaseClient
        .from("leaflets")
        .select("*")
        .order("distribution_date", { ascending: false });
      if (qError) throw qError;
      return data as Leaflets[];
    },
    enabled: autoFetch,
  });

  const activeLeaflet =
    leaflets.find((l) => l.status === "active") ??
    leaflets.find((l) => l.status === "planned") ??
    null;

  const createMutation = useMutation({
    mutationFn: async (input: Pick<LeafletsInsert, "title" | "distribution_date">) => {
      const res = await fetch(`${getApiBase()}/api/leaflets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as { error?: string; leaflet?: Leaflets };
      if (!res.ok) throw new Error(data.error ?? "Failed to create leaflet");
      return data.leaflet!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAFLETS_QUERY_KEY });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${getApiBase()}/api/leaflets/${id}/activate`, {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string; leaflet?: Leaflets };
      if (!res.ok) throw new Error(data.error ?? "Failed to activate");
      return data.leaflet!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAFLETS_QUERY_KEY });
    },
  });

  const closeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${getApiBase()}/api/leaflets/${id}/close`, {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string; closed?: Leaflets };
      if (!res.ok) throw new Error(data.error ?? "Failed to close");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAFLETS_QUERY_KEY });
    },
  });

  return {
    leaflets,
    activeLeaflet,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load leaflets") : null,
    refetch: async () => {
      await refetch();
    },
    create: (input: Pick<LeafletsInsert, "title" | "distribution_date">) =>
      createMutation.mutateAsync(input),
    activate: (id: string) => activateMutation.mutateAsync(id),
    close: (id: string) => closeMutation.mutateAsync(id),
  };
}

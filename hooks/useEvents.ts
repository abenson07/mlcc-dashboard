"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Events } from "@/types/database";

export const EVENTS_QUERY_KEY = ["events"] as const;

async function fetchEventsList(): Promise<Events[]> {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized.");
  }
  const { data, error } = await supabaseClient
    .from("events")
    .select("id, name, date")
    .order("date", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }
  return (data as Events[]) ?? [];
}

export function useEvents({ autoFetch = true }: { autoFetch?: boolean } = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: fetchEventsList,
    enabled: autoFetch,
  });

  return {
    events: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
  };
}

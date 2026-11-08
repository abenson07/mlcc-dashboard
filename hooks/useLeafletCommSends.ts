"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { CommSend } from "@/lib/leaflets/comm/commSends";

export const LEAFLET_COMM_SENDS_QUERY_KEY = "leafletCommSends";

/** Logged deliverer emails for a leaflet: who got which template, and when. */
export function useLeafletCommSends(leafletId: string | null, options?: { enabled?: boolean }) {
  const enabled = Boolean(leafletId) && (options?.enabled ?? true);
  const { data: sends = [], refetch } = useQuery({
    queryKey: [LEAFLET_COMM_SENDS_QUERY_KEY, leafletId],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/api/leaflets/${leafletId}/comm/sends`);
      const data = (await res.json()) as { error?: string; sends?: CommSend[] };
      if (!res.ok) throw new Error(data.error ?? "Failed to load sent emails");
      return data.sends ?? [];
    },
    enabled,
  });
  return { sends, refetch: async () => void (await refetch()) };
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getApiBase } from "@/lib/apiBase";
import type { SearchResponse } from "@/lib/search/types";

async function fetchGlobalSearch(q: string, limit: number): Promise<SearchResponse> {
  const base = getApiBase();
  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`${base}/api/search?${params.toString()}`);
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `Search failed (${res.status})`);
  }
  return res.json() as Promise<SearchResponse>;
}

export function useGlobalSearch(query: string, enabled: boolean, limit = 5) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ["global-search", debouncedQuery, limit],
    queryFn: () => fetchGlobalSearch(debouncedQuery, limit),
    enabled,
    staleTime: 30_000,
  });
}

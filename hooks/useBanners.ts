"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBannerItems, type BannerItem } from "@marketing/data/banner";
import type { BannerView, BannerWriteInput } from "@/lib/webflow/banners";

export const BANNERS_QUERY_KEY = ["banners"] as const;

function siteBannerToView(item: BannerItem): BannerView {
  return {
    id: `site:${item.linkPath}`,
    name: item.headline,
    slug: item.linkPath.replace(/^\//, ""),
    message: item.linkText,
    linkUrl: item.linkPath,
    active: true,
    expiresAt: null,
    urgent: false,
    urgentUntil: null,
    editorNotes: "",
    isArchived: false,
    isDraft: false,
    derived: { isExpired: false, inUrgentWindow: false, hiddenByRetention: false },
  };
}

export function useBanners() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: BANNERS_QUERY_KEY,
    queryFn: async (): Promise<BannerView[]> => getBannerItems().map(siteBannerToView),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: async (_input: BannerWriteInput): Promise<BannerView> => {
      throw new Error(
        "Site banners are generated from events, Leaflet stories, and volunteer asks — not stored separately.",
      );
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async (_args: {
      id: string;
      input: BannerWriteInput;
    }): Promise<BannerView> => {
      throw new Error(
        "Site banners are generated from events, Leaflet stories, and volunteer asks — not stored separately.",
      );
    },
    onSuccess: invalidate,
  });

  return {
    banners: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    create: (input: BannerWriteInput) => createMutation.mutateAsync(input),
    update: (id: string, input: BannerWriteInput) =>
      updateMutation.mutateAsync({ id, input }),
    invalidate,
  };
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type {
  BusinessMemberships,
  BusinessMembershipsInsert,
  BusinessMembershipsUpdate,
} from "@/types/database";
import {
  BUSINESS_MEMBERSHIP_ANNUAL_DUES,
  BUSINESS_MEMBERSHIP_TIER,
} from "schemas/business_memberships";

interface UseBusinessMembershipsReturn {
  create: (data: BusinessMembershipsInsert) => Promise<BusinessMemberships>;
  update: (id: string, data: BusinessMembershipsUpdate) => Promise<BusinessMemberships>;
}

export function useBusinessMemberships(): UseBusinessMembershipsReturn {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: BusinessMembershipsInsert) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: created, error } = await supabaseClient
        .from("business_memberships")
        .insert({
          ...data,
          tier: BUSINESS_MEMBERSHIP_TIER,
          annual_dues: data.annual_dues ?? BUSINESS_MEMBERSHIP_ANNUAL_DUES,
        })
        .select()
        .single();
      if (error) throw error;
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BusinessMembershipsUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: updated, error } = await supabaseClient
        .from("business_memberships")
        .update({ ...data, tier: BUSINESS_MEMBERSHIP_TIER })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });

  // Propagate Postgres errors the same way `useMemberships` does — swallowing
  // them is how a status write once looked like a successful save.
  const create = (data: BusinessMembershipsInsert): Promise<BusinessMemberships> =>
    createMutation.mutateAsync(data);

  const update = (id: string, data: BusinessMembershipsUpdate): Promise<BusinessMemberships> =>
    updateMutation.mutateAsync({ id, data });

  return { create, update };
}

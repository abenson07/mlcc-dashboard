"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Memberships, MembershipsInsert, MembershipsUpdate } from "@/types/database";

interface UseMembershipsReturn {
  create: (data: MembershipsInsert) => Promise<Memberships>;
  update: (id: string, data: MembershipsUpdate) => Promise<Memberships>;
}

export function useMemberships(): UseMembershipsReturn {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: MembershipsInsert) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: created, error } = await supabaseClient
        .from("memberships")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MembershipsUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data: updated, error } = await supabaseClient
        .from("memberships")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  // These deliberately propagate the underlying Postgres error rather than
  // returning null. Swallowing it here is how an invalid enum write once
  // looked like a successful save that silently reverted on refetch.
  const create = (data: MembershipsInsert): Promise<Memberships> =>
    createMutation.mutateAsync(data);

  const update = (id: string, data: MembershipsUpdate): Promise<Memberships> =>
    updateMutation.mutateAsync({ id, data });

  return { create, update };
}

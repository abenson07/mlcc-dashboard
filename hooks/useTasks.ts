"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Tasks, TasksUpdate } from "@/types/database";

export function taskDueDate(distributionDate: string, offsetDays: number): Date {
  const d = new Date(`${distributionDate}T00:00:00`);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

export function useTasks(leafletId: string | null, distributionDate: string | null) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tasks", "leaflet", leafletId],
    queryFn: async () => {
      if (!supabaseClient || !leafletId) return [];
      const { data, error: qError } = await supabaseClient
        .from("tasks")
        .select("*")
        .eq("context", "leaflet")
        .eq("context_id", leafletId);
      if (qError) throw qError;
      const rows = (data ?? []) as Tasks[];
      if (!distributionDate) return rows;
      return [...rows].sort(
        (a, b) =>
          taskDueDate(distributionDate, a.offset_days).getTime() -
          taskDueDate(distributionDate, b.offset_days).getTime(),
      );
    },
    enabled: Boolean(leafletId),
  });

  const openCount = tasks.filter((t) => !t.is_complete).length;

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TasksUpdate }) => {
      if (!supabaseClient) throw new Error("Supabase client is not initialized");
      const { data, error: uError } = await supabaseClient
        .from("tasks")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (uError) throw uError;
      return data as Tasks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "leaflet", leafletId] });
    },
  });

  return {
    tasks,
    openCount,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load tasks") : null,
    refetch: async () => {
      await refetch();
    },
    toggleComplete: async (task: Tasks) => {
      const next = !task.is_complete;
      await updateMutation.mutateAsync({
        id: task.id,
        patch: {
          is_complete: next,
          completed_at: next ? new Date().toISOString() : null,
        },
      });
    },
  };
}

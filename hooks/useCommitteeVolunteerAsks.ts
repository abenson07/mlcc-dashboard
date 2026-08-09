"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Events, People, VolunteerAsks, Volunteers } from "@/types/database";
import type { CommitteeSlug } from "schemas/committee_meetings";
import type { VolunteerAskWithSignups, VolunteerSignup } from "./useVolunteerAsks";

export const committeeVolunteerAsksQueryKey = (committee: CommitteeSlug | null) =>
  ["volunteer_asks", "committee", committee] as const;

type AskRow = VolunteerAsks & {
  event: Events | Events[] | null;
  volunteers: (Volunteers & { person: People | People[] | null })[];
};

function normalizeOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function transformAsk(row: AskRow): VolunteerAskWithSignups {
  const { volunteers: volunteerRows, event: eventRaw, ...ask } = row;
  const event = normalizeOne(eventRaw);
  const signups: VolunteerSignup[] = (volunteerRows ?? []).map((v) => ({
    id: v.id,
    volunteer_ask_id: v.volunteer_ask_id,
    person_id: v.person_id,
    status: v.status ?? "accepted",
    accepted_at: v.accepted_at ?? null,
    accepted_by: v.accepted_by ?? null,
    created_at: v.created_at,
    person: normalizeOne(v.person),
  }));
  const signup_count = signups.length;
  return {
    ...ask,
    event,
    signups,
    signup_count,
    remaining_slots: Math.max(0, ask.quantity - signup_count),
  };
}

export function useCommitteeVolunteerAsks(committee: CommitteeSlug | null) {
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: committeeVolunteerAsksQueryKey(committee),
    queryFn: async () => {
      if (!supabaseClient || !committee) return [];
      const { data: rows, error: qError } = await supabaseClient
        .from("volunteer_asks")
        .select(
          `
          *,
          event:events(*),
          volunteers(
            id,
            volunteer_ask_id,
            person_id,
            status,
            accepted_at,
            accepted_by,
            created_at,
            person:people(id, full_name, email, phone)
          )
        `,
        )
        .eq("committee", committee)
        .order("created_at", { ascending: false });

      if (qError) throw qError;
      return (rows as AskRow[] | null)?.map(transformAsk) ?? [];
    },
    enabled: Boolean(committee),
  });

  const openAsks = data.filter((a) => a.remaining_slots > 0);
  const filledAsks = data.filter((a) => a.remaining_slots <= 0);

  return {
    asks: data,
    openAsks,
    filledAsks,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: async () => {
      await refetch();
    },
  };
}

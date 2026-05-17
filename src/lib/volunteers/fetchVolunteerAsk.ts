import type { SupabaseClient } from "@supabase/supabase-js";
import type { VolunteerAskWithSignups } from "hooks";
import type { VolunteerAsks, People } from "@/types/database";

type AskRow = VolunteerAsks & {
  volunteers: {
    id: string;
    volunteer_ask_id: string;
    person_id: string;
    created_at: string;
    person: People | People[] | null;
  }[];
  event:
    | { id: string; name: string | null; date: string | null }
    | { id: string; name: string | null; date: string | null }[]
    | null;
};

function normalizeOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function transformAsk(row: AskRow): VolunteerAskWithSignups {
  const { volunteers: volunteerRows, event: eventRaw, ...ask } = row;
  const event = normalizeOne(eventRaw);
  const signups = (volunteerRows ?? []).map((v) => ({
    id: v.id,
    volunteer_ask_id: v.volunteer_ask_id,
    person_id: v.person_id,
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

const ASK_SELECT = `
  *,
  event:events(id, name, date),
  volunteers(
    id,
    volunteer_ask_id,
    person_id,
    created_at,
    person:people(id, full_name, email, phone)
  )
`;

export async function fetchVolunteerAskById(
  supabase: SupabaseClient,
  askId: string
): Promise<VolunteerAskWithSignups | null> {
  const { data, error } = await supabase
    .from("volunteer_asks")
    .select(ASK_SELECT)
    .eq("id", askId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch volunteer ask: ${error.message}`);
  if (!data) return null;
  return transformAsk(data as AskRow);
}

export async function fetchAllVolunteerAsks(
  supabase: SupabaseClient
): Promise<VolunteerAskWithSignups[]> {
  const { data, error } = await supabase
    .from("volunteer_asks")
    .select(ASK_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch volunteer asks: ${error.message}`);
  return (data as AskRow[] | null)?.map(transformAsk) ?? [];
}

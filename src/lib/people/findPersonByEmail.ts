import type { SupabaseClient } from "@supabase/supabase-js";

export type PersonNameRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
};

function escapeIlikeExact(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

/**
 * Case-insensitive exact match on `people.email`.
 * Returns every row (usually 0 or 1) so callers can log collisions.
 */
export async function findPeopleByEmail(
  supabase: SupabaseClient,
  email: string | null | undefined,
): Promise<{ people: PersonNameRow[]; error: string | null }> {
  const trimmed = email?.trim();
  if (!trimmed) return { people: [], error: null };

  const { data, error } = await supabase
    .from("people")
    .select("id, full_name, email, phone")
    .ilike("email", escapeIlikeExact(trimmed))
    .limit(5);

  if (error) return { people: [], error: error.message };
  return { people: (data ?? []) as PersonNameRow[], error: null };
}

export async function findPersonByEmail(
  supabase: SupabaseClient,
  email: string | null | undefined,
): Promise<{ person: PersonNameRow | null; matchCount: number; error: string | null }> {
  const { people, error } = await findPeopleByEmail(supabase, email);
  return {
    person: people[0] ?? null,
    matchCount: people.length,
    error,
  };
}

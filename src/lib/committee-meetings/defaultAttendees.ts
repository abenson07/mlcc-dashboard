import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommitteeSlug } from "schemas/committee_meetings";
import type { People } from "@/types/database";

export type DefaultAttendeePerson = Pick<People, "id" | "full_name" | "email">;

export async function fetchDefaultAttendeePersonIds(
  supabase: SupabaseClient,
  committee: CommitteeSlug,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("committee_default_attendees")
    .select("person_id")
    .eq("committee_slug", committee)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.person_id as string);
}

export async function fetchDefaultAttendeesWithPeople(
  supabase: SupabaseClient,
  committee: CommitteeSlug,
): Promise<Array<{ id: string; person_id: string; person: DefaultAttendeePerson | null }>> {
  const { data, error } = await supabase
    .from("committee_default_attendees")
    .select("id, person_id, created_at, people ( id, full_name, email )")
    .eq("committee_slug", committee)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const peopleRaw = row.people as unknown;
    const people = (Array.isArray(peopleRaw) ? peopleRaw[0] : peopleRaw) as
      | DefaultAttendeePerson
      | null
      | undefined;
    return {
      id: row.id as string,
      person_id: row.person_id as string,
      person: people ?? null,
    };
  });
}

export async function replaceDefaultAttendees(
  supabase: SupabaseClient,
  committee: CommitteeSlug,
  personIds: string[],
): Promise<void> {
  const uniqueIds = [...new Set(personIds.filter(Boolean))];

  const { error: deleteError } = await supabase
    .from("committee_default_attendees")
    .delete()
    .eq("committee_slug", committee);

  if (deleteError) throw new Error(deleteError.message);

  if (uniqueIds.length === 0) return;

  const { data: existingPeople, error: peopleError } = await supabase
    .from("people")
    .select("id")
    .in("id", uniqueIds);

  if (peopleError) throw new Error(peopleError.message);

  const validIds = (existingPeople ?? []).map((p) => p.id);
  if (validIds.length !== uniqueIds.length) {
    throw new Error("One or more selected people no longer exist.");
  }

  const { error: insertError } = await supabase.from("committee_default_attendees").insert(
    validIds.map((person_id) => ({ committee_slug: committee, person_id })),
  );

  if (insertError) throw new Error(insertError.message);
}

export async function seedMeetingAttendeesFromDefaults(
  supabase: SupabaseClient,
  meetingId: string,
  committee: CommitteeSlug,
): Promise<number> {
  const personIds = await fetchDefaultAttendeePersonIds(supabase, committee);
  if (personIds.length === 0) return 0;

  const { error } = await supabase.from("committee_meeting_attendees").insert(
    personIds.map((person_id) => ({
      meeting_id: meetingId,
      person_id,
    })),
  );

  if (error) throw new Error(error.message);
  return personIds.length;
}

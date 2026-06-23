import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommitteeMeetings, Events } from "@/types/database";
import type { CommitteeSlug } from "schemas/committee_meetings";
import { createEvent } from "@/lib/events/createEvent";
import { committeeMeetingEventName } from "./committeeMeetingUtils";
import { seedMeetingAttendeesFromDefaults } from "./defaultAttendees";

export type CreateCommitteeMeetingInput = {
  committee: CommitteeSlug;
  starts_at: string;
  ends_at?: string | null;
  location_type: "in_person" | "remote" | "hybrid";
  location?: string | null;
  google_calendar_url?: string | null;
};

export async function createCommitteeMeeting(
  supabase: SupabaseClient,
  input: CreateCommitteeMeetingInput,
): Promise<{ event: Events; meeting: CommitteeMeetings }> {
  const name = committeeMeetingEventName(input.committee, input.starts_at);

  const event = await createEvent(supabase, {
    name,
    starts_at: input.starts_at,
    ends_at: input.ends_at ?? null,
    event_template_id: null,
    field_data: {
      kind: "committee_meeting",
      committee: input.committee,
      location: input.location ?? undefined,
      status: "planning",
    },
  });

  const { data: meeting, error: meetingError } = await supabase
    .from("committee_meetings")
    .insert({
      event_id: event.id,
      committee: input.committee,
      location_type: input.location_type,
      location: input.location ?? null,
      google_calendar_url: input.google_calendar_url ?? null,
      agenda_json: { type: "doc", content: [{ type: "paragraph" }] },
    })
    .select()
    .single();

  if (meetingError || !meeting) {
    throw new Error(meetingError?.message ?? "Failed to create committee meeting");
  }

  await seedMeetingAttendeesFromDefaults(supabase, meeting.id, input.committee);

  return { event, meeting: meeting as CommitteeMeetings };
}

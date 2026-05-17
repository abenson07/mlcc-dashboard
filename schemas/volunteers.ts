/**
 * Volunteers (signup) Schema — join between people and volunteer_asks
 * Based on Supabase schema
 */

export interface Volunteers {
  id: string; // uuid
  volunteer_ask_id: string; // uuid (references volunteer_asks)
  person_id: string; // uuid (references people)
  created_at: string; // timestamptz
}

export interface VolunteersInsert {
  volunteer_ask_id: string;
  person_id: string;
}

/**
 * Events Schema
 * Dashboard-native events (parallel track to Webflow calendar).
 */

export interface Events {
  id: string;
  name: string | null;
  date: string | null;
  event_template_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  slug: string | null;
  field_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EventsInsert {
  name?: string | null;
  date?: string | null;
  event_template_id?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  slug?: string | null;
  field_data?: Record<string, unknown>;
}

export interface EventsUpdate {
  name?: string | null;
  date?: string | null;
  event_template_id?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  slug?: string | null;
  field_data?: Record<string, unknown>;
}

/**
 * Events Schema
 * Dashboard-native events (parallel track to Webflow calendar).
 *
 * `field_data` jsonb conventions (see `src/lib/events/eventData.ts`):
 * - location, status, capacity, image_url, description
 * - kind: "council" | "external" (default council)
 * - qr_code_id, webflow_item_id (migration bridge)
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

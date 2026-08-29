/**
 * Stories Schema
 * Based on Supabase schema (supabase/migrations/20260707190000_stories.sql)
 */

export type StoryStatus = "draft" | "published";

export interface Stories {
  id: string; // uuid
  title: string;
  /** Live column: free-text byline (name or kebab slug). */
  author: string;
  author_id?: string | null;
  author_slug?: string | null;
  cover_image_url: string | null;
  body: string;
  status: StoryStatus;
  publish_date: string | null;
  leaflet_id: string | null;
  slug?: string | null;
  story_type?: string | null;
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoriesInsert {
  title?: string;
  author?: string;
  author_id?: string | null;
  author_slug?: string | null;
  cover_image_url?: string | null;
  body?: string;
  status?: StoryStatus;
  publish_date?: string | null;
  leaflet_id?: string | null;
  slug?: string | null;
  story_type?: string | null;
  featured?: boolean;
}

export interface StoriesUpdate {
  title?: string;
  author?: string;
  author_id?: string | null;
  author_slug?: string | null;
  cover_image_url?: string | null;
  body?: string;
  status?: StoryStatus;
  publish_date?: string | null;
  leaflet_id?: string | null;
  slug?: string | null;
  story_type?: string | null;
  featured?: boolean;
}

/**
 * Sponsorships Schema
 */

export type SponsorshipStatus = "pledged" | "invoiced" | "paid";

export interface Sponsorships {
  id: string;
  business_id: string | null;
  event_id: string | null;
  leaflet_id: string | null;
  amount: number | null;
  status: SponsorshipStatus | null;
  memo: string | null;
  paid_date: string | null;
  description: string | null;
  image_url: string | null;
  quantity: number;
}

export interface SponsorshipsInsert {
  business_id?: string | null;
  event_id?: string | null;
  leaflet_id?: string | null;
  amount?: number | null;
  status?: SponsorshipStatus | null;
  memo?: string | null;
  paid_date?: string | null;
  description?: string | null;
  image_url?: string | null;
  quantity?: number;
}

export interface SponsorshipsUpdate {
  business_id?: string | null;
  event_id?: string | null;
  leaflet_id?: string | null;
  amount?: number | null;
  status?: SponsorshipStatus | null;
  memo?: string | null;
  paid_date?: string | null;
  description?: string | null;
  image_url?: string | null;
  quantity?: number;
}

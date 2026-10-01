/**
 * Business Memberships Schema
 * Based on Supabase schema
 */

import { MembershipStatusEnum } from "./memberships";

/** One public product — $200/year. Not Gold/Silver/Bronze (those are sponsorship levels). */
export const BUSINESS_MEMBERSHIP_TIER = "Business membership";
export const BUSINESS_MEMBERSHIP_ANNUAL_DUES = 200;

export interface BusinessMemberships {
  id: string; // uuid
  status: MembershipStatusEnum; // not null
  last_renewal: string; // date, not null
  payment_method: string | null; // text
  is_subscription: boolean | null; // default false
  /** Always "Business membership" — there is one product, not Gold/Silver/Bronze. */
  tier: string | null;
  /** Annual dues in dollars. */
  annual_dues: number | null;
  /** Stripe sync columns — null for manually-managed members. */
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  customer_email?: string | null;
  cancel_at_period_end?: boolean; // default false
  current_period_end?: string | null; // date
  canceled_at?: string | null; // timestamp with time zone
}

export interface BusinessMembershipsInsert {
  status: MembershipStatusEnum;
  last_renewal: string;
  payment_method?: string | null;
  is_subscription?: boolean | null;
  tier?: string | null;
  annual_dues?: number | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  customer_email?: string | null;
  cancel_at_period_end?: boolean;
  current_period_end?: string | null;
  canceled_at?: string | null;
}

export interface BusinessMembershipsUpdate {
  status?: MembershipStatusEnum;
  last_renewal?: string;
  payment_method?: string | null;
  is_subscription?: boolean | null;
  tier?: string | null;
  annual_dues?: number | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  customer_email?: string | null;
  cancel_at_period_end?: boolean;
  current_period_end?: string | null;
  canceled_at?: string | null;
}

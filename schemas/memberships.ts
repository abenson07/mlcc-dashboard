/**
 * Memberships Schema
 * Based on Supabase schema
 */

/**
 * These mirror the Postgres enums `public.membership_tier_enum` and
 * `public.membership_status_enum` exactly, casing included. They were `string`
 * until an admin discovered that writing "lapsed" typechecked fine and then
 * failed at runtime — Postgres enum labels are case-sensitive and there is no
 * "Lapsed" label. Keep these in step with `01_enums.sql`.
 */
export type MembershipTierEnum = "Household" | "Individual" | "Senior" | "Student";
export type MembershipStatusEnum = "Active" | "Expired" | "Donation" | "Cancelled";

export interface Memberships {
  id: string; // uuid
  tier: MembershipTierEnum | null;
  status: MembershipStatusEnum | null;
  last_renewal: string | null; // date
  payment_method: string | null; // text
  is_subscription: boolean | null; // default false
  start_date: string | null; // date
  stripe_customer_id: string | null; // text
  stripe_subscription_id: string | null; // text
  stripe_tier_id: string | null; // text
  customer_email: string | null; // text
  created_at: string | null; // timestamp with time zone
  cancel_at_period_end: boolean; // default false
  current_period_end: string | null; // date
  canceled_at: string | null; // timestamp with time zone
}

export interface MembershipsInsert {
  tier?: MembershipTierEnum | null;
  status?: MembershipStatusEnum | null;
  last_renewal?: string | null;
  payment_method?: string | null;
  is_subscription?: boolean | null;
  start_date?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_tier_id?: string | null;
  customer_email?: string | null;
  created_at?: string | null;
  cancel_at_period_end?: boolean;
  current_period_end?: string | null;
  canceled_at?: string | null;
}

export interface MembershipsUpdate {
  tier?: MembershipTierEnum | null;
  status?: MembershipStatusEnum | null;
  last_renewal?: string | null;
  payment_method?: string | null;
  is_subscription?: boolean | null;
  start_date?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_tier_id?: string | null;
  customer_email?: string | null;
  created_at?: string | null;
  cancel_at_period_end?: boolean;
  current_period_end?: string | null;
  canceled_at?: string | null;
}

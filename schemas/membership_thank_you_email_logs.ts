/**
 * Membership Thank You Email Logs Schema
 * Tracks send attempts and idempotency for renewal reminders.
 */

export type MembershipThankYouEmailStatus =
  | "pending"
  | "sent"
  | "failed"
  | "skipped";

export interface MembershipThankYouEmailLogs {
  id: string; // uuid
  membership_id: string; // uuid
  person_id: string | null; // uuid
  renewal_date: string; // date
  email: string; // text
  receipt_period_start: string; // date
  receipt_period_end: string; // date
  receipt_total: number; // numeric(10,2)
  receipt_line_items: Array<Record<string, unknown>>; // jsonb
  status: MembershipThankYouEmailStatus; // text/check constraint
  provider_message_id: string | null; // text
  sent_at: string | null; // timestamp with time zone
  error: string | null; // text
  attempt_count: number; // integer
  run_id: string | null; // text
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
}

export interface MembershipThankYouEmailLogsInsert {
  membership_id: string;
  person_id?: string | null;
  renewal_date: string;
  email: string;
  receipt_period_start: string;
  receipt_period_end: string;
  receipt_total?: number;
  receipt_line_items?: Array<Record<string, unknown>>;
  status?: MembershipThankYouEmailStatus;
  provider_message_id?: string | null;
  sent_at?: string | null;
  error?: string | null;
  attempt_count?: number;
  run_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MembershipThankYouEmailLogsUpdate {
  membership_id?: string;
  person_id?: string | null;
  renewal_date?: string;
  email?: string;
  receipt_period_start?: string;
  receipt_period_end?: string;
  receipt_total?: number;
  receipt_line_items?: Array<Record<string, unknown>>;
  status?: MembershipThankYouEmailStatus;
  provider_message_id?: string | null;
  sent_at?: string | null;
  error?: string | null;
  attempt_count?: number;
  run_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

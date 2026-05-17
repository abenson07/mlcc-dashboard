export type ScheduledEmailRow = {
  id: string;
  subject: string | null;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
};

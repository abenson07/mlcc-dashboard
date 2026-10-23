import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import { getResend, getResendFromEmail } from "@/lib/resend";
import { sanitizeEmailHtml } from "@/lib/marketing/sanitizeEmailHtml";
import { UNSUBSCRIBE_TAG } from "@/lib/marketing/composePlanCopy";

export const MAX_DIRECT_RECIPIENTS = 50;

export type DirectRecipient = { id: string; fullName: string; email: string };

/** Resolve people ids to emailable recipients from our own people table. */
export async function loadRecipients(personIds: string[]): Promise<{
  recipients: DirectRecipient[];
  missingEmail: string[];
}> {
  const ids = [...new Set(personIds)].slice(0, MAX_DIRECT_RECIPIENTS);
  if (ids.length === 0) return { recipients: [], missingEmail: [] };
  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("people")
    .select("id, full_name, email")
    .in("id", ids);
  if (error) throw new Error(error.message);

  const recipients: DirectRecipient[] = [];
  const missingEmail: string[] = [];
  for (const row of data ?? []) {
    const email = (row.email as string | null)?.trim();
    if (email) recipients.push({ id: row.id as string, fullName: row.full_name as string, email });
    else missingEmail.push(row.full_name as string);
  }
  return { recipients, missingEmail };
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Personalizes composed broadcast HTML for one-to-one sending.
 * Broadcast merge tags don't exist outside Resend broadcasts, so the greeting is filled in
 * here and the broadcast-only unsubscribe footer is dropped (these go to people staff chose).
 */
export function personalizeForDirectSend(html: string, recipient: DirectRecipient): string {
  const withName = html.replace(
    /\{\{\{\s*contact\.first_name\s*(?:\|[^}]*)?\}\}\}/g,
    escapeHtml(firstName(recipient.fullName)),
  );
  const withoutFooter = withName.replace(
    new RegExp(`<p>\\s*<a[^>]*href="${UNSUBSCRIBE_TAG.replace(/[{}]/g, "\\$&")}"[^>]*>[\\s\\S]*?</a>\\s*</p>`, "g"),
    "",
  );
  return sanitizeEmailHtml(withoutFooter.replace(UNSUBSCRIBE_TAG, "")).trim();
}

export type DirectSendResult = { recipientId: string; email: string; ok: boolean; error?: string };

/** One Resend email per person (the batch API can't schedule). Always returns one result per recipient. */
export async function sendToRecipients(input: {
  recipients: DirectRecipient[];
  subject: string;
  html: string;
  scheduledAt?: string;
}): Promise<DirectSendResult[]> {
  const resend = getResend();
  const from = getResendFromEmail();
  if (!resend || !from) {
    const error = !resend ? "RESEND_API_KEY is not set." : "RESEND_FROM_EMAIL is not configured.";
    return input.recipients.map((r) => ({ recipientId: r.id, email: r.email, ok: false, error }));
  }

  const results: DirectSendResult[] = [];
  for (const r of input.recipients) {
    const { error } = await resend.emails.send({
      from,
      to: r.email,
      subject: input.subject,
      html: personalizeForDirectSend(input.html, r),
      ...(input.scheduledAt ? { scheduledAt: input.scheduledAt } : {}),
    });
    results.push({ recipientId: r.id, email: r.email, ok: !error, error: error?.message });
  }
  return results;
}

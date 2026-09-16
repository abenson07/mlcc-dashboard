import { getResend, getResendFromEmail } from "@/lib/resend";

const HELLO_FROM = "MLCC <hello@mapleleafcommunity.org>";
const HELLO_REPLY_TO = "hello@mapleleafcommunity.org";

/** Prefer env `RESEND_FROM_EMAIL`, else hello@mapleleafcommunity.org. */
export function getCommitteeEmailFrom(): string {
  return getResendFromEmail() || HELLO_FROM;
}

export function getCommitteeEmailReplyTo(): string {
  return HELLO_REPLY_TO;
}

/**
 * Committee-chair CC list from `COMMITTEE_INTEREST_CC_EMAILS` (comma-separated).
 * Unset until chairs are wired up — returns an empty list.
 */
export function getCommitteeInterestCcEmails(): string[] {
  const raw = process.env.COMMITTEE_INTEREST_CC_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export async function sendCommitteeInterestEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  cc?: string[];
}): Promise<{ sent: boolean; id?: string; error?: string }> {
  const resend = getResend();
  const from = getCommitteeEmailFrom();
  if (!resend) {
    return { sent: false, error: "Resend is not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: params.to,
      replyTo: getCommitteeEmailReplyTo(),
      subject: params.subject,
      text: params.text,
      ...(params.html ? { html: params.html } : {}),
      ...(params.cc && params.cc.length ? { cc: params.cc } : {}),
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true, id: data?.id };
  } catch (e) {
    return {
      sent: false,
      error: e instanceof Error ? e.message : "Failed to send email",
    };
  }
}

/**
 * Auto-reply for any general committee/volunteer interest submission (join a
 * committee, RSVP, workshop interest, volunteer opportunity) that isn't
 * already covered by `sendVolunteerAutoAcceptEmail`. CC's committee chairs
 * once `COMMITTEE_INTEREST_CC_EMAILS` is configured — empty until then.
 */
export async function sendVolunteerInterestAcknowledgementEmail(params: {
  to: string;
  name: string;
}): Promise<{ sent: boolean; id?: string; error?: string }> {
  const text = [
    `Hi ${params.name},`,
    "",
    "Thanks for reaching out — we've received your message about volunteering with Maple Leaf Community Council.",
    "",
    "Someone will be in touch with you shortly. We're an all-volunteer organization, so we'll get back to you as quickly as we possibly can.",
    "",
    "— Maple Leaf Community Council",
  ].join("\n");

  return sendCommitteeInterestEmail({
    to: params.to,
    subject: "Thanks for reaching out to Maple Leaf Community Council",
    text,
    cc: getCommitteeInterestCcEmails(),
  });
}

export async function sendVolunteerAutoAcceptEmail(params: {
  to: string;
  volunteerName: string;
  askTitle: string;
  responseBody: string;
}): Promise<{ sent: boolean; id?: string; error?: string }> {
  const text = [
    `Hi ${params.volunteerName},`,
    "",
    `Thank you for offering to help with "${params.askTitle}".`,
    "",
    params.responseBody.trim(),
    "",
    "If you have questions, just reply to this email.",
    "",
    "— Maple Leaf Community Council",
  ].join("\n");

  return sendCommitteeInterestEmail({
    to: params.to,
    subject: `You're confirmed: ${params.askTitle}`,
    text,
  });
}

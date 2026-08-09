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

export async function sendCommitteeInterestEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
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

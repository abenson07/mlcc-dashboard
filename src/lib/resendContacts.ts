import { getResend } from "@/lib/resend";

function getAudienceId(): string | undefined {
  return process.env.RESEND_MARKETING_SEGMENT_ID?.trim() || undefined;
}

function getWeeklyDigestAudienceId(): string | undefined {
  return process.env.RESEND_WEEKLY_DIGEST_AUDIENCE_ID?.trim() || undefined;
}

async function upsertContact(
  audienceId: string,
  email: string,
  firstName?: string
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const existing = await resend.contacts.get({ email, audienceId });

  if (existing.data) {
    await resend.contacts.update({
      email,
      audienceId,
      unsubscribed: false,
      ...(firstName ? { firstName } : {}),
    });
    return;
  }

  await resend.contacts.create({
    email,
    audienceId,
    unsubscribed: false,
    ...(firstName ? { firstName } : {}),
  });
}

/** Adds an email to the newsletter audience, or updates it if already present. No-ops if unconfigured. */
export async function upsertNewsletterContact(email: string, firstName?: string): Promise<void> {
  const audienceId = getAudienceId();
  if (!audienceId) return;
  await upsertContact(audienceId, email, firstName);
}

/** Adds an email to the weekly digest audience, or updates it if already present. No-ops if unconfigured. */
export async function upsertWeeklyDigestContact(email: string, firstName?: string): Promise<void> {
  const audienceId = getWeeklyDigestAudienceId();
  if (!audienceId) return;
  await upsertContact(audienceId, email, firstName);
}

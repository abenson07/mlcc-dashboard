import { getCommitteeEmailFrom, getCommitteeEmailReplyTo } from "@/lib/committees/sendCommitteeEmail";
import { getResend } from "@/lib/resend";

export async function sendOpenRouteSignupEmail(params: {
  to: string;
  volunteerName: string;
  routeName: string;
  leafletTitle: string;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend();
  const from = getCommitteeEmailFrom();
  if (!resend) {
    return { sent: false, error: "Resend is not configured" };
  }

  const firstName = params.volunteerName.split(/\s+/)[0] ?? params.volunteerName;
  const text = [
    `Hi ${firstName},`,
    "",
    `Thank you for signing up to deliver ${params.routeName} for the ${params.leafletTitle}.`,
    "",
    "We'll follow up with a cover sheet and timing before the next drop. If anything changes, just reply to this email.",
    "",
    "We're grateful you're helping get the Leaflet to neighbors' doors.",
    "",
    "— Maple Leaf Community Council",
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      replyTo: getCommitteeEmailReplyTo(),
      subject: `You're signed up to deliver ${params.routeName}`,
      text,
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

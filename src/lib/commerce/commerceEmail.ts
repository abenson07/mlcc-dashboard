import { formatLineItemsSummary } from "@/lib/commerce/tshirtCart";
import type { TshirtLineItem } from "@/types/database";
import { getResend, getResendFromEmail } from "@/lib/resend";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export async function sendTshirtConfirmationEmail(params: {
  to: string;
  customerName: string;
  lineItems: TshirtLineItem[];
  amountCents: number;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend();
  const from = getResendFromEmail();
  if (!resend || !from) {
    return { sent: false, error: "Resend is not configured" };
  }

  const summary = formatLineItemsSummary(params.lineItems);
  const amount = formatCents(params.amountCents);

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: "Maple Leaf t-shirt preorder confirmed",
      text: [
        `Hi ${params.customerName},`,
        "",
        "Thank you for your t-shirt preorder for the Maple Leaf summer social.",
        "",
        `Order: ${summary}`,
        `Total paid: ${amount}`,
        "",
        "We'll be in touch about pickup at the summer social or shipping if needed.",
        "",
        "— Maple Leaf Community Council",
      ].join("\n"),
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (e) {
    return {
      sent: false,
      error: e instanceof Error ? e.message : "Failed to send email",
    };
  }
}

export async function sendFundraiserThankYouEmail(params: {
  to: string;
  amountCents: number;
  tier: string;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend();
  const from = getResendFromEmail();
  if (!resend || !from) {
    return { sent: false, error: "Resend is not configured" };
  }

  const amount = formatCents(params.amountCents);

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: "Thank you for supporting Maple Leaf",
      text: [
        "Thank you for your donation to help save Summer in Maple Leaf.",
        "",
        `Amount: ${amount}`,
        "",
        "Your support helps us recover from recent losses and keep neighborhood events going.",
        "",
        "— Maple Leaf Community Council",
      ].join("\n"),
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (e) {
    return {
      sent: false,
      error: e instanceof Error ? e.message : "Failed to send email",
    };
  }
}

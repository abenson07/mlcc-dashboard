import { formatLineItemsSummary as formatTshirtLineItemsSummary } from "@/lib/commerce/tshirtCart";
import { formatLineItemsSummary as formatShopLineItemsSummary } from "@/lib/commerce/shopCart";
import type { TshirtLineItem, ShopLineItem } from "@/types/database";
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

  const summary = formatTshirtLineItemsSummary(params.lineItems);
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

export async function sendShopOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  lineItems: ShopLineItem[];
  amountCents: number;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend();
  const from = getResendFromEmail();
  if (!resend || !from) {
    return { sent: false, error: "Resend is not configured" };
  }

  const summary = formatShopLineItemsSummary(params.lineItems);
  const amount = formatCents(params.amountCents);
  const hasPreorder = params.lineItems.some((l) => l.fulfillment === "preorder");
  const hasInStock = params.lineItems.some((l) => l.fulfillment === "in_stock");

  const shippingNotes: string[] = [];
  if (hasPreorder) {
    shippingNotes.push(
      "Pre-order items are printed after the order window closes, then mailed to you — plan on a few weeks before they ship."
    );
  }
  if (hasInStock) {
    shippingNotes.push("In-stock items will ship to your address soon.");
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: "Maple Leaf shop order confirmed",
      text: [
        `Hi ${params.customerName},`,
        "",
        "Thank you for your order from the Maple Leaf shop.",
        "",
        `Order: ${summary}`,
        `Total paid: ${amount}`,
        "",
        ...shippingNotes,
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

export async function sendMembershipConfirmationEmail(params: {
  to: string;
  customerName: string;
  tierName: string;
  amountCents: number;
  isSubscription: boolean;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend();
  const from = getResendFromEmail();
  if (!resend || !from) {
    return { sent: false, error: "Resend is not configured" };
  }

  const amount = formatCents(params.amountCents);
  const cadenceNote = params.isSubscription
    ? "Your membership renews automatically each year — thank you for the ongoing support."
    : "This is a one-time membership; we'll be in touch when it's time to renew.";

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: "Your Maple Leaf membership is confirmed",
      text: [
        `Hi ${params.customerName},`,
        "",
        `Thank you for joining the Maple Leaf Community Council with a ${params.tierName} membership.`,
        "",
        `Amount paid: ${amount}`,
        cadenceNote,
        "",
        "This email is your receipt. Welcome to the neighborhood.",
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

import { getResend, getResendFromEmail } from "@/lib/resend";

const ORG_NAME = "Maple Leaf Community Council";

export type MembershipEmailParams = {
  to: string;
  customerName: string;
  tierName: string;
  amountCents: number;
  /** ISO date (YYYY-MM-DD) the payment was made. */
  paidOn: string;
  /** Stripe invoice, subscription, or payment-intent id shown on the receipt. */
  receiptId: string | null;
  /** Stripe-hosted invoice/receipt page, when we have one. */
  receiptUrl?: string | null;
  isSubscription?: boolean;
};

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function logoUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://mapleleafcommunity.org";
  return `${base.replace(/\/$/, "")}/images/mlcc-logo.jpg`;
}

function signatureHtml(): string {
  return `<table style="border-collapse:collapse;margin-top:24px;border-top:1px solid #ddd">
<tr><td style="padding-top:16px"><img src="${logoUrl()}" alt="${ORG_NAME}" width="240" style="display:block;width:240px;max-width:100%;height:auto;border:0"></td></tr>
<tr><td style="padding-top:8px;font-size:13px;color:#555">${ORG_NAME} · Seattle, Washington<br><a href="mailto:hello@mapleleafcommunity.org" style="color:#2d7a3e">hello@mapleleafcommunity.org</a> · <a href="https://mapleleafcommunity.org" style="color:#2d7a3e">mapleleafcommunity.org</a></td></tr></table>`;
}

const SIGNATURE_TEXT = `${ORG_NAME}\nSeattle, Washington\nhello@mapleleafcommunity.org · https://mapleleafcommunity.org`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nonprofitStatement(): string {
  const ein = process.env.MLCC_EIN?.trim();
  const einPart = ein ? ` (EIN ${ein})` : "";
  return `${ORG_NAME} is a 501(c)(3) nonprofit organization${einPart}. No goods or services were provided in exchange for this contribution. Please keep this email for your tax records.`;
}

function receiptRows(p: MembershipEmailParams): Array<[string, string]> {
  const rows: Array<[string, string]> = [
    ["Organization", ORG_NAME],
    ["Date", formatDate(p.paidOn)],
    ["Membership", p.tierName],
    ["Amount paid", formatCents(p.amountCents)],
  ];
  if (p.receiptId) rows.push(["Reference", p.receiptId]);
  return rows;
}

function receiptText(p: MembershipEmailParams): string {
  const lines = ["RECEIPT", ...receiptRows(p).map(([k, v]) => `${k}: ${v}`)];
  if (p.receiptUrl) lines.push(`View online: ${p.receiptUrl}`);
  return lines.join("\n");
}

function receiptHtml(p: MembershipEmailParams): string {
  const rows = receiptRows(p)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#666">${escapeHtml(k)}</td><td style="padding:6px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
    )
    .join("");
  const link = p.receiptUrl
    ? `<p style="margin:12px 0 0"><a href="${escapeHtml(p.receiptUrl)}">View this receipt online</a></p>`
    : "";
  return `<div style="border:1px solid #ddd;border-radius:8px;padding:16px;margin:20px 0">
<div style="font-size:12px;letter-spacing:.08em;color:#666;margin-bottom:8px">RECEIPT</div>
<table style="border-collapse:collapse;font-size:15px">${rows}</table>${link}</div>`;
}

const SITE_URL = "https://mapleleafcommunity.org";
const VOLUNTEER_URL = `${SITE_URL}/volunteer`;
const COMMITTEES_URL = `${SITE_URL}/committees`;

const SUPPORT_PARAGRAPH =
  "Your continued support enables our volunteer-led organization to continue to provide the summer social, the Halloween parade, movies by the tower, multiple newsletters, community meetings, a monthly silent book club, and more.";

type Built = { subject: string; text: string; html: string };

function buildWelcome(p: MembershipEmailParams): Built {
  const cadence = p.isSubscription
    ? "Your membership renews automatically each year. We will email you a receipt each time."
    : "This is a one-time membership; we will be in touch when it is time to renew.";
  const text = [
    `Hi ${p.customerName},`,
    "",
    `Welcome, and thank you for joining ${ORG_NAME} as a ${p.tierName} member. Your support makes our work in the neighborhood possible.`,
    "",
    cadence,
    "",
    receiptText(p),
    "",
    nonprofitStatement(),
    "",
    "Warmly,",
    SIGNATURE_TEXT,
  ].join("\n");
  const html = `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.5;color:#222;max-width:560px">
<p>Hi ${escapeHtml(p.customerName)},</p>
<p>Welcome, and thank you for joining ${ORG_NAME} as a <strong>${escapeHtml(p.tierName)}</strong> member. Your support makes our work in the neighborhood possible.</p>
<p>${escapeHtml(cadence)}</p>
${receiptHtml(p)}
<p style="font-size:13px;color:#555">${escapeHtml(nonprofitStatement())}</p>
<p style="margin-bottom:0">Warmly,</p>${signatureHtml()}</div>`;
  return { subject: `Welcome to ${ORG_NAME} — your receipt`, text, html };
}

function buildRenewal(p: MembershipEmailParams): Built {
  const text = [
    `Hi ${p.customerName},`,
    "",
    `Thank you for renewing your ${p.tierName} membership with ${ORG_NAME}. Your continued support means a great deal to us and to the neighborhood.`,
    "",
    SUPPORT_PARAGRAPH,
    "",
    `Want to get more involved? See volunteer opportunities at ${VOLUNTEER_URL} or join a committee at ${COMMITTEES_URL}.`,
    "",
    receiptText(p),
    "",
    nonprofitStatement(),
    "",
    "With gratitude,",
    SIGNATURE_TEXT,
  ].join("\n");
  const html = `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.5;color:#222;max-width:560px">
<p>Hi ${escapeHtml(p.customerName)},</p>
<p>Thank you for renewing your <strong>${escapeHtml(p.tierName)}</strong> membership with ${ORG_NAME}. Your continued support means a great deal to us and to the neighborhood.</p>
<p>${escapeHtml(SUPPORT_PARAGRAPH)}</p>
<p>Want to get more involved? See <a href="${VOLUNTEER_URL}" style="color:#2d7a3e">volunteer opportunities</a> or <a href="${COMMITTEES_URL}" style="color:#2d7a3e">join a committee</a>.</p>
${receiptHtml(p)}
<p style="font-size:13px;color:#555">${escapeHtml(nonprofitStatement())}</p>
<p style="margin-bottom:0">With gratitude,</p>${signatureHtml()}</div>`;
  return { subject: `Thank you for renewing — your ${ORG_NAME} receipt`, text, html };
}

async function send(to: string, built: Built): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend();
  const address = getResendFromEmail();
  if (!resend || !address) return { sent: false, error: "Resend is not configured" };
  // Show the org name, not just "hello", in the inbox.
  const from = address.includes("<") ? address : `${ORG_NAME} <${address}>`;
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: built.subject,
      text: built.text,
      html: built.html,
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "Failed to send email" };
  }
}

export function sendMembershipWelcomeEmail(p: MembershipEmailParams) {
  return send(p.to, buildWelcome(p));
}

export function sendMembershipRenewalEmail(p: MembershipEmailParams) {
  return send(p.to, buildRenewal(p));
}

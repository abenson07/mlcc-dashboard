function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildOpenRouteEmailHtml(params: {
  delivererName: string;
  leafletTitle: string;
  distributionDate: string;
  routeName: string;
  householdCount: number | null;
  customMessage?: string;
  volunteerUrl: string;
  dashboardUrl: string;
  coverSheetUrl?: string;
}) {
  const firstName = escapeHtml(params.delivererName.split(" ")[0] ?? params.delivererName);
  const countLine =
    params.householdCount != null
      ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#52525b;">This route covers about <strong>${params.householdCount.toLocaleString()} households</strong>.</p>`
      : "";
  const customBlock = params.customMessage?.trim()
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#52525b;font-style:italic;">${escapeHtml(params.customMessage.trim())}</p>`
    : "";
  const coverSheetBlock = params.coverSheetUrl
    ? `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#52525b;">
        <a href="${escapeHtml(params.coverSheetUrl)}" style="color:#5E6AD2;font-weight:600;">View cover sheet</a>
        (route details and building contact).
      </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:28px 24px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:0.04em;">Maple Leaf Community Council</p>
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Can you help with an open route?</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#52525b;">Hi ${firstName},</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#52525b;">
                We&rsquo;re looking for a deliverer for <strong>${escapeHtml(params.routeName)}</strong>
                on the upcoming <strong>${escapeHtml(params.leafletTitle)}</strong> leaflet
                (${escapeHtml(params.distributionDate)}).
              </p>
              ${countLine}
              ${customBlock}
              ${coverSheetBlock}
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#52525b;">
                Are you interested in delivering this route? Reply to this email and we&rsquo;ll get you set up.
              </p>
              <a href="${escapeHtml(params.volunteerUrl)}" style="display:inline-block;background:#047857;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 20px;border-radius:8px;">Learn about volunteering</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

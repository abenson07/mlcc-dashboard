function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildLeafletCommEmailHtml(params: {
  delivererName: string;
  leafletTitle: string;
  distributionDate: string;
  routeLines: string[];
  confirmUrl: string;
}) {
  const firstName = escapeHtml(params.delivererName.split(" ")[0] ?? params.delivererName);
  const routesHtml = params.routeLines
    .map((line) => `<li style="margin:0 0 8px">${escapeHtml(line)}</li>`)
    .join("");

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
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Confirm your delivery routes</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#52525b;">Hi ${firstName},</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#52525b;">
                You&rsquo;re scheduled to help deliver the <strong>${escapeHtml(params.leafletTitle)}</strong> leaflet on
                <strong>${escapeHtml(params.distributionDate)}</strong>.
              </p>
              <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#71717a;">Your route${params.routeLines.length === 1 ? "" : "s"}</p>
              <ul style="margin:0 0 24px;padding:12px 14px 12px 28px;background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;font-size:14px;line-height:1.5;color:#3f3f46;">
                ${routesHtml}
              </ul>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
                <tr>
                  <td style="border-radius:8px;background:#18181b;">
                    <a href="${escapeHtml(params.confirmUrl)}" style="display:inline-block;padding:12px 20px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Confirm or respond</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a;">
                If the button doesn&rsquo;t work, copy and paste this link:<br />
                <a href="${escapeHtml(params.confirmUrl)}" style="color:#5E6AD2;word-break:break-all;">${escapeHtml(params.confirmUrl)}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

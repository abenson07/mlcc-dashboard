import type { Deliveries, Leaflets, People, Routes } from "@/types/database";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDistributionDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type CoverSheetParams = {
  leaflet: Pick<Leaflets, "title" | "distribution_date">;
  delivery: Deliveries;
  route: Routes | null;
  deliverer: People | null;
};

const COVER_SHEET_STYLES = `
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 640px;
      margin: 0 auto;
      padding: 32px 24px 48px;
      color: #18181b;
      background: #fff;
      font-size: 15px;
      line-height: 1.5;
    }
    h1 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; margin: 0 0 20px; }
    .fields { margin-bottom: 20px; }
    .field { display: flex; gap: 16px; padding: 2px 0; }
    .field .label { color: #15803d; font-weight: 600; flex: 0 0 180px; }
    .field .value { flex: 1; }
    .field .value.blank { border-bottom: 1px solid #d4d4d8; min-height: 1.2em; }
    p { margin: 0 0 16px; }
    ul { margin: 0 0 16px; padding-left: 20px; }
    li { margin-bottom: 12px; }
    .thank-you-title { color: #15803d; font-weight: 700; font-size: 17px; margin: 0 0 8px; }
    .special-instructions { border: 1px solid #e4e4e7; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; }
    .special-instructions .label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #71717a; margin: 0 0 4px; }
    a { color: #2563eb; }
    .print-hint { margin-top: 24px; font-size: 13px; color: #71717a; text-align: center; }
    .no-print { margin-bottom: 20px; }
    .no-print button {
      padding: 10px 16px;
      border-radius: 8px;
      border: 1px solid #d4d4d8;
      background: #fff;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
`;

const BOILERPLATE_HTML = `
  <p>
    Do <u>not</u> place newsletters in mailboxes; this is illegal. Sliding them under the
    front door/welcome mat works great! We <u>may</u> deliver to homes that have a &ldquo;no
    soliciting&rdquo; sign, since we are not asking anything of the resident.
  </p>
  <p>Please email us (hello@mapleleafcommunity.org) if&hellip;</p>
  <ul>
    <li>If you need <strong>more or fewer newsletters</strong> for your route.</li>
    <li>
      If you want to take on an additional route. We currently have <strong>40 routes that need
      coverage</strong>. Delivering the newsletter also makes a great project for a high schooler
      who needs volunteer hours!
    </li>
    <li>
      If you did not receive a heads-up email about these newsletters coming your way and you
      would like to, it means we do not have <strong>your email address</strong> on file. Please
      email us at hello@mapleleafcommunity.org.
    </li>
  </ul>
  <p class="thank-you-title">Thank you!</p>
  <p>
    We thank you for pitching in on this community effort. Maple Leaf is a lovely neighborhood
    and this newsletter getting delivered does not happen without the time and commitment of
    dozens of people like you who hand-deliver it to your neighbors. The Maple Leaf newsletter
    helps neighbors connect with each other, and by delivering it, you help make Maple Leaf
    stronger and a better neighborhood to live in. Thank you.
  </p>
  <p>
    ~ Maple Leaf Community Council Executive Board<br />
    <a href="https://www.mapleleafcommunity.org/" target="_blank" rel="noopener noreferrer">https://www.mapleleafcommunity.org/</a>
  </p>
`;

export function buildCoverSheetSection(params: CoverSheetParams) {
  const { leaflet, delivery, route, deliverer } = params;
  const routeName = route?.route_name ?? "Route";
  const leafletCount = delivery.leaflet_count;
  const countLabel = leafletCount != null ? `${leafletCount.toLocaleString()}` : "—";
  const carrierName = deliverer?.full_name ?? "Needs cover";
  const carrierAddress = deliverer?.address ?? "—";
  const deadline = formatDistributionDate(leaflet.distribution_date);

  const specialInstructions = route?.special_instructions
    ? `
    <div class="special-instructions">
      <p class="label">Special instructions</p>
      <p style="margin:0;">${escapeHtml(route.special_instructions)}</p>
    </div>`
    : "";

  return `
  <h1>Maple Leaf Community Council Leaflet</h1>

  <div class="fields">
    <div class="field"><span class="label">Route:</span><span class="value">${escapeHtml(routeName)}</span></div>
    <div class="field"><span class="label">Bundle Deliverer:</span><span class="value blank">&nbsp;</span></div>
    <div class="field"><span class="label">Quantity needed:</span><span class="value">${escapeHtml(countLabel)}</span></div>
  </div>

  <div class="fields">
    <div class="field"><span class="label">Route Carrier name:</span><span class="value">${escapeHtml(carrierName)}</span></div>
    <div class="field"><span class="label">Route Carrier address:</span><span class="value">${escapeHtml(carrierAddress)}</span></div>
  </div>
  ${specialInstructions}
  <p>Please aim to deliver your newsletters <strong>by ${escapeHtml(deadline)}.</strong></p>
  ${BOILERPLATE_HTML}`;
}

export function buildCoverSheetHtml(params: CoverSheetParams) {
  const routeName = params.route?.route_name ?? "Route";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cover sheet — ${escapeHtml(routeName)}</title>
  <style>
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none; }
    }
    ${COVER_SHEET_STYLES}
  </style>
</head>
<body>
  <div class="no-print">
    <button type="button" onclick="window.print()">Print / Save as PDF</button>
  </div>
  ${buildCoverSheetSection(params)}
  <p class="print-hint no-print">Use your browser&rsquo;s Print dialog and choose &ldquo;Save as PDF&rdquo; to download.</p>
</body>
</html>`;
}

export function buildCoverSheetsHtml(
  leaflet: Pick<Leaflets, "title" | "distribution_date">,
  rows: { delivery: Deliveries; route: Routes | null; deliverer: People | null }[],
) {
  const sections = rows
    .map(
      (row, i) => `
  <div class="sheet"${i < rows.length - 1 ? ' style="page-break-after: always;"' : ""}>
    ${buildCoverSheetSection({ leaflet, ...row })}
  </div>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cover sheets — ${escapeHtml(leaflet.title)}</title>
  <style>
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none; }
      .sheet { padding-top: 0; }
    }
    ${COVER_SHEET_STYLES}
  </style>
</head>
<body>
  <div class="no-print">
    <button type="button" onclick="window.print()">Print / Save as PDF</button>
  </div>
  ${sections}
  <p class="print-hint no-print">Use your browser&rsquo;s Print dialog and choose &ldquo;Save as PDF&rdquo; to download all cover sheets.</p>
</body>
</html>`;
}

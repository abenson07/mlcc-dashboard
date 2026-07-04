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

export function buildCoverSheetHtml(params: CoverSheetParams) {
  const { leaflet, delivery, route, deliverer } = params;
  const routeName = route?.route_name ?? "Route";
  const routeType = route?.route_type ?? "—";
  const leafletCount = delivery.leaflet_count;
  const countLabel =
    leafletCount != null ? `${leafletCount.toLocaleString()} households` : "—";

  const delivererBlock = deliverer
    ? `
      <div class="field"><span class="label">Deliverer</span><span class="value">${escapeHtml(deliverer.full_name)}</span></div>
      ${deliverer.email ? `<div class="field"><span class="label">Email</span><span class="value">${escapeHtml(deliverer.email)}</span></div>` : ""}
      ${deliverer.phone ? `<div class="field"><span class="label">Phone</span><span class="value">${escapeHtml(deliverer.phone)}</span></div>` : ""}
    `
    : `<div class="field"><span class="label">Deliverer</span><span class="value needs-cover">Needs cover</span></div>`;

  const buildingContact = [
    delivery.building_contact_name
      ? `<div class="field"><span class="label">Name</span><span class="value">${escapeHtml(delivery.building_contact_name)}</span></div>`
      : "",
    delivery.building_contact_phone
      ? `<div class="field"><span class="label">Phone</span><span class="value">${escapeHtml(delivery.building_contact_phone)}</span></div>`
      : "",
    delivery.building_contact_email
      ? `<div class="field"><span class="label">Email</span><span class="value">${escapeHtml(delivery.building_contact_email)}</span></div>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const buildingBlock =
    buildingContact ||
    `<p class="muted">No building contact on file.</p>`;

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
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 640px;
      margin: 0 auto;
      padding: 32px 24px 48px;
      color: #18181b;
      background: #fff;
    }
    h1 { font-size: 1.5rem; margin: 0 0 4px; line-height: 1.25; }
    .subtitle { color: #52525b; font-size: 14px; margin: 0 0 24px; }
    .section { border: 1px solid #e4e4e7; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; }
    .section-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #71717a; margin: 0 0 12px; }
    .field { display: flex; justify-content: space-between; gap: 16px; padding: 6px 0; font-size: 15px; border-bottom: 1px solid #f4f4f5; }
    .field:last-child { border-bottom: none; }
    .label { color: #71717a; flex-shrink: 0; }
    .value { text-align: right; font-weight: 500; }
    .needs-cover { color: #b45309; }
    .muted { color: #71717a; font-size: 14px; margin: 0; }
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
  </style>
</head>
<body>
  <div class="no-print">
    <button type="button" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <h1>${escapeHtml(routeName)}</h1>
  <p class="subtitle">${escapeHtml(leaflet.title)} · ${escapeHtml(formatDistributionDate(leaflet.distribution_date))}</p>

  <div class="section">
    <p class="section-title">Route</p>
    <div class="field"><span class="label">Route name</span><span class="value">${escapeHtml(routeName)}</span></div>
    <div class="field"><span class="label">Route type</span><span class="value">${escapeHtml(routeType)}</span></div>
    <div class="field"><span class="label">Leaflet count</span><span class="value">${escapeHtml(countLabel)}</span></div>
  </div>

  <div class="section">
    <p class="section-title">Assignment</p>
    ${delivererBlock}
  </div>

  <div class="section">
    <p class="section-title">Building contact</p>
    ${buildingBlock}
  </div>

  <p class="print-hint no-print">Use your browser&rsquo;s Print dialog and choose &ldquo;Save as PDF&rdquo; to download.</p>
</body>
</html>`;
}

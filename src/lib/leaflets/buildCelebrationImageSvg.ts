import type { CloseOutMetrics } from "./getCloseOutMetrics";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatChange(change: number | null) {
  if (change == null) return "—";
  if (change > 0) return `+${change.toLocaleString()}`;
  if (change < 0) return `−${Math.abs(change).toLocaleString()}`;
  return "+0";
}

export function buildCelebrationImageSvg(metrics: CloseOutMetrics): string {
  const title = escapeXml(metrics.title);
  const confirmed = `${metrics.deliverersConfirmed.toLocaleString()} / ${metrics.deliverersTotal.toLocaleString()}`;
  const delivered = metrics.leafletsDelivered.toLocaleString();
  const change = formatChange(metrics.changeVsLastRun);
  const reroutes = metrics.reroutes.toLocaleString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ecfdf5"/>
      <stop offset="100%" stop-color="#d1fae5"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bg)"/>
  <rect x="48" y="48" width="704" height="904" rx="24" fill="#ffffff" stroke="#a7f3d0" stroke-width="2"/>
  <text x="400" y="140" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="#047857" font-weight="600">DELIVERY COMPLETE</text>
  <text x="400" y="210" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="36" fill="#18181b" font-weight="700">${title}</text>
  <text x="400" y="280" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#52525b">Thank you to our neighborhood deliverers</text>
  <g font-family="system-ui, -apple-system, sans-serif">
    <rect x="88" y="340" width="280" height="140" rx="16" fill="#f0fdf4" stroke="#bbf7d0"/>
    <text x="228" y="390" text-anchor="middle" font-size="14" fill="#71717a">Deliverers confirmed</text>
    <text x="228" y="440" text-anchor="middle" font-size="32" fill="#18181b" font-weight="700">${confirmed}</text>
    <rect x="432" y="340" width="280" height="140" rx="16" fill="#f0fdf4" stroke="#bbf7d0"/>
    <text x="572" y="390" text-anchor="middle" font-size="14" fill="#71717a">Leaflets delivered</text>
    <text x="572" y="440" text-anchor="middle" font-size="32" fill="#18181b" font-weight="700">${delivered}</text>
    <rect x="88" y="520" width="280" height="140" rx="16" fill="#f0fdf4" stroke="#bbf7d0"/>
    <text x="228" y="570" text-anchor="middle" font-size="14" fill="#71717a">Change vs last run</text>
    <text x="228" y="620" text-anchor="middle" font-size="32" fill="#18181b" font-weight="700">${change}</text>
    <rect x="432" y="520" width="280" height="140" rx="16" fill="#f0fdf4" stroke="#bbf7d0"/>
    <text x="572" y="570" text-anchor="middle" font-size="14" fill="#71717a">Reroutes captured</text>
    <text x="572" y="620" text-anchor="middle" font-size="32" fill="#18181b" font-weight="700">${reroutes}</text>
  </g>
  <text x="400" y="760" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#71717a">Maple Leaf Community Council</text>
  <text x="400" y="820" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="48">🍁</text>
</svg>`;
}

import type { RespondDeliveryRow } from "./handleDelivererResponse";

export type RespondTokenParams = { p: string; sig: string };

export type RouteAction = "keep" | "skip" | "remove";
export type RouteEdit = { count: number; action: RouteAction };
export type EditsMap = Record<string, RouteEdit>;

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

function routeName(d: RespondDeliveryRow) {
  return d.routes?.route_name ?? "Route";
}

function formatNetChange(delta: number): string {
  if (delta === 0) return "";
  return delta > 0 ? ` (+${delta})` : ` (${delta})`;
}

function tokenFields(token: RespondTokenParams) {
  return `
    <input type="hidden" name="p" value="${escapeHtml(token.p)}" />
    <input type="hidden" name="sig" value="${escapeHtml(token.sig)}" />
  `;
}

export function respondUrl(token: RespondTokenParams, extra?: Record<string, string>) {
  const params = new URLSearchParams({ p: token.p, sig: token.sig });
  if (extra) {
    for (const [k, v] of Object.entries(extra)) params.set(k, v);
  }
  return `/api/public/leaflet/respond?${params.toString()}`;
}

export function encodeEdits(edits: EditsMap): string {
  return encodeURIComponent(JSON.stringify(edits));
}

export function decodeEdits(raw: string | null): EditsMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as EditsMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function defaultEdits(deliveries: RespondDeliveryRow[]): EditsMap {
  const edits: EditsMap = {};
  for (const d of deliveries) {
    edits[d.id] = { count: d.leaflet_count ?? 0, action: "keep" };
  }
  return edits;
}

const PAGE_STYLES = `
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px 16px 40px; color: #18181b; background: #fafafa; }
  h1 { font-size: 1.35rem; line-height: 1.3; margin: 0 0 8px; }
  h2 { font-size: 1.1rem; line-height: 1.3; margin: 0 0 8px; }
  .lead { color: #52525b; line-height: 1.55; margin: 0 0 20px; font-size: 15px; }
  .card { background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
  form { display: flex; flex-direction: column; gap: 12px; }
  .btn-primary { display: block; width: 100%; padding: 14px 16px; border-radius: 10px; border: none; background: #18181b; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer; text-align: center; }
  .btn-secondary { display: block; width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid #d4d4d8; background: #fff; color: #18181b; font-size: 15px; font-weight: 500; cursor: pointer; }
  .link { display: block; text-align: center; color: #5E6AD2; font-size: 14px; text-decoration: underline; margin-top: 4px; background: none; border: none; width: 100%; cursor: pointer; padding: 8px 0; }
  .meta { color: #71717a; font-size: 13px; margin: 0 0 16px; }
  .route-grid { display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; align-items: center; }
  .route-grid-header { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; color: #a1a1aa; padding-bottom: 6px; border-bottom: 1px solid #f4f4f5; }
  .route-grid-row { display: contents; }
  .route-grid-row > span, .route-grid-row > div { padding: 8px 0; border-bottom: 1px solid #f4f4f5; }
  .count-cell { text-align: right; font-variant-numeric: tabular-nums; }
  .count-input { width: 72px; text-align: right; padding: 6px 8px; border: 1px solid #d4d4d8; border-radius: 6px; font-size: 14px; }
  .edit-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; padding: 10px 0; border-bottom: 1px solid #f4f4f5; }
  .edit-row-name { font-size: 14px; font-weight: 500; }
  .action-group { display: flex; gap: 10px; font-size: 12px; color: #52525b; grid-column: 1 / -1; }
  .action-group label { display: flex; align-items: center; gap: 4px; cursor: pointer; }
  .overlay-target { display: none; position: fixed; inset: 0; z-index: 50; align-items: flex-end; justify-content: center; }
  .overlay-target:target, .overlay-target.overlay-target--open { display: flex; }
  .overlay-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
  .overlay-panel { position: relative; width: 100%; max-width: 480px; max-height: 85vh; overflow-y: auto; background: #fff; border-radius: 16px 16px 0 0; padding: 24px 16px 32px; box-sizing: border-box; }
  .review-group-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; color: #a1a1aa; margin: 16px 0 4px; }
  .review-group-label:first-child { margin-top: 0; }
`;

export function respondHtmlPage(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>${PAGE_STYLES}</style>
</head>
<body>
  ${body}
</body>
</html>`;
}

function buildChangesOverlay(params: {
  token: RespondTokenParams;
  deliveries: RespondDeliveryRow[];
  edits: EditsMap;
  forceOpen: boolean;
}) {
  const rows = params.deliveries
    .map((d) => {
      const edit = params.edits[d.id] ?? { count: d.leaflet_count ?? 0, action: "keep" as const };
      const id = escapeHtml(d.id);
      return `
        <div class="edit-row">
          <span class="edit-row-name">${escapeHtml(routeName(d))}</span>
          <input type="number" min="0" name="count_${id}" value="${edit.count}" class="count-input" />
          <div class="action-group">
            <label><input type="radio" name="action_${id}" value="keep" ${edit.action === "keep" ? "checked" : ""} /> Keep</label>
            <label><input type="radio" name="action_${id}" value="skip" ${edit.action === "skip" ? "checked" : ""} /> Skip</label>
            <label><input type="radio" name="action_${id}" value="remove" ${edit.action === "remove" ? "checked" : ""} /> Remove</label>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div id="changes-overlay" class="overlay-target${params.forceOpen ? " overlay-target--open" : ""}">
      <a href="${respondUrl(params.token)}" class="overlay-backdrop" aria-label="Close"></a>
      <div class="overlay-panel">
        <h2>Which routes need changes?</h2>
        <p class="lead">Adjust leaflet counts, or mark a route to skip or remove.</p>
        <form method="POST">
          ${tokenFields(params.token)}
          <input type="hidden" name="action" value="review" />
          ${rows}
          <button type="submit" class="btn-primary" style="margin-top: 16px;">Review changes</button>
        </form>
        <a class="link" href="${respondUrl(params.token)}">Cancel</a>
      </div>
    </div>
  `;
}

export function renderRespondHome(params: {
  token: RespondTokenParams;
  delivererName: string;
  leafletTitle: string;
  distributionDate: string;
  deliveries: RespondDeliveryRow[];
  edits?: EditsMap;
  openChangesPanel?: boolean;
}) {
  const edits = params.edits ?? defaultEdits(params.deliveries);
  const rows = params.deliveries
    .map(
      (d) => `
      <div class="route-grid-row">
        <span>${escapeHtml(routeName(d))}</span>
        <span class="count-cell">${d.leaflet_count ?? 0}</span>
      </div>
    `,
    )
    .join("");

  const body = `
    <h1>Hi ${escapeHtml(params.delivererName.split(" ")[0] ?? params.delivererName)}</h1>
    <p class="lead">
      You’re signed up to deliver the <strong>${escapeHtml(params.leafletTitle)}</strong> leaflet on
      ${escapeHtml(formatDistributionDate(params.distributionDate))}.
    </p>
    <div class="card">
      <p class="meta" style="margin-top:0">Your route${params.deliveries.length === 1 ? "" : "s"}</p>
      <div class="route-grid">
        <div class="route-grid-row route-grid-header"><span>Route</span><span>Leaflets</span></div>
        ${rows}
      </div>
    </div>
    <form method="POST">
      ${tokenFields(params.token)}
      <input type="hidden" name="action" value="confirm_all" />
      <button type="submit" class="btn-primary">I&rsquo;m good to help</button>
    </form>
    <a class="link" href="#changes-overlay">I need changes</a>
    ${buildChangesOverlay({ token: params.token, deliveries: params.deliveries, edits, forceOpen: Boolean(params.openChangesPanel) })}
  `;

  return respondHtmlPage("Confirm your routes", body);
}

export function renderRespondReview(params: {
  token: RespondTokenParams;
  deliveries: RespondDeliveryRow[];
  edits: EditsMap;
}) {
  const committed = params.deliveries.filter((d) => (params.edits[d.id]?.action ?? "keep") === "keep");
  const skipped = params.deliveries.filter((d) => params.edits[d.id]?.action === "skip");
  const removed = params.deliveries.filter((d) => params.edits[d.id]?.action === "remove");

  function renderGroup(label: string, rows: RespondDeliveryRow[], showCount: boolean) {
    if (rows.length === 0) return "";
    const items = rows
      .map((d) => {
        const edit = params.edits[d.id];
        const originalCount = d.leaflet_count ?? 0;
        const newCount = edit?.count ?? originalCount;
        const delta = newCount - originalCount;
        const countText = showCount ? `${newCount}${formatNetChange(delta)}` : "";
        return `
          <div class="route-grid-row">
            <span>${escapeHtml(routeName(d))}</span>
            <span class="count-cell">${countText}</span>
          </div>
        `;
      })
      .join("");
    return `<p class="review-group-label">${label}</p><div class="route-grid">${items}</div>`;
  }

  const hiddenFields = params.deliveries
    .map((d) => {
      const edit = params.edits[d.id] ?? { count: d.leaflet_count ?? 0, action: "keep" as const };
      const id = escapeHtml(d.id);
      return `
        <input type="hidden" name="count_${id}" value="${edit.count}" />
        <input type="hidden" name="action_${id}" value="${edit.action}" />
      `;
    })
    .join("");

  const changesEditsParam = encodeEdits(params.edits);

  const body = `
    <h1>Review your changes</h1>
    <p class="lead">Here&rsquo;s what will be recorded.</p>
    <div class="card">
      ${renderGroup("Committed", committed, true)}
      ${renderGroup("Skipped", skipped, false)}
      ${renderGroup("Removed", removed, false)}
    </div>
    <form method="POST">
      ${tokenFields(params.token)}
      <input type="hidden" name="action" value="confirm_reviewed" />
      ${hiddenFields}
      <button type="submit" class="btn-primary">Confirm</button>
    </form>
    <a class="link" href="${respondUrl(params.token, { panel: "changes", edits: changesEditsParam })}">I need more changes</a>
    <a class="link" href="${respondUrl(params.token)}">Reset Changes</a>
  `;

  return respondHtmlPage("Review your changes", body);
}

export function renderRespondConfirmed(params: { committedCount: number; hasChanges: boolean }) {
  const { committedCount, hasChanges } = params;
  const base = `You&rsquo;re confirmed for ${committedCount} route${committedCount === 1 ? "" : "s"}. We appreciate your help delivering the leaflet.`;
  const changesNote = hasChanges
    ? " We&rsquo;ve recorded your requested changes and will follow up."
    : "";
  const body = `
    <h1>Thank you!</h1>
    <p class="lead">${base}${changesNote}</p>
  `;
  return respondHtmlPage("Routes confirmed", body);
}

export function renderRespondFarewellAllRemoved() {
  const body = `
    <h1>Thank you</h1>
    <p class="lead">We hope to see you again soon!</p>
  `;
  return respondHtmlPage("Thank you", body);
}

export function renderCompleteHome(params: {
  token: RespondTokenParams;
  delivererName: string;
  leafletTitle: string;
  distributionDate: string;
  deliveries: RespondDeliveryRow[];
}) {
  const routes = params.deliveries
    .map((d) => `<li>${escapeHtml(routeName(d))}</li>`)
    .join("");

  const body = `
    <h1>Hi ${escapeHtml(params.delivererName.split(" ")[0] ?? params.delivererName)}</h1>
    <p class="lead">
      Thanks for delivering the <strong>${escapeHtml(params.leafletTitle)}</strong> leaflet on
      ${escapeHtml(formatDistributionDate(params.distributionDate))}.
      When you&rsquo;re finished, let us know below.
    </p>
    <div class="card">
      <p class="meta" style="margin-top:0">Your route${params.deliveries.length === 1 ? "" : "s"}</p>
      <ul style="list-style:none; margin:0; padding:0;">${routes}</ul>
    </div>
    <form method="POST">
      ${tokenFields(params.token)}
      <input type="hidden" name="action" value="mark_complete_all" />
      <button type="submit" class="btn-primary">Mark delivered</button>
    </form>
  `;

  return respondHtmlPage("Report delivery complete", body);
}

export function renderCompleteThankYou(count: number) {
  const body = `
    <h1>Thank you!</h1>
    <p class="lead">We recorded delivery complete for ${count} route${count === 1 ? "" : "s"}. We appreciate your help!</p>
  `;
  return respondHtmlPage("Delivery recorded", body);
}

export function renderRespondError(message: string) {
  return respondHtmlPage("Something went wrong", `<p class="lead">${escapeHtml(message)}</p>`);
}

export function renderRespondInvalidLink() {
  return respondHtmlPage("Invalid link", "<p class=\"lead\">This response link is invalid.</p>");
}

export function renderRespondExpiredLink() {
  return respondHtmlPage("Link expired", "<p class=\"lead\">This link has expired or is invalid.</p>");
}

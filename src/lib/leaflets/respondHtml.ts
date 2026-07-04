import type { RespondDeliveryRow } from "./handleDelivererResponse";

export type RespondTokenParams = { p: string; sig: string };

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

function routeLabel(d: RespondDeliveryRow) {
  const name = d.routes?.route_name ?? "Route";
  const count = d.leaflet_count != null ? ` (${d.leaflet_count} households)` : "";
  return `${name}${count}`;
}

function tokenFields(token: RespondTokenParams) {
  return `
    <input type="hidden" name="p" value="${escapeHtml(token.p)}" />
    <input type="hidden" name="sig" value="${escapeHtml(token.sig)}" />
  `;
}

export function respondUrl(token: RespondTokenParams, view?: string) {
  const params = new URLSearchParams({ p: token.p, sig: token.sig });
  if (view) params.set("view", view);
  return `/api/public/leaflet/respond?${params.toString()}`;
}

const PAGE_STYLES = `
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px 16px 40px; color: #18181b; background: #fafafa; }
  h1 { font-size: 1.35rem; line-height: 1.3; margin: 0 0 8px; }
  .lead { color: #52525b; line-height: 1.55; margin: 0 0 20px; font-size: 15px; }
  .card { background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
  .route-list { list-style: none; margin: 0; padding: 0; }
  .route-list li { padding: 10px 0; border-bottom: 1px solid #f4f4f5; font-size: 15px; }
  .route-list li:last-child { border-bottom: none; }
  form { display: flex; flex-direction: column; gap: 12px; }
  .btn-primary { display: block; width: 100%; padding: 14px 16px; border-radius: 10px; border: none; background: #18181b; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer; text-align: center; }
  .btn-secondary { display: block; width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid #d4d4d8; background: #fff; color: #18181b; font-size: 15px; font-weight: 500; cursor: pointer; }
  .link { display: block; text-align: center; color: #5E6AD2; font-size: 14px; text-decoration: underline; margin-top: 4px; }
  .checkbox-row { display: flex; align-items: flex-start; gap: 10px; padding: 12px 0; border-bottom: 1px solid #f4f4f5; }
  .checkbox-row:last-child { border-bottom: none; }
  .checkbox-row input { margin-top: 3px; width: 18px; height: 18px; }
  .checkbox-row label { flex: 1; font-size: 15px; line-height: 1.4; cursor: pointer; }
  .meta { color: #71717a; font-size: 13px; margin: 0 0 16px; }
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

export function renderRespondHome(params: {
  token: RespondTokenParams;
  delivererName: string;
  leafletTitle: string;
  distributionDate: string;
  deliveries: RespondDeliveryRow[];
}) {
  const routes = params.deliveries
    .map((d) => `<li>${escapeHtml(routeLabel(d))}</li>`)
    .join("");

  const body = `
    <h1>Hi ${escapeHtml(params.delivererName.split(" ")[0] ?? params.delivererName)}</h1>
    <p class="lead">
      You’re signed up to deliver the <strong>${escapeHtml(params.leafletTitle)}</strong> leaflet on
      ${escapeHtml(formatDistributionDate(params.distributionDate))}.
    </p>
    <div class="card">
      <p class="meta" style="margin-top:0">Your route${params.deliveries.length === 1 ? "" : "s"}</p>
      <ul class="route-list">${routes}</ul>
    </div>
    <form method="POST">
      ${tokenFields(params.token)}
      <input type="hidden" name="action" value="confirm_all" />
      <button type="submit" class="btn-primary">I&rsquo;m good to help</button>
    </form>
    <a class="link" href="${respondUrl(params.token, "changes")}">I need changes</a>
  `;

  return respondHtmlPage("Confirm your routes", body);
}

export function renderRespondChanges(params: {
  token: RespondTokenParams;
  deliveries: RespondDeliveryRow[];
}) {
  if (params.deliveries.length === 0) {
    return renderRespondFarewellAllRemoved();
  }

  const checkboxes = params.deliveries
    .map(
      (d) => `
      <div class="checkbox-row">
        <input type="checkbox" name="delivery_id" value="${escapeHtml(d.id)}" id="d-${escapeHtml(d.id)}" />
        <label for="d-${escapeHtml(d.id)}">${escapeHtml(routeLabel(d))}</label>
      </div>
    `,
    )
    .join("");

  const body = `
    <h1>Which routes need changes?</h1>
    <p class="lead">Select the routes you want to update.</p>
    <form method="POST">
      ${tokenFields(params.token)}
      <div class="card">${checkboxes}</div>
      <button type="submit" name="action" value="skip_selected" class="btn-primary">Skip this round</button>
      <button type="submit" name="action" value="remove_selected" class="link" style="border:none;background:none;width:100%;cursor:pointer;padding:12px 0;font-size:14px">
        Remove from my routes
      </button>
    </form>
    <a class="link" href="${respondUrl(params.token)}">Back</a>
  `;

  return respondHtmlPage("Update your routes", body);
}

export function renderRespondConfirmed(count: number) {
  const body = `
    <h1>Thank you!</h1>
    <p class="lead">You&rsquo;re confirmed for ${count} route${count === 1 ? "" : "s"}. We appreciate your help delivering the leaflet.</p>
  `;
  return respondHtmlPage("Routes confirmed", body);
}

export function renderRespondSkipFarewell() {
  const body = `
    <h1>Thanks for letting us know</h1>
    <p class="lead">We&rsquo;ll do our best to find someone to cover these, and we&rsquo;ll see you next time!</p>
  `;
  return respondHtmlPage("Routes skipped", body);
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
    .map((d) => `<li>${escapeHtml(routeLabel(d))}</li>`)
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
      <ul class="route-list">${routes}</ul>
    </div>
    <form method="POST">
      ${tokenFields(params.token)}
      <input type="hidden" name="action" value="mark_complete_all" />
      <button type="submit" class="btn-primary">Mark delivered</button>
    </form>
    <a class="link" href="${respondUrl(params.token, "changes")}">Something&rsquo;s wrong</a>
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

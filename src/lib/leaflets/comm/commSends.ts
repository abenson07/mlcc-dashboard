/** One logged email to a deliverer (a row of `leaflet_comm_sends`). */
export type CommSend = {
  person_id: string;
  step_key: string;
  sent_at: string;
};

export function formatSendDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Newest send time per template for one person. */
export function latestSendPerStep(sends: CommSend[], personId: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of sends) {
    if (s.person_id !== personId) continue;
    const current = out[s.step_key];
    if (!current || s.sent_at > current) out[s.step_key] = s.sent_at;
  }
  return out;
}

/**
 * Short "Emailed" cell text for a deliverer: the newest template and date, with
 * a "+N" when other templates were sent too. `title` lists every template.
 */
export function summarizePersonSends(
  sends: CommSend[],
  personId: string,
  stepLabels: Record<string, string>,
): { text: string; title: string } | null {
  const latest = Object.entries(latestSendPerStep(sends, personId)).sort((a, b) =>
    a[1] < b[1] ? 1 : -1,
  );
  if (latest.length === 0) return null;
  const label = (key: string) => stepLabels[key] ?? key;
  const [firstKey, firstAt] = latest[0]!;
  const more = latest.length > 1 ? ` +${latest.length - 1}` : "";
  return {
    text: `${formatSendDate(firstAt)} · ${label(firstKey)}${more}`,
    title: latest.map(([key, at]) => `${label(key)} — ${formatSendDate(at)}`).join("\n"),
  };
}

/** True when the send log table has not been created yet (migration not run). */
export function isMissingTableError(error: { code?: string } | null | undefined): boolean {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

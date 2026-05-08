/** Open invoice whose due timestamp is strictly before now (UTC-ish). */
export function isOpenPastDue(inv: {
  status: string | null;
  due_date: number | null;
}): boolean {
  if (inv.status !== "open") return false;
  if (inv.due_date === null || inv.due_date === undefined) return false;
  return inv.due_date < Math.floor(Date.now() / 1000);
}

export function formatUsd(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

export function formatDueDate(timestamp: number | null): string {
  if (timestamp === null) return "—";
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

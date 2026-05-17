import type { VolunteerAsks } from "@/types/database";

export function formatVolunteerCommitment(ask: Pick<
  VolunteerAsks,
  "commitment_type" | "commitment_unit" | "commitment_quantity"
>): string {
  const qty = ask.commitment_quantity;
  const unitLabel = ask.commitment_unit === "hours" ? "hour" : "minute";
  const unit = qty === 1 ? unitLabel : `${unitLabel}s`;
  const time = `${qty} ${unit}`;
  if (ask.commitment_type === "ongoing") {
    return `${time} / month`;
  }
  return time;
}

export function formatCommitmentTypeLabel(
  type: VolunteerAsks["commitment_type"]
): string {
  return type === "ongoing" ? "Ongoing" : "One-off";
}

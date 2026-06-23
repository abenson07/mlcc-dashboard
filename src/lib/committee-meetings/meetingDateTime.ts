/** Combine a calendar date (YYYY-MM-DD) and clock time (HH:mm) in local timezone. */
export function combineLocalDateAndTime(date: string, time: string): string {
  if (!date || !time) {
    throw new Error("Date and time are required");
  }
  const parsed = new Date(`${date}T${time}`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date or time");
  }
  return parsed.toISOString();
}

export function splitIsoToLocalDateAndTime(iso: string | null | undefined): {
  date: string;
  time: string;
} {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

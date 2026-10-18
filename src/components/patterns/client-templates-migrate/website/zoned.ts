/** Events are Seattle events: dates are shown and entered in this zone whatever the editor's browser says. */
export const SITE_TIME_ZONE = "America/Los_Angeles";

function offsetMinutes(utcMs: number, timeZone: string): number {
  const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(new Date(utcMs))
    .find((p) => p.type === "timeZoneName")?.value;
  const m = part?.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

/** ISO instant → value for <input type="datetime-local"> in the site's time zone. */
export function isoToZonedInput(iso: string | undefined, timeZone = SITE_TIME_ZONE): string {
  const t = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(t)) return "";
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(t))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** <input type="datetime-local"> value (read in the site's time zone) → ISO instant, or "" if empty/invalid. */
export function zonedInputToIso(local: string, timeZone = SITE_TIME_ZONE): string {
  const guess = Date.parse(`${local}:00Z`);
  if (!local || Number.isNaN(guess)) return "";
  let utc = guess - offsetMinutes(guess, timeZone) * 60_000;
  utc = guess - offsetMinutes(utc, timeZone) * 60_000; // re-check across a DST boundary
  return new Date(utc).toISOString();
}

/**
 * In-memory buffer of console output for bug reports.
 * Captures log/warn/error (and info) and returns them as a string.
 */

const MAX_ENTRIES = 100;
const buffer: { level: string; args: unknown[] }[] = [];
let patched = false;

function serialize(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === "string") return a;
      try {
        return JSON.stringify(a);
      } catch {
        return String(a);
      }
    })
    .join(" ");
}

function capture(level: string, original: (...args: unknown[]) => void, args: unknown[]) {
  buffer.push({ level, args: [...args] });
  if (buffer.length > MAX_ENTRIES) buffer.shift();
  original.apply(console, args);
}

export function installConsoleBuffer() {
  if (typeof window === "undefined" || patched) return;
  patched = true;
  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;
  const origInfo = console.info;
  console.log = (...args: unknown[]) => capture("log", origLog, args);
  console.warn = (...args: unknown[]) => capture("warn", origWarn, args);
  console.error = (...args: unknown[]) => capture("error", origError, args);
  console.info = (...args: unknown[]) => capture("info", origInfo, args);
}

export function getConsoleSnapshot(): string {
  if (buffer.length === 0) return "";
  return buffer
    .map(({ level, args }) => `[${level}] ${serialize(args)}`)
    .join("\n");
}

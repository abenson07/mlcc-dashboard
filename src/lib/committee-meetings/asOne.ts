/** Supabase nested selects are sometimes typed as T | T[]; normalize to one row. */
export function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

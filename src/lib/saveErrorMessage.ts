/**
 * Turns a failed save into something an admin can act on. Supabase errors are
 * plain objects with `code` and `message`, so `instanceof Error` misses them.
 */
export function saveErrorMessage(
  error: unknown,
  options: { fallback: string; duplicate?: string },
): string {
  const { code, message } = (error ?? {}) as { code?: unknown; message?: unknown };
  if (code === "23505" && options.duplicate) return options.duplicate;
  if (code === "42501") return "You don't have permission to add this. Ask a board admin for access.";
  return typeof message === "string" && message.trim() ? message : options.fallback;
}

export const DUPLICATE_PERSON_EMAIL =
  "Someone with that email is already in the database. Search for them and edit their record instead.";

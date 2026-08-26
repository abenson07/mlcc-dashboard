export class DuplicateLeafletTitleError extends Error {
  constructor(title: string) {
    super(`A leaflet named “${title.trim()}” already exists. Choose a different name.`);
    this.name = "DuplicateLeafletTitleError";
  }
}

export function normalizeLeafletTitle(title: string): string {
  return title.trim().toLowerCase();
}

export function isDuplicateLeafletTitle(title: string, existingTitles: string[]): boolean {
  const normalized = normalizeLeafletTitle(title);
  if (!normalized) return false;
  return existingTitles.some((existing) => normalizeLeafletTitle(existing) === normalized);
}

export function isPostgresUniqueViolation(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === "23505") return true;
  return (error.message ?? "").toLowerCase().includes("leaflets_title_lower_uidx");
}

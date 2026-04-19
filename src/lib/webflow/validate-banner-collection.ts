import type { BannerFieldSlugs } from "@/lib/webflow/field-slugs";

/** Webflow field types allowed for each logical banner field (keep in sync with setup script). */
export const BANNER_FIELD_TYPES: Record<
  keyof BannerFieldSlugs,
  readonly string[]
> = {
  message: ["PlainText"],
  linkUrl: ["PlainText", "Link"],
  active: ["Switch"],
  expiresAt: ["DateTime"],
  urgent: ["Switch"],
  urgentUntil: ["DateTime"],
  editorNotes: ["PlainText"],
};

export type WebflowFieldMeta = { slug: string; type: string };

export function validateBannerCollectionFields(
  webflowFields: WebflowFieldMeta[],
  slugs: BannerFieldSlugs
): { ok: true } | { ok: false; issues: string[] } {
  const issues: string[] = [];
  const keys = Object.keys(slugs) as (keyof BannerFieldSlugs)[];
  for (const key of keys) {
    const slug = slugs[key];
    const f = webflowFields.find((x) => x.slug === slug);
    if (!f) {
      issues.push(
        `Missing field for ${String(key)}: Webflow has no field with slug "${slug}".`
      );
      continue;
    }
    const allowed = BANNER_FIELD_TYPES[key];
    if (!allowed.includes(f.type)) {
      issues.push(
        `Field "${slug}" (${String(key)}) has type "${f.type}"; expected ${allowed.join(" or ")}.`
      );
    }
  }
  return issues.length ? { ok: false, issues } : { ok: true };
}

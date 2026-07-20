import type { FaqItem } from "@marketing/components/byq/FaqSection";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

type FaqRow = {
  question: string;
  answer: string;
};

// Fetched via the PostgREST HTTP API (rather than @supabase/supabase-js) so this
// data file has no package dependency and works the same in both the mlcc-website
// and root Next.js apps.
export async function getFaqsForPage(pageSlug: string): Promise<FaqItem[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

  const params = new URLSearchParams({
    select: "question,answer,faq_page_assignments!inner(page_slug)",
    "faq_page_assignments.page_slug": `eq.${pageSlug}`,
    is_active: "eq.true",
    order: "sort_order.asc",
  });

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/faqs?${params.toString()}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) return [];

    const rows = (await response.json()) as FaqRow[];
    return rows.map(({ question, answer }) => ({ question, answer }));
  } catch {
    return [];
  }
}

export async function getAllFaqs(): Promise<FaqItem[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

  const params = new URLSearchParams({
    select: "question,answer",
    is_active: "eq.true",
    order: "sort_order.asc",
  });

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/faqs?${params.toString()}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) return [];

    const rows = (await response.json()) as FaqRow[];
    return rows.map(({ question, answer }) => ({ question, answer }));
  } catch {
    return [];
  }
}

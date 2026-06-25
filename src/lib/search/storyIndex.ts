/** Server-side story index (mirrors mock data until a real CMS exists). */
export const STORY_INDEX = [
  { id: "1", title: "Meet the Chang Family" },
  { id: "2", title: "Our Community Garden" },
  { id: "3", title: "Summer Block Party Recap" },
  { id: "4", title: "Welcome to Maple Leaf" },
] as const;

export function searchStories(q: string, limit: number) {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  return STORY_INDEX.filter((s) => s.title.toLowerCase().includes(term)).slice(0, limit);
}

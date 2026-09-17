import {
  SURPLUS_VOTE_ITEM_IDS,
  SURPLUS_VOTE_ITEMS,
  type SurplusVoteItem,
} from "./items";

export type SurplusVoteResult = SurplusVoteItem & {
  points: number;
};

export function isCompleteRanking(
  rankedItemIds: unknown,
  expectedIds: readonly string[] = SURPLUS_VOTE_ITEM_IDS,
): rankedItemIds is string[] {
  if (!Array.isArray(rankedItemIds) || rankedItemIds.length !== expectedIds.length) {
    return false;
  }
  if (!rankedItemIds.every((id) => typeof id === "string")) return false;
  const unique = new Set(rankedItemIds);
  if (unique.size !== expectedIds.length) return false;
  return expectedIds.every((id) => unique.has(id));
}

/** Points for a 0-based rank among `itemCount` options. First place = itemCount. */
export function pointsForRank(rankIndex: number, itemCount: number): number {
  return itemCount - rankIndex;
}

export function scoreBallots(
  ballots: string[][],
  items: readonly SurplusVoteItem[] = SURPLUS_VOTE_ITEMS,
): SurplusVoteResult[] {
  const itemCount = items.length;
  const points = new Map(items.map((item) => [item.id, 0]));

  for (const ranking of ballots) {
    if (!isCompleteRanking(ranking, items.map((item) => item.id))) continue;
    ranking.forEach((id, index) => {
      points.set(id, (points.get(id) ?? 0) + pointsForRank(index, itemCount));
    });
  }

  return items
    .map((item) => ({
      ...item,
      points: points.get(item.id) ?? 0,
    }))
    .sort((a, b) => b.points - a.points || a.title.localeCompare(b.title));
}

export function orderItemsByRanking(
  rankedItemIds: string[] | null | undefined,
  items: readonly SurplusVoteItem[] = SURPLUS_VOTE_ITEMS,
): SurplusVoteItem[] {
  if (!isCompleteRanking(rankedItemIds, items.map((item) => item.id))) {
    return [...items];
  }
  const byId = new Map(items.map((item) => [item.id, item]));
  return rankedItemIds.map((id) => byId.get(id)!);
}

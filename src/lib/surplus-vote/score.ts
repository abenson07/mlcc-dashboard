import {
  SURPLUS_VOTE_ITEM_IDS,
  SURPLUS_VOTE_ITEMS,
  type SurplusVoteItem,
} from "./items";

export type SurplusVoteResult = SurplusVoteItem & {
  points: number;
  /** 1-based average rank across ballots (1 = everyone's top pick). Null with no ballots. */
  averageRank: number | null;
  /** Standard competition rank: equal points share a rank and the next rank skips (1, 2, 2, 4). */
  rank: number;
  /** True when another item has the same points and therefore the same rank. */
  tied: boolean;
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
  const rankSum = new Map(items.map((item) => [item.id, 0]));
  let validBallotCount = 0;

  for (const ranking of ballots) {
    if (!isCompleteRanking(ranking, items.map((item) => item.id))) continue;
    validBallotCount += 1;
    ranking.forEach((id, index) => {
      points.set(id, (points.get(id) ?? 0) + pointsForRank(index, itemCount));
      rankSum.set(id, (rankSum.get(id) ?? 0) + (index + 1));
    });
  }

  const sorted = items
    .map((item) => ({
      ...item,
      points: points.get(item.id) ?? 0,
      averageRank: validBallotCount > 0 ? (rankSum.get(item.id) ?? 0) / validBallotCount : null,
    }))
    .sort((a, b) => b.points - a.points || a.title.localeCompare(b.title));

  return sorted.map((item) => {
    const firstWithPoints = sorted.findIndex((other) => other.points === item.points);
    const tied = sorted.filter((other) => other.points === item.points).length > 1;
    return { ...item, rank: firstWithPoints + 1, tied };
  });
}

export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
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

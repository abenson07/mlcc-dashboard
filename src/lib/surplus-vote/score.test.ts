import { describe, expect, it } from "vitest";
import { SURPLUS_VOTE_ITEM_COUNT, SURPLUS_VOTE_ITEM_IDS } from "./items";
import {
  isCompleteRanking,
  orderItemsByRanking,
  pointsForRank,
  scoreBallots,
} from "./score";

describe("surplus vote scoring", () => {
  it("awards itemCount points to first place and 1 to last", () => {
    expect(pointsForRank(0, SURPLUS_VOTE_ITEM_COUNT)).toBe(SURPLUS_VOTE_ITEM_COUNT);
    expect(pointsForRank(SURPLUS_VOTE_ITEM_COUNT - 1, SURPLUS_VOTE_ITEM_COUNT)).toBe(1);
  });

  it("rejects incomplete or duplicate rankings", () => {
    expect(isCompleteRanking(SURPLUS_VOTE_ITEM_IDS)).toBe(true);
    expect(isCompleteRanking(SURPLUS_VOTE_ITEM_IDS.slice(1))).toBe(false);
    expect(isCompleteRanking([...SURPLUS_VOTE_ITEM_IDS, SURPLUS_VOTE_ITEM_IDS[0]])).toBe(
      false,
    );
    expect(
      isCompleteRanking(["not-an-item", ...SURPLUS_VOTE_ITEM_IDS.slice(1)]),
    ).toBe(false);
  });

  it("sums Borda points across ballots and keeps last place on the board", () => {
    const first = [...SURPLUS_VOTE_ITEM_IDS];
    const reversed = [...SURPLUS_VOTE_ITEM_IDS].reverse();
    const results = scoreBallots([first, reversed]);
    const n = SURPLUS_VOTE_ITEM_COUNT;
    expect(results).toHaveLength(n);
    expect(results.every((row) => row.points === n + 1)).toBe(true);
  });

  it("restores item order from a saved ranking", () => {
    const reversed = [...SURPLUS_VOTE_ITEM_IDS].reverse();
    const ordered = orderItemsByRanking(reversed);
    expect(ordered.map((item) => item.id)).toEqual(reversed);
  });
});

import type { SurplusVoteResult } from "./score";

export type SurplusVoteGetResponse = {
  myRanking: string[] | null;
  ballotCount: number;
  results: SurplusVoteResult[];
};

export type SurplusVotePutResponse = SurplusVoteGetResponse & {
  saved: true;
};

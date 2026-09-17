export interface SurplusVoteBallots {
  id: string;
  user_id: string;
  ranked_item_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface SurplusVoteBallotsInsert {
  user_id: string;
  ranked_item_ids: string[];
}

export interface SurplusVoteBallotsUpdate {
  ranked_item_ids?: string[];
  updated_at?: string;
}

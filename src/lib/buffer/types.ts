export type SupportedSocialService = "instagram" | "facebook";

export type BufferChannelRow = {
  id: string;
  name: string;
  service: SupportedSocialService;
  descriptor: string;
  avatar: string;
  isDisconnected: boolean;
};

export type BufferPostAsset = {
  id: string | null;
  mimeType: string | null;
  url: string | null;
};

export type BufferSocialPostRow = {
  id: string;
  text: string;
  status: string;
  channelId: string;
  channelService: SupportedSocialService;
  channelName: string;
  dueAt: string | null;
  sentAt: string | null;
  createdAt: string;
  assets: BufferPostAsset[];
};

export type ChannelQueueStatus = {
  channelId: string;
  channelName: string;
  service: SupportedSocialService;
  used: number;
  max: number;
  atLimit: boolean;
};

export type BufferPostsListResponse = {
  posts: BufferSocialPostRow[];
  queueMax: number;
  perChannel: ChannelQueueStatus[];
  channels: BufferChannelRow[];
};

export type DailyPostingLimitRow = {
  channelId: string;
  sent: number;
  scheduled: number;
  limit: number | null;
  isAtLimit: boolean;
};

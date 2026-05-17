import { bufferGraphql } from "@/lib/buffer/client";
import { resolveBufferOrganizationId } from "@/lib/buffer/organization";
import { isSupportedSocialService } from "@/lib/buffer/services";
import type {
  BufferChannelRow,
  BufferPostsListResponse,
  BufferSocialPostRow,
  ChannelQueueStatus,
  DailyPostingLimitRow,
  SupportedSocialService,
} from "@/lib/buffer/types";

type GqlChannel = {
  id: string;
  name: string;
  service: string;
  descriptor: string;
  avatar: string;
  isDisconnected: boolean;
};

type GqlPostNode = {
  id: string;
  text: string;
  status: string;
  channelId: string;
  channelService: string;
  dueAt: string | null;
  sentAt: string | null;
  createdAt: string;
  channel: { name: string };
  assets: Array<{
    id: string | null;
    mimeType: string | null;
    source?: string | null;
    thumbnail?: string | null;
  }>;
};

const CHANNELS_QUERY = `
  query GetChannels($organizationId: OrganizationId!) {
    channels(input: { organizationId: $organizationId }) {
      id
      name
      service
      descriptor
      avatar
      isDisconnected
    }
  }
`;

const ORG_LIMITS_QUERY = `
  query GetOrgLimits {
    account {
      organizations {
        id
        limits {
          scheduledPosts
        }
      }
    }
  }
`;

const POSTS_QUERY = `
  query GetPosts($organizationId: OrganizationId!, $channelIds: [ChannelId!]) {
    posts(
      input: {
        organizationId: $organizationId
        filter: { channelIds: $channelIds }
        sort: [{ field: dueAt, direction: asc }, { field: createdAt, direction: desc }]
      }
      first: 100
    ) {
      edges {
        node {
          id
          text
          status
          channelId
          channelService
          dueAt
          sentAt
          createdAt
          channel {
            name
          }
          assets {
            id
            mimeType
            ... on ImageAsset {
              source
              thumbnail
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const DAILY_LIMITS_QUERY = `
  query DailyPostingLimits($channelIds: [ChannelId!]!, $date: DateTime) {
    dailyPostingLimits(input: { channelIds: $channelIds, date: $date }) {
      channelId
      sent
      scheduled
      limit
      isAtLimit
    }
  }
`;

function mapChannel(c: GqlChannel): BufferChannelRow | null {
  const service = c.service?.toLowerCase() ?? "";
  if (!isSupportedSocialService(service)) return null;
  return {
    id: c.id,
    name: c.name,
    service,
    descriptor: c.descriptor,
    avatar: c.avatar,
    isDisconnected: c.isDisconnected,
  };
}

function mapPost(node: GqlPostNode): BufferSocialPostRow | null {
  if (!isSupportedSocialService(node.channelService)) return null;
  const assets = (node.assets ?? []).map((a) => ({
    id: a.id,
    mimeType: a.mimeType,
    url: a.thumbnail ?? a.source ?? null,
  }));
  return {
    id: node.id,
    text: node.text,
    status: node.status,
    channelId: node.channelId,
    channelService: node.channelService as SupportedSocialService,
    channelName: node.channel.name,
    dueAt: node.dueAt,
    sentAt: node.sentAt,
    createdAt: node.createdAt,
    assets,
  };
}

export async function listSupportedChannels(): Promise<BufferChannelRow[]> {
  const organizationId = await resolveBufferOrganizationId();
  const data = await bufferGraphql<{ channels: GqlChannel[] }>(CHANNELS_QUERY, {
    organizationId,
  });
  return (data.channels ?? [])
    .map(mapChannel)
    .filter((c): c is BufferChannelRow => c !== null);
}

async function getQueueMax(organizationId: string): Promise<number> {
  const data = await bufferGraphql<{
    account: { organizations: Array<{ id: string; limits: { scheduledPosts: number } }> };
  }>(ORG_LIMITS_QUERY);
  const org = data.account.organizations.find((o) => o.id === organizationId);
  return org?.limits.scheduledPosts ?? 10;
}

export async function listSocialPosts(): Promise<BufferPostsListResponse> {
  const organizationId = await resolveBufferOrganizationId();
  const channels = await listSupportedChannels();
  const channelIds = channels.map((c) => c.id);

  if (channelIds.length === 0) {
    const queueMax = await getQueueMax(organizationId);
    return { posts: [], queueMax, perChannel: [], channels: [] };
  }

  const [postsData, queueMax] = await Promise.all([
    bufferGraphql<{
      posts: {
        edges: Array<{ node: GqlPostNode }>;
        pageInfo: { hasNextPage: boolean };
      };
    }>(POSTS_QUERY, { organizationId, channelIds }),
    getQueueMax(organizationId),
  ]);

  const posts = (postsData.posts.edges ?? [])
    .map((e) => mapPost(e.node))
    .filter((p): p is BufferSocialPostRow => p !== null);

  const scheduledByChannel = new Map<string, number>();
  for (const ch of channels) {
    scheduledByChannel.set(ch.id, 0);
  }
  for (const post of posts) {
    const s = post.status.toLowerCase();
    if (s === "scheduled" || s === "sending") {
      scheduledByChannel.set(
        post.channelId,
        (scheduledByChannel.get(post.channelId) ?? 0) + 1,
      );
    }
  }

  const perChannel: ChannelQueueStatus[] = channels.map((ch) => {
    const used = scheduledByChannel.get(ch.id) ?? 0;
    return {
      channelId: ch.id,
      channelName: ch.name,
      service: ch.service,
      used,
      max: queueMax,
      atLimit: used >= queueMax,
    };
  });

  return { posts, queueMax, perChannel, channels };
}

export async function getDailyPostingLimits(
  channelIds: string[],
  dateIso: string,
): Promise<DailyPostingLimitRow[]> {
  if (channelIds.length === 0) return [];
  const data = await bufferGraphql<{
    dailyPostingLimits: DailyPostingLimitRow[];
  }>(DAILY_LIMITS_QUERY, { channelIds, date: dateIso });
  return data.dailyPostingLimits ?? [];
}

export async function getChannelById(
  channelId: string,
): Promise<BufferChannelRow | null> {
  const channels = await listSupportedChannels();
  return channels.find((c) => c.id === channelId) ?? null;
}

export function countScheduledForChannel(
  posts: BufferSocialPostRow[],
  channelId: string,
): number {
  return posts.filter(
    (p) =>
      p.channelId === channelId &&
      (p.status.toLowerCase() === "scheduled" ||
        p.status.toLowerCase() === "sending"),
  ).length;
}

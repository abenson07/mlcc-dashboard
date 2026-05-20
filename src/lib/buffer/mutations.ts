import { bufferGraphql } from "@/lib/buffer/client";
import {
  countScheduledForChannel,
  listSocialPosts,
} from "@/lib/buffer/queries";
import type {
  BufferChannelRow,
  BufferPostsListResponse,
  BufferSocialPostRow,
  SupportedSocialService,
} from "@/lib/buffer/types";

function createPostMetadata(
  service: SupportedSocialService,
): Record<string, unknown> {
  if (service === "instagram") {
    return {
      instagram: {
        type: "post",
        shouldShareToFeed: true,
      },
    };
  }
  return {
    facebook: {
      type: "post",
    },
  };
}

export type CreateSocialPostInput = {
  channelId: string;
  text: string;
  dueAt: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
};

const CREATE_POST_MUTATION = `
  mutation CreateScheduledPost($input: CreatePostInput!) {
    createPost(input: $input) {
      ... on PostActionSuccess {
        post {
          id
          text
          status
          dueAt
        }
      }
      ... on MutationError {
        message
      }
    }
  }
`;

const DELETE_POST_MUTATION = `
  mutation DeletePost($input: DeletePostInput!) {
    deletePost(input: $input) {
      ... on DeletePostSuccess {
        id
      }
      ... on MutationError {
        message
      }
    }
  }
`;

type CreatePostResponse = {
  createPost:
    | { post: { id: string; text: string; status: string; dueAt: string | null } }
    | { message: string };
};

/** One Buffer API call — createPost only. */
async function bufferCreatePost(
  channel: BufferChannelRow,
  input: CreateSocialPostInput,
): Promise<BufferSocialPostRow> {
  const assets =
    input.imageUrl && input.imageUrl.trim()
      ? [
          {
            image: {
              url: input.imageUrl.trim(),
              ...(input.imageWidth && input.imageHeight
                ? {
                    metadata: {
                      altText: "MLCC community post",
                      dimensions: {
                        width: input.imageWidth,
                        height: input.imageHeight,
                      },
                    },
                  }
                : { metadata: { altText: "MLCC community post" } }),
            },
          },
        ]
      : undefined;

  const gqlInput: Record<string, unknown> = {
    text: input.text,
    channelId: input.channelId,
    schedulingType: "automatic",
    mode: "customScheduled",
    dueAt: input.dueAt,
    metadata: createPostMetadata(channel.service),
  };
  if (assets) {
    gqlInput.assets = assets;
  }

  const data = await bufferGraphql<CreatePostResponse>(CREATE_POST_MUTATION, {
    input: gqlInput,
  });

  const result = data.createPost;
  if ("message" in result && result.message) {
    throw new Error(result.message);
  }
  if (!("post" in result) || !result.post) {
    throw new Error("Buffer did not return the created post.");
  }

  return {
    id: result.post.id,
    text: result.post.text,
    status: result.post.status,
    channelId: input.channelId,
    channelService: channel.service,
    channelName: channel.name,
    dueAt: result.post.dueAt,
    sentAt: null,
    createdAt: new Date().toISOString(),
    assets: input.imageUrl
      ? [{ id: null, mimeType: "image/*", url: input.imageUrl }]
      : [],
  };
}

function scheduledCountByChannel(
  snapshot: BufferPostsListResponse,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const ch of snapshot.channels) {
    counts.set(ch.id, countScheduledForChannel(snapshot.posts, ch.id));
  }
  return counts;
}

export async function createScheduledSocialPost(
  input: CreateSocialPostInput,
  snapshot?: BufferPostsListResponse,
): Promise<BufferSocialPostRow> {
  const state = snapshot ?? (await listSocialPosts());
  const channel = state.channels.find((c) => c.id === input.channelId);
  if (!channel) {
    throw new Error("Channel not found or not supported (Instagram/Facebook only).");
  }

  const counts = scheduledCountByChannel(state);
  const used = counts.get(input.channelId) ?? 0;
  if (used >= state.queueMax) {
    throw new Error(
      `This channel already has ${used} scheduled posts (limit ${state.queueMax}). Remove or publish one before scheduling more.`,
    );
  }

  return bufferCreatePost(channel, input);
}

export type CreateSocialPostBatchInput = {
  text: string;
  dueAt: string;
  posts: CreateSocialPostInput[];
};

export type CreateSocialPostBatchResult = {
  posts: BufferSocialPostRow[];
  errors: Array<{ channelId: string; message: string }>;
};

export async function createScheduledSocialPostsBatch(
  input: CreateSocialPostBatchInput,
  snapshot?: BufferPostsListResponse,
): Promise<CreateSocialPostBatchResult> {
  const state = snapshot ?? (await listSocialPosts());
  const channelById = new Map(state.channels.map((c) => [c.id, c]));
  const scheduledByChannel = scheduledCountByChannel(state);

  const created: BufferSocialPostRow[] = [];
  const errors: Array<{ channelId: string; message: string }> = [];

  for (const item of input.posts) {
    const channel = channelById.get(item.channelId);
    if (!channel) {
      errors.push({
        channelId: item.channelId,
        message: "Channel not found or not supported (Instagram/Facebook only).",
      });
      continue;
    }

    const used = scheduledByChannel.get(item.channelId) ?? 0;
    if (used >= state.queueMax) {
      errors.push({
        channelId: item.channelId,
        message: `Queue full (${used}/${state.queueMax} scheduled).`,
      });
      continue;
    }

    try {
      const post = await bufferCreatePost(channel, {
        ...item,
        text: input.text,
        dueAt: input.dueAt,
      });
      scheduledByChannel.set(item.channelId, used + 1);
      created.push(post);
    } catch (e) {
      errors.push({
        channelId: item.channelId,
        message: e instanceof Error ? e.message : "Failed to schedule post.",
      });
    }
  }

  if (created.length === 0 && errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join(" "));
  }

  return { posts: created, errors };
}

export async function deleteSocialPost(postId: string): Promise<void> {
  const data = await bufferGraphql<{
    deletePost: { id: string } | { message: string };
  }>(DELETE_POST_MUTATION, { input: { id: postId } });

  const result = data.deletePost;
  if ("message" in result && result.message) {
    throw new Error(result.message);
  }
}

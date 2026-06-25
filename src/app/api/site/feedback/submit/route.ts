import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import {
  formatLinearBatchDescription,
  formatLinearBatchTitle,
} from "@/lib/site-feedback/formatLinearBatch";
import type { SiteFeedbackComment } from "@/lib/site-feedback/types";

const LINEAR_GRAPHQL_URL = "https://api.linear.app/graphql";

const MLCC_WEBSITE_TEAM_ID = "099ed058-f147-44c2-ad53-8b45e62f803c";
const MLCC_WEBSITE_PROJECT_ID = "7987d67b-317a-4f02-8e14-72bf82aeed3f";

interface LinearGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message?: string }>;
}

async function linearGraphQL<T>(
  apiKey: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(LINEAR_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Linear API error ${res.status}: ${text}`);
  }
  const json = (await res.json()) as LinearGraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data as T;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!session.ok) return session.response;

    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Linear API is not configured (LINEAR_API_KEY missing)." },
        { status: 503 },
      );
    }

    let body: { comments?: SiteFeedbackComment[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const comments = body.comments ?? [];
    if (!Array.isArray(comments) || comments.length === 0) {
      return NextResponse.json({ error: "At least one comment is required." }, { status: 400 });
    }

    for (const comment of comments) {
      if (!comment.body?.trim() || !comment.pagePath) {
        return NextResponse.json({ error: "Each comment needs body and pagePath." }, { status: 400 });
      }
      if (comment.scope !== "page" && comment.scope !== "element") {
        return NextResponse.json({ error: "Invalid comment scope." }, { status: 400 });
      }
    }

    const teamId = process.env.LINEAR_WEBSITE_TEAM_ID ?? MLCC_WEBSITE_TEAM_ID;
    const projectId = process.env.LINEAR_WEBSITE_PROJECT_ID ?? MLCC_WEBSITE_PROJECT_ID;

    const title = formatLinearBatchTitle(comments);
    const description = formatLinearBatchDescription(comments, session.user.displayName);

    const mutation = `
      mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            url
            identifier
          }
        }
      }
    `;

    const result = await linearGraphQL<{
      issueCreate: {
        success: boolean;
        issue: { id: string; url: string; identifier: string };
      };
    }>(apiKey, mutation, {
      input: {
        teamId,
        projectId,
        title,
        description,
      },
    });

    const payload = result?.issueCreate;
    if (!payload?.success || !payload.issue) {
      return NextResponse.json({ error: "Linear did not create the issue." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      issueId: payload.issue.id,
      url: payload.issue.url,
      identifier: payload.issue.identifier,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

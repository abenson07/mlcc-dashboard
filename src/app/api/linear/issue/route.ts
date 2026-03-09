import { NextRequest, NextResponse } from "next/server";

const LINEAR_GRAPHQL_URL = "https://api.linear.app/graphql";
const DEFAULT_TEAM_ID = "cd8ff0c6";
const DEFAULT_PROJECT_ID = "d9c77471";

const MAX_PAGE_LENGTH = 500;
const MAX_DETAILS_LENGTH = 10000;
const MAX_ERROR_LOG_LENGTH = 5000;

type FeedbackType = "bug" | "feature";

interface RequestBody {
  type: FeedbackType;
  page: string;
  details: string;
  errorLog?: string;
}

function sanitize(str: string, maxLen: number): string {
  return String(str).slice(0, maxLen).trim();
}

interface LinearGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message?: string }>;
}

async function linearGraphQL<T>(
  apiKey: string,
  query: string,
  variables?: Record<string, unknown>
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

async function getLabelIdByName(
  apiKey: string,
  teamId: string,
  labelName: string
): Promise<string | null> {
  const query = `
    query TeamLabels($teamId: String!) {
      team(id: $teamId) {
        labels {
          nodes {
            id
            name
          }
        }
      }
    }
  `;
  const data = await linearGraphQL<{
    team: { labels: { nodes: { id: string; name: string }[] } };
  }>(apiKey, query, { teamId });
  const nodes = data?.team?.labels?.nodes ?? [];
  const label = nodes.find(
    (n) => n.name.toLowerCase() === labelName.toLowerCase()
  );
  return label?.id ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Linear API is not configured (LINEAR_API_KEY missing)." },
        { status: 503 }
      );
    }

    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { type, page, details, errorLog } = body;
    if (type !== "bug" && type !== "feature") {
      return NextResponse.json(
        { error: "type must be 'bug' or 'feature'." },
        { status: 400 }
      );
    }
    const safePage = sanitize(page ?? "", MAX_PAGE_LENGTH);
    const safeDetails = sanitize(details ?? "", MAX_DETAILS_LENGTH);
    const safeErrorLog =
      type === "bug" && errorLog != null
        ? sanitize(String(errorLog), MAX_ERROR_LOG_LENGTH)
        : "";

    if (!safeDetails) {
      return NextResponse.json(
        { error: "details is required." },
        { status: 400 }
      );
    }

    const teamId = process.env.LINEAR_TEAM_ID ?? DEFAULT_TEAM_ID;
    const projectId = process.env.LINEAR_PROJECT_ID ?? DEFAULT_PROJECT_ID;

    const labelName = type === "bug" ? "Bug" : "Feature";
    const labelId = await getLabelIdByName(apiKey, teamId, labelName);
    const labelIds = labelId ? [labelId] : [];

    const title =
      type === "bug"
        ? `[Bug] ${safeDetails.slice(0, 80)}${safeDetails.length > 80 ? "…" : ""}`
        : `[Feature] ${safeDetails.slice(0, 80)}${safeDetails.length > 80 ? "…" : ""}`;

    const descriptionParts = [
      `**Page:** ${safePage || "(not provided)"}`,
      "",
      "**Details:**",
      safeDetails,
    ];
    if (type === "bug" && safeErrorLog) {
      descriptionParts.push("", "**Error log:**", "```", safeErrorLog, "```");
    }
    const description = descriptionParts.join("\n");

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
    const input: Record<string, unknown> = {
      teamId,
      projectId,
      title,
      description,
      labelIds,
    };

    const result = await linearGraphQL<{
      issueCreate: {
        success: boolean;
        issue: { id: string; url: string; identifier: string };
      };
    }>(apiKey, mutation, { input });

    const payload = result?.issueCreate;
    if (!payload?.success || !payload.issue) {
      return NextResponse.json(
        { error: "Linear did not create the issue." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      issueId: payload.issue.id,
      url: payload.issue.url,
      identifier: payload.issue.identifier,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

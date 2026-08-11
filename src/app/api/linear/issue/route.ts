import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";

const LINEAR_GRAPHQL_URL = "https://api.linear.app/graphql";

// MLCC Dashboard Features (see src/app/api/linear/project-issues/route.ts)
const DEFAULT_PROJECT_ID = "d9c77471-1473-469a-a978-8522e9c82319";

type IssueType = "bug" | "feature";

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

/** Projects can span multiple teams; fall back to the project's first team when LINEAR_TEAM_ID isn't set. */
async function resolveTeamId(apiKey: string, projectId: string): Promise<string> {
  const envTeamId = process.env.LINEAR_TEAM_ID;
  if (envTeamId) return envTeamId;

  const data = await linearGraphQL<{
    project: { teams: { nodes: Array<{ id: string }> } } | null;
  }>(apiKey, `query ProjectTeam($projectId: String!) { project(id: $projectId) { teams { nodes { id } } } }`, {
    projectId,
  });

  const teamId = data?.project?.teams?.nodes?.[0]?.id;
  if (!teamId) {
    throw new Error("Could not resolve a Linear team for this project — set LINEAR_TEAM_ID.");
  }
  return teamId;
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

    let body: {
      type?: IssueType;
      title?: string;
      description?: string;
      pageUrl?: string;
      pageContext?: string;
      panelOpen?: boolean;
      panelPreview?: string;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { type, title, description, pageUrl, pageContext, panelOpen, panelPreview } = body;
    if (type !== "bug" && type !== "feature") {
      return NextResponse.json({ error: "type must be 'bug' or 'feature'." }, { status: 400 });
    }
    if (!title?.trim()) {
      return NextResponse.json({ error: "title is required." }, { status: 400 });
    }

    const projectId = process.env.LINEAR_PROJECT_ID ?? DEFAULT_PROJECT_ID;
    const teamId = await resolveTeamId(apiKey, projectId);

    const prefix = type === "bug" ? "[Bug]" : "[Feature]";
    const fullTitle = `${prefix} ${title.trim()}`;
    const descriptionParts = [
      description?.trim() || "_No description provided._",
      "",
      "---",
      `Reported by ${session.user.displayName} (${session.user.email ?? "no email"})`,
    ];
    if (pageUrl) descriptionParts.push(`Page: ${pageUrl}`);
    if (pageContext) descriptionParts.push(`Section: ${pageContext}`);
    if (panelOpen) {
      descriptionParts.push(
        `Detail panel open${panelPreview ? `: "${panelPreview}"` : ""}`,
      );
    }

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
        title: fullTitle,
        description: descriptionParts.join("\n"),
      },
    });

    const payload = result?.issueCreate;
    if (!payload?.success || !payload.issue) {
      return NextResponse.json({ error: "Linear did not create the issue." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      url: payload.issue.url,
      identifier: payload.issue.identifier,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

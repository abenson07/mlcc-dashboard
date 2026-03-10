import { NextRequest, NextResponse } from "next/server";

const LINEAR_GRAPHQL_URL = "https://api.linear.app/graphql";

const ALLOWED_PROJECT_IDS = [
  "d9c77471-1473-469a-a978-8522e9c82319", // MLCC Dashboard Features
  "44bafc1d-98a4-4917-adcc-8130b0a4cbf8", // MLCC Website Features
];

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

export interface ProjectIssueItem {
  id: string;
  title: string;
  description: string | null;
  stateName: string | null;
  priority: number;
  url: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Linear API is not configured (LINEAR_API_KEY missing)." },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json(
        { error: "projectId query parameter is required." },
        { status: 400 }
      );
    }
    if (!ALLOWED_PROJECT_IDS.includes(projectId)) {
      return NextResponse.json(
        { error: "Project ID not allowed." },
        { status: 400 }
      );
    }

    // Query issues by project; filter archived/done in app (Linear project.issues filter support varies).
    const query = `
      query ProjectIssues($projectId: String!) {
        project(id: $projectId) {
          issues {
            nodes {
              id
              title
              description
              state { name type }
              priority
              archivedAt
              url
            }
          }
        }
      }
    `;

    const data = await linearGraphQL<{
      project: {
        issues: {
          nodes: Array<{
            id: string;
            title: string;
            description: string | null;
            state: { name: string; type: string } | null;
            priority: number;
            archivedAt: string | null;
            url: string | null;
          }>;
        };
      };
    }>(apiKey, query, { projectId });

    const rawNodes = data?.project?.issues?.nodes ?? [];
    // Exclude archived and done (completed/canceled)
    const nodes = rawNodes.filter(
      (n) =>
        !n.archivedAt &&
        n.state?.type !== "completed" &&
        n.state?.type !== "canceled"
    );
    const items: ProjectIssueItem[] = nodes.map((node) => ({
      id: node.id,
      title: node.title,
      description: node.description ?? null,
      stateName: node.state?.name ?? null,
      priority: node.priority ?? 0,
      url: node.url ?? null,
    }));

    return NextResponse.json(items);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

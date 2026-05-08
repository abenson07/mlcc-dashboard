#!/usr/bin/env node

const LINEAR_API_URL = "https://api.linear.app/graphql";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for argument --${key}`);
    }
    args[key] = value;
    i += 1;
  }
  return args;
}

async function gql(apiKey, query, variables = {}) {
  const res = await fetch(LINEAR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Linear API HTTP ${res.status}: ${body}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Linear API error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

async function getProjectByName(apiKey, projectName) {
  const query = `
    query GetProjectByName($name: String!) {
      projects(filter: { name: { eq: $name } }, first: 10) {
        nodes {
          id
          name
          teams {
            nodes {
              id
              name
            }
          }
        }
      }
    }
  `;

  const data = await gql(apiKey, query, { name: projectName });
  const exact = (data.projects.nodes || []).find((p) => p.name === projectName);
  if (!exact) throw new Error(`Project not found: "${projectName}"`);
  const team = exact.teams?.nodes?.[0];
  if (!team) throw new Error(`Project "${projectName}" has no team.`);
  return {
    ...exact,
    team,
  };
}

async function fetchAllMilestones(apiKey, projectId) {
  const query = `
    query ProjectMilestones($projectId: String!, $after: String) {
      project(id: $projectId) {
        projectMilestones(first: 100, after: $after) {
          nodes {
            id
            name
            description
            targetDate
            sortOrder
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  const out = [];
  let after = null;
  while (true) {
    const data = await gql(apiKey, query, { projectId, after });
    const conn = data.project?.projectMilestones;
    if (!conn) break;
    out.push(...(conn.nodes || []));
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }

  return out;
}

async function fetchAllIssues(apiKey, projectId) {
  const query = `
    query ProjectIssues($projectId: ID!, $after: String) {
      issues(filter: { project: { id: { eq: $projectId } } }, first: 100, after: $after) {
        nodes {
          id
          title
          description
          priority
          estimate
          dueDate
          sortOrder
          state {
            id
            name
          }
          parent {
            id
          }
          projectMilestone {
            id
            name
          }
          labels {
            nodes {
              id
              name
            }
          }
          relations {
            nodes {
              type
              relatedIssue {
                id
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const out = [];
  let after = null;
  while (true) {
    const data = await gql(apiKey, query, { projectId, after });
    const conn = data.issues;
    out.push(...(conn.nodes || []));
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return out;
}

async function fetchTeamStates(apiKey, teamId) {
  const query = `
    query TeamStates($teamId: String!) {
      team(id: $teamId) {
        states {
          nodes {
            id
            name
          }
        }
      }
    }
  `;
  const data = await gql(apiKey, query, { teamId });
  return data.team?.states?.nodes || [];
}

async function fetchTeamLabels(apiKey, teamId) {
  const query = `
    query TeamLabels($teamId: ID, $after: String) {
      issueLabels(filter: { team: { id: { eq: $teamId } } }, first: 100, after: $after) {
        nodes {
          id
          name
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
  const out = [];
  let after = null;
  while (true) {
    const data = await gql(apiKey, query, { teamId, after });
    const conn = data.issueLabels;
    out.push(...(conn.nodes || []));
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return out;
}

async function createMilestone(apiKey, input) {
  const mutation = `
    mutation CreateMilestone($input: ProjectMilestoneCreateInput!) {
      projectMilestoneCreate(input: $input) {
        success
        projectMilestone {
          id
          name
        }
      }
    }
  `;
  const data = await gql(apiKey, mutation, { input });
  if (!data.projectMilestoneCreate?.success) {
    throw new Error(`Failed to create milestone "${input.name}"`);
  }
  return data.projectMilestoneCreate.projectMilestone;
}

async function createIssue(apiKey, input) {
  const mutation = `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          title
        }
      }
    }
  `;
  const data = await gql(apiKey, mutation, { input });
  if (!data.issueCreate?.success) {
    throw new Error(`Failed to create issue "${input.title}"`);
  }
  return data.issueCreate.issue;
}

async function createDependency(apiKey, issueId, relatedIssueId) {
  const mutation = `
    mutation CreateIssueRelation($input: IssueRelationCreateInput!) {
      issueRelationCreate(input: $input) {
        success
      }
    }
  `;
  const data = await gql(apiKey, mutation, {
    input: {
      issueId,
      relatedIssueId,
      type: "blocks",
    },
  });
  return Boolean(data.issueRelationCreate?.success);
}

async function main() {
  const args = parseArgs(process.argv);
  const oldApiKey = args.oldApiKey || process.env.OLD_LINEAR_API_KEY;
  const newApiKey = args.newApiKey || process.env.NEW_LINEAR_API_KEY;
  const oldProjectName = args.oldProjectName;
  const newProjectName = args.newProjectName;

  if (!oldApiKey || !newApiKey || !oldProjectName || !newProjectName) {
    throw new Error(
      "Usage: node scripts/linear-migrate-project.mjs --oldApiKey <key> --newApiKey <key> --oldProjectName <name> --newProjectName <name>",
    );
  }

  console.log(`Resolving old project "${oldProjectName}"...`);
  const oldProject = await getProjectByName(oldApiKey, oldProjectName);
  console.log(`Resolving new project "${newProjectName}"...`);
  const newProject = await getProjectByName(newApiKey, newProjectName);

  console.log("Fetching source milestones and issues...");
  const [oldMilestones, oldIssues] = await Promise.all([
    fetchAllMilestones(oldApiKey, oldProject.id),
    fetchAllIssues(oldApiKey, oldProject.id),
  ]);

  console.log(`Found ${oldMilestones.length} milestones, ${oldIssues.length} issues.`);

  const targetStates = await fetchTeamStates(newApiKey, newProject.team.id);
  const stateByName = new Map(targetStates.map((s) => [s.name, s.id]));

  const targetLabels = await fetchTeamLabels(newApiKey, newProject.team.id);
  const labelByName = new Map(targetLabels.map((l) => [l.name, l.id]));

  const milestoneIdMap = new Map();
  for (const ms of oldMilestones.sort((a, b) => a.sortOrder - b.sortOrder)) {
    const created = await createMilestone(newApiKey, {
      projectId: newProject.id,
      name: ms.name,
      description: ms.description || "",
      targetDate: ms.targetDate || null,
      sortOrder: ms.sortOrder,
    });
    milestoneIdMap.set(ms.id, created.id);
    console.log(`Milestone created: ${ms.name}`);
  }

  const issueIdMap = new Map();
  const deferredChildren = [];
  const issuesOrdered = [...oldIssues].sort((a, b) => a.sortOrder - b.sortOrder);

  for (const issue of issuesOrdered) {
    if (issue.parent?.id) {
      deferredChildren.push(issue);
      continue;
    }
    const targetStateId = issue.state?.name ? stateByName.get(issue.state.name) : null;
    const targetMilestoneId = issue.projectMilestone?.id
      ? milestoneIdMap.get(issue.projectMilestone.id)
      : null;
    const targetLabelIds = (issue.labels?.nodes || [])
      .map((l) => labelByName.get(l.name))
      .filter(Boolean);

    const created = await createIssue(newApiKey, {
      teamId: newProject.team.id,
      projectId: newProject.id,
      title: issue.title,
      description: issue.description || "",
      priority: issue.priority ?? 0,
      estimate: issue.estimate ?? null,
      dueDate: issue.dueDate || null,
      sortOrder: issue.sortOrder,
      stateId: targetStateId || undefined,
      projectMilestoneId: targetMilestoneId || undefined,
      labelIds: targetLabelIds.length ? targetLabelIds : undefined,
    });
    issueIdMap.set(issue.id, created.id);
    console.log(`Issue created: ${issue.title}`);
  }

  let pendingChildren = deferredChildren;
  while (pendingChildren.length > 0) {
    const next = [];
    let createdCount = 0;
    for (const issue of pendingChildren) {
      const targetParentId = issueIdMap.get(issue.parent.id);
      if (!targetParentId) {
        next.push(issue);
        continue;
      }
      const targetStateId = issue.state?.name ? stateByName.get(issue.state.name) : null;
      const targetMilestoneId = issue.projectMilestone?.id
        ? milestoneIdMap.get(issue.projectMilestone.id)
        : null;
      const targetLabelIds = (issue.labels?.nodes || [])
        .map((l) => labelByName.get(l.name))
        .filter(Boolean);

      const created = await createIssue(newApiKey, {
        teamId: newProject.team.id,
        projectId: newProject.id,
        parentId: targetParentId,
        title: issue.title,
        description: issue.description || "",
        priority: issue.priority ?? 0,
        estimate: issue.estimate ?? null,
        dueDate: issue.dueDate || null,
        sortOrder: issue.sortOrder,
        stateId: targetStateId || undefined,
        projectMilestoneId: targetMilestoneId || undefined,
        labelIds: targetLabelIds.length ? targetLabelIds : undefined,
      });
      issueIdMap.set(issue.id, created.id);
      createdCount += 1;
      console.log(`Sub-issue created: ${issue.title}`);
    }

    if (createdCount === 0) {
      throw new Error(
        `Unable to resolve parent mapping for ${pendingChildren.length} child issue(s).`,
      );
    }
    pendingChildren = next;
  }

  const dependencyPairs = [];
  for (const issue of oldIssues) {
    const sourceId = issue.id;
    for (const rel of issue.relations?.nodes || []) {
      if (rel.type !== "blocks" || !rel.relatedIssue?.id) continue;
      dependencyPairs.push([sourceId, rel.relatedIssue.id]);
    }
  }

  let dependencyCreated = 0;
  for (const [oldIssueId, oldRelatedId] of dependencyPairs) {
    const newIssueId = issueIdMap.get(oldIssueId);
    const newRelatedId = issueIdMap.get(oldRelatedId);
    if (!newIssueId || !newRelatedId) continue;
    const ok = await createDependency(newApiKey, newIssueId, newRelatedId);
    if (ok) dependencyCreated += 1;
  }

  console.log("Migration complete.");
  console.log(`Milestones migrated: ${milestoneIdMap.size}`);
  console.log(`Issues migrated: ${issueIdMap.size}`);
  console.log(`Dependencies created: ${dependencyCreated}`);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});

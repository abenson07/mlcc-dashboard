import {
  getWebflowApiToken,
  getWebflowVolunteerAsksCollectionId,
} from "@/lib/webflow/env";

export function getVolunteerAskWebflowConfigIssues(): string[] {
  const issues: string[] = [];
  if (!getWebflowApiToken()) {
    issues.push("WEBFLOW_SITE_API_TOKEN or WEBFLOW_API_TOKEN");
  }
  if (!getWebflowVolunteerAsksCollectionId()) {
    issues.push("WEBFLOW_VOLUNTEER_ASKS_COLLECTION_ID");
  }
  return issues;
}

export function isVolunteerAsksWebflowConfigured(): boolean {
  return getVolunteerAskWebflowConfigIssues().length === 0;
}

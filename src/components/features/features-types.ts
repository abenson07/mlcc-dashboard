export type FeatureSurface = "dashboard" | "website";

/** Linear priority: 0 = None, 1 = Urgent, 2 = High, 3 = Medium, 4 = Low */
export const PRIORITY_LABELS: Record<number, string> = {
  0: "None",
  1: "Urgent",
  2: "High",
  3: "Medium",
  4: "Low",
};

export function getPriorityLabel(priority: number): string {
  return PRIORITY_LABELS[priority] ?? "None";
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string | null;
  stateName: string | null;
  priority: number;
  url: string | null;
  vote_count: number;
  surface: FeatureSurface;
}

export const PROJECT_IDS: Record<FeatureSurface, string> = {
  dashboard: "4d3b6e2d-7ab9-4bee-a6d6-f40d75cd63ad",
  website: "44bafc1d-98a4-4917-adcc-8130b0a4cbf8",
};

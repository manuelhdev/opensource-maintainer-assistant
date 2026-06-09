export type Priority = "low" | "medium" | "high";

export type TaskType = "issue" | "pr" | "release" | "security" | "docs";

export type MaintainerTask = {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: Priority;
  completed: boolean;
  createdAt: string;
};

export type ReleaseChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type RepoSettings = {
  repoName: string;
  githubUrl: string;
  maintainerName: string;
  compactMode: boolean;
  weeklyDigest: boolean;
};

export type HealthSignal = {
  name: string;
  status: "good" | "warning" | "risk";
  score: number;
  detail: string;
};

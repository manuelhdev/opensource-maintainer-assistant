import type {
  HealthSignal,
  MaintainerTask,
  ReleaseChecklistItem,
  RepoSettings,
} from "@/types";

export const initialTasks: MaintainerTask[] = [
  {
    id: "task-1",
    title: "Triage stale bug reports",
    description: "Review open issues older than 30 days and tag reproducible bugs.",
    type: "issue",
    priority: "high",
    completed: false,
    createdAt: "2026-06-01",
  },
  {
    id: "task-2",
    title: "Review dependency bump PR",
    description: "Check changelog and CI results before merging the patch update.",
    type: "pr",
    priority: "medium",
    completed: false,
    createdAt: "2026-06-03",
  },
  {
    id: "task-3",
    title: "Update installation docs",
    description: "Refresh README setup notes for the new package manager flow.",
    type: "docs",
    priority: "low",
    completed: true,
    createdAt: "2026-05-29",
  },
  {
    id: "task-4",
    title: "Audit security advisory",
    description: "Confirm if the advisory affects the current lockfile version.",
    type: "security",
    priority: "high",
    completed: false,
    createdAt: "2026-06-05",
  },
];

export const initialChecklist: ReleaseChecklistItem[] = [
  { id: "release-1", label: "All required PRs merged", completed: false },
  { id: "release-2", label: "CI green on default branch", completed: false },
  { id: "release-3", label: "Version updated in package manifest", completed: false },
  { id: "release-4", label: "Migration notes reviewed", completed: true },
  { id: "release-5", label: "Release announcement drafted", completed: false },
];

export const initialSettings: RepoSettings = {
  repoName: "opensource-maintainer-assistant",
  githubUrl: "https://github.com/manuelhdev/opensource-maintainer-assistant",
  maintainerName: "Manuel Herrera",
  compactMode: false,
  weeklyDigest: true,
};

export const healthSignals: HealthSignal[] = [
  {
    name: "Documentation",
    status: "good",
    score: 88,
    detail: "README, contributing guide, and setup docs are present.",
  },
  {
    name: "Tests",
    status: "warning",
    score: 68,
    detail: "Core flows have coverage, but release tooling needs tests.",
  },
  {
    name: "Dependencies",
    status: "warning",
    score: 74,
    detail: "Three packages have minor updates available.",
  },
  {
    name: "Security",
    status: "risk",
    score: 61,
    detail: "One advisory needs maintainer review before the next release.",
  },
];

export const dashboardMetrics = [
  { label: "Open issues", value: "42", delta: "+6 this week" },
  { label: "Pending PRs", value: "11", delta: "4 need review" },
  { label: "Upcoming releases", value: "2", delta: "next in 9 days" },
  { label: "Security alerts", value: "1", delta: "needs triage" },
];

export const mockChangelogEntries = [
  "Added maintainer task filters and searchable triage queues.",
  "Improved release readiness checklist for recurring launch steps.",
  "Updated repository health scoring with documentation and security signals.",
  "Fixed stale settings persistence when changing repository metadata.",
];

"use client";

import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ClipboardList,
  Code2,
  FileText,
  Filter,
  HeartPulse,
  LayoutDashboard,
  Pencil,
  Plus,
  Rocket,
  Search,
  Settings,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { useMemo, useState } from "react";

import {
  healthSignals,
  initialChecklist,
  initialSettings,
  initialTasks,
} from "@/data/mock";
import { useGitHubActivity, type GitHubActivity } from "@/hooks/useGitHubActivity";
import { useGitHubRepository, type GitHubRepository } from "@/hooks/useGitHubRepository";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { buildMockChangelog } from "@/lib/changelog";
import type {
  MaintainerTask,
  Priority,
  ReleaseChecklistItem,
  RepoSettings,
  TaskType,
} from "@/types";

const typeOptions: Array<{ value: TaskType; label: string }> = [
  { value: "issue", label: "Issue" },
  { value: "pr", label: "PR" },
  { value: "release", label: "Release" },
  { value: "security", label: "Security" },
  { value: "docs", label: "Docs" },
];

const priorityOptions: Array<{ value: Priority; label: string }> = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "release", label: "Release", icon: Rocket },
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type ActiveView = (typeof navItems)[number]["id"];

const emptyTask: Omit<MaintainerTask, "id" | "completed" | "createdAt"> = {
  title: "",
  description: "",
  type: "issue",
  priority: "medium",
};

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [tasks, setTasks] = useLocalStorage("osma:tasks", initialTasks);
  const [checklist, setChecklist] = useLocalStorage(
    "osma:release-checklist",
    initialChecklist,
  );
  const [settings, setSettings] = useLocalStorage(
    "osma:settings",
    initialSettings,
  );
  const [releaseVersion, setReleaseVersion] = useLocalStorage(
    "osma:release-version",
    "v0.2.0",
  );
  const [releaseNotes, setReleaseNotes] = useLocalStorage(
    "osma:release-notes",
    "",
  );
  const [taskDraft, setTaskDraft] = useState(emptyTask);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TaskType>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all");

  const {
    data: repository,
    loading: repositoryLoading,
    error: repositoryError,
  } = useGitHubRepository(settings.githubUrl);

  const {
    data: activity,
    loading: activityLoading,
    error: activityError,
  } = useGitHubActivity(settings.githubUrl);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const openTasks = tasks.length - completedTasks;
  const repoHealthScore = Math.round(
    healthSignals.reduce((total, signal) => total + signal.score, 0) /
      healthSignals.length,
  );

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesQuery =
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);
      const matchesType = typeFilter === "all" || task.type === typeFilter;
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesQuery && matchesType && matchesPriority;
    });
  }, [priorityFilter, searchTerm, tasks, typeFilter]);

  function resetTaskDraft() {
    setTaskDraft(emptyTask);
    setEditingTaskId(null);
  }

  function handleTaskSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = taskDraft.title.trim();

    if (!normalizedTitle) {
      return;
    }

    if (editingTaskId) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                ...taskDraft,
                title: normalizedTitle,
                description: taskDraft.description.trim(),
              }
            : task,
        ),
      );
      resetTaskDraft();
      return;
    }

    const newTask: MaintainerTask = {
      ...taskDraft,
      id: crypto.randomUUID(),
      title: normalizedTitle,
      description: taskDraft.description.trim(),
      completed: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    resetTaskDraft();
  }

  function editTask(task: MaintainerTask) {
    setTaskDraft({
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
    });
    setEditingTaskId(task.id);
  }

  function updateChecklistItem(
    id: string,
    updates: Partial<ReleaseChecklistItem>,
  ) {
    setChecklist((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  function addChecklistItem() {
    setChecklist((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        label: "New release step",
        completed: false,
      },
    ]);
  }

  function updateSettings<K extends keyof RepoSettings>(
    key: K,
    value: RepoSettings[K],
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value,
    }));
  }

  function generateChangelogDraft() {
    setReleaseNotes(buildMockChangelog(releaseVersion, settings.repoName));
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-5 py-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Code2 size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">
                OpenSource
              </p>
              <h1 className="text-lg font-bold leading-tight">
                Maintainer Assistant
              </h1>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`flex h-11 min-w-fit items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden px-5 pb-5 lg:block">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                GitHub-ready
              </p>
              <p className="mt-2 text-sm text-slate-700">
                LocalStorage today, API adapters tomorrow.
              </p>
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {settings.maintainerName}
                </p>
                <h2 className="text-2xl font-bold tracking-normal">
                  {settings.repoName}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={settings.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950"
                >
                  <Code2 size={17} aria-hidden="true" />
                  Repository
                </a>
                <button
                  type="button"
                  onClick={() => setActiveView("release")}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Rocket size={17} aria-hidden="true" />
                  Plan release
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {activeView === "dashboard" && (
              <DashboardView
                completedTasks={completedTasks}
                openTasks={openTasks}
                repoHealthScore={repoHealthScore}
                repository={repository}
                repositoryLoading={repositoryLoading}
                repositoryError={repositoryError}
                activity={activity}
                activityLoading={activityLoading}
                activityError={activityError}
              />
            )}

            {activeView === "tasks" && (
              <TasksView
                taskDraft={taskDraft}
                setTaskDraft={setTaskDraft}
                editingTaskId={editingTaskId}
                resetTaskDraft={resetTaskDraft}
                handleTaskSubmit={handleTaskSubmit}
                filteredTasks={filteredTasks}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                setTasks={setTasks}
                editTask={editTask}
              />
            )}

            {activeView === "release" && (
              <ReleasePlannerView
                releaseVersion={releaseVersion}
                setReleaseVersion={setReleaseVersion}
                releaseNotes={releaseNotes}
                setReleaseNotes={setReleaseNotes}
                checklist={checklist}
                updateChecklistItem={updateChecklistItem}
                addChecklistItem={addChecklistItem}
                setChecklist={setChecklist}
                generateChangelogDraft={generateChangelogDraft}
              />
            )}

            {activeView === "health" && (
              <RepoHealthView repoHealthScore={repoHealthScore} />
            )}

            {activeView === "settings" && (
              <SettingsView settings={settings} updateSettings={updateSettings} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardView({
  completedTasks,
  openTasks,
  repoHealthScore,
  repository,
  repositoryLoading,
  repositoryError,
  activity,
  activityLoading,
  activityError,
}: {
  completedTasks: number;
  openTasks: number;
  repoHealthScore: number;
  repository: GitHubRepository | null;
  repositoryLoading: boolean;
  repositoryError: string | null;
  activity: GitHubActivity | null;
  activityLoading: boolean;
  activityError: string | null;
}) {
  const icons = [Code2, ClipboardList, FileText, Bell];

  const updatedDate = repository
    ? new Date(repository.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "—";

  const liveMetrics = [
    {
      label: "Stars",
      value: repositoryLoading ? "..." : repository ? String(repository.stars) : "—",
      delta: repository?.fullName ?? repositoryError ?? "GitHub live data",
    },
    {
      label: "Forks",
      value: repositoryLoading ? "..." : repository ? String(repository.forks) : "—",
      delta: repository ? "GitHub live data" : repositoryError ?? "Loading repository",
    },
    {
      label: "Language",
      value: repositoryLoading ? "..." : repository?.language ?? "N/A",
      delta: repository
        ? `Branch: ${repository.defaultBranch}`
        : repositoryError ?? "Loading repository",
    },
    {
      label: "Updated",
      value: repositoryLoading ? "..." : updatedDate,
      delta: repository
        ? `${repository.visibility} repository`
        : repositoryError ?? "Loading repository",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {liveMetrics.map((metric, index) => {
          const Icon = icons[index];

          return (
            <article
              key={metric.label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {metric.label}
                </p>
                <Icon size={20} className="text-emerald-600" aria-hidden />
              </div>
              <p className="mt-4 text-3xl font-bold">{metric.value}</p>
              <p className="mt-1 text-sm text-slate-500">{metric.delta}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Maintenance pulse</h3>
              <p className="text-sm text-slate-500">
                {activityError
                  ? activityError
                  : "Live GitHub activity combined with local maintainer workflow."}
              </p>
            </div>
            <Bell size={20} className="text-amber-600" aria-hidden />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricStrip
              label="Open issues"
              value={activityLoading ? "..." : activity?.openIssues ?? "—"}
              tone="amber"
            />
            <MetricStrip
              label="Open PRs"
              value={activityLoading ? "..." : activity?.openPullRequests ?? "—"}
              tone="sky"
            />
            <MetricStrip label="Open tasks" value={openTasks} tone="amber" />
            <MetricStrip
              label="Completed tasks"
              value={completedTasks}
              tone="emerald"
            />
            <MetricStrip label="Health score" value={repoHealthScore} tone="sky" />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Next maintainer actions</h3>
          <div className="mt-4 space-y-3">
            {[
              "Review the high-priority security task.",
              "Confirm release checklist ownership.",
              "Move accepted fixes into the next changelog draft.",
            ].map((action) => (
              <div key={action} className="flex items-start gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 text-emerald-600"
                  aria-hidden
                />
                <p className="text-sm text-slate-700">{action}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function TasksView({
  taskDraft,
  setTaskDraft,
  editingTaskId,
  resetTaskDraft,
  handleTaskSubmit,
  filteredTasks,
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  priorityFilter,
  setPriorityFilter,
  setTasks,
  editTask,
}: {
  taskDraft: Omit<MaintainerTask, "id" | "completed" | "createdAt">;
  setTaskDraft: Dispatch<
    SetStateAction<Omit<MaintainerTask, "id" | "completed" | "createdAt">>
  >;
  editingTaskId: string | null;
  resetTaskDraft: () => void;
  handleTaskSubmit: (event: FormEvent<HTMLFormElement>) => void;
  filteredTasks: MaintainerTask[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: "all" | TaskType;
  setTypeFilter: (value: "all" | TaskType) => void;
  priorityFilter: "all" | Priority;
  setPriorityFilter: (value: "all" | Priority) => void;
  setTasks: Dispatch<SetStateAction<MaintainerTask[]>>;
  editTask: (task: MaintainerTask) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold">
          {editingTaskId ? "Edit task" : "Create task"}
        </h3>
        <form className="mt-5 space-y-4" onSubmit={handleTaskSubmit}>
          <Field label="Title">
            <input
              value={taskDraft.title}
              onChange={(event) =>
                setTaskDraft((draft) => ({
                  ...draft,
                  title: event.target.value,
                }))
              }
              className="input"
              placeholder="Review contributor PR"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={taskDraft.description}
              onChange={(event) =>
                setTaskDraft((draft) => ({
                  ...draft,
                  description: event.target.value,
                }))
              }
              className="input min-h-28 resize-y"
              placeholder="What needs attention before this can move forward?"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <select
                value={taskDraft.type}
                onChange={(event) =>
                  setTaskDraft((draft) => ({
                    ...draft,
                    type: event.target.value as TaskType,
                  }))
                }
                className="input"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select
                value={taskDraft.priority}
                onChange={(event) =>
                  setTaskDraft((draft) => ({
                    ...draft,
                    priority: event.target.value as Priority,
                  }))
                }
                className="input"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="button-primary">
              {editingTaskId ? (
                <Check size={17} aria-hidden />
              ) : (
                <Plus size={17} aria-hidden />
              )}
              {editingTaskId ? "Save task" : "Add task"}
            </button>
            {editingTaskId && (
              <button
                type="button"
                onClick={resetTaskDraft}
                className="button-secondary"
              >
                <X size={17} aria-hidden />
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold">Task queue</h3>
            <p className="text-sm text-slate-500">
              Search, filter, complete, edit, and remove maintainer work.
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px]">
            <label className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="input pl-10"
                placeholder="Search tasks"
              />
            </label>
            <label className="relative">
              <Filter
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as "all" | TaskType)
                }
                className="input pl-10"
              >
                <option value="all">All types</option>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value as "all" | Priority)
              }
              className="input"
            >
              <option value="all">All priorities</option>
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filteredTasks.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              No tasks match the current filters.
            </p>
          )}
          {filteredTasks.map((task) => (
            <article
              key={task.id}
              className={`rounded-lg border p-4 ${
                task.completed
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={badgeClass(task.priority)}>
                      {task.priority}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {task.type}
                    </span>
                    <span className="text-xs text-slate-500">
                      {task.createdAt}
                    </span>
                  </div>
                  <h4 className="mt-3 text-base font-semibold">{task.title}</h4>
                  {task.description && (
                    <p className="mt-1 text-sm text-slate-600">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <IconButton
                    label={task.completed ? "Reopen task" : "Complete task"}
                    onClick={() =>
                      setTasks((currentTasks) =>
                        currentTasks.map((currentTask) =>
                          currentTask.id === task.id
                            ? {
                                ...currentTask,
                                completed: !currentTask.completed,
                              }
                            : currentTask,
                        ),
                      )
                    }
                  >
                    <Check size={17} aria-hidden />
                  </IconButton>
                  <IconButton label="Edit task" onClick={() => editTask(task)}>
                    <Pencil size={17} aria-hidden />
                  </IconButton>
                  <IconButton
                    label="Delete task"
                    danger
                    onClick={() =>
                      setTasks((currentTasks) =>
                        currentTasks.filter(
                          (currentTask) => currentTask.id !== task.id,
                        ),
                      )
                    }
                  >
                    <Trash2 size={17} aria-hidden />
                  </IconButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReleasePlannerView({
  releaseVersion,
  setReleaseVersion,
  releaseNotes,
  setReleaseNotes,
  checklist,
  updateChecklistItem,
  addChecklistItem,
  setChecklist,
  generateChangelogDraft,
}: {
  releaseVersion: string;
  setReleaseVersion: Dispatch<SetStateAction<string>>;
  releaseNotes: string;
  setReleaseNotes: Dispatch<SetStateAction<string>>;
  checklist: ReleaseChecklistItem[];
  updateChecklistItem: (
    id: string,
    updates: Partial<ReleaseChecklistItem>,
  ) => void;
  addChecklistItem: () => void;
  setChecklist: Dispatch<SetStateAction<ReleaseChecklistItem[]>>;
  generateChangelogDraft: () => void;
}) {
  const doneCount = checklist.filter((item) => item.completed).length;
  const progress = checklist.length
    ? Math.round((doneCount / checklist.length) * 100)
    : 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Release checklist</h3>
            <p className="text-sm text-slate-500">
              {doneCount} of {checklist.length} items complete.
            </p>
          </div>
          <span className="text-2xl font-bold text-emerald-700">
            {progress}%
          </span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 space-y-3">
          {checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={(event) =>
                  updateChecklistItem(item.id, {
                    completed: event.target.checked,
                  })
                }
                className="size-5 rounded border-slate-300 accent-emerald-600"
                aria-label={`Toggle ${item.label}`}
              />
              <input
                value={item.label}
                onChange={(event) =>
                  updateChecklistItem(item.id, { label: event.target.value })
                }
                className="input h-10"
              />
              <IconButton
                label="Remove checklist item"
                danger
                onClick={() =>
                  setChecklist((items) =>
                    items.filter((currentItem) => currentItem.id !== item.id),
                  )
                }
              >
                <Trash2 size={17} aria-hidden />
              </IconButton>
            </div>
          ))}
        </div>

        <button type="button" onClick={addChecklistItem} className="mt-5 button-secondary">
          <Plus size={17} aria-hidden />
          Add item
        </button>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold">Release draft</h3>
        <div className="mt-5 space-y-4">
          <Field label="Version">
            <input
              value={releaseVersion}
              onChange={(event) => setReleaseVersion(event.target.value)}
              className="input"
              placeholder="v1.0.0"
            />
          </Field>
          <Field label="Release notes">
            <textarea
              value={releaseNotes}
              onChange={(event) => setReleaseNotes(event.target.value)}
              className="input min-h-80 resize-y font-mono text-sm"
              placeholder="Draft release notes or generate a mock changelog."
            />
          </Field>
          <button
            type="button"
            onClick={generateChangelogDraft}
            className="button-primary"
          >
            <FileText size={17} aria-hidden />
            Generate changelog draft
          </button>
        </div>
      </section>
    </div>
  );
}

function RepoHealthView({ repoHealthScore }: { repoHealthScore: number }) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Repository health</h3>
            <p className="text-sm text-slate-500">
              Visual score built from documentation, tests, dependencies, and security.
            </p>
          </div>
          <div className="flex size-36 items-center justify-center rounded-full border-[14px] border-emerald-600 bg-emerald-50">
            <span className="text-3xl font-bold text-emerald-800">
              {repoHealthScore}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {healthSignals.map((signal) => (
          <article
            key={signal.name}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold">{signal.name}</h4>
                <p className="mt-1 text-sm text-slate-500">{signal.detail}</p>
              </div>
              <span className={healthBadgeClass(signal.status)}>
                {signal.status}
              </span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={healthBarClass(signal.status)}
                style={{ width: `${signal.score}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-slate-600">
              {signal.score}/100
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function SettingsView({
  settings,
  updateSettings,
}: {
  settings: RepoSettings;
  updateSettings: <K extends keyof RepoSettings>(
    key: K,
    value: RepoSettings[K],
  ) => void;
}) {
  return (
    <section className="max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Settings</h3>
      <div className="mt-5 grid gap-4">
        <Field label="Repository name">
          <input
            value={settings.repoName}
            onChange={(event) => updateSettings("repoName", event.target.value)}
            className="input"
          />
        </Field>
        <Field label="GitHub URL">
          <input
            value={settings.githubUrl}
            onChange={(event) => updateSettings("githubUrl", event.target.value)}
            className="input"
          />
        </Field>
        <Field label="Maintainer name">
          <input
            value={settings.maintainerName}
            onChange={(event) =>
              updateSettings("maintainerName", event.target.value)
            }
            className="input"
          />
        </Field>
        <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
          <span>
            <span className="block text-sm font-semibold">Compact mode</span>
            <span className="block text-sm text-slate-500">
              Tighten spacing for busy maintainers.
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.compactMode}
            onChange={(event) =>
              updateSettings("compactMode", event.target.checked)
            }
            className="size-5 accent-emerald-600"
          />
        </label>
        <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
          <span>
            <span className="block text-sm font-semibold">Weekly digest</span>
            <span className="block text-sm text-slate-500">
              Prepare summary data for future GitHub API integration.
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.weeklyDigest}
            onChange={(event) =>
              updateSettings("weeklyDigest", event.target.checked)
            }
            className="size-5 accent-emerald-600"
          />
        </label>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function MetricStrip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "amber" | "emerald" | "sky";
}) {
  const toneClass = {
    amber: "bg-amber-50 text-amber-800",
    emerald: "bg-emerald-50 text-emerald-800",
    sky: "bg-sky-50 text-sky-800",
  }[tone];

  return (
    <div className={`rounded-lg p-4 ${toneClass}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function IconButton({
  label,
  danger,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex size-10 items-center justify-center rounded-lg border transition ${
        danger
          ? "border-red-200 text-red-700 hover:bg-red-50"
          : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function badgeClass(priority: Priority) {
  const classes = {
    high: "rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700",
    medium:
      "rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700",
    low: "rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700",
  };

  return classes[priority];
}

function healthBadgeClass(status: "good" | "warning" | "risk") {
  const classes = {
    good: "rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700",
    warning:
      "rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700",
    risk: "rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700",
  };

  return classes[status];
}

function healthBarClass(status: "good" | "warning" | "risk") {
  const classes = {
    good: "h-full rounded-full bg-emerald-600",
    warning: "h-full rounded-full bg-amber-500",
    risk: "h-full rounded-full bg-red-500",
  };

  return classes[status];
}

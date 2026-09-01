import { NextResponse } from "next/server";

const repoPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

type GitHubSearchItem = {
  number: number;
  title: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
  } | null;
};

type GitHubSearchResponse = {
  total_count: number;
  items: GitHubSearchItem[];
};

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function searchGitHub(query: string) {
  const url = new URL("https://api.github.com/search/issues");

  url.searchParams.set("q", query);
  url.searchParams.set("sort", "updated");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", "5");

  return fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: 60 },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo")?.trim();

  if (!repo || !repoPattern.test(repo)) {
    return NextResponse.json(
      { error: "Use a valid repository in owner/name format." },
      { status: 400 },
    );
  }

  try {
    const [issuesResponse, pullRequestsResponse] = await Promise.all([
      searchGitHub(`repo:${repo} is:issue is:open`),
      searchGitHub(`repo:${repo} is:pr is:open`),
    ]);

    if (issuesResponse.status === 422 || pullRequestsResponse.status === 422) {
      return NextResponse.json(
        { error: "Repository not found or unavailable." },
        { status: 404 },
      );
    }

    if (!issuesResponse.ok || !pullRequestsResponse.ok) {
      return NextResponse.json(
        {
          error: "GitHub API request failed.",
          issuesStatus: issuesResponse.status,
          pullRequestsStatus: pullRequestsResponse.status,
        },
        { status: 502 },
      );
    }

    const issuesData =
      (await issuesResponse.json()) as GitHubSearchResponse;

    const pullRequestsData =
      (await pullRequestsResponse.json()) as GitHubSearchResponse;

    return NextResponse.json({
      openIssues: issuesData.total_count,
      openPullRequests: pullRequestsData.total_count,

      issues: issuesData.items.map((issue) => ({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        author: issue.user?.login ?? "unknown",
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
      })),

      pullRequests: pullRequestsData.items.map((pullRequest) => ({
        number: pullRequest.number,
        title: pullRequest.title,
        url: pullRequest.html_url,
        author: pullRequest.user?.login ?? "unknown",
        createdAt: pullRequest.created_at,
        updatedAt: pullRequest.updated_at,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to communicate with GitHub." },
      { status: 502 },
    );
  }
}
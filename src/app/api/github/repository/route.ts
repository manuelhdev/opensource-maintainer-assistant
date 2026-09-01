import { NextResponse } from "next/server";

const repoPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo")?.trim();

  if (!repo || !repoPattern.test(repo)) {
    return NextResponse.json(
      {
        error: "Use a valid repository in owner/name format.",
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}`,
      {
        headers: githubHeaders(),
        next: { revalidate: 60 },
      },
    );

    if (response.status === 404) {
      return NextResponse.json(
        { error: "Repository not found." },
        { status: 404 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "GitHub API request failed.",
          status: response.status,
        },
        { status: 502 },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      url: data.html_url,
      owner: {
        login: data.owner.login,
        avatarUrl: data.owner.avatar_url,
      },
      stars: data.stargazers_count,
      forks: data.forks_count,
      openItems: data.open_issues_count,
      language: data.language,
      defaultBranch: data.default_branch,
      visibility: data.visibility,
      updatedAt: data.updated_at,
      pushedAt: data.pushed_at,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to communicate with GitHub." },
      { status: 502 },
    );
  }
}
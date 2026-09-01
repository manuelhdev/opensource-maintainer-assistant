"use client";

import { useEffect, useMemo, useState } from "react";

export type GitHubActivityItem = {
  number: number;
  title: string;
  url: string;
  author: string;
  createdAt: string;
  updatedAt: string;
};

export type GitHubActivity = {
  openIssues: number;
  openPullRequests: number;
  issues: GitHubActivityItem[];
  pullRequests: GitHubActivityItem[];
};

function extractRepository(input: string) {
  const value = input.trim();

  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
      return null;
    }

    const [owner, repository] = url.pathname
      .split("/")
      .filter(Boolean);

    if (!owner || !repository) {
      return null;
    }

    return `${owner}/${repository.replace(/\.git$/, "")}`;
  } catch {
    return null;
  }
}

export function useGitHubActivity(input: string) {
  const repositoryName = useMemo(
    () => extractRepository(input),
    [input],
  );

  const [data, setData] = useState<GitHubActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repositoryName) {
      setData(null);
      setLoading(false);
      setError("Enter a valid GitHub repository URL.");
      return;
    }

    const controller = new AbortController();

    async function loadActivity() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/github/activity?repo=${encodeURIComponent(repositoryName!)}`,
          {
            signal: controller.signal,
          },
        );

        const body = await response.json();

        if (!response.ok) {
          throw new Error(
            body.error || "Unable to load GitHub activity.",
          );
        }

        setData(body as GitHubActivity);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        setData(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load GitHub activity.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadActivity();

    return () => controller.abort();
  }, [repositoryName]);

  return {
    data,
    loading,
    error,
  };
}
"use client";

import { useEffect, useMemo, useState } from "react";

export type GitHubRepository = {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  stars: number;
  forks: number;
  openItems: number;
  language: string | null;
  defaultBranch: string;
  visibility: string;
  updatedAt: string;
  pushedAt: string;
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

export function useGitHubRepository(input: string) {
  const repositoryName = useMemo(
    () => extractRepository(input),
    [input],
  );

  const [data, setData] = useState<GitHubRepository | null>(null);
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

    async function loadRepository() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/github/repository?repo=${encodeURIComponent(repositoryName!)}`,
          {
            signal: controller.signal,
          },
        );

        const body = await response.json();

        if (!response.ok) {
          throw new Error(
            body.error || "Unable to load repository information.",
          );
        }

        setData(body as GitHubRepository);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        setData(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load repository information.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRepository();

    return () => controller.abort();
  }, [repositoryName]);

  return {
    repositoryName,
    data,
    loading,
    error,
  };
}
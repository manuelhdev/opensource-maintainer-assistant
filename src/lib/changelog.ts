import { mockChangelogEntries } from "@/data/mock";

export function buildMockChangelog(version: string, repoName: string) {
  const releaseVersion = version.trim() || "next";

  return [
    `## ${repoName} ${releaseVersion}`,
    "",
    "### Highlights",
    ...mockChangelogEntries.map((entry) => `- ${entry}`),
    "",
    "### Maintainer notes",
    "- Review open security alerts before publishing.",
    "- Confirm all release checklist items are complete.",
  ].join("\n");
}

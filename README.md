# OpenSource Maintainer Assistant

A local-first web app for open source maintainers who need one practical place to organize repository maintenance, task triage, release planning, and health checks.

The first version uses mock data and LocalStorage so it is easy to demo, fork, and publish. The codebase is structured so a GitHub API integration can be added later without rewriting the app.

## Features

- Dashboard with simulated maintenance metrics
- Task manager with create, edit, complete, delete, search, type filters, and priority filters
- Release planner with editable checklist, version field, release notes, and mock changelog generation
- Repo health view for documentation, tests, dependencies, security, and visual score
- Settings for repository name, GitHub URL, maintainer name, and preferences
- Responsive Next.js App Router UI
- LocalStorage persistence with mock seed data

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Lucide React icons
- LocalStorage persistence

shadcn/ui is not configured in this initial scaffold, so the app uses local Tailwind component classes that can be replaced with shadcn/ui later if desired.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project Structure

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  data/
    mock.ts
  hooks/
    useLocalStorage.ts
  lib/
    changelog.ts
  types/
    index.ts
```

## Future GitHub API Integration

The app is prepared for a future integration layer:

- `src/data/mock.ts` contains seed data that can later be replaced by GitHub API responses.
- `src/types/index.ts` defines the core domain models.
- `src/hooks/useLocalStorage.ts` isolates initial persistence.
- `src/lib/changelog.ts` keeps generation logic outside the UI.

A future implementation can add `src/services/github/` with API clients, mappers, and authentication boundaries while keeping the UI modules mostly intact.

## License

MIT

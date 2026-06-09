# Contributing

Thanks for helping improve OpenSource Maintainer Assistant.

## Development setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the local app:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000`.

## Before opening a pull request

- Keep changes focused and easy to review.
- Run `npm run lint`.
- Run `npm run build` when changing app structure, data models, or rendering logic.
- Update documentation when behavior or setup changes.

## Project direction

The app is intentionally local-first for now. Contributions should preserve a clean path toward future GitHub API integration by keeping persistence, mock data, and UI concerns separated.

Useful areas for contribution:

- GitHub API adapter interfaces
- Import/export for LocalStorage data
- Test coverage for task and release workflows
- Accessibility and keyboard navigation improvements
- Additional repository health signals

## Code style

- Use TypeScript for app code.
- Prefer small, typed modules over large utility files.
- Keep UI responsive and practical for maintainers who scan lots of repository state.
- Avoid adding backend infrastructure until the project explicitly introduces an API layer.

# frontend-perf-budget-ci

A deterministic TypeScript toolkit for frontend performance budget enforcement in CI.

It ingests Lighthouse + bundle artifacts, compares current metrics against baseline thresholds, and produces:
- concise PR-ready markdown reports,
- a deterministic dashboard HTML render for demo and snapshot testing,
- predictable webhook parsing for GitHub App flows.

## Why this project

Most budget checks fail at communication, not math. This project focuses on actionable output: clear pass/fail status, explicit deltas, and immediate remediation hints that engineers can use in review.

## Requirements

- Node.js 22+
- npm 10+

## Quick start

```bash
npm install
npm run lint
npm test
```

## Scripts

- `npm run dev` — run the app in watch mode via `tsx`
- `npm run build` — compile TypeScript to `dist/`
- `npm run start` — run compiled output from `dist/index.js`
- `npm run lint` — run ESLint (flat config)
- `npm run typecheck` — strict TypeScript check without emitting files
- `npm test` — run unit tests with Node's built-in test runner
- `npm run test:watch` — watch mode for unit tests

## Demo walkthrough (5 minutes)

Use this flow in portfolio demos to show end-to-end value quickly.

1. **Show deterministic budget comparison output**
   - Open `tests/format.test.ts` and highlight PASS + FAIL cases.
   - Point out fixed ordering and stable markdown formatting for CI comments.

2. **Show dashboard rendering quality**
   - Open `tests/dashboard.test.ts`.
   - Emphasize deterministic rendering, empty/loading states, and mobile breakpoint support.

3. **Show artifact ingestion reliability**
   - Open `src/ingest.ts`.
   - Highlight strict validation and explicit `ArtifactParseError` codes.

4. **Run validation live**
   ```bash
   npm run lint
   ```

5. **Close with portfolio narrative**
   - Problem solved: noisy perf checks.
   - Approach: deterministic comparison + concise reporting.
   - Outcome: CI comments and dashboards engineers trust.

## Project layout

- `src/ingest.ts` — parse and validate Lighthouse + bundle artifacts
- `src/compare.ts` — threshold comparison engine and pass/fail computation
- `src/format.ts` — deterministic markdown report formatter for PR comments
- `src/dashboard.ts` — deterministic dashboard HTML renderer (ready/loading/empty)
- `src/github-app.ts` — GitHub webhook event parsing and normalization
- `tests/` — deterministic unit tests for core behavior
- `.github/workflows/ci.yml` — lint/typecheck/test pipeline

## CI

GitHub Actions workflow runs on push and pull requests:
1. Install dependencies (`npm ci`)
2. Lint (`npm run lint`)
3. Typecheck (`npm run typecheck`)
4. Test (`npm test`)

## Additional demo notes

See `docs/demo-walkthrough.md` for a presenter-friendly script and talking points.

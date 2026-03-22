# frontend-perf-budget-ci

Bootstrap scaffold for a TypeScript Node service that will evolve into frontend performance budget automation (GitHub App + dashboard).

## Requirements

- Node.js 22+
- npm 10+

## Setup

```bash
npm install
```

## Scripts

- `npm run dev` - run the app in watch mode via `tsx`
- `npm run build` - compile TypeScript to `dist/`
- `npm run start` - run compiled output from `dist/index.js`
- `npm run lint` - run ESLint (flat config)
- `npm run typecheck` - strict TypeScript check without emitting files
- `npm test` - run unit tests with Node's built-in test runner
- `npm run test:watch` - watch mode for unit tests

## Project layout

- `src/index.ts` - minimal app entry point
- `src/types.ts` - core domain types placeholder
- `src/utils.ts` - reusable utility helpers
- `tests/` - unit tests
- `.github/workflows/ci.yml` - lint/typecheck/test pipeline

## CI

GitHub Actions workflow runs on push and pull requests:
1. Install dependencies (`npm ci`)
2. Lint (`npm run lint`)
3. Typecheck (`npm run typecheck`)
4. Test (`npm test`)

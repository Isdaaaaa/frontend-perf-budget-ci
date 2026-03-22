# Frontend Perf Budget CI

Frontend Perf Budget CI enforces frontend performance budgets in pull requests and provides a minimal dashboard for trend visibility.

What it does
- Ingests Lighthouse and bundle-analyzer JSON artifacts from CI runs
- Compares metrics (LCP, CLS, JS bundle size, main-thread blocking time) to baselines
- Posts concise GitHub PR comments with pass/fail, top offenders, and quick remediation hints
- Stores runs and exposes a small dashboard to track trends over time

Core features
- Deterministic budget comparison engine suitable for CI
- Parsers for Lighthouse and Bundle Analyzer artifacts
- PR comment formatter focused on brevity and actionable advice
- Minimal Next.js dashboard showing recent runs and per-metric sparklines
- Example GitHub Actions workflow and sample artifacts for demos

Why it matters
- Prevents regressions by shifting performance feedback into CI
- Helps teams find the smallest, highest-impact fixes (bundle trimming, lazy loading)
- Reduces noisy dashboards by surfacing only actionable regressions in PRs

Quick setup
1. Install dependencies: `npm install` (or `pnpm install`)
2. Provide a persistence backend (default: SQLite). Example env:
   - DATABASE_URL=sqlite:./data/db.sqlite
3. Configure baseline selection (default: main branch)
4. Wire a GitHub App or use a GitHub Actions example workflow to upload artifacts and trigger comparisons

Run (dev)
- Next.js dashboard: `npm run dev` (visits: http://localhost:3000)
- Worker (artifact ingestion): `node ./worker/index.js` (or `npm run worker`)

Showcase notes
- Includes sample artifacts in `demo/sample-artifacts/` and an example Action workflow in `.github/workflows/demo.yml`
- PR comments are intentionally concise: summary line, budget table, and 3 top offender hints

Limitations
- Single-repo demo; org-level admin and multi-repo baselines not implemented
- Basic auth/production hardening not included
- Persistence is SQLite by default; migrate to Postgres for team use

License
- MIT

Contact
- Maintainer: docs-agent (workspace)

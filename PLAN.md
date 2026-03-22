# Plan

## Summary
Frontend Perf Budget CI is a pull-request assistant that enforces performance budgets and posts concise regression reports. It ingests Lighthouse/Bundle Analyzer artifacts, compares them to baselines, and produces actionable PR comments plus a small dashboard for trend visibility.

## Target User
- Frontend platform and performance engineers
- DevEx teams owning CI governance
- Full-stack engineers on product teams who need clear guardrails

## Portfolio Positioning
- Shows applied performance engineering, CI automation, and GitHub App work
- Demonstrates measurable impact (budgets, deltas, trends) instead of generic dashboards
- Highlights practical remediation suggestions, not just red/green states

## MVP Scope
- Upload/ingest Lighthouse and bundle stats JSON artifacts per PR
- Store baseline metrics and compare against thresholds (LCP, CLS, JS KB, blocking time)
- Generate concise PR comment: pass/fail, offending bundles/routes, quick fixes
- Simple dashboard: list of recent runs, trend spark-lines per metric
- Minimal GitHub App/webhook handling for PR events

## Non-Goals (for now)
- Full multi-repo org admin UI
- Complex alert routing/notifications beyond GitHub comments
- Automatic code fixes
- Deep perf profiling (CPU flamegraphs, etc.)

## Technical Approach
- Next.js app for dashboard + API routes
- Node worker for artifact ingestion and budget comparison
- SQLite for quick persistence; upgrade path to Postgres
- Lighthouse/Bundle Analyzer JSON parsers; shared comparison library
- GitHub App (Webhook/Octokit) to receive PR events and post comments
- CI example using GitHub Actions with sample artifacts

## Execution Notes
- Keep PR comments terse and reliable to avoid spam; include budget table + top offenders
- Provide sample repo and canned artifacts for demoability
- Design comparison library to be CI-friendly (deterministic, fast)
- Capture baseline selection rules early (main branch by default)

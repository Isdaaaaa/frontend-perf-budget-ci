# Demo Walkthrough

This script is optimized for a 5-minute portfolio demo and keeps the narrative deterministic.

## 1) Problem framing (30s)
Teams often fail perf budgets in noisy ways: unclear thresholds, unstable reports, and hard-to-triage regressions.

## 2) Deterministic diff output (90s)
Run: `npm test -- --test-name-pattern=format`

## 3) Dashboard rendering quality (90s)
Open `tests/dashboard.test.ts` and highlight deterministic rendering plus loading/empty/mobile states.

## 4) Artifact ingestion reliability (60s)
Open `src/ingest.ts` and highlight strict validation and explicit parse error codes.

## 5) Confidence check (30s)
Run: `npm run lint`

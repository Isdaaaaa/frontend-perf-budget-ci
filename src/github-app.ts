import { compareAgainstBudget } from './compare.js';
import { formatBudgetPrComment } from './format.js';
import { ingestBaselineFromStrings } from './ingest.js';
import type { GithubWebhookResult, NormalizedMetrics } from './types.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const parseMetrics = (value: unknown): NormalizedMetrics | null => {
  if (!isRecord(value)) {
    return null;
  }

  const lcp = asNumber(value.lcp);
  const cls = asNumber(value.cls);
  const js_kb = asNumber(value.js_kb);
  const tbt = asNumber(value.tbt);

  if (lcp === null || cls === null || js_kb === null || tbt === null) {
    return null;
  }

  return { lcp, cls, js_kb, tbt };
};

const isPullRequestAction = (action: unknown): action is 'opened' | 'reopened' | 'synchronize' =>
  action === 'opened' || action === 'reopened' || action === 'synchronize';

export const handleGithubWebhook = (eventName: string, payload: unknown): GithubWebhookResult => {
  if (!isRecord(payload)) {
    return { type: 'ignored', reason: 'invalid_payload' };
  }

  if (eventName === 'pull_request') {
    if (!isPullRequestAction(payload.action)) {
      return { type: 'ignored', reason: 'unsupported_pr_action' };
    }

    const pullRequest = payload.pull_request;
    if (!isRecord(pullRequest) || typeof pullRequest.number !== 'number') {
      return { type: 'ignored', reason: 'missing_pull_request' };
    }

    return {
      type: 'pr_event',
      action: payload.action,
      prNumber: pullRequest.number
    };
  }

  if (eventName === 'workflow_run') {
    if (payload.action !== 'completed') {
      return { type: 'ignored', reason: 'unsupported_workflow_action' };
    }

    const artifacts = payload.artifacts;
    if (!isRecord(artifacts)) {
      return { type: 'ignored', reason: 'missing_artifacts' };
    }

    const lighthouseJson = artifacts.lighthouseJson;
    const bundleStatsJson = artifacts.bundleStatsJson;

    if (typeof lighthouseJson !== 'string' || typeof bundleStatsJson !== 'string') {
      return { type: 'ignored', reason: 'missing_artifact_payloads' };
    }

    const current = ingestBaselineFromStrings({ lighthouseJson, bundleStatsJson });

    const baseline = parseMetrics(payload.baseline);
    if (baseline === null) {
      return {
        type: 'artifact_ingested',
        metrics: current
      };
    }

    const comparison = compareAgainstBudget(baseline, current);

    return {
      type: 'report_generated',
      metrics: current,
      markdown: formatBudgetPrComment(comparison)
    };
  }

  return { type: 'ignored', reason: 'unsupported_event' };
};

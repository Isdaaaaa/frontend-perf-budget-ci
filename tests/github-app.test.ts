import assert from 'node:assert/strict';
import test from 'node:test';

import { handleGithubWebhook } from '../src/github-app.js';

const lighthouseJson = JSON.stringify({
  audits: {
    'largest-contentful-paint': { numericValue: 1900 },
    'cumulative-layout-shift': { numericValue: 0.09 },
    'total-blocking-time': { numericValue: 140 }
  }
});

const bundleStatsJson = JSON.stringify({
  totalJSBytes: 204800
});

test('handleGithubWebhook maps pull_request opened to pr_event', () => {
  const result = handleGithubWebhook('pull_request', {
    action: 'opened',
    pull_request: { number: 42 }
  });

  assert.deepEqual(result, {
    type: 'pr_event',
    action: 'opened',
    prNumber: 42
  });
});

test('handleGithubWebhook ingests workflow artifacts deterministically', () => {
  const result = handleGithubWebhook('workflow_run', {
    action: 'completed',
    artifacts: {
      lighthouseJson,
      bundleStatsJson
    }
  });

  assert.equal(result.type, 'artifact_ingested');
  if (result.type !== 'artifact_ingested') {
    return;
  }

  assert.deepEqual(result.metrics, {
    lcp: 1900,
    cls: 0.09,
    js_kb: 200,
    tbt: 140
  });
});

test('handleGithubWebhook generates markdown when baseline is provided', () => {
  const result = handleGithubWebhook('workflow_run', {
    action: 'completed',
    artifacts: {
      lighthouseJson,
      bundleStatsJson
    },
    baseline: {
      lcp: 1800,
      cls: 0.08,
      js_kb: 180,
      tbt: 100
    }
  });

  assert.equal(result.type, 'report_generated');
  if (result.type !== 'report_generated') {
    return;
  }

  assert.match(result.markdown, /Performance Budget Report — ❌ FAIL/);
  assert.match(result.markdown, /`lcp` \(fail\)/);
});

test('handleGithubWebhook ignores unsupported PR actions', () => {
  const result = handleGithubWebhook('pull_request', {
    action: 'closed',
    pull_request: { number: 99 }
  });

  assert.deepEqual(result, {
    type: 'ignored',
    reason: 'unsupported_pr_action'
  });
});

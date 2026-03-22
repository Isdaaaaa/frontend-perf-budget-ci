import assert from 'node:assert/strict';
import test from 'node:test';

import { compareAgainstBudget } from '../src/compare.js';
import type { NormalizedMetrics } from '../src/types.js';

const baseline: NormalizedMetrics = {
  lcp: 1800,
  cls: 0.08,
  js_kb: 150,
  tbt: 100
};

test('compareAgainstBudget passes when all current metrics are <= baseline by default', () => {
  const result = compareAgainstBudget(baseline, {
    lcp: 1700,
    cls: 0.07,
    js_kb: 130,
    tbt: 80
  });

  assert.equal(result.pass, true);
  assert.deepEqual(result.failedMetrics, []);
  assert.deepEqual(result.missingMetrics, []);
  assert.equal(result.metrics.lcp.status, 'pass');
  assert.equal(result.metrics.lcp.delta, -100);
});

test('compareAgainstBudget fails when one metric regresses over threshold', () => {
  const result = compareAgainstBudget(
    baseline,
    {
      lcp: 1815,
      cls: 0.08,
      js_kb: 150,
      tbt: 100
    },
    { lcp: 10 }
  );

  assert.equal(result.pass, false);
  assert.deepEqual(result.failedMetrics, ['lcp']);
  assert.equal(result.metrics.lcp.status, 'fail');
  assert.equal(result.metrics.lcp.delta, 15);
  assert.equal(result.metrics.lcp.threshold, 10);
});

test('compareAgainstBudget treats equality with threshold as pass', () => {
  const result = compareAgainstBudget(
    baseline,
    {
      lcp: 1810,
      cls: 0.08,
      js_kb: 150,
      tbt: 100
    },
    { lcp: 10 }
  );

  assert.equal(result.pass, true);
  assert.equal(result.metrics.lcp.status, 'pass');
  assert.equal(result.metrics.lcp.delta, 10);
});

test('compareAgainstBudget marks missing metrics and fails overall', () => {
  const result = compareAgainstBudget(baseline, {
    lcp: 1790,
    cls: 0.07,
    tbt: 90
  });

  assert.equal(result.pass, false);
  assert.deepEqual(result.failedMetrics, []);
  assert.deepEqual(result.missingMetrics, ['js_kb']);
  assert.equal(result.metrics.js_kb.status, 'missing');
  assert.equal(result.metrics.js_kb.current, null);
  assert.equal(result.metrics.js_kb.delta, null);
});

test('compareAgainstBudget rounds delta deterministically', () => {
  const result = compareAgainstBudget(baseline, {
    lcp: 1800,
    cls: 0.08006,
    js_kb: 150,
    tbt: 100
  });

  assert.equal(result.metrics.cls.delta, 0.0001);
});

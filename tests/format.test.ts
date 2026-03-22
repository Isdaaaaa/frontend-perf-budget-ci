import assert from 'node:assert/strict';
import test from 'node:test';

import { compareAgainstBudget } from '../src/compare.js';
import { formatBudgetPrComment } from '../src/format.js';
import type { NormalizedMetrics } from '../src/types.js';

const baseline: NormalizedMetrics = {
  lcp: 1800,
  cls: 0.08,
  js_kb: 150,
  tbt: 100
};

test('formatBudgetPrComment renders deterministic PASS report', () => {
  const result = compareAgainstBudget(
    baseline,
    {
      lcp: 1805,
      cls: 0.0801,
      js_kb: 150,
      tbt: 100
    },
    {
      lcp: 10,
      cls: 0.001,
      js_kb: 5,
      tbt: 5
    }
  );

  const markdown = formatBudgetPrComment(result);

  assert.equal(
    markdown,
    [
      '## Performance Budget Report — ✅ PASS',
      'Summary: 4 passing, 0 failing, 0 missing (total 4).',
      '',
      '### Metrics',
      '- ✅ `lcp` (pass) | baseline 1800 | current 1805 | delta +5 | threshold +10',
      '- ✅ `cls` (pass) | baseline 0.08 | current 0.0801 | delta +0.0001 | threshold +0.001',
      '- ✅ `js_kb` (pass) | baseline 150 | current 150 | delta 0 | threshold +5',
      '- ✅ `tbt` (pass) | baseline 100 | current 100 | delta 0 | threshold +5'
    ].join('\n')
  );
});

test('formatBudgetPrComment renders FAIL + missing with actionable hints', () => {
  const result = compareAgainstBudget(
    baseline,
    {
      lcp: 1850,
      cls: 0.08,
      tbt: 120
    },
    {
      lcp: 20,
      cls: 0.01,
      js_kb: 5,
      tbt: 10
    }
  );

  const markdown = formatBudgetPrComment(result);

  assert.equal(
    markdown,
    [
      '## Performance Budget Report — ❌ FAIL',
      'Summary: 1 passing, 2 failing, 1 missing (total 4).',
      '',
      '### Metrics',
      '- ❌ `lcp` (fail) | baseline 1800 | current 1850 | delta +50 | threshold +20',
      '  - Likely blame: hero image, slow server response, or render-blocking CSS. Hint: optimize hero image, improve server response, and reduce render-blocking CSS.',
      '- ✅ `cls` (pass) | baseline 0.08 | current 0.08 | delta 0 | threshold +0.01',
      '- ⚪ `js_kb` (missing) | baseline 150 | current n/a | delta n/a | threshold +5',
      '- ❌ `tbt` (fail) | baseline 100 | current 120 | delta +20 | threshold +10',
      '  - Likely blame: main-thread long tasks and third-party scripts. Hint: reduce long tasks, split code, and defer third-party scripts.'
    ].join('\n')
  );
});

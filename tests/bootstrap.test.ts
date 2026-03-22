import test from 'node:test';
import assert from 'node:assert/strict';

import { start } from '../src/index.js';

test('bootstrap start exposes default config summary', () => {
  const summary = start();

  assert.match(summary, /frontend-perf-budget-ci/);
  assert.match(summary, /default budgets/);
});

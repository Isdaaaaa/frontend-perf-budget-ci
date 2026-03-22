import assert from 'node:assert/strict';
import test from 'node:test';

import { getHealthStatus, makeAppConfig } from '../src/utils.js';

test('makeAppConfig falls back to development', () => {
  const config = makeAppConfig('staging');
  assert.equal(config.env, 'development');
});

test('getHealthStatus returns healthy payload', () => {
  const health = getHealthStatus();
  assert.equal(health.ok, true);
  assert.match(health.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

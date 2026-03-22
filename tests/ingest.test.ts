import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  ArtifactParseError,
  ingestBaselineFromFiles,
  ingestBaselineFromStrings,
  parseBundleMetrics,
  parseLighthouseMetrics
} from '../src/ingest.js';

const validLighthouseJson = JSON.stringify({
  audits: {
    'largest-contentful-paint': { numericValue: 1800.125 },
    'cumulative-layout-shift': { numericValue: 0.084321 },
    'total-blocking-time': { numericValue: 95.2 }
  }
});

const validBundleJson = JSON.stringify({
  assets: [
    { name: 'main.js', size: 102400 },
    { name: 'vendor.mjs', size: 51200 },
    { name: 'styles.css', size: 2048 }
  ]
});

test('parseLighthouseMetrics extracts lcp/cls/tbt', () => {
  const result = parseLighthouseMetrics(validLighthouseJson);

  assert.deepEqual(result, {
    lcp: 1800.13,
    cls: 0.0843,
    tbt: 95.2
  });
});

test('parseBundleMetrics extracts js_kb from JS assets', () => {
  const result = parseBundleMetrics(validBundleJson);

  assert.deepEqual(result, {
    js_kb: 150
  });
});

test('ingestBaselineFromStrings returns normalized baseline metrics', () => {
  const baseline = ingestBaselineFromStrings({
    lighthouseJson: validLighthouseJson,
    bundleStatsJson: validBundleJson
  });

  assert.deepEqual(baseline, {
    lcp: 1800.13,
    cls: 0.0843,
    js_kb: 150,
    tbt: 95.2
  });
});

test('ingestBaselineFromFiles reads files and normalizes metrics', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'artifact-ingest-'));
  const lighthousePath = join(dir, 'lh.json');
  const bundlePath = join(dir, 'bundle.json');

  await writeFile(lighthousePath, validLighthouseJson, 'utf8');
  await writeFile(bundlePath, validBundleJson, 'utf8');

  const baseline = await ingestBaselineFromFiles({
    lighthousePath,
    bundleStatsPath: bundlePath
  });

  assert.equal(baseline.js_kb, 150);
  assert.equal(baseline.lcp, 1800.13);
  assert.equal(baseline.cls, 0.0843);
  assert.equal(baseline.tbt, 95.2);
});

test('parseLighthouseMetrics throws on malformed JSON', () => {
  assert.throws(
    () => parseLighthouseMetrics('{bad json'),
    (error: unknown) =>
      error instanceof ArtifactParseError &&
      error.code === 'INVALID_JSON' &&
      /invalid JSON/.test(error.message)
  );
});

test('parseLighthouseMetrics throws when required audit is missing', () => {
  const missingField = JSON.stringify({
    audits: {
      'largest-contentful-paint': { numericValue: 1800 },
      'total-blocking-time': { numericValue: 100 }
    }
  });

  assert.throws(
    () => parseLighthouseMetrics(missingField),
    (error: unknown) =>
      error instanceof ArtifactParseError &&
      error.code === 'MISSING_FIELD' &&
      /cumulative-layout-shift/.test(error.message)
  );
});

test('parseBundleMetrics throws when no supported JS size fields exist', () => {
  const invalidBundle = JSON.stringify({ assets: [{ name: 'styles.css', size: 1000 }] });

  assert.throws(
    () => parseBundleMetrics(invalidBundle),
    (error: unknown) =>
      error instanceof ArtifactParseError &&
      error.code === 'MISSING_FIELD' &&
      /expected totalJSBytes/.test(error.message)
  );
});

test('parseBundleMetrics throws when JS asset size type is invalid', () => {
  const invalidBundle = JSON.stringify({
    assets: [{ name: 'app.js', size: '1024' }]
  });

  assert.throws(
    () => parseBundleMetrics(invalidBundle),
    (error: unknown) =>
      error instanceof ArtifactParseError &&
      error.code === 'INVALID_FIELD_TYPE' &&
      /assets\[\]\.size/.test(error.message)
  );
});

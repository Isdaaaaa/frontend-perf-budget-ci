import { readFile } from 'node:fs/promises';

import type {
  ArtifactErrorCode,
  BaselineArtifactFileInput,
  BaselineArtifactInput,
  BaselineMetrics,
  BundleMetrics,
  LighthouseMetrics
} from './types.js';

export class ArtifactParseError extends Error {
  public readonly code: ArtifactErrorCode;

  public constructor(code: ArtifactErrorCode, message: string) {
    super(message);
    this.name = 'ArtifactParseError';
    this.code = code;
  }
}

const round = (value: number, decimals: number): number => {
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseJsonObject = (raw: string, label: string): Record<string, unknown> => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ArtifactParseError('INVALID_JSON', `${label}: invalid JSON payload`);
  }

  if (!isRecord(parsed)) {
    throw new ArtifactParseError('INVALID_ROOT', `${label}: root value must be an object`);
  }

  return parsed;
};

const getAuditNumericValue = (
  audits: Record<string, unknown>,
  id: string,
  label: string
): number => {
  const audit = audits[id];

  if (!isRecord(audit)) {
    throw new ArtifactParseError('MISSING_FIELD', `${label}: missing audits.${id}`);
  }

  const numericValue = audit.numericValue;

  if (typeof numericValue !== 'number') {
    throw new ArtifactParseError(
      'INVALID_FIELD_TYPE',
      `${label}: audits.${id}.numericValue must be a number`
    );
  }

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw new ArtifactParseError(
      'INVALID_FIELD_VALUE',
      `${label}: audits.${id}.numericValue must be a finite, non-negative number`
    );
  }

  return numericValue;
};

export const parseLighthouseMetrics = (rawJson: string): LighthouseMetrics => {
  const root = parseJsonObject(rawJson, 'lighthouse');
  const audits = root.audits;

  if (!isRecord(audits)) {
    throw new ArtifactParseError('MISSING_FIELD', 'lighthouse: missing audits object');
  }

  return {
    lcp: round(getAuditNumericValue(audits, 'largest-contentful-paint', 'lighthouse'), 2),
    cls: round(getAuditNumericValue(audits, 'cumulative-layout-shift', 'lighthouse'), 4),
    tbt: round(getAuditNumericValue(audits, 'total-blocking-time', 'lighthouse'), 2)
  };
};

const getFiniteNonNegativeNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return value;
};

const pickBundleJsBytes = (bundle: Record<string, unknown>): number => {
  const directBytes = getFiniteNonNegativeNumber(bundle.totalJSBytes);
  if (directBytes !== null) {
    return directBytes;
  }

  const totalBytes = getFiniteNonNegativeNumber(bundle.totalBytes);
  if (totalBytes !== null) {
    return totalBytes;
  }

  const assets = bundle.assets;
  if (Array.isArray(assets)) {
    const jsBytes = (assets as unknown[]).reduce<number>((sum, asset) => {
      if (!isRecord(asset)) {
        return sum;
      }

      const name = asset.name;
      const size = asset.size;
      const isJsAsset = typeof name === 'string' && /\.m?js($|\?)/.test(name);

      if (!isJsAsset) {
        return sum;
      }

      const jsSize = getFiniteNonNegativeNumber(size);
      if (jsSize === null) {
        throw new ArtifactParseError(
          'INVALID_FIELD_TYPE',
          'bundle-stats: assets[].size must be a finite, non-negative number for JS assets'
        );
      }

      return sum + jsSize;
    }, 0);

    if (jsBytes > 0) {
      return jsBytes;
    }
  }

  throw new ArtifactParseError(
    'MISSING_FIELD',
    'bundle-stats: expected totalJSBytes, totalBytes, or JS assets[].size values'
  );
};

export const parseBundleMetrics = (rawJson: string): BundleMetrics => {
  const root = parseJsonObject(rawJson, 'bundle-stats');
  const jsBytes = pickBundleJsBytes(root);

  if (!Number.isFinite(jsBytes) || jsBytes < 0) {
    throw new ArtifactParseError(
      'INVALID_FIELD_VALUE',
      'bundle-stats: JS byte total must be a finite, non-negative number'
    );
  }

  return {
    js_kb: round(jsBytes / 1024, 2)
  };
};

export const ingestBaselineFromStrings = (input: BaselineArtifactInput): BaselineMetrics => {
  const lighthouse = parseLighthouseMetrics(input.lighthouseJson);
  const bundle = parseBundleMetrics(input.bundleStatsJson);

  return {
    lcp: lighthouse.lcp,
    cls: lighthouse.cls,
    js_kb: bundle.js_kb,
    tbt: lighthouse.tbt
  };
};

export const ingestBaselineFromFiles = async (
  input: BaselineArtifactFileInput
): Promise<BaselineMetrics> => {
  const [lighthouseJson, bundleStatsJson] = await Promise.all([
    readFile(input.lighthousePath, 'utf8'),
    readFile(input.bundleStatsPath, 'utf8')
  ]);

  return ingestBaselineFromStrings({
    lighthouseJson,
    bundleStatsJson
  });
};

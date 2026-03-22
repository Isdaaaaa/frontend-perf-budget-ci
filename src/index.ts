import { defaultConfig, summarizeConfig } from './lib/config.js';

export { compareAgainstBudget } from './compare.js';
export { formatBudgetComparisonMarkdown, formatBudgetPrComment } from './format.js';
export { ArtifactParseError, ingestBaselineFromFiles, ingestBaselineFromStrings, parseBundleMetrics, parseLighthouseMetrics } from './ingest.js';
export type {
  ArtifactErrorCode,
  BaselineArtifactFileInput,
  BaselineArtifactInput,
  BaselineMetrics,
  BudgetComparisonResult,
  BundleMetrics,
  LighthouseMetrics,
  MetricComparison,
  MetricComparisonStatus,
  NormalizedMetrics
} from './types.js';

export const start = (): string => summarizeConfig(defaultConfig);

if (process.env.NODE_ENV !== 'test') {
  console.log(start());
}

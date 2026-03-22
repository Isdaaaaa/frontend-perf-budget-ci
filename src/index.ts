import { defaultConfig, summarizeConfig } from './lib/config.js';

export { compareAgainstBudget } from './compare.js';
export { createEmptyDashboardData, renderDashboard } from './dashboard.js';
export { formatBudgetComparisonMarkdown, formatBudgetPrComment } from './format.js';
export { ArtifactParseError, ingestBaselineFromFiles, ingestBaselineFromStrings, parseBundleMetrics, parseLighthouseMetrics } from './ingest.js';
export type {
  ArtifactErrorCode,
  BaselineArtifactFileInput,
  BaselineArtifactInput,
  BaselineMetrics,
  BudgetComparisonResult,
  BundleMetrics,
  DashboardData,
  DashboardRenderState,
  DashboardRoute,
  DashboardRun,
  DashboardTrendSeries,
  LighthouseMetrics,
  MetricComparison,
  MetricComparisonStatus,
  NormalizedMetrics,
  PrCommentPreview,
  RouteStatus,
  RunStatus
} from './types.js';

export const start = (): string => summarizeConfig(defaultConfig);

if (process.env.NODE_ENV !== 'test') {
  console.log(start());
}

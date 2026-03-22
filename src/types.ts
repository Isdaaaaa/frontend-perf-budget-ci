export type PerfMetricName = 'lcp' | 'cls' | 'js_kb' | 'tbt';

export interface PerfBudget {
  metric: PerfMetricName;
  threshold: number;
  unit: 'ms' | 'score' | 'kb';
}

export interface BootstrapConfig {
  projectName: string;
  defaultBudgets: PerfBudget[];
}

export interface AppConfig {
  appName: string;
  env: 'development' | 'test' | 'production';
}

export interface HealthStatus {
  ok: boolean;
  timestamp: string;
}

export interface NormalizedMetrics {
  lcp: number;
  cls: number;
  js_kb: number;
  tbt: number;
}

export type BaselineMetrics = NormalizedMetrics;

export interface LighthouseMetrics {
  lcp: number;
  cls: number;
  tbt: number;
}

export interface BundleMetrics {
  js_kb: number;
}

export interface BaselineArtifactInput {
  lighthouseJson: string;
  bundleStatsJson: string;
}

export interface BaselineArtifactFileInput {
  lighthousePath: string;
  bundleStatsPath: string;
}

export type ArtifactErrorCode =
  | 'INVALID_JSON'
  | 'INVALID_ROOT'
  | 'MISSING_FIELD'
  | 'INVALID_FIELD_TYPE'
  | 'INVALID_FIELD_VALUE';

export type MetricComparisonStatus = 'pass' | 'fail' | 'missing';

export interface MetricComparison {
  metric: PerfMetricName;
  baseline: number;
  current: number | null;
  threshold: number;
  delta: number | null;
  status: MetricComparisonStatus;
}

export interface BudgetComparisonResult {
  pass: boolean;
  metrics: Record<PerfMetricName, MetricComparison>;
  failedMetrics: PerfMetricName[];
  missingMetrics: PerfMetricName[];
}

export type RouteStatus = 'pass' | 'fail' | 'missing';

export interface DashboardRoute {
  path: string;
  status: RouteStatus;
  metrics: Partial<NormalizedMetrics>;
}

export type RunStatus = 'pass' | 'fail' | 'running';

export interface DashboardRun {
  id: string;
  branch: string;
  status: RunStatus;
  startedAt: string;
  durationMs: number;
}

export interface DashboardTrendSeries {
  metric: PerfMetricName;
  values: number[];
}

export interface PrCommentPreview {
  updatedAt: string;
  body: string;
}

export interface DashboardData {
  routes: DashboardRoute[];
  runs: DashboardRun[];
  trends: DashboardTrendSeries[];
  prCommentPreview: PrCommentPreview | null;
}

export type DashboardRenderState = 'loading' | 'empty' | 'ready';

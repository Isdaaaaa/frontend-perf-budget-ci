import type {
  BudgetComparisonResult,
  MetricComparison,
  NormalizedMetrics,
  PerfMetricName
} from './types.js';

const METRICS: PerfMetricName[] = ['lcp', 'cls', 'js_kb', 'tbt'];

const round = (value: number, decimals: number): number => {
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const compareMetric = (
  metric: PerfMetricName,
  baseline: number,
  currentValue: unknown,
  threshold: number
): MetricComparison => {
  if (!isFiniteNumber(currentValue)) {
    return {
      metric,
      baseline,
      current: null,
      threshold,
      delta: null,
      status: 'missing'
    };
  }

  const delta = round(currentValue - baseline, 4);
  const status = delta <= threshold ? 'pass' : 'fail';

  return {
    metric,
    baseline,
    current: currentValue,
    threshold,
    delta,
    status
  };
};

export const compareAgainstBudget = (
  baseline: NormalizedMetrics,
  current: Partial<NormalizedMetrics>,
  thresholds: Partial<Record<PerfMetricName, number>> = {}
): BudgetComparisonResult => {
  const metrics = Object.fromEntries(
    METRICS.map((metric) => {
      const threshold = thresholds[metric] ?? 0;
      const comparison = compareMetric(metric, baseline[metric], current[metric], threshold);
      return [metric, comparison];
    })
  ) as BudgetComparisonResult['metrics'];

  const failedMetrics = METRICS.filter((metric) => metrics[metric].status === 'fail');
  const missingMetrics = METRICS.filter((metric) => metrics[metric].status === 'missing');

  return {
    pass: failedMetrics.length === 0 && missingMetrics.length === 0,
    metrics,
    failedMetrics,
    missingMetrics
  };
};

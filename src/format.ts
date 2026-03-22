import type { BudgetComparisonResult, PerfMetricName } from './types.js';

const METRICS: PerfMetricName[] = ['lcp', 'cls', 'js_kb', 'tbt'];

const blameAndHint: Record<PerfMetricName, string> = {
  lcp: 'Likely blame: hero image, slow server response, or render-blocking CSS. Hint: optimize hero image, improve server response, and reduce render-blocking CSS.',
  cls: 'Likely blame: unsized media and late layout shifts. Hint: reserve media dimensions and avoid late layout shifts.',
  js_kb: 'Likely blame: bundle growth from dependencies/imports. Hint: trim bundle, lazy-load features, and remove heavy deps.',
  tbt: 'Likely blame: main-thread long tasks and third-party scripts. Hint: reduce long tasks, split code, and defer third-party scripts.'
};

const countPassing = (result: BudgetComparisonResult): number =>
  METRICS.filter((metric) => result.metrics[metric].status === 'pass').length;

const formatNumber = (value: number): string => `${value}`;

const formatDelta = (value: number): string => {
  if (value > 0) {
    return `+${formatNumber(value)}`;
  }

  return formatNumber(value);
};

const metricLine = (result: BudgetComparisonResult, metric: PerfMetricName): string[] => {
  const comparison = result.metrics[metric];

  if (comparison.status === 'missing' || comparison.current === null || comparison.delta === null) {
    return [
      `- ⚪ \`${metric}\` (missing) | baseline ${formatNumber(comparison.baseline)} | current n/a | delta n/a | threshold +${formatNumber(comparison.threshold)}`
    ];
  }

  const icon = comparison.status === 'pass' ? '✅' : '❌';
  const lines = [
    `- ${icon} \`${metric}\` (${comparison.status}) | baseline ${formatNumber(comparison.baseline)} | current ${formatNumber(comparison.current)} | delta ${formatDelta(comparison.delta)} | threshold +${formatNumber(comparison.threshold)}`
  ];

  if (comparison.status === 'fail') {
    lines.push(`  - ${blameAndHint[metric]}`);
  }

  return lines;
};

export const formatBudgetComparisonMarkdown = (result: BudgetComparisonResult): string => {
  const passing = countPassing(result);
  const failing = result.failedMetrics.length;
  const missing = result.missingMetrics.length;
  const total = METRICS.length;

  const lines: string[] = [
    `## Performance Budget Report — ${result.pass ? '✅ PASS' : '❌ FAIL'}`,
    `Summary: ${passing} passing, ${failing} failing, ${missing} missing (total ${total}).`,
    '',
    '### Metrics'
  ];

  for (const metric of METRICS) {
    lines.push(...metricLine(result, metric));
  }

  return lines.join('\n');
};

export const formatBudgetPrComment = formatBudgetComparisonMarkdown;

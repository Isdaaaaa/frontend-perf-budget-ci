import type { BootstrapConfig } from '../types.js';

export const defaultConfig: BootstrapConfig = {
  projectName: 'frontend-perf-budget-ci',
  defaultBudgets: [
    { metric: 'lcp', threshold: 2500, unit: 'ms' },
    { metric: 'cls', threshold: 0.1, unit: 'score' },
    { metric: 'js_kb', threshold: 220, unit: 'kb' },
    { metric: 'tbt', threshold: 300, unit: 'ms' }
  ]
};

export const summarizeConfig = (config: BootstrapConfig): string =>
  `${config.projectName} with ${config.defaultBudgets.length} default budgets`;

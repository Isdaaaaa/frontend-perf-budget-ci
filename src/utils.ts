import type { AppConfig, HealthStatus } from './types.js';

export function makeAppConfig(env = process.env.NODE_ENV): AppConfig {
  return {
    appName: 'frontend-perf-budget-ci',
    env: env === 'production' || env === 'test' ? env : 'development'
  };
}

export function getHealthStatus(): HealthStatus {
  return {
    ok: true,
    timestamp: new Date().toISOString()
  };
}

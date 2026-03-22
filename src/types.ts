export interface PerfBudget {
  metric: 'lcp' | 'cls' | 'js_kb' | 'tbt';
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

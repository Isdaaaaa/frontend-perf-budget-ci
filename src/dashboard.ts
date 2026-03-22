import type {
  DashboardData,
  DashboardRenderState,
  DashboardRoute,
  DashboardRun,
  DashboardTrendSeries,
  PerfMetricName,
  PrCommentPreview,
  RunStatus
} from './types.js';

const METRICS: PerfMetricName[] = ['lcp', 'cls', 'js_kb', 'tbt'];

const STATUS_LABEL: Record<RunStatus, string> = {
  pass: 'PASS',
  fail: 'FAIL',
  running: 'RUNNING'
};

const STATUS_CLASS: Record<RunStatus, string> = {
  pass: 'status-pass',
  fail: 'status-fail',
  running: 'status-running'
};

const SPARKLINE_BARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatNumber = (value: number): string => `${value}`;

const renderSparkline = (values: number[]): string => {
  if (values.length === 0) {
    return '—';
  }

  if (values.length === 1) {
    return SPARKLINE_BARS[SPARKLINE_BARS.length - 1];
  }

  let min = values[0] ?? 0;
  let max = values[0] ?? 0;

  for (const value of values) {
    if (value < min) {
      min = value;
    }

    if (value > max) {
      max = value;
    }
  }

  if (min === max) {
    return values.map(() => SPARKLINE_BARS[3]).join('');
  }

  const range = max - min;

  return values
    .map((value) => {
      const normalized = (value - min) / range;
      const idx = Math.min(
        SPARKLINE_BARS.length - 1,
        Math.max(0, Math.round(normalized * (SPARKLINE_BARS.length - 1)))
      );
      return SPARKLINE_BARS[idx] ?? SPARKLINE_BARS[0];
    })
    .join('');
};

const metricValue = (route: DashboardRoute, metric: PerfMetricName): string => {
  const value = route.metrics[metric];
  return typeof value === 'number' ? formatNumber(value) : '—';
};

const renderRouteRows = (routes: DashboardRoute[]): string => {
  if (routes.length === 0) {
    return '<tr><td colspan="6" class="empty-cell">No tracked routes yet.</td></tr>';
  }

  return routes
    .map(
      (route) =>
        `<tr><td><code>${escapeHtml(route.path)}</code></td><td>${escapeHtml(route.status.toUpperCase())}</td><td>${metricValue(route, 'lcp')}</td><td>${metricValue(route, 'cls')}</td><td>${metricValue(route, 'js_kb')}</td><td>${metricValue(route, 'tbt')}</td></tr>`
    )
    .join('');
};

const renderRunTimeline = (runs: DashboardRun[]): string => {
  if (runs.length === 0) {
    return '<li class="empty-item">No CI runs yet.</li>';
  }

  return runs
    .map((run) => {
      const statusClass = STATUS_CLASS[run.status];
      const statusLabel = STATUS_LABEL[run.status];
      return `<li><div class="timeline-row"><span class="timeline-id">#${escapeHtml(run.id)}</span><span class="status-chip ${statusClass}">${statusLabel}</span></div><div class="timeline-meta">${escapeHtml(run.branch)} • ${escapeHtml(run.startedAt)} • ${formatNumber(run.durationMs)} ms</div></li>`;
    })
    .join('');
};

const renderTrendRows = (trends: DashboardTrendSeries[]): string => {
  if (trends.length === 0) {
    return '<li class="empty-item">No trend data yet.</li>';
  }

  return trends
    .map(
      (trend) =>
        `<li><span class="trend-name">${escapeHtml(trend.metric)}</span><span class="sparkline" aria-label="${escapeHtml(trend.metric)} trend">${renderSparkline(trend.values)}</span></li>`
    )
    .join('');
};

const renderPrPreview = (preview: PrCommentPreview | null): string => {
  if (!preview) {
    return '<div class="empty-block">No PR comment preview yet.</div>';
  }

  return `<div class="pr-meta">Updated ${escapeHtml(preview.updatedAt)}</div><pre>${escapeHtml(preview.body)}</pre>`;
};

const renderLoadingState = (): string =>
  `<section class="state-panel"><h2>Loading dashboard</h2><p>Loading route budgets, CI run history, trend sparklines, and PR comment preview…</p></section>`;

const renderEmptyState = (): string =>
  `<section class="state-panel"><h2>Dashboard is empty</h2><p>No route snapshots or CI history found. Run a baseline check to populate this dashboard.</p></section>`;

const renderDashboardContent = (data: DashboardData): string =>
  `<div class="dashboard-grid">
      <section class="card routes-card">
        <h2>Route List</h2>
        <table>
          <thead>
            <tr><th>Route</th><th>Status</th><th>LCP</th><th>CLS</th><th>JS KB</th><th>TBT</th></tr>
          </thead>
          <tbody>${renderRouteRows(data.routes)}</tbody>
        </table>
      </section>
      <section class="card trends-card">
        <h2>Trend Sparklines</h2>
        <ul class="trend-list">${renderTrendRows(data.trends)}</ul>
      </section>
      <section class="card timeline-card">
        <h2>Run History Timeline</h2>
        <ol class="timeline-list">${renderRunTimeline(data.runs)}</ol>
      </section>
      <section class="card preview-card">
        <h2>PR Comment Preview</h2>
        ${renderPrPreview(data.prCommentPreview)}
      </section>
    </div>`;

const DASHBOARD_STYLES = `<style>
:root {
  --color-primary: #1E4B99;
  --color-accent: #8BC34A;
  --color-slate: #1F2933;
  --color-smoke: #E5E7EB;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  color: var(--color-slate);
  background: #f8fafc;
}
main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}
header {
  margin-bottom: 12px;
  border-bottom: 2px solid var(--color-smoke);
  padding-bottom: 10px;
}
h1 {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.4rem;
}
.subtitle {
  margin: 6px 0 0;
  color: #334155;
  font-size: 0.92rem;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}
.card {
  background: #fff;
  border: 1px solid var(--color-smoke);
  border-radius: 10px;
  padding: 12px;
}
.card h2 {
  margin: 0 0 10px;
  color: var(--color-primary);
  font-size: 1rem;
}
.routes-card,
.trends-card { min-height: 180px; }
.preview-card,
.timeline-card { min-height: 220px; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
th, td {
  text-align: left;
  border-bottom: 1px solid var(--color-smoke);
  padding: 6px 4px;
}
th { color: #334155; }
.empty-cell,
.empty-item,
.empty-block {
  color: #64748b;
}
.timeline-list,
.trend-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}
.timeline-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.timeline-id {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--color-slate);
}
.timeline-meta {
  color: #334155;
  font-size: 0.86rem;
}
.status-chip {
  border-radius: 999px;
  font-size: 0.75rem;
  padding: 2px 8px;
  border: 1px solid var(--color-smoke);
}
.status-pass {
  border-color: var(--color-accent);
  color: #4d7c0f;
  background: #f7fee7;
}
.status-fail {
  border-color: #ef4444;
  color: #b91c1c;
  background: #fef2f2;
}
.status-running {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: #eff6ff;
}
.trend-list li {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.trend-name {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
.sparkline {
  letter-spacing: 1px;
  color: var(--color-primary);
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
pre {
  margin: 8px 0 0;
  white-space: pre-wrap;
  background: #f8fafc;
  border: 1px solid var(--color-smoke);
  border-radius: 8px;
  padding: 10px;
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
.pr-meta {
  color: #334155;
  font-size: 0.85rem;
}
.state-panel {
  border: 1px dashed var(--color-smoke);
  background: #fff;
  border-radius: 10px;
  padding: 16px;
}
.state-panel h2 {
  margin: 0 0 8px;
  color: var(--color-primary);
}
@media (max-width: 800px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  main {
    padding: 12px;
  }

  .card {
    padding: 10px;
  }

  th,
  td {
    font-size: 0.82rem;
  }
}
</style>`;

export const renderDashboard = (
  input: {
    state: DashboardRenderState;
    data?: DashboardData;
  } = { state: 'empty' }
): string => {
  const content =
    input.state === 'loading'
      ? renderLoadingState()
      : input.state === 'empty' || !input.data
        ? renderEmptyState()
        : renderDashboardContent(input.data);

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${DASHBOARD_STYLES}</head><body><main><header><h1>Frontend Perf Budget Dashboard</h1><p class="subtitle">Deterministic dashboard render for CI artifacts and PR reporting.</p></header>${content}</main></body></html>`;
};

export const createEmptyDashboardData = (): DashboardData => ({
  routes: [],
  runs: [],
  trends: METRICS.map((metric) => ({ metric, values: [] })),
  prCommentPreview: null
});

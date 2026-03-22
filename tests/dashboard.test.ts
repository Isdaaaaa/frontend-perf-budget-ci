import assert from 'node:assert/strict';
import test from 'node:test';

import { createEmptyDashboardData, renderDashboard } from '../src/dashboard.js';
import type { DashboardData } from '../src/types.js';

test('renderDashboard renders deterministic populated dashboard HTML', () => {
  const data: DashboardData = {
    routes: [
      {
        path: '/home',
        status: 'pass',
        metrics: { lcp: 1700, cls: 0.06, js_kb: 142, tbt: 85 }
      },
      {
        path: '/pricing',
        status: 'fail',
        metrics: { lcp: 2100, cls: 0.11, js_kb: 188, tbt: 130 }
      }
    ],
    runs: [
      {
        id: '4201',
        branch: 'main',
        status: 'pass',
        startedAt: '2026-03-22T09:30:00Z',
        durationMs: 51234
      },
      {
        id: '4200',
        branch: 'feature/perf',
        status: 'fail',
        startedAt: '2026-03-22T08:40:00Z',
        durationMs: 60111
      }
    ],
    trends: [
      { metric: 'lcp', values: [1900, 1850, 1800, 1700] },
      { metric: 'cls', values: [0.1, 0.08, 0.06, 0.06] },
      { metric: 'js_kb', values: [180, 170, 160, 150] },
      { metric: 'tbt', values: [140, 130, 100, 90] }
    ],
    prCommentPreview: {
      updatedAt: '2026-03-22T09:31:00Z',
      body: '## Performance Budget Report — ✅ PASS\nSummary: 4 passing, 0 failing, 0 missing.'
    }
  };

  const first = renderDashboard({ state: 'ready', data });
  const second = renderDashboard({ state: 'ready', data });

  assert.equal(first, second);
  assert.match(first, /Frontend Perf Budget Dashboard/);
  assert.match(first, /Route List/);
  assert.match(first, /Run History Timeline/);
  assert.match(first, /Trend Sparklines/);
  assert.match(first, /PR Comment Preview/);
  assert.match(first, /#4201/);
  assert.match(first, /aria-label="lcp trend"/);
  assert.match(first, /Performance Budget Report/);
  assert.match(first, /#1E4B99/);
  assert.match(first, /#8BC34A/);
  assert.match(first, /@media \(max-width: 800px\)/);
});

test('renderDashboard supports explicit loading and empty states', () => {
  const loading = renderDashboard({ state: 'loading' });
  const empty = renderDashboard({ state: 'empty' });
  const seededEmpty = renderDashboard({
    state: 'ready',
    data: createEmptyDashboardData()
  });

  assert.match(loading, /Loading dashboard/);
  assert.match(loading, /Loading route budgets, CI run history, trend sparklines, and PR comment preview/);

  assert.match(empty, /Dashboard is empty/);
  assert.match(empty, /Run a baseline check to populate this dashboard/);

  assert.match(seededEmpty, /No tracked routes yet/);
  assert.match(seededEmpty, /No CI runs yet/);
  assert.match(seededEmpty, /aria-label="lcp trend">—</);
  assert.match(seededEmpty, /No PR comment preview yet/);
});

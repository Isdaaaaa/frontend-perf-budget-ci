import test from 'node:test';
import assert from 'node:assert/strict';

import { renderDashboardHtml } from '../src/dashboard.js';
import type { DashboardRenderModel } from '../src/types.js';

test('renderDashboardHtml renders populated dashboard with trends and preview', () => {
  const model: DashboardRenderModel = {
    title: 'Frontend Perf Budget CI',
    generatedAtLabel: '2026-03-22 11:22 UTC',
    state: 'ready',
    routes: [
      {
        route: '/home',
        metricSummary: 'LCP 1800ms · CLS 0.04 · JS 162kb · TBT 140ms',
        status: 'pass',
        trend: [2.2, 2.0, 1.9, 1.8],
        notes: 'Hero image optimized'
      },
      {
        route: '/checkout',
        metricSummary: 'LCP 2900ms · CLS 0.16 · JS 241kb · TBT 280ms',
        status: 'fail',
        trend: [2.4, 2.6, 2.8, 2.9],
        notes: 'Bundle grew after payment SDK update'
      }
    ],
    runs: [
      {
        id: 'run-1042',
        createdAtLabel: '10m ago',
        commitLabel: 'a1b2c3d',
        status: 'fail',
        summary: 'Checkout route exceeded JS budget by +32kb'
      }
    ],
    commentPreview: {
      title: 'Bot comment',
      body: '## Performance Budget Report — ❌ FAIL\n- ❌ `js_kb` on /checkout'
    }
  };

  const html = renderDashboardHtml(model);

  assert.match(html, /Route budget summary/);
  assert.match(html, /Recent CI runs/);
  assert.match(html, /PR comment preview/);
  assert.match(html, /run-1042/);
  assert.match(html, /Hero image optimized/);
  assert.match(html, /▁|▂|▃|▄|▅|▆|▇|█/);
  assert.match(html, /chip-pass/);
  assert.match(html, /chip-fail/);
  assert.match(html, /@media \(max-width: 900px\)/);
  assert.ok(html.startsWith('<!doctype html>'));
});

test('renderDashboardHtml supports loading and empty states', () => {
  const loading: DashboardRenderModel = {
    title: 'Frontend Perf Budget CI',
    generatedAtLabel: 'just now',
    state: 'loading',
    routes: [],
    runs: [],
    commentPreview: { body: '' }
  };

  const empty: DashboardRenderModel = {
    title: 'Frontend Perf Budget CI',
    generatedAtLabel: 'a while ago',
    state: 'empty',
    routes: [],
    runs: [],
    commentPreview: { body: '' }
  };

  const loadingHtml = renderDashboardHtml(loading);
  const emptyHtml = renderDashboardHtml(empty);

  assert.match(loadingHtml, /Loading dashboard…/);
  assert.match(loadingHtml, /Refreshing latest CI artifacts…/);
  assert.match(emptyHtml, /No performance data yet/);
  assert.match(emptyHtml, /Run the CI workflow once/);
});

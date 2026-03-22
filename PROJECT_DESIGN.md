# Project Design

## Personality
Confident, pragmatic, and data-forward. Speaks in concise, actionable language suitable for engineers skimming PRs.

## Visual Identity
- **Colors:**
  - Primary: Sapphire (#1E4B99)
  - Accent: Lime (#8BC34A)
  - Neutrals: Slate (#1F2933), Smoke (#E5E7EB)
- **Typography:**
  - Headings: Inter SemiBold
  - Body/Code: Inter Regular, with monospaced sections using JetBrains Mono for diffs/tables
- **Components:**
  - Metric cards with spark-lines for trends
  - Budget tables with pass/fail badges
  - PR comment preview panel
  - Timeline of CI runs with status chips
  - Callout boxes for remediation tips
- **Layout:**
  - Two-column dashboard: metrics + trends on left, recent runs and PR comment preview on right
  - Light theme by default with clear contrast for red/green states

## Inspiration References
- GitHub check runs UI (concise status rows)
- Vercel dashboard cards for performance metrics
- Google Lighthouse report visual cues (color-coded gauges)

## Notes
Prioritize scannability. Keep charts simple (sparklines, bar deltas). Ensure PR comment preview matches actual formatting to build trust.

# 18 — UI Polish: Text Capitalization, Kanban Tab Bar, Dashboard Chart Fixes

**What to build:** Cross-cutting UI polish pass addressing text casing inconsistencies, Kanban layout improvements (unified status tab bar with counts), and dashboard chart sizing/labeling gaps.

**Blocked by:** 04 — Visual Kanban Board, 09 — Dashboard Analytics

**Status:** ready-for-agent

## Kanban Fixes

- [ ] **Capitalize status badge on cards** — In `job-application-card.tsx`, look up the `label` from `JOB_APPLICATION_STATUSES` instead of rendering the raw `application.status` enum value (`wishlist` → `Wishlist`).
- [ ] **Add universal status tab bar with counts** above the Kanban columns in `kanban-board.tsx`. Desktop: flex-wrap row (no horizontal scroll, no click action — purely informational count indicators). Mobile: horizontal scroll, clicking a tab switches the visible column (existing behavior).
- [ ] **Remove per-column count badges** from Kanban column headers (`kanban-board.tsx`) — column headers show only the status name, no colored count pill. Counts are now in the tab bar above.

## Dashboard Chart Fixes

- [ ] **Fix chart sizing** — Remove `aspect-square max-h-72` constraint from both `ChartContainer` instances in `dashboard.tsx`. Charts should fill their card width responsively.
- [ ] **Add pie chart legend** — Add a Recharts `<Legend>` component below the status distribution pie chart with color-coded, capitalized status labels and counts (e.g., `Applied (5)`, `Interviewing (2)`).
- [ ] **Capitalize pie chart tooltips** — Ensure tooltip `nameKey` maps raw status enum keys to capitalized labels via the existing `statusLabel()` helper.

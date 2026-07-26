# 09 — Dashboard Analytics & shadcn Visual Charts

**What to build:** Server-side Eloquent aggregations and a React dashboard page (`resources/js/pages/dashboard.tsx`) featuring `shadcn/ui` visual charts (`recharts`) and metric cards.

**Blocked by:** 02 — Form Requests & CRUD Backend Controllers, 04 — Visual Kanban Board & Drag-and-Drop Column Transitions

**Status:** ready-for-agent

- [ ] Implement `DashboardController` calculating `total`, `status_counts`, `avg_match_score`, `added_this_week`, `added_this_month`, and 30-day application trend data via Eloquent queries.
- [ ] Update `resources/js/pages/dashboard.tsx` to render metric summary cards (Total Applications, Avg Match Score, Added This Month).
- [ ] Add `shadcn/ui` bar/pie chart component (`recharts`) visualizing application status distribution and submission trends.
- [ ] Write Pest feature tests in `tests/Feature/DashboardTest.php` asserting exact mathematical aggregates passed as Inertia props.

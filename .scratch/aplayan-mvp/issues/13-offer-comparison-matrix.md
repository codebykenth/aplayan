# 13 — Offer Comparison Matrix Page & Modal Breakdown UI

**What to build:** An interactive net take-home pay breakdown card inside `application-detail-modal.tsx` and a dedicated Offer Comparison Matrix page (`/job-applications/offers`) placing all applications in `offer` status side-by-side.

**Blocked by:** 12 — Philippine Statutory Tax & Net Take-Home Pay Calculator Service, 05 — Full Application Detail & Edit Modal

**Status:** ready-for-agent

- [ ] Add an interactive "Net Take-Home Pay Breakdown" card inside `application-detail-modal.tsx` showing statutory itemized deductions (SSS, PhilHealth, Pag-IBIG, Tax).
- [ ] Create `OfferComparisonController` (`GET /job-applications/offers`) fetching all job applications with status `offer`.
- [ ] Build Inertia page `resources/js/pages/job-applications/offers/index.tsx` rendering side-by-side comparison columns (Salary, Net Take-Home, Location, Match Score, Benefits, Action buttons).
- [ ] Add Navigation link to "Offer Comparison" in `AppLayout` sidebar.
- [ ] Write Pest feature tests in `tests/Feature/OfferComparisonTest.php`.

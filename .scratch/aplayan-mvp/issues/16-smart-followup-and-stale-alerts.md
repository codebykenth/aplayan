# 16 — Smart Follow-Up & Stale Application Alerts

**What to build:** Intelligent staleness detection system that flags applications sitting too long in "Applied" or "Interviewing" statuses, a "Needs Attention" filtered Kanban view, AI-generated follow-up email drafts via GeminiService, and a "last contacted" date field that resets the staleness clock.

**Blocked by:** 04 — Visual Kanban Board & Drag-and-Drop Column Transitions, 06 — Gemini AI Service Integration

**Status:** ready-for-agent

- [ ] Compute staleness server-side in `JobApplicationService` based on days since `updated_at` or `last_contacted_at` (thresholds: 7 days = yellow warning, 14 days = red alert).
- [ ] Expose `staleness_level` (null | 'warning' | 'alert') and `days_since_update` via `JobApplicationResource`.
- [ ] Render visual staleness badges (⚠️ yellow / 🔴 red) on Kanban cards for applications in `applied` or `interviewing` status.
- [ ] Add a "Needs Attention" toggle/filter on the Kanban board that isolates only stale applications.
- [ ] Create `FollowUpEmailController` (`POST /job-applications/{id}/follow-up-draft`) invoking GeminiService to generate a professional follow-up email draft tailored to the company, role, and days elapsed.
- [ ] Render the AI follow-up draft in a copyable text area inside `application-detail-modal.tsx`.
- [ ] Add `last_contacted_at` (date, nullable) column to `job_applications` if not already present from Issue 15, with a manual "Mark as Contacted" button that resets the staleness clock.
- [ ] Write Pest feature tests in `tests/Feature/StaleAlertTest.php`.
